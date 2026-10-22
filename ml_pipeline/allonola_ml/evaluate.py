"""Metrics for classification and regression."""
from __future__ import annotations

import numpy as np
from sklearn import metrics as m


def classification_report(model, X, y) -> dict:
    classes = list(model.classes_)
    pred = model.predict(X)
    binary = len(classes) == 2
    avg = "binary" if binary else "macro"
    out = {
        "n": int(len(y)),
        "accuracy": float(m.accuracy_score(y, pred)),
        "balanced_accuracy": float(m.balanced_accuracy_score(y, pred)),
        "precision": float(m.precision_score(y, pred, average=avg, zero_division=0)),
        "recall": float(m.recall_score(y, pred, average=avg, zero_division=0)),
        "f1": float(m.f1_score(y, pred, average=avg, zero_division=0)),
        "classes": [c.item() if hasattr(c, "item") else c for c in classes],
        "confusion_matrix": m.confusion_matrix(y, pred, labels=classes).tolist(),
    }
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)
        try:
            if binary:
                out["roc_auc"] = float(m.roc_auc_score(y, proba[:, 1]))
                out["average_precision"] = float(m.average_precision_score(y, proba[:, 1]))
            else:
                out["roc_auc"] = float(m.roc_auc_score(y, proba, multi_class="ovr", average="macro", labels=classes))
        except ValueError:
            pass  # a split with a single class cannot produce AUC
    return out


def regression_report(model, X, y) -> dict:
    pred = model.predict(X)
    return {
        "n": int(len(y)),
        "mae": float(m.mean_absolute_error(y, pred)),
        "rmse": float(np.sqrt(m.mean_squared_error(y, pred))),
        "r2": float(m.r2_score(y, pred)),
    }


def report(task: str, model, X, y) -> dict:
    return classification_report(model, X, y) if task == "classification" else regression_report(model, X, y)
