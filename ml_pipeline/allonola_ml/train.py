"""Train every model with a proper 60/20/20 protocol.

Protocol per model
  1. Split once: 60 % train / 20 % validation / 20 % test
     (stratified for classification, chronological for time-based data).
  2. Grid-search hyper-parameters: fit on TRAIN, score on VALIDATION.
  3. k-fold cross-validation on train+validation for a stability estimate.
  4. Refit the winning configuration on train+validation.
  5. Score ONCE on the untouched TEST set -> the number you report.

Run:  python -m allonola_ml.train --models all
"""
from __future__ import annotations

import argparse
import hashlib
import json
import platform
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.base import clone
from sklearn.metrics import get_scorer
from sklearn.model_selection import KFold, ParameterGrid, StratifiedKFold, TimeSeriesSplit, cross_val_score

from . import __version__
from .config import ARTIFACT_DIR, DRIVE_FOLDER_ID, SplitConfig
from .evaluate import report
from .models import SPECS, ModelSpec
from .splits import three_way_split


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _json_default(o):
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        return float(o)
    if isinstance(o, np.ndarray):
        return o.tolist()
    return str(o)


def train_one(
    spec: ModelSpec,
    cfg: SplitConfig,
    run_dir: Path,
    n_rows: int | None = None,
    refit_on_train_val: bool = True,
    save_data: bool = True,
) -> dict:
    out = run_dir / spec.name
    out.mkdir(parents=True, exist_ok=True)

    df = spec.make_data(seed=cfg.seed, **({"n": n_rows} if n_rows else {}))
    data_hash = hashlib.sha256(df.to_csv(index=False).encode()).hexdigest()
    splits = three_way_split(
        df, spec.target, cfg, stratify=spec.task == "classification", time_col=spec.time_col
    )

    feats, tgt = spec.features, spec.target
    Xtr, ytr = splits.train[feats], splits.train[tgt]
    Xva, yva = splits.val[feats], splits.val[tgt]
    Xte, yte = splits.test[feats], splits.test[tgt]

    # 2. hyper-parameter search: fit on train, judge on validation
    scorer = get_scorer(spec.scoring)
    trials = []
    for params in ParameterGrid(spec.grid):
        model = spec.build(**params).fit(Xtr, ytr)
        trials.append({"params": params, "val_score": float(scorer(model, Xva, yva))})
    top = max(t["val_score"] for t in trials)
    # first (simplest) trial within the spec's tolerance of the best validation score
    best = next(t for t in trials if t["val_score"] >= top - spec.tolerance)
    best_params = best["params"]

    # 3. cross-validation on train+val (never includes test)
    trval = pd.concat([splits.train, splits.val])
    if spec.time_col:
        cv = TimeSeriesSplit(n_splits=cfg.cv_folds)
    elif spec.task == "classification":
        cv = StratifiedKFold(cfg.cv_folds, shuffle=True, random_state=cfg.seed)
    else:
        cv = KFold(cfg.cv_folds, shuffle=True, random_state=cfg.seed)
    cv_scores = cross_val_score(spec.build(**best_params), trval[feats], trval[tgt], cv=cv, scoring=spec.scoring)

    # train / validation metrics come from the model that never saw validation rows
    dev_model = spec.build(**best_params).fit(Xtr, ytr)
    train_metrics = report(spec.task, dev_model, Xtr, ytr)
    val_metrics = report(spec.task, dev_model, Xva, yva)

    # 4. final model
    final = spec.build(**best_params)
    if refit_on_train_val:
        final.fit(trval[feats], trval[tgt])
    else:
        final.fit(Xtr, ytr)

    # 5. the one and only look at the test set
    test_metrics = report(spec.task, final, Xte, yte)

    model_path = out / "model.joblib"
    joblib.dump(final, model_path, compress=3)

    if save_data:
        (out / "data").mkdir(exist_ok=True)
        cols = list(dict.fromkeys(feats + spec.extra_cols + [tgt]))
        for part in ("train", "val", "test"):
            getattr(splits, part)[cols].to_csv(out / "data" / f"{part}.csv", index=False)

    explanation = spec.explain(final, spec) if spec.explain else {}
    if explanation:
        with open(out / "explanation.json", "w") as f:
            json.dump(explanation, f, indent=2, default=_json_default)
        if "rules" in explanation:
            (out / "rules.txt").write_text(explanation["rules"])

    example = splits.test[feats].iloc[0].to_dict()
    meta = {
        "name": spec.name,
        "title": spec.title,
        "task": spec.task,
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "pipeline_version": __version__,
        "environment": {"python": platform.python_version(), "sklearn": sklearn.__version__},
        "data": {"rows": len(df), "sha256": data_hash, "seed": cfg.seed, "synthetic": True},
        "split": {
            "strategy": "chronological" if spec.time_col else ("stratified" if spec.task == "classification" else "random"),
            "config": {"train": cfg.train, "val": cfg.val, "test": cfg.test},
            "sizes": splits.sizes(),
        },
        "selection": {
            "scoring": spec.scoring,
            "best_params": best_params,
            "best_val_score": best["val_score"],
            "trials": sorted(trials, key=lambda t: -t["val_score"]),
            "refit_on_train_val": refit_on_train_val,
        },
        "cross_validation": {
            "folds": cfg.cv_folds,
            "scheme": type(cv).__name__,
            "scores": [float(s) for s in cv_scores],
            "mean": float(np.mean(cv_scores)),
            "std": float(np.std(cv_scores)),
        },
        "metrics": {"train": train_metrics, "validation": val_metrics, "test": test_metrics},
        "schema": {
            "features": feats,
            "dtypes": {c: str(splits.test[c].dtype) for c in feats},
            "example": example,
            "target": tgt,
        },
        "model_file": "model.joblib",
        "model_sha256": _sha256_file(model_path),
    }
    with open(out / "metadata.json", "w") as f:
        json.dump(meta, f, indent=2, default=_json_default)
    return meta


def _headline(meta: dict) -> str:
    t = meta["metrics"]["test"]
    if meta["task"] == "regression":
        return f"RMSE={t['rmse']:.2f}  MAE={t['mae']:.2f}  R2={t['r2']:.3f}"
    s = f"acc={t['accuracy']:.3f}  f1={t['f1']:.3f}"
    if "roc_auc" in t:
        s += f"  auc={t['roc_auc']:.3f}"
    return s


def run(
    names: list[str],
    cfg: SplitConfig,
    out_root: Path = ARTIFACT_DIR,
    n_rows: int | None = None,
    refit: bool = True,
    save_data: bool = True,
) -> tuple[Path, dict]:
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = out_root / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    summary = {}
    for name in names:
        spec = SPECS[name]
        print(f"\n=== {spec.title} ===")
        meta = train_one(spec, cfg, run_dir, n_rows=n_rows, refit_on_train_val=refit, save_data=save_data)
        sz = meta["split"]["sizes"]
        cvm = meta["cross_validation"]
        print(f"split  {meta['split']['strategy']}: train={sz['train']} val={sz['val']} test={sz['test']}")
        print(f"best   {meta['selection']['best_params']}  (val {spec.scoring}={meta['selection']['best_val_score']:.4f})")
        print(f"cv     {cvm['scheme']} {cvm['mean']:.4f} +/- {cvm['std']:.4f}")
        print(f"TEST   {_headline(meta)}")
        summary[name] = {
            "title": spec.title,
            "task": spec.task,
            "best_params": meta["selection"]["best_params"],
            "test": meta["metrics"]["test"],
            "cv_mean": cvm["mean"],
            "model_sha256": meta["model_sha256"],
        }

    manifest = {
        "run_id": run_id,
        "pipeline_version": __version__,
        "split": {"train": cfg.train, "val": cfg.val, "test": cfg.test, "seed": cfg.seed},
        "models": summary,
    }
    with open(run_dir / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2, default=_json_default)
    return run_dir, manifest


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Train Allonola models (60/20/20 by default).")
    p.add_argument("--models", nargs="+", default=["all"], help=f"all or any of: {', '.join(SPECS)}")
    p.add_argument("--split", nargs=3, type=float, default=[60, 20, 20], metavar=("TRAIN", "VAL", "TEST"),
                   help="percentages that sum to 100 (default 60 20 20)")
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--cv-folds", type=int, default=5)
    p.add_argument("--rows", type=int, default=None, help="override synthetic dataset size")
    p.add_argument("--out", type=Path, default=ARTIFACT_DIR)
    p.add_argument("--no-refit", action="store_true", help="keep the train-only model instead of refitting on train+val")
    p.add_argument("--no-data", action="store_true", help="do not save the train/val/test CSVs")
    p.add_argument("--drive", action="store_true", help="upload the run to Google Drive afterwards")
    p.add_argument("--drive-auth", choices=["service_account", "oauth"], default="service_account")
    p.add_argument("--drive-folder", default=DRIVE_FOLDER_ID, help="Drive folder ID (or ALLONOLA_DRIVE_FOLDER_ID)")
    a = p.parse_args(argv)

    names = list(SPECS) if a.models == ["all"] else a.models
    unknown = [n for n in names if n not in SPECS]
    if unknown:
        p.error(f"unknown model(s): {unknown}")
    tr, va, te = (x / sum(a.split) for x in a.split)
    cfg = SplitConfig(train=tr, val=va, test=te, seed=a.seed, cv_folds=a.cv_folds)

    run_dir, manifest = run(names, cfg, a.out, a.rows, refit=not a.no_refit, save_data=not a.no_data)
    print(f"\nArtifacts: {run_dir}")

    if a.drive:
        from .drive_store import build_service, DriveStore, publish_run

        if not a.drive_folder:
            p.error("--drive needs --drive-folder or ALLONOLA_DRIVE_FOLDER_ID")
        store = DriveStore(build_service(a.drive_auth), a.drive_folder)
        info = publish_run(store, run_dir)
        print(f"Uploaded {info['files']} files to Drive -> runs/{manifest['run_id']} (latest.json updated)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
