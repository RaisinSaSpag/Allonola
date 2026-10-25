"""Model specifications: one per algorithm on the website.

Every model is a single sklearn Pipeline that contains its own preprocessing, so
scalers / vectorisers are fitted on training rows only (no leakage) and the saved
file can be used on raw input rows with no extra code.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier, export_text

from . import datasets as ds

SEED = 42


@dataclass
class ModelSpec:
    name: str
    title: str
    task: str                       # "classification" | "regression"
    make_data: Callable[..., pd.DataFrame]
    features: list[str]
    target: str
    scoring: str                    # sklearn scorer used to pick hyper-parameters
    grid: dict[str, list]
    build: Callable[..., object]
    time_col: str | None = None     # set -> chronological split + TimeSeriesSplit CV
    # Prefer the first (= simplest, grids are listed simple -> complex) trial whose
    # validation score is within this distance of the best one.
    tolerance: float = 0.0
    extra_cols: list[str] = field(default_factory=list)  # kept in the data, not used as features
    explain: Callable[[object, "ModelSpec"], dict] | None = None


# ---- helpers (module level so joblib can pickle them) -------------------------
def add_log_price_ratio(X: pd.DataFrame) -> pd.DataFrame:
    X = X.copy()
    X["log_price_ratio"] = np.log(X["price"] / X["base_price"])
    return X


def _onehot():
    return OneHotEncoder(handle_unknown="ignore")


# ---- 1. linear regression -------------------------------------------------------
def build_linear(alpha: float = 1.0):
    prep = ColumnTransformer(
        [
            ("cat", _onehot(), ["product", "category"]),
            ("num", "passthrough", ["log_price_ratio", "promo", "is_weekend"]),
        ]
    )
    pipe = Pipeline(
        [("ratio", FunctionTransformer(add_log_price_ratio)), ("prep", prep), ("lin", Ridge(alpha=alpha))]
    )
    # model log(units): coefficients on log price ratio are the price elasticity
    return TransformedTargetRegressor(regressor=pipe, func=np.log1p, inverse_func=np.expm1)


def explain_linear(model, spec) -> dict:
    pipe = model.regressor_
    names = pipe.named_steps["prep"].get_feature_names_out()
    coef = pipe.named_steps["lin"].coef_
    d = {n.split("__", 1)[-1]: float(c) for n, c in zip(names, coef)}
    return {
        "price_elasticity": d.get("log_price_ratio"),
        "promo_effect_pct": float(np.expm1(d.get("promo", 0.0)) * 100),
        "coefficients": d,
        "note": "Target is log(1+units); elasticity < 0 means demand falls as price rises.",
    }


# ---- 2. naive bayes -------------------------------------------------------------
def build_nb(alpha: float = 1.0, ngram_max: int = 1):
    prep = ColumnTransformer([("tfidf", TfidfVectorizer(ngram_range=(1, ngram_max), min_df=2), "text")])
    return Pipeline([("prep", prep), ("clf", MultinomialNB(alpha=alpha))])


def explain_nb(model, spec) -> dict:
    vocab = np.array(model.named_steps["prep"].get_feature_names_out())
    clf = model.named_steps["clf"]
    out = {}
    for i, cls in enumerate(clf.classes_):
        others = np.delete(clf.feature_log_prob_, i, axis=0).mean(axis=0)
        top = np.argsort(clf.feature_log_prob_[i] - others)[::-1][:10]
        out[str(cls)] = [v.split("__", 1)[-1] for v in vocab[top]]
    return {"top_tokens_per_class": out}


# ---- 3. knn ---------------------------------------------------------------------
def build_knn(n_neighbors: int = 5, weights: str = "uniform"):
    return Pipeline(
        [("scale", StandardScaler()), ("clf", KNeighborsClassifier(n_neighbors=n_neighbors, weights=weights))]
    )


# ---- 4. svm ---------------------------------------------------------------------
SVM_CATEGORICAL = ["payment", "location"]
SVM_NUMERIC = [
    "order_amount", "account_age_days", "items_per_order",
    "address_mismatch", "orders_last_24h", "new_device",
]


def build_svm(C: float = 1.0, gamma="scale"):
    prep = ColumnTransformer(
        [
            ("cat", _onehot(), SVM_CATEGORICAL),
            ("num", StandardScaler(), SVM_NUMERIC),
        ]
    )
    return Pipeline(
        [
            ("prep", prep),
            ("clf", SVC(kernel="rbf", C=C, gamma=gamma, class_weight="balanced", probability=True, random_state=SEED)),
        ]
    )


# ---- 5. decision tree -----------------------------------------------------------
def build_tree(max_depth: int = 4, min_samples_leaf: int = 20):
    prep = ColumnTransformer(
        [
            ("cat", _onehot(), ["category", "courier"]),
            ("num", "passthrough", ["seller_rating", "distance_km", "return_history"]),
        ]
    )
    return Pipeline(
        [
            ("prep", prep),
            (
                "clf",
                DecisionTreeClassifier(
                    max_depth=max_depth, min_samples_leaf=min_samples_leaf, class_weight="balanced", random_state=SEED
                ),
            ),
        ]
    )


def explain_tree(model, spec) -> dict:
    names = [n.split("__", 1)[-1] for n in model.named_steps["prep"].get_feature_names_out()]
    clf = model.named_steps["clf"]
    return {
        "rules": export_text(clf, feature_names=names),
        "feature_importance": {n: float(v) for n, v in zip(names, clf.feature_importances_) if v > 0},
        "depth": int(clf.get_depth()),
        "leaves": int(clf.get_n_leaves()),
    }


# ---- 6. ann ---------------------------------------------------------------------
def build_ann(hidden=(32, 16), alpha: float = 1e-4):
    return Pipeline(
        [
            ("scale", StandardScaler()),
            (
                "clf",
                MLPClassifier(
                    hidden_layer_sizes=tuple(hidden), alpha=alpha, max_iter=800, random_state=SEED
                ),
            ),
        ]
    )


SPECS: dict[str, ModelSpec] = {
    s.name: s
    for s in [
        ModelSpec(
            name="linear_regression",
            title="Demand forecasting (Linear Regression)",
            task="regression",
            make_data=ds.make_demand,
            features=["product", "category", "price", "base_price", "promo", "is_weekend"],
            target="units_sold",
            scoring="neg_root_mean_squared_error",
            grid={"alpha": [0.001, 0.01, 0.1, 1.0, 10.0]},
            build=build_linear,
            time_col="date",
            extra_cols=["date", "day_of_week"],
            explain=explain_linear,
        ),
        ModelSpec(
            name="naive_bayes",
            title="Review sentiment & spam (Naive Bayes)",
            task="classification",
            make_data=ds.make_reviews,
            features=["text"],
            target="label",
            scoring="f1_macro",
            grid={"alpha": [0.1, 0.5, 1.0], "ngram_max": [1, 2]},
            build=build_nb,
            explain=explain_nb,
        ),
        ModelSpec(
            name="knn",
            title="Next-category recommender (KNN)",
            task="classification",
            make_data=ds.make_shoppers,
            features=[
                "share_fashion", "share_electronics", "share_home", "share_grocery",
                "avg_order_value", "sessions_per_week", "avg_rating_given",
            ],
            target="next_category",
            scoring="f1_macro",
            grid={"n_neighbors": [3, 5, 9, 15, 25, 45], "weights": ["uniform", "distance"]},
            build=build_knn,
        ),
        ModelSpec(
            name="svm",
            title="Order fraud detection (SVM)",
            task="classification",
            make_data=ds.make_orders,
            features=SVM_CATEGORICAL + SVM_NUMERIC,
            target="is_fraud",
            scoring="f1",   # fraud is rare (accuracy misleads); F1 judges the served predict() output, not just the ranking
            grid={"C": [0.01, 0.03, 0.1, 0.5, 1.0, 5.0, 10.0], "gamma": ["scale", 0.005, 0.02, 0.1]},
            build=build_svm,
        ),
        ModelSpec(
            name="decision_tree",
            title="Late-delivery risk (Decision Tree)",
            task="classification",
            make_data=ds.make_deliveries,
            features=["category", "seller_rating", "courier", "distance_km", "return_history"],
            target="is_late",
            scoring="f1",
            grid={"max_depth": [2, 3, 4, 5, 6, 8, 10], "min_samples_leaf": [20, 50, 100]},
            tolerance=0.01,   # explainability matters more than the last 1 % of F1
            build=build_tree,
            explain=explain_tree,
        ),
        ModelSpec(
            name="ann",
            title="Shopper churn (Neural Network)",
            task="classification",
            make_data=ds.make_churn,
            features=[
                "pages_viewed_session", "searches_30d", "past_purchases", "days_since_last_visit",
            ],
            target="churned",
            scoring="roc_auc",
            grid={"hidden": [(16,), (32, 16), (64, 32)], "alpha": [1e-4, 1e-2]},
            build=build_ann,
        ),
    ]
}
