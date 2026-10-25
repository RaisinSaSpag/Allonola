# Allonola ML pipeline (Python)

Trains the six models behind the website, evaluates them properly, stores them in
**Google Drive**, and serves them to the site through a small JSON API.

| Model | Website page | Task | Split | Selected on |
|---|---|---|---|---|
| `linear_regression` | Demand forecasting | regression | chronological | RMSE |
| `naive_bayes` | Review sentiment / spam | 3-class text | stratified | macro-F1 |
| `knn` | (not on the website) | 4-class | stratified | macro-F1 |
| `svm` | Order fraud | binary, 8 % positives; payment and location features | stratified | F1 |
| `decision_tree` | Late delivery | binary, 30 % positives; site categories and couriers | stratified | F1 (simplest within 0.01) |
| `ann` | Shopper churn | binary, 25 % positives; clickstream, search, purchases, recency | stratified | ROC-AUC |

## About "20-20-60"

The standard recipe is **60 % train / 20 % validation / 20 % test**, which is what
this pipeline uses by default (`--split 60 20 20`). If you meant something else,
pass different percentages, e.g. `--split 70 15 15`.

## Training protocol (what `train.py` does for every model)

1. **Split once**: 60/20/20. Stratified for classification so class ratios match in every
   part; **chronological** for demand data (past trains, future tests, no leakage).
2. **Tune** hyper-parameters: fit on *train*, score on *validation*.
3. **Cross-validate** the winner on train+validation (5-fold; `TimeSeriesSplit` for demand).
4. **Refit** the winner on train+validation (`--no-refit` to disable).
5. **Test once**: the untouched 20 % gives the number you report.

Preprocessing (scalers, TF-IDF, one-hot) lives *inside* each sklearn `Pipeline`, so it is fitted on
training rows only. A unit test proves that corrupting the test labels changes nothing about model
selection.

## Quick start

```bash
cd ml_pipeline
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

python -m allonola_ml.train --models all               # trains + saves to ./artifacts/<run_id>/
python -m unittest discover -s tests -t .              # 13 tests
```

Each model folder contains `model.joblib`, `metadata.json` (split sizes, every trial, CV scores,
train/validation/test metrics, feature schema, SHA-256), `data/{train,val,test}.csv`, and where
meaningful `explanation.json` (price elasticity, top spam words) or `rules.txt` (decision-tree rules).

## Results on the bundled synthetic data (test set, seed 42)

| Model | Test result (held-out, seed 42) | Note |
|---|---|---|
| Linear regression | RMSE 13.8 units, MAE 10.4, R² 0.83 (480 product-days) | 3 products; elasticity ≈ −1.30 in `explanation.json` |
| Naive Bayes | accuracy 0.887, macro-F1 0.887 (600 reviews) | 6 % of labels deliberately wrong |
| KNN | accuracy 0.405 (chance 0.25) | trained but not used on the website; the KNN demo is an item recommender |
| SVM | precision 0.26, recall 0.53, F1 0.35, AUC 0.78 (800 orders) | fraud is rare (8.3 %); numbers at probability cut-off 0.5 |
| Decision tree | accuracy 0.66, F1 0.54, AUC 0.70 (600 orders) | depth 4, readable rules |
| ANN | accuracy 0.825, precision 0.75, recall 0.46, AUC 0.82 (600 shoppers) | churn rate 25 % |

**These numbers describe the synthetic data generators, not real shoppers.** The data is
produced by rules written in `datasets.py`, so a score only shows the pipeline works and how hard
the generator is. Replace each `make_*` function with a real export (same column names) and re-run.

## Google Drive storage

Drive layout:

```
<your folder>/latest.json                      # {"run_id": "..."}
<your folder>/runs/<run_id>/manifest.json
<your folder>/runs/<run_id>/<model>/model.joblib, metadata.json, data/*.csv
```

### Option A: service account (servers, scheduled training)
1. Google Cloud Console → create a project → enable **Google Drive API**.
2. IAM → Service accounts → create one → Keys → add key → JSON. Save it as `ml_pipeline/service_account.json`.
3. In Drive, create a folder (e.g. `Allonola-ML`) and **Share** it with the service account's e-mail
   (looks like `name@project.iam.gserviceaccount.com`) as **Editor**.
4. Copy the folder ID (the last part of the folder URL).

```bash
export ALLONOLA_DRIVE_FOLDER_ID=<folder id>
python -m allonola_ml.train --models all --drive
```

### Option B: your own Google account (laptop)
Create an OAuth client of type *Desktop app*, save it as `credentials.json`, then:

```bash
python -m allonola_ml.train --models all --drive --drive-auth oauth   # browser opens once
```

Re-running updates files in place instead of creating duplicates. **Never commit
`service_account.json`, `credentials.json` or `token.json`** (already in `.gitignore`).

## Serving the models to the website

```bash
python -m allonola_ml.api                      # uses ./artifacts
python -m allonola_ml.api --drive              # pulls the latest run from Drive first
```

| Endpoint | Purpose |
|---|---|
| `GET /health` | status + which run is loaded |
| `GET /models` | list + test metrics |
| `GET /models/<name>` | full metadata |
| `POST /predict/<name>` | `{"rows":[{...}]}` or a single `{...}` |

From the website's JavaScript:

```js
const res = await fetch("http://127.0.0.1:5000/predict/naive_bayes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "click this link for a free gift card" }),
});
const { results } = await res.json();   // [{prediction:"spam", probabilities:{...}}]
```

Required fields per model are in `GET /models/<name>` → `schema.features`.
In production set `ALLONOLA_CORS_ORIGIN` to your site's origin (default `*` is for local development)
and run behind a real WSGI server (e.g. `gunicorn "allonola_ml.api:create_app(...)"`); a static
host such as GitHub Pages cannot run this API.

## Security notes
* `.joblib` files are pickles: only load files you created. The loader refuses any file whose
  SHA-256 differs from `metadata.json`, but anyone who can edit both files on Drive can bypass that,
  so keep the Drive folder private.
* The API validates input and caps request size/rows; add authentication before exposing it publicly.

## Google Colab alternative
In Colab, `from google.colab import drive; drive.mount('/content/drive')` and run
`python -m allonola_ml.train --out /content/drive/MyDrive/Allonola-ML/runs` to write straight to your
Drive without any API setup.

## Running the trained models in the browser (JavaScript)

The website must not use hand-written formulas. After training, export the learned
parameters and check that the JavaScript reproduces Python's predictions:

```bash
python -m allonola_ml.train --models all                       # 1. train -> artifacts/<run_id>/
python -m allonola_ml.export_js artifacts/<run_id>             # 2. write js/ml/model-params.js
node tests/js_parity.js                                        # 3. JS vs Python, row by row
```

* `allonola_ml/export_js.py` writes the weights, scaler statistics, support vectors, tree nodes,
  TF-IDF vocabulary and neural-network layers, plus the 60 SVM demo orders and 6 churn shoppers
  the pages display. The KNN classifier is not exported. It also writes `tests/parity_fixture.json`:
  200 real held-out test rows plus Python's predictions for them.
* `js/ml/inference.js` re-implements each model's prediction step. It is a classic
  script, so it works from `file://` like the rest of the site.
* `tests/js_parity.js` loads the same two files the browser loads and compares every row.
  Labels and decision values must match exactly. Probabilities must match within 1e-6,
  except the SVM, which is allowed 5e-3 (see below).

Latest result (run 20261025T082946Z): all checks pass. The labels match on all 1,000 held-out
rows (five models × 200), the 60 SVM demo orders and the 6 churn shoppers. Decision values agree to
about 1e-13, and probabilities agree to 2.5e-3 for the SVM and about 2e-15 for the others.

Known gap: `SVC(probability=True)` is deprecated in scikit-learn 1.9. Its `predict_proba` is a
Platt sigmoid that differs very slightly from the stored (A, B) on this model. The SVM's
labels and decision values are still exact, and those are what the fraud threshold uses.
