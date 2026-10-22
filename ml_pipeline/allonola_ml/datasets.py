"""Synthetic (seeded, reproducible) datasets that mirror the six use cases on the website.

All data is fictional. Replace these generators with real exports (same column
names) when real data exists; nothing else in the pipeline has to change.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

CATEGORIES = ["Fashion", "Electronics", "Home", "Grocery"]


def _sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


def _calibrate(z: np.ndarray, rate: float) -> np.ndarray:
    """Shift the logit so the mean probability equals `rate` (bisection)."""
    lo, hi = -30.0, 30.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if _sigmoid(z + mid).mean() < rate:
            lo = mid
        else:
            hi = mid
    return _sigmoid(z + (lo + hi) / 2)


# 1. Linear regression: demand forecasting ----------------------------------
def make_demand(n: int = 2400, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    n_products = 24
    n_days = max(n // n_products, 1)
    cat = rng.choice(CATEGORIES, n_products)
    base_price = np.round(rng.uniform(150, 2500, n_products))
    base_units = rng.uniform(40, 160, n_products)

    rows = []
    start = pd.Timestamp("2025-01-01")
    for d in range(n_days):
        date = start + pd.Timedelta(days=d)
        weekend = int(date.dayofweek >= 5)
        for p in range(n_products):
            price = base_price[p] * rng.uniform(0.75, 1.25)
            promo = int(rng.random() < 0.25)
            units = (
                base_units[p]
                * (price / base_price[p]) ** -1.3
                * (1 + 0.22 * promo)
                * (1.10 if weekend else 1.0)
                * rng.lognormal(0, 0.12)
            )
            rows.append((date, f"P-{p:03d}", cat[p], price, base_price[p], promo, date.dayofweek, weekend, int(round(units))))
    return pd.DataFrame(
        rows,
        columns=["date", "product", "category", "price", "base_price", "promo", "day_of_week", "is_weekend", "units_sold"],
    )


# 2. Naive Bayes: review sentiment / spam ------------------------------------
_POS = "great excellent love perfect sturdy worth comfortable recommend quality happy amazing fast reliable".split()
_NEG = "broken terrible late refund poor disappointed cheap damaged waste faulty slow awful".split()
_SPAM = "free gift card click link win prize now limited offer visit promo code cash claim".split()
_FILL = "the product item arrived seller order package bought this was and very really it my".split()


def make_reviews(n: int = 3000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    labels = rng.choice(["positive", "negative", "spam"], n, p=[0.45, 0.35, 0.20])
    texts = []
    for lab in labels:
        main, other = {"positive": (_POS, _NEG), "negative": (_NEG, _POS), "spam": (_SPAM, _POS)}[lab]
        words = list(rng.choice(main, rng.integers(3, 6)))
        words += list(rng.choice(_FILL, rng.integers(3, 7)))
        words += list(rng.choice(other, rng.integers(0, 4)))  # mixed-signal reviews
        rng.shuffle(words)
        texts.append(" ".join(words))
    # ~6 % of labels are simply wrong (sarcasm, mis-clicked stars, moderator error)
    flip = rng.random(n) < 0.06
    all_labels = np.array(["positive", "negative", "spam"])
    labels = np.where(flip, [rng.choice(all_labels[all_labels != l]) for l in labels], labels)
    return pd.DataFrame({"text": texts, "label": labels})


# 3. KNN: next purchase category from shopper behaviour ----------------------
def make_shoppers(n: int = 2000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    shares = rng.dirichlet([2, 2, 2, 2], n)
    score = 4 * shares + rng.normal(0, 0.5, shares.shape)
    probs = np.exp(score) / np.exp(score).sum(axis=1, keepdims=True)
    nxt = np.array([rng.choice(CATEGORIES, p=p) for p in probs])
    return pd.DataFrame(
        {
            "share_fashion": shares[:, 0],
            "share_electronics": shares[:, 1],
            "share_home": shares[:, 2],
            "share_grocery": shares[:, 3],
            "avg_order_value": rng.lognormal(6.8, 0.5, n).round(2),
            "sessions_per_week": rng.poisson(5, n),
            "avg_rating_given": np.clip(rng.normal(4.1, 0.6, n), 1, 5).round(2),
            "next_category": nxt,
        }
    )


# 4. SVM: order fraud ---------------------------------------------------------
def make_orders(n: int = 4000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    amount = rng.lognormal(7.0, 0.8, n).round(2)
    age = (rng.exponential(300, n) + 1).round()
    items = rng.poisson(1.8, n) + 1
    cod = rng.binomial(1, 0.35, n)
    mismatch = rng.binomial(1, 0.12, n)
    last24 = rng.poisson(0.6, n)
    new_dev = rng.binomial(1, 0.20, n)
    z = (
        0.55 * np.log1p(amount / 1000)
        - 0.012 * np.minimum(age, 365) / 10
        + 0.25 * items
        + 0.9 * cod
        + 1.6 * mismatch
        + 0.7 * last24
        + 1.1 * new_dev
    )
    fraud = rng.binomial(1, _calibrate(z, 0.08))
    return pd.DataFrame(
        {
            "order_amount": amount,
            "account_age_days": age,
            "items_per_order": items,
            "is_cod": cod,
            "address_mismatch": mismatch,
            "orders_last_24h": last24,
            "new_device": new_dev,
            "is_fraud": fraud,
        }
    )


# 5. Decision tree: late delivery --------------------------------------------
def make_deliveries(n: int = 3000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    cat = rng.choice(["Perishable", "Electronics", "Fashion", "Home"], n, p=[0.2, 0.3, 0.3, 0.2])
    rating = rng.uniform(2.5, 5.0, n).round(1)
    courier = rng.choice(["A", "B", "C"], n)
    dist = rng.lognormal(2.6, 0.7, n).round(1)
    returns = rng.poisson(0.5, n)
    z = (
        1.2 * (cat == "Perishable")
        + 0.04 * dist
        - 0.7 * (rating - 4)
        + 0.9 * (courier == "C")
        + 0.3 * returns
    )
    late = rng.binomial(1, _calibrate(z, 0.30))
    return pd.DataFrame(
        {
            "category": cat,
            "seller_rating": rating,
            "courier": courier,
            "distance_km": dist,
            "return_history": returns,
            "is_late": late,
        }
    )


# 6. ANN: shopper churn -------------------------------------------------------
def make_churn(n: int = 3000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    recency = rng.exponential(25, n).round()
    sessions = rng.poisson(8, n)
    orders = rng.poisson(3, n)
    basket = rng.lognormal(6.5, 0.5, n).round(2)
    tickets = rng.poisson(0.5, n)
    discount = rng.uniform(0, 1, n).round(2)
    z = (
        0.05 * recency
        - 0.15 * sessions
        - 0.30 * orders
        + 0.40 * tickets
        - 0.80 * discount
        + 0.0002 * (2000 - np.minimum(basket, 4000))
        + 0.3 * np.sin(recency / 7) * (orders == 0)  # mild non-linearity
    )
    churn = rng.binomial(1, _calibrate(z, 0.25))
    return pd.DataFrame(
        {
            "recency_days": recency,
            "sessions_30d": sessions,
            "orders_90d": orders,
            "avg_basket": basket,
            "support_tickets": tickets,
            "discount_usage": discount,
            "churned": churn,
        }
    )
