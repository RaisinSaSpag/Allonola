"""Train / validation / test splitting.

* Tabular classification -> stratified random split (class ratios preserved).
* Regression             -> random split.
* Anything with time     -> chronological split (past trains, future tests),
                            because a random split would leak the future.
"""
from __future__ import annotations

from dataclasses import dataclass

import pandas as pd
from sklearn.model_selection import train_test_split

from .config import SplitConfig


@dataclass
class Splits:
    train: pd.DataFrame
    val: pd.DataFrame
    test: pd.DataFrame

    def sizes(self) -> dict:
        n = len(self.train) + len(self.val) + len(self.test)
        return {
            "train": len(self.train),
            "val": len(self.val),
            "test": len(self.test),
            "total": n,
            "fractions": {
                "train": round(len(self.train) / n, 4),
                "val": round(len(self.val) / n, 4),
                "test": round(len(self.test) / n, 4),
            },
        }


def three_way_split(
    df: pd.DataFrame,
    target: str,
    cfg: SplitConfig,
    stratify: bool = False,
    time_col: str | None = None,
) -> Splits:
    if len(df) < 30:
        raise ValueError("Need at least 30 rows to make a 3-way split")

    if time_col:
        ordered = df.sort_values(time_col, kind="stable").reset_index(drop=True)
        n = len(ordered)
        n_train = int(round(n * cfg.train))
        n_val = int(round(n * cfg.val))
        return Splits(
            ordered.iloc[:n_train].copy(),
            ordered.iloc[n_train : n_train + n_val].copy(),
            ordered.iloc[n_train + n_val :].copy(),
        )

    strat = df[target] if stratify else None
    rest, test = train_test_split(df, test_size=cfg.test, random_state=cfg.seed, stratify=strat)
    # val is a fraction of the *remainder*, so the final proportions are exact
    val_share = cfg.val / (cfg.train + cfg.val)
    strat_rest = rest[target] if stratify else None
    train, val = train_test_split(rest, test_size=val_share, random_state=cfg.seed, stratify=strat_rest)
    return Splits(train.copy(), val.copy(), test.copy())
