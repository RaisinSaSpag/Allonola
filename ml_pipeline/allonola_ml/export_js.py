"""Export a trained run to plain JavaScript so the website runs the SAME models.

    python -m allonola_ml.export_js artifacts/<run_id>

Writes two files:
  * ../js/ml/model-params.js   -> window.Allonola.modelParams (classic script, works from file://)
  * tests/parity_fixture.json  -> real held-out test rows + Python's predictions; js_parity.js checks
                                  the JavaScript engine against it.

Only learned parameters are exported (weights, scaler statistics, support vectors, tree nodes,
TF-IDF vocabulary, neural-network layers). The inference maths lives in js/ml/inference.js.

The KNN classifier is intentionally NOT exported: the website's KNN demo is an item-based
recommender (js/ml/knn.js), which is not the trained classifier.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from .config import ROOT
from .datasets import DEMO_PROFILES
from .models import SPECS

SITE_JS = ROOT.parent / "js" / "ml" / "model-params.js"
FIXTURE = ROOT / "tests" / "parity_fixture.json"
PARITY_ROWS = 200
DEMO_ORDERS = 60      # the SVM page's order table


def _f(a) -> list[float]:
    return [float(x) for x in np.asarray(a).ravel()]


def _py(v):
    return v.item() if hasattr(v, "item") else v


def _classes(clf) -> list:
    return [_py(c) for c in clf.classes_]


def _feature_spec(prep) -> list[dict]:
    """Describe every column of a fitted ColumnTransformer, in output order.

    onehot : 1 if row[col] == value else 0
    raw    : row[col] as a number, standardised with (mean, scale) when they are present
    """
    spec: list[dict] = []
    for _name, trans, cols in prep.transformers_:
        if isinstance(trans, str) or trans is None:          # "drop" / "passthrough" markers
            if trans == "passthrough":
                spec += [{"kind": "raw", "col": c} for c in cols]
            continue
        cols = list(cols)
        if hasattr(trans, "categories_"):                     # fitted OneHotEncoder
            for col, cats in zip(cols, trans.categories_):
                spec += [{"kind": "onehot", "col": col, "value": _py(v)} for v in cats]
        elif hasattr(trans, "mean_"):                          # fitted StandardScaler
            for i, col in enumerate(cols):
                spec.append({"kind": "raw", "col": col,
                             "mean": float(trans.mean_[i]), "scale": float(trans.scale_[i])})
        else:                                                  # identity FunctionTransformer
            spec += [{"kind": "raw", "col": c} for c in cols]
    return spec


def _scaler_spec(sc) -> list[dict]:
    return [{"kind": "raw", "col": col, "mean": float(m), "scale": float(s)}
            for col, m, s in zip(sc.feature_names_in_, sc.mean_, sc.scale_)]


# ---- one exporter per model ----------------------------------------------------
def export_linear(model) -> dict:
    pipe = model.regressor_  # TransformedTargetRegressor wraps Pipeline(ratio, prep, ridge)
    lin = pipe.named_steps["lin"]
    return {
        "type": "ridge_on_log1p",            # prediction = expm1(ridge(x))
        "features": _feature_spec(pipe.named_steps["prep"]),
        "coef": _f(lin.coef_),
        "intercept": float(lin.intercept_),
    }


def export_nb(model) -> dict:
    tf = model.named_steps["prep"].named_transformers_["tfidf"]
    clf = model.named_steps["clf"]
    vocab = [None] * len(tf.vocabulary_)
    for term, idx in tf.vocabulary_.items():
        vocab[idx] = term
    return {
        "type": "tfidf_multinomial_nb",
        "ngram_range": list(tf.ngram_range),
        "vocabulary": vocab,
        "idf": _f(tf.idf_),
        "classes": _classes(clf),
        "feature_log_prob": [_f(r) for r in clf.feature_log_prob_],
        "class_log_prior": _f(clf.class_log_prior_),
    }


def export_svm(model) -> dict:
    prep, clf = model.named_steps["prep"], model.named_steps["clf"]
    return {
        "type": "svm_rbf_binary",
        "features": _feature_spec(prep),
        "support_vectors": [_f(r) for r in clf.support_vectors_],
        "dual_coef": _f(clf.dual_coef_[0]),
        "intercept": float(clf.intercept_[0]),
        "gamma": float(clf._gamma),
        "platt_a": float(clf.probA_[0]),
        "platt_b": float(clf.probB_[0]),
        "classes": _classes(clf),
    }


def export_tree(model) -> dict:
    prep, clf = model.named_steps["prep"], model.named_steps["clf"]
    t = clf.tree_
    return {
        "type": "decision_tree",
        "features": _feature_spec(prep),
        "children_left": [int(v) for v in t.children_left],
        "children_right": [int(v) for v in t.children_right],
        "feature": [int(v) for v in t.feature],
        "threshold": _f(t.threshold),
        "value": [_f(v) for v in t.value[:, 0, :]],   # class weights per node
        "classes": _classes(clf),
    }


def export_mlp(model) -> dict:
    sc, clf = model.named_steps["scale"], model.named_steps["clf"]
    assert clf.out_activation_ == "logistic", "JS engine supports the binary (logistic) output only"
    return {
        "type": "mlp_binary_relu",
        "features": _scaler_spec(sc),
        "coefs": [np.asarray(W).tolist() for W in clf.coefs_],       # [layer][in][out]
        "intercepts": [_f(b) for b in clf.intercepts_],
        "classes": _classes(clf),
    }


EXPORTERS = {
    "linear_regression": export_linear,
    "naive_bayes": export_nb,
    "svm": export_svm,
    "decision_tree": export_tree,
    "ann": export_mlp,
}


# ---- rows and reference predictions ---------------------------------------------
def _test_frame(run_dir: Path, name: str) -> pd.DataFrame:
    """Held-out test rows, rounded the way the website displays them."""
    df = pd.read_csv(run_dir / name / "data" / "test.csv")
    if name == "svm":
        df["order_amount"] = df["order_amount"].round(0)   # pesos, no centavos on the site
    return df


def _python_predictions(name: str, model, X: pd.DataFrame) -> dict:
    if name == "linear_regression":
        return {"value": model.predict(X).tolist()}
    out = {"label": [str(_py(v)) for v in model.predict(X)]}
    out["proba"] = model.predict_proba(X).tolist()
    if name == "svm":
        out["decision"] = model.decision_function(X).tolist()
    return out


def build_fixture(run_dir: Path) -> tuple[dict, dict]:
    fixture = {}
    for name in EXPORTERS:
        spec = SPECS[name]
        model = joblib.load(run_dir / name / "model.joblib")
        test = _test_frame(run_dir, name)
        X = test[spec.features]
        fixture[name] = {
            "rows": json.loads(X.head(PARITY_ROWS).to_json(orient="records")),
            "python": _python_predictions(name, model, X.head(PARITY_ROWS)),
        }

    # Demo data: the 60 SVM orders and 6 churn shoppers the pages display, with Python's scores.
    svm_test = _test_frame(run_dir, "svm").head(DEMO_ORDERS)
    svm_model = joblib.load(run_dir / "svm" / "model.joblib")
    svm_scores = svm_model.predict_proba(svm_test[SPECS["svm"].features])[:, 1]
    orders = []
    for i, (_, r) in enumerate(svm_test.iterrows()):
        orders.append({
            "orderId": f"O-{1001 + i}",
            "amount": int(r["order_amount"]),
            "location": r["location"],
            "payment": r["payment"],
            "accountAge": int(r["account_age_days"]),
            "items": int(r["items_per_order"]),
            "fraud": int(r["is_fraud"]),
            "row": {k: _py(r[k]) for k in SPECS["svm"].features},
            "pythonScore": float(svm_scores[i]),
        })

    ann_model = joblib.load(run_dir / "ann" / "model.joblib")
    profiles = pd.DataFrame(
        [{k: v for k, v in p.items() if k != "churned"} for p in DEMO_PROFILES.values()]
    )[SPECS["ann"].features]
    ann_scores = ann_model.predict_proba(profiles)[:, 1]
    shoppers = {}
    for i, (sid, p) in enumerate(DEMO_PROFILES.items()):
        shoppers[sid] = {
            "row": {k: float(profiles.iloc[i][k]) for k in SPECS["ann"].features},
            "actualChurn": int(p["churned"]),
            "pythonChurnProb": float(ann_scores[i]),
        }
    return fixture, {"svmOrders": orders, "shoppers": shoppers}


def export(run_dir: Path, out_js: Path = SITE_JS, fixture_path: Path = FIXTURE) -> Path:
    models = {}
    for name, fn in EXPORTERS.items():
        model = joblib.load(run_dir / name / "model.joblib")
        meta = json.loads((run_dir / name / "metadata.json").read_text())
        params = fn(model)
        params["_source"] = {"run_id": run_dir.name, "model_sha256": meta["model_sha256"], "title": meta["title"]}
        models[name] = params

    fixture, demo = build_fixture(run_dir)
    payload = {"run_id": run_dir.name, "models": models, "demo": {
        # Keep the Python scores out of the page payload; they are only for the parity test.
        "svmOrders": [{k: v for k, v in o.items() if k != "pythonScore"} for o in demo["svmOrders"]],
        "shoppers": {k: {"row": v["row"], "actualChurn": v["actualChurn"]} for k, v in demo["shoppers"].items()},
    }}
    body = json.dumps(payload, separators=(",", ":"))
    out_js.parent.mkdir(parents=True, exist_ok=True)
    out_js.write_text(
        "/* GENERATED by ml_pipeline/allonola_ml/export_js.py - do not edit by hand.\n"
        f"   Source run: {run_dir.name}. Re-run the exporter after retraining. */\n"
        '"use strict";\n'
        "(function () {\n"
        "  window.Allonola = window.Allonola || {};\n"
        f"  window.Allonola.modelParams = {body};\n"
        "})();\n",
        encoding="utf-8",
    )

    fixture["_demo"] = demo  # includes pythonScore, checked by the parity test
    fixture_path.parent.mkdir(parents=True, exist_ok=True)
    fixture_path.write_text(json.dumps(fixture), encoding="utf-8")
    return out_js


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Export a trained run to the website's JavaScript.")
    p.add_argument("run_dir", type=Path, help="e.g. artifacts/20261025T082515Z")
    p.add_argument("--out", type=Path, default=SITE_JS)
    p.add_argument("--fixture", type=Path, default=FIXTURE)
    a = p.parse_args(argv)
    out = export(a.run_dir, a.out, a.fixture)
    print(f"Wrote {out}  ({out.stat().st_size / 1024:.0f} KB)")
    print(f"Wrote {a.fixture}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
