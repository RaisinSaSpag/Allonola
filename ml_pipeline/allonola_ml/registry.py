"""Load trained models (local first, Google Drive as the source of truth) and predict."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import joblib
import pandas as pd

from .config import ARTIFACT_DIR


def _latest_local_run(root: Path) -> Path | None:
    runs = sorted(p for p in root.glob("*") if (p / "manifest.json").exists())
    return runs[-1] if runs else None


class ModelRegistry:
    """Loads models from a run folder.

    SECURITY: .joblib files are pickles. Only load files you produced yourself;
    the sha256 recorded in metadata.json is checked before every load.
    """

    def __init__(self, root: Path = ARTIFACT_DIR, drive_store=None, run_id: str | None = None):
        self.root = Path(root)
        self.drive = drive_store
        self.run_dir: Path | None = None
        self._models: dict = {}
        self._meta: dict = {}
        self.refresh(run_id)

    def refresh(self, run_id: str | None = None) -> None:
        if self.drive is not None:
            from .drive_store import fetch_run

            self.root.mkdir(parents=True, exist_ok=True)
            self.run_dir = fetch_run(self.drive, self.root, run_id)
        else:
            self.run_dir = (self.root / run_id) if run_id else _latest_local_run(self.root)
        if not self.run_dir or not (self.run_dir / "manifest.json").exists():
            raise FileNotFoundError("No trained run found. Run: python -m allonola_ml.train")
        self._models.clear()
        self._meta.clear()

    def names(self) -> list[str]:
        return sorted(json.loads((self.run_dir / "manifest.json").read_text())["models"])

    def metadata(self, name: str) -> dict:
        if name not in self._meta:
            path = self.run_dir / name / "metadata.json"
            if not path.exists():
                raise KeyError(name)
            self._meta[name] = json.loads(path.read_text())
        return self._meta[name]

    def model(self, name: str):
        if name not in self._models:
            meta = self.metadata(name)
            path = self.run_dir / name / meta["model_file"]
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest != meta["model_sha256"]:
                raise ValueError(f"Checksum mismatch for {name}: file changed since training")
            self._models[name] = joblib.load(path)
        return self._models[name]

    def predict(self, name: str, rows: list[dict]) -> list[dict]:
        meta = self.metadata(name)
        feats = meta["schema"]["features"]
        df = pd.DataFrame(rows)
        missing = [c for c in feats if c not in df.columns]
        if missing:
            raise ValueError(f"Missing field(s): {missing}")
        df = df[feats]
        for c, dt in meta["schema"]["dtypes"].items():
            if dt.startswith(("int", "float")):
                df[c] = pd.to_numeric(df[c], errors="raise")
        model = self.model(name)
        pred = model.predict(df)
        out = [{"prediction": p.item() if hasattr(p, "item") else p} for p in pred]
        if meta["task"] == "classification" and hasattr(model, "predict_proba"):
            proba = model.predict_proba(df)
            classes = [c.item() if hasattr(c, "item") else c for c in model.classes_]
            for o, row in zip(out, proba):
                o["probabilities"] = {str(c): round(float(p), 4) for c, p in zip(classes, row)}
        return out
