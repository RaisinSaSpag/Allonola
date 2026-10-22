"""Central configuration (splits, seeds, paths, Drive)."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class SplitConfig:
    """Train / validation / test proportions.

    Default is the classic 60 / 20 / 20:
      * train       -> fit the model
      * validation  -> choose hyper-parameters (never used to fit)
      * test        -> touched ONCE at the end for the honest final score
    """

    train: float = 0.60
    val: float = 0.20
    test: float = 0.20
    seed: int = 42
    cv_folds: int = 5

    def __post_init__(self) -> None:
        total = self.train + self.val + self.test
        if abs(total - 1.0) > 1e-9:
            raise ValueError(f"Split fractions must sum to 1.0, got {total:.4f}")
        if min(self.train, self.val, self.test) <= 0:
            raise ValueError("Every split fraction must be > 0")
        if self.cv_folds < 2:
            raise ValueError("cv_folds must be >= 2")


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = Path(os.getenv("ALLONOLA_ARTIFACTS", ROOT / "artifacts"))

# Google Drive: ID of the folder that will hold models and data
# (the long id at the end of the folder URL).
DRIVE_FOLDER_ID = os.getenv("ALLONOLA_DRIVE_FOLDER_ID", "")
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", str(ROOT / "service_account.json"))
OAUTH_CLIENT_FILE = os.getenv("GOOGLE_OAUTH_CLIENT_FILE", str(ROOT / "credentials.json"))
OAUTH_TOKEN_FILE = os.getenv("GOOGLE_OAUTH_TOKEN_FILE", str(ROOT / "token.json"))
