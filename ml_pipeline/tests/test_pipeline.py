import json
import re
import tempfile
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

from allonola_ml.config import SplitConfig
from allonola_ml.models import SPECS
from allonola_ml.splits import three_way_split
from allonola_ml.train import train_one


class SplitTests(unittest.TestCase):
    def setUp(self):
        rng = np.random.default_rng(0)
        self.df = pd.DataFrame({
            "id": range(1000),
            "x": rng.normal(size=1000),
            "y": rng.choice([0, 1], 1000, p=[0.9, 0.1]),
            "t": pd.date_range("2025-01-01", periods=1000),
        })

    def test_default_is_60_20_20(self):
        s = three_way_split(self.df, "y", SplitConfig(), stratify=True)
        self.assertEqual((len(s.train), len(s.val), len(s.test)), (600, 200, 200))

    def test_no_row_in_two_splits_and_none_lost(self):
        s = three_way_split(self.df, "y", SplitConfig(), stratify=True)
        ids = [set(p["id"]) for p in (s.train, s.val, s.test)]
        self.assertFalse(ids[0] & ids[1] or ids[0] & ids[2] or ids[1] & ids[2])
        self.assertEqual(len(ids[0] | ids[1] | ids[2]), 1000)

    def test_stratified_keeps_class_ratio(self):
        s = three_way_split(self.df, "y", SplitConfig(), stratify=True)
        base = self.df["y"].mean()
        for part in (s.train, s.val, s.test):
            self.assertAlmostEqual(part["y"].mean(), base, delta=0.01)

    def test_chronological_has_no_future_leakage(self):
        s = three_way_split(self.df.sample(frac=1, random_state=1), "y", SplitConfig(), time_col="t")
        self.assertLess(s.train["t"].max(), s.val["t"].min())
        self.assertLess(s.val["t"].max(), s.test["t"].min())

    def test_same_seed_same_split(self):
        a = three_way_split(self.df, "y", SplitConfig(seed=7), stratify=True)
        b = three_way_split(self.df, "y", SplitConfig(seed=7), stratify=True)
        self.assertEqual(list(a.test["id"]), list(b.test["id"]))

    def test_bad_config_rejected(self):
        with self.assertRaises(ValueError):
            SplitConfig(train=0.7, val=0.2, test=0.2)
        with self.assertRaises(ValueError):
            SplitConfig(train=1.0, val=0.0, test=0.0)


class TrainingTests(unittest.TestCase):
    def test_every_model_trains_saves_and_predicts(self):
        from allonola_ml.registry import ModelRegistry
        from allonola_ml.train import run

        cfg = SplitConfig(cv_folds=3)
        with tempfile.TemporaryDirectory() as tmp:
            run_dir, manifest = run(list(SPECS), cfg, Path(tmp), n_rows=720)
            reg = ModelRegistry(Path(tmp))
            self.assertEqual(sorted(manifest["models"]), reg.names())
            for name in SPECS:
                meta = reg.metadata(name)
                fr = meta["split"]["sizes"]["fractions"]
                self.assertAlmostEqual(fr["train"], 0.6, delta=0.01)
                self.assertAlmostEqual(fr["val"], 0.2, delta=0.01)
                self.assertAlmostEqual(fr["test"], 0.2, delta=0.01)
                self.assertTrue((run_dir / name / "data" / "test.csv").exists())
                out = reg.predict(name, [meta["schema"]["example"]])
                self.assertEqual(len(out), 1)
                self.assertIn("prediction", out[0])
                if meta["task"] == "classification":
                    self.assertAlmostEqual(sum(out[0]["probabilities"].values()), 1.0, places=2)

    def test_tampered_model_is_rejected(self):
        from allonola_ml.registry import ModelRegistry

        with tempfile.TemporaryDirectory() as tmp:
            cfg = SplitConfig(cv_folds=3)
            run_dir = Path(tmp) / "r1"
            run_dir.mkdir()
            train_one(SPECS["decision_tree"], cfg, run_dir, n_rows=600)
            (run_dir / "manifest.json").write_text(json.dumps({"models": {"decision_tree": {}}}))
            with open(run_dir / "decision_tree" / "model.joblib", "ab") as f:
                f.write(b"tamper")
            with self.assertRaises(ValueError):
                ModelRegistry(Path(tmp), run_id="r1").model("decision_tree")

    def test_missing_field_is_reported(self):
        from allonola_ml.registry import ModelRegistry

        with tempfile.TemporaryDirectory() as tmp:
            run_dir = Path(tmp) / "r1"
            run_dir.mkdir()
            train_one(SPECS["svm"], SplitConfig(cv_folds=3), run_dir, n_rows=600)
            (run_dir / "manifest.json").write_text(json.dumps({"models": {"svm": {}}}))
            with self.assertRaises(ValueError):
                ModelRegistry(Path(tmp), run_id="r1").predict("svm", [{"order_amount": 10}])

    def test_test_set_never_used_for_selection(self):
        """Corrupting ONLY the test labels (after splitting) must not change the chosen
        hyper-parameters or the cross-validation scores - but must change the test score."""
        from allonola_ml import train as T

        cfg = SplitConfig(cv_folds=3)
        spec = SPECS["decision_tree"]
        real_split = T.three_way_split

        def corrupting_split(*a, **k):
            sp = real_split(*a, **k)
            sp.test[spec.target] = 1 - sp.test[spec.target]
            return sp

        with tempfile.TemporaryDirectory() as tmp:
            m1 = train_one(spec, cfg, Path(tmp) / "a", n_rows=900)
            T.three_way_split = corrupting_split
            try:
                m2 = train_one(spec, cfg, Path(tmp) / "b", n_rows=900)
            finally:
                T.three_way_split = real_split
        self.assertEqual(m1["selection"]["best_params"], m2["selection"]["best_params"])
        self.assertEqual(m1["cross_validation"]["scores"], m2["cross_validation"]["scores"])
        self.assertEqual(m1["metrics"]["validation"], m2["metrics"]["validation"])
        self.assertNotEqual(m1["metrics"]["test"]["accuracy"], m2["metrics"]["test"]["accuracy"])


class FakeDrive:
    """Minimal in-memory stand-in for the Drive v3 `files()` resource."""

    def __init__(self):
        self.items = {}
        self.n = 0

    def files(self):
        return self

    def _new(self, name, parent, mime, data=None):
        self.n += 1
        fid = f"id{self.n}"
        self.items[fid] = {"id": fid, "name": name, "parent": parent, "mimeType": mime, "data": data}
        return fid

    class _Exec:
        def __init__(self, fn): self.fn = fn
        def execute(self): return self.fn()

    def list(self, q="", **kw):
        def run():
            name = re.search(r"name = '((?:[^'\\]|\\.)*)'", q)
            parent = re.search(r"'([^']+)' in parents", q).group(1)
            res = [i for i in self.items.values() if i["parent"] == parent]
            if name:
                res = [i for i in res if i["name"] == name.group(1).replace("\\'", "'")]
            folder = "application/vnd.google-apps.folder"
            if f"mimeType = '{folder}'" in q:
                res = [i for i in res if i["mimeType"] == folder]
            elif f"mimeType != '{folder}'" in q:
                res = [i for i in res if i["mimeType"] != folder]
            return {"files": [{"id": i["id"], "name": i["name"], "mimeType": i["mimeType"]} for i in res]}
        return self._Exec(run)

    def create(self, body, media_body=None, **kw):
        def run():
            data = media_body.getbytes(0, media_body.size()) if media_body else None
            return {"id": self._new(body["name"], body["parents"][0], body["mimeType"] if "mimeType" in body else "file", data)}
        return self._Exec(run)

    def update(self, fileId, media_body, **kw):
        def run():
            self.items[fileId]["data"] = media_body.getbytes(0, media_body.size())
            return {"id": fileId}
        return self._Exec(run)


class DriveTests(unittest.TestCase):
    def _run_dir(self, tmp, run_id="20260101T000000Z", payload=b"v1"):
        d = Path(tmp) / run_id
        (d / "knn" / "data").mkdir(parents=True, exist_ok=True)
        (d / "manifest.json").write_text(json.dumps({"run_id": run_id, "models": {}}))
        (d / "knn" / "model.joblib").write_bytes(payload)
        (d / "knn" / "data" / "train.csv").write_text("a,b\n1,2\n")
        return d

    def test_publish_creates_tree_and_pointer(self):
        from allonola_ml.drive_store import DriveStore, publish_run

        fake = FakeDrive()
        store = DriveStore(fake, "ROOT")
        with tempfile.TemporaryDirectory() as tmp:
            info = publish_run(store, self._run_dir(tmp))
        self.assertEqual(info["files"], 3)
        names = {i["name"] for i in fake.items.values()}
        self.assertTrue({"runs", "20260101T000000Z", "knn", "data", "model.joblib", "train.csv", "latest.json"} <= names)
        latest = store.find("latest.json", "ROOT")
        self.assertEqual(json.loads(fake.items[latest]["data"]), {"run_id": "20260101T000000Z"})

    def test_republish_updates_instead_of_duplicating(self):
        from allonola_ml.drive_store import DriveStore, publish_run

        fake = FakeDrive()
        store = DriveStore(fake, "ROOT")
        with tempfile.TemporaryDirectory() as tmp:
            publish_run(store, self._run_dir(tmp, payload=b"v1"))
            count = len(fake.items)
            publish_run(store, self._run_dir(tmp, payload=b"v2"))
        self.assertEqual(len(fake.items), count)  # nothing duplicated
        model = [i for i in fake.items.values() if i["name"] == "model.joblib"][0]
        self.assertEqual(model["data"], b"v2")

    def test_names_with_quotes_do_not_break_queries(self):
        from allonola_ml.drive_store import DriveStore

        fake = FakeDrive()
        store = DriveStore(fake, "ROOT")
        fid = store.ensure_folder("it's a folder", "ROOT")
        self.assertEqual(store.ensure_folder("it's a folder", "ROOT"), fid)


if __name__ == "__main__":
    unittest.main()
