# Allonola: Project Documentation

Allonola is a fictional online-only retail marketplace website built as the final project for ELEC026.23 Machine Learning. The site presents six machine-learning methods, each tied to a business question, with an interactive demo page for each. The demos run models that were trained in Python with scikit-learn and exported to plain JavaScript, so the browser makes the same predictions as the training code.

> **Synthetic data notice.** Every dataset, shopper, order, company figure and dashboard number in this project is synthetic or illustrative. Nothing describes a real company or real customers.

---

## 1. Contents

1. Quick start
2. What the project contains
3. Repository layout
4. The website
5. The six algorithms
6. JavaScript architecture
7. Python ML pipeline
8. Export and parity workflow
9. Tests and verification
10. Results (headline metrics)
11. Known limitations
12. Manual checklist
13. Git and delivery notes

---

## 1. Quick start

### 1.1 View the website

The site is static. Open `index.html` directly in a browser (`file://` works), or serve the folder:

```bash
cd allonola
python -m http.server 8000     # then open http://localhost:8000
```

Chart.js (`js/chart.umd.min.js`) and the fonts (`assets/fonts/`) are local, so the site needs no internet connection.

### 1.2 Check the JavaScript against Python

```bash
node ml_pipeline/tests/js_parity.js
```

Expected: every row PASS and the message "All JavaScript checks reproduce the Python predictions."

### 1.3 Check the browser-side page checks

Open `test/checks.html` in a browser. It runs the page-level assertions (see section 9.3).

### 1.4 Retrain the models

```bash
cd ml_pipeline
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m allonola_ml.train --models all               # writes artifacts/<run_id>/
python -m allonola_ml.export_js artifacts/<run_id>     # rewrites js/ml/model-params.js
node tests/js_parity.js                                # from ml_pipeline/, or use the root path above
```

After retraining, update the numbers shown on the algorithm pages and in `js/data.js` (`reportedResults`), then rerun the checks.

---

## 2. What the project contains

| Part | What it is | Technology |
|---|---|---|
| Website | 11 HTML pages, 6 algorithm demo pages, shared CSS and JS | HTML5, CSS3, ES2020 JavaScript, Chart.js 4.4.1 |
| Demo wiring | Browser code that runs the trained models on the demo inputs | Plain JavaScript (classic scripts) |
| ML pipeline | Synthetic data generation, training, evaluation, export, optional Drive upload and a Flask API | Python 3.13, scikit-learn 1.9.1, pandas, numpy, joblib |
| Parity tests | Node test that checks the JavaScript predictions against Python | Node `vm` sandbox |
| Page checks | Browser page that asserts the demo outputs | Plain JavaScript |

---

## 3. Repository layout

```
allonola/
├── index.html                  Home page
├── about.html                  About the company
├── algorithms.html             Overview of the six algorithms
├── algo-linear-regression.html Demand forecasting and price elasticity demo
├── algo-naive-bayes.html       Review moderation and sentiment demo
├── algo-svm.html               Order fraud screening demo
├── algo-decision-tree.html     Late delivery risk demo
├── algo-ann.html               Shopper churn (neural network) demo
├── algo-knn.html               Item-based collaborative recommendation demo
├── dashboard.html              Dashboard demo (data-driven, illustrative history)
├── contact.html                Contact page
├── README.md                   Short project readme
├── CHANGES.md                  Revision notes for the website
├── DOCUMENTATION.md            This document
│
├── css/
│   ├── base.css                Design tokens (light/dark), reset, typography
│   ├── layout.css              Page grid, header, navigation, footer, responsive rules
│   ├── components.css          Cards, buttons, badges, tables, forms
│   ├── algorithm.css           Styles for the six algorithm pages
│   └── fonts.css               @font-face rules for the local fonts
│
├── js/
│   ├── app.js                  Theme toggle, navigation, breadcrumbs, reveal animations, page init
│   ├── charts.js               Chart.js wrapper: theme-aware colours, accessible summaries
│   ├── table.js                Builds accessible data tables and "View as table" toggles
│   ├── data.js                 Single source for company facts, dataset samples, reported metrics
│   ├── chart.umd.min.js        Chart.js 4.4.1 (bundled, offline)
│   ├── ml/
│   │   ├── model-params.js     GENERATED. Trained parameters for all five exported models
│   │   ├── inference.js        Prediction code for the five exported models
│   │   ├── linear-regression.js  Demand forecast and price-impact calculations
│   │   ├── naive-bayes.js      Review classifier wrapper (uses inference.js)
│   │   ├── svm.js              Fraud threshold evaluation; rule-based category matcher
│   │   ├── decision-tree.js    Delivery-risk prediction and rule display
│   │   ├── ann.js              Shopper churn prediction and risk bands
│   │   └── knn.js              Item-based cosine recommender (not a trained classifier)
│   └── demo/
│       ├── linear-regression-demo.js
│       ├── naive-bayes-demo.js
│       ├── knn-demo.js
│       └── (page wiring for the demo controls)
│
├── assets/
│   ├── fonts/                  Montserrat 600/700, Open Sans 400/600/700 (woff2)
│   └── icons/                  Placeholder folder
│
├── test/
│   └── checks.html             Browser page assertions for the demos
│
└── ml_pipeline/
    ├── README.md               Pipeline readme: models, results table, browser notes
    ├── requirements.txt        Python dependencies
    ├── .gitignore              Ignores artifacts/, __pycache__, credential files
    ├── allonola_ml/
    │   ├── __init__.py
    │   ├── config.py           Split fractions, seed, folder paths, Drive settings
    │   ├── datasets.py         Synthetic data generators (one per model)
    │   ├── splits.py          Stratified and chronological 60/20/20 splits
    │   ├── models.py           Model specifications (features, target, grids, pipelines)
    │   ├── train.py            Training, validation, refit and run folder writer (CLI: train)
    │   ├── evaluate.py         Test-set metrics
    │   ├── export_js.py        Writes model-params.js and the parity fixture (CLI: export_js)
    │   ├── registry.py         Loads saved runs from disk or Google Drive
    │   ├── api.py              Flask API (CLI: python -m allonola_ml.api)
    │   └── drive_store.py      Google Drive upload/download (imports lazily)
    └── tests/
        ├── __init__.py
        ├── test_pipeline.py    unittest suite (Python)
        ├── js_parity.js        Node parity test against the browser code
        └── parity_fixture.json 200 held-out rows per exported model, Python predictions, demo data
```

Folders created by the pipeline but not committed: `ml_pipeline/artifacts/` (training runs) and `__pycache__/`.

---

## 4. The website

### 4.1 Pages

| Page | Purpose |
|---|---|
| `index.html` | Home: company promise, quick links to the algorithms |
| `about.html` | Company background and goals (illustrative) |
| `algorithms.html` | Overview of the six methods, each linked to its demo |
| `algo-*.html` (six) | Explainer plus interactive demo for each method (section 5) |
| `dashboard.html` | Operational dashboard. Latest figures are linked to the models; quarterly history is illustrative |
| `contact.html` | Contact form layout |

### 4.2 Shared behaviour

- **Theme:** dark by default, follows `prefers-color-scheme` on the first visit, and can be switched. Colours are CSS tokens defined on `:root` and redefined for dark mode.
- **Accessibility:** skip links, WCAG AA contrast, keyboard-operable controls, `prefers-reduced-motion` respected, and "View as table" toggles that present each chart's data as an accessible table.
- **Responsive:** works at phone width with a 16 px gutter and no horizontal page scroll.
- **Offline:** Chart.js and fonts are local; no external requests are needed.

### 4.3 Global namespace

Every script adds to one namespace, `window.Allonola`:

| Key | Set by | Contents |
|---|---|---|
| `data` | `js/data.js` | Company facts, dataset samples, `reportedResults` |
| `ui` | `js/app.js` | Theme, navigation, breadcrumbs, reveal animations |
| `charts` | `js/charts.js` | Chart.js wrapper |
| `table` | `js/table.js` | Accessible table builder |
| `modelParams` | `js/ml/model-params.js` | Generated model parameters and demo data |
| `inference` | `js/ml/inference.js` | Prediction functions |
| `ml` | `js/ml/*.js` | Per-algorithm page logic |

Scripts are classic `<script defer>` tags, not ES modules, so the site works from `file://`, where browsers block module imports.

---

## 5. The six algorithms

Each row lists the page, the question the algorithm answers, the data, the model that runs in the browser, and whether that model is trained.

| # | Algorithm | Page | Business question | Trained model used on the site? |
|---|---|---|---|---|
| 1 | Linear regression | `algo-linear-regression.html` | How many units will a product sell at a given price, and how sensitive is demand to price? | Yes (Ridge on log1p target) |
| 2 | Naive Bayes | `algo-naive-bayes.html` | Is a customer review spam, positive or negative? | Yes (TF-IDF + multinomial NB) |
| 3 | SVM | `algo-svm.html` | Is this order likely fraud? | Yes (RBF SVC with Platt probabilities) |
| 4 | Decision tree | `algo-decision-tree.html` | Will this delivery be late? | Yes (depth-limited tree) |
| 5 | ANN (MLP) | `algo-ann.html` | Will this shopper churn? | Yes (one hidden layer, 16 units) |
| 6 | KNN | `algo-knn.html` | Which products should we recommend? | No. Item-based cosine recommender in `knn.js` |

### 5.1 Linear regression (demand forecasting)

- **Data:** `make_demand`, 2,400 synthetic daily sales rows for three products: Ceramic mug (Home and Kitchen), Running shoes (P-220, Fashion), Phone stand (Home and Office).
- **Features:** `product`, `category`, `price`, `base_price`, `promo`, `is_weekend`. A derived feature `log_price_ratio = log(price / base_price)` is created inside the pipeline.
- **Target:** `units_sold`, modelled as `expm1(Ridge(log1p(y)))` through `TransformedTargetRegressor`.
- **Split:** chronological (the last 20 percent is the test period).
- **Tuning:** Ridge `alpha` in {0.001, 0.01, 0.1, 1, 10}, chosen on validation.
- **Site use:** predicts units for a chosen product, price and promotion; calculates the impact of a 10 percent price cut; draws a price curve; reports price elasticity from the `log_price_ratio` coefficient.
- **Assumption:** `is_weekend` is set to 0 on the page (weekday forecast). Confirm this is the intended demo view.

### 5.2 Naive Bayes (review moderation)

- **Data:** `make_reviews`, 3,000 synthetic reviews, labelled Positive, Negative, Spam or Neutral.
- **Features:** review text through `TfidfVectorizer` (`min_df=2`; n-gram range as set in `models.py`).
- **Model:** `MultinomialNB`.
- **Metric:** macro-F1 on validation for selection; accuracy and macro-F1 reported on test.
- **Site use:** `classify(text)` returns the predicted class, class probabilities and the five terms that most support the prediction.

### 5.3 SVM (order fraud screening)

- **Data:** `make_orders`, synthetic orders with a fraud rate of about 8 percent.
- **Features:** categorical `payment` (COD, Card, E-wallet) and `location` (Metro, Province) one-hot encoded; numeric `order_amount`, `account_age_days`, `items_per_order`, `address_mismatch`, `orders_last_24h`, `new_device` standardised.
- **Model:** `SVC(kernel="rbf", class_weight="balanced", probability=True)`.
- **Site use:** scores the 60 demo orders in the table. The threshold slider runs from 0.05 to 0.60 (step 0.05, default 0.20). The label comes from the sign of the decision value; the displayed probability is the Platt estimate.
- **Business note:** at a 0.50 threshold no demo order is flagged (highest score 0.41), so the page defaults to 0.20. This is a business choice for the operator, not a model fact.
- **Category matcher:** the product-category lookup on the page is rule-based keyword matching. It is not a trained model and is labelled that way on the page.

### 5.4 Decision tree (late delivery)

- **Data:** `make_deliveries`, synthetic deliveries with categories Standard, Fragile, Perishable; couriers A, B, C; a base late rate of about 30 percent.
- **Features:** `category`, `seller_rating`, `courier`, `distance_km`, `return_history`.
- **Model:** `DecisionTreeClassifier` with a `max_depth` grid, `min_samples_leaf`, and a tolerance of 0.01 on validation scores. The simplest tree within tolerance is kept.
- **Site use:** the "Load sample order" button fills the form; the page shows the path taken through the tree, the leaf probability, and the full rule list (`treeRules()`).

### 5.5 ANN (shopper churn)

- **Data:** `make_churn`, synthetic shoppers with a churn rate of about 25 percent.
- **Features (model inputs):** `pages_viewed_session`, `searches_30d`, `past_purchases`, `days_since_last_visit`.
- **Not inputs:** `age_band` and "bought next" appear in the sample table for context only. They are not model features.
- **Model:** `MLPClassifier` with one hidden layer of 16 ReLU units, `alpha=0.01`, standardised inputs. Metric: ROC-AUC.
- **Site use:** computes churn probability for the six demo shoppers S-01 to S-06 and assigns a risk band: below 0.33 Low, below 0.66 Moderate, otherwise High.
- **Illustrative element:** the loss curve (`getLossSlice`) comes from illustrative data in `data.js`, not from the trained run. The panel is labelled "Illustrative".

### 5.6 KNN (collaborative recommendations)

- **Data:** six products (Phone case, Charger, Screen protector, Earbuds, Notebook, Desk lamp) and shopper purchase histories.
- **Method:** item-based cosine similarity; the recommendation for shopper U1 with k=3 is Earbuds (score about 4.3).
- **Not trained:** the Python pipeline still trains a KNN classifier, but it is not exported and the site does not use it. The site's KNN is the recommender in `js/ml/knn.js`. This was a deliberate decision.

---

## 6. JavaScript architecture

### 6.1 Load order

Each algorithm page loads scripts in this order. Order matters because later scripts read the namespace the earlier ones create.

1. `js/chart.umd.min.js`: Chart.js
2. `js/data.js`: company and dataset data
3. `js/app.js`, `js/charts.js`, `js/table.js`: shared UI
4. `js/ml/model-params.js`: generated parameters (only on pages that use them)
5. `js/ml/inference.js`: prediction engine (only on pages that use it)
6. `js/ml/<algorithm>.js`: page logic for that algorithm
7. `js/demo/<algorithm>-demo.js`: demo controls (where present)

### 6.2 `model-params.js` (generated)

A classic script that assigns `window.Allonola.modelParams = {run_id, models, demo}`:

- `models.linear_regression`: feature spec, coefficients, intercept
- `models.naive_bayes`: TF-IDF vocabulary, IDF weights, class log-probabilities
- `models.svm`: feature spec, support vectors, dual coefficients, intercept, gamma, Platt A and B
- `models.decision_tree`: child arrays, features, thresholds, node class counts
- `models.ann`: scaler statistics, layer weights and intercepts
- `demo.svmOrders`: 60 orders with their features
- `demo.shoppers`: six shopper feature rows and actual outcomes

It is about 515 KB and must not be edited by hand. The header says so.

### 6.3 `inference.js`

Functions exposed as `Allonola.inference`:

| Function | Model | Returns |
|---|---|---|
| `predictUnits(row)` | Linear regression | Continuous unit forecast (the page rounds and clamps) |
| `priceElasticity()` | Linear regression | Coefficient on `log_price_ratio` |
| `predictReview(text)` | Naive Bayes | `{label, proba, topWords}` |
| `predictFraud(row)` | SVM | `{label, decision, proba}` |
| `predictLate(row)` | Decision tree | `{label, proba, leaf, steps}` |
| `treeRules()` | Decision tree | Indented rule lines |
| `predictChurn(row)` | ANN | `{label, proba}` |
| `svmDemoOrders()` | SVM | The 60 demo orders with fraud scores |
| `demoShopperRow(id)` | ANN | Feature row for a demo shopper |

Sklearn details reproduced in this file:

- `predict_proba` for the SVM is a Platt sigmoid with the convention `P(class 1) = 1 / (1 + exp(A*f - B))`.
- Decision-tree inputs are cast to float32 (`Math.fround`) before threshold comparison, as sklearn does.
- Feature transforms are applied in the order sklearn used.

### 6.4 Page logic (`js/ml/*.js`)

| File | Public functions | Used by |
|---|---|---|
| `linear-regression.js` | `predictUnits(productName, newPrice, promotionOn)`, `calculate10PercentCutImpact`, `generatePriceCurve`, `priceElasticity` | `algo-linear-regression.html` |
| `naive-bayes.js` | `tokenize`, `classify(text)` | `algo-naive-bayes.html` |
| `svm.js` | `evaluateFraudThreshold(threshold, orders)`, `predictProductCategory` (rule-based) | `algo-svm.html` |
| `decision-tree.js` | `describeStep`, `predictDeliveryRisk(order)`, `treeRules()` | `algo-decision-tree.html` |
| `ann.js` | `getLossSlice` (illustrative), `predictShopperChurn(id)` | `algo-ann.html` |
| `knn.js` | Item-based cosine recommender | `algo-knn.html` |

---

## 7. Python ML pipeline

### 7.1 Requirements

Python 3.13 is the tested version. Install with `pip install -r ml_pipeline/requirements.txt`. The main packages are `scikit-learn==1.9.1`, `pandas`, `numpy`, `joblib` and `flask`. Google Drive support needs `google-api-python-client` and related packages; these are optional and the Drive tests are skipped without them.

### 7.2 Training protocol

Applied to every model:

1. **Split** 60 / 20 / 20 (train / validation / test), seed 42. Classification splits are stratified. Demand splits are chronological.
2. **Tune** the grid on the validation set only.
3. **Cross-validate** the chosen configuration with 5 folds on training data.
4. **Refit** on train plus validation (unless `--no-refit`).
5. **Evaluate** once on the test set. The test set is not used for any choice.

### 7.3 Models and specifications

Defined in `allonola_ml/models.py` as `SPECS`:

| Name | Task | Metric (headline) | Notes |
|---|---|---|---|
| `linear_regression` | regression | RMSE, R² | Ridge on log1p target; `is_weekend` included as a feature |
| `naive_bayes` | classification (text) | macro-F1, accuracy | TF-IDF + multinomial NB |
| `knn` | classification | macro-F1 | Trained and evaluated; **not exported, not on the site** |
| `svm` | classification (binary) | F1, ROC-AUC | Balanced class weights; probability via Platt scaling |
| `decision_tree` | classification (binary) | F1, accuracy | Tolerance-based simplest tree |
| `ann` | classification (binary) | ROC-AUC | MLP, one hidden layer of 16 |

### 7.4 Commands

```bash
# Train all models into artifacts/<run_id>/
python -m allonola_ml.train --models all

# Train selected models only
python -m allonola_ml.train --models svm decision_tree

# Change split, seed, folds, size, or output folder
python -m allonola_ml.train --split 60 20 20 --seed 42 --cv-folds 5 --rows 2400 --out artifacts

# Skip refit, or skip saving CSVs
python -m allonola_ml.train --no-refit --no-data

# Upload the run to Google Drive
python -m allonola_ml.train --drive --drive-auth service_account --drive-folder <FOLDER_ID>

# Export models to the website (writes js/ml/model-params.js and tests/parity_fixture.json)
python -m allonola_ml.export_js artifacts/<run_id>

# Serve saved models over HTTP
python -m allonola_ml.api --host 127.0.0.1 --port 5000
python -m allonola_ml.api --drive --drive-folder <FOLDER_ID>
```

### 7.5 Run outputs

Each run writes `artifacts/<run_id>/` (run IDs are UTC timestamps such as `20261025T082946Z`):

- `<model>/model.joblib`: the fitted pipeline
- `<model>/metadata.json`: parameters, metrics, SHA-256 of the model file, and title
- `<model>/data/train.csv`, `val.csv`, `test.csv`: the splits (unless `--no-data`)
- A run summary with the headline metrics

`artifacts/` is git-ignored. Keep the run ID that produced the committed `model-params.js`, so the site's source can be traced.

### 7.6 API

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/models` | List models in the registry |
| GET | `/models/<name>` | Model metadata |
| POST | `/predict/<name>` | Predict from a JSON row of features |

The API is independent of the website. The site does not call it.

### 7.7 Data generators

`allonola_ml/datasets.py`:

| Generator | Rows | Target and rate | Notes |
|---|---|---|---|
| `make_demand` | 2,400 | `units_sold` | Three products (section 5.1) |
| `make_reviews` | 3,000 | Positive, Negative, Spam, Neutral | Unchanged in the latest revision |
| `make_deliveries` | synthetic | `is_late`, base rate 0.30 | Categories and couriers as in section 5.4 |
| `make_orders` | synthetic | `is_fraud`, rate 0.08 | Payment and location as in section 5.3 |
| `make_churn` | synthetic | `churned`, rate 0.25 | `age_band` generated but not a model input |
| `make_shoppers` | synthetic | (see code) | Unchanged |

`DEMO_PROFILES` holds six hand-set shopper profiles S-01 to S-06 used on the ANN page:

| Shopper | pages | searches | purchases | days since visit | Actual churn |
|---|---|---|---|---|---|
| S-01 | 14 | 6 | 5 | 2 | 0 |
| S-06 | 1 | 0 | 0 | 90 | 1 |

(Other values are in `datasets.py`.)

---

## 8. Export and parity workflow

This is how a trained model reaches the browser.

1. **Train** with `train.py`. This creates `artifacts/<run_id>/`.
2. **Export** with `export_js.py`. It reads each `model.joblib`, extracts only the learned parameters, and writes:
   - `js/ml/model-params.js` (browser)
   - `ml_pipeline/tests/parity_fixture.json` (test input and Python's answers)
3. **Implement** in `inference.js`. The JavaScript re-implements each prediction step. The parameters are data; the maths is code.
4. **Verify** with `js_parity.js`. Every held-out row is run through the JavaScript and compared with Python.

Export details:

- `_feature_spec` describes every column of the fitted `ColumnTransformer`. In scikit-learn 1.9, `passthrough` becomes an identity `FunctionTransformer`; the exporter treats it as a raw column.
- KNN is deliberately excluded from `EXPORTERS`.
- SVM `order_amount` is rounded to whole pesos in the test frame, matching what the page displays.

### 8.1 Known parity findings

| Item | Finding | Resolution |
|---|---|---|
| SVM probabilities | sklearn 1.9's `predict_proba` differs slightly from the stored Platt parameters on this model. Max difference about 0.0025 to 0.0035 | Documented. SVM probability tolerance set to 5e-3. Labels and decision values match exactly |
| SVM `probability=True` | Emits a deprecation FutureWarning in sklearn 1.9 | Not yet changed (see section 12) |
| Decision tree | Thresholds compare in float32 | `Math.fround` in JavaScript |

---

## 9. Tests and verification

### 9.1 Python unit tests

```bash
cd ml_pipeline
python -m unittest discover -s tests -t .
```

Latest result: 13 tests run, 10 pass, 3 skipped. The 3 skipped tests are the Google Drive tests, skipped when `googleapiclient` is not installed (`@unittest.skipUnless(HAS_GOOGLE, ...)`).

### 9.2 JavaScript parity

```bash
node ml_pipeline/tests/js_parity.js
```

Loads `model-params.js` and `inference.js` into a Node `vm` sandbox, runs 200 held-out rows per model, then checks:

- Labels match exactly.
- Decision values match within 1e-6.
- Probabilities match within 1e-6 (SVM: 5e-3).
- Linear-regression predictions match within relative 1e-6.
- The 60 SVM demo orders and 6 ANN shopper scores match Python.

Latest result: all checks PASS.

### 9.3 Page checks in the browser

Open `test/checks.html`. It loads the same scripts as the demo pages and asserts 8 checks:

1. Naive Bayes classifies a spam example as Spam (probability about 0.9998).
2. KNN recommends Earbuds (about 4.3) for U1.
3. Decision tree: a sample order gives "LIKELY LATE" at 86 percent after four rules.
4. Linear regression: P-220 forecast is 110 units; a 10 percent cut gives 97; the phone stand promotion gives 86 versus 71 without it. Output is non-negative and directionally correct.
5. SVM at threshold 0.20 flags 6 orders, of which 4 are true positives.
6. ANN loss curve renders (illustrative data).
7. ANN churn flags match the table: S-02, S-04, S-06 at or above 0.5; the others below. Values: S-01 0.02, S-02 0.96, S-03 0.01, S-04 0.76, S-05 0.12, S-06 0.98.

Latest result: all 8 PASS (checked headlessly). **Not yet checked in a real browser by hand** (section 12).

---

## 10. Results (headline metrics)

These are the figures reported on the site and in `data.js`. Full tables are in `ml_pipeline/README.md`. Each figure comes from the test set, after the single final evaluation.

| Model | Headline metric | Value | Other |
|---|---|---|---|
| Linear regression | R² | 0.83 | RMSE 13.8 units |
| Naive Bayes | Accuracy | 88.7% | See `ml_pipeline/README.md` for macro-F1 |
| SVM | F1 (fraud) | 0.35 | ROC-AUC 0.78; 35 of 66 frauds caught among 800 test orders, 133 flagged |
| Decision tree | Accuracy | 65.8% | F1 0.54; late recall 0.61; 600 test orders: 276 TN, 130 FP, 75 FN, 119 TP |
| ANN | ROC-AUC | 0.82 | Churn base rate 25% |
| KNN | (not trained for site) | (illustrative) | Not reported as a trained result |

The earlier brief asked for about 85.8% for the decision tree and an F1 near 0.72 for SVM. The trained models do not reach those figures on this synthetic data, and the site now shows the retrained numbers.

The dashboard's "Latest" entries in `data.js` use these values (LR 0.83 / 10.4, NB 0.90 / 0.88, SVM 0.78 / 0.35, DT 0.66 / 0.61, ANN 0.82 / 0.825). The dashboard's quarterly history and the KNN "Latest" entry are illustrative.

---

## 11. Known limitations

1. **SVM probability gap.** Platt probabilities differ from sklearn 1.9's own output by up to about 0.0035. Labels are exact.
2. **Illustrative data remains.** The ANN loss curve, the dashboard quarterly history, the KNN "Latest" figure and some business-impact text are illustrative. They are labelled where the page has space to do so.
3. **KNN on the site is not the trained classifier.** The trained KNN is evaluated in the pipeline but not exported. The page shows a recommender.
4. **SVM category matcher is rule-based**, not learned.
5. **Linear regression is a weekday forecast** (`is_weekend = 0`).
6. **SVM threshold is a business choice.** The default 0.20 was picked so the demo flags some orders; at 0.50 nothing is flagged.
7. **Synthetic data only.** Results describe the generators in `datasets.py`, not real retail behaviour. A real deployment would need real data and fresh validation.
8. **Browser behaviour not tested by hand.** Page-level logic is verified by the headless checks and Node parity test, not by clicking through each page in a browser.
9. **Some marketing copy is unaudited.** Claims such as "highest potential accuracy" on `algorithms.html` have not been checked against the model results.
10. **`README.md` (root) architecture section is partly stale.** It still describes some `js/ml` files and the Chart.js loading in older terms. This document is the current reference.

---

## 12. Manual checklist

For the team or the operator:

- [ ] Apply the patches locally and push (sandbox push is blocked).
- [ ] Update the Word document's metrics: DT 65.8%, SVM F1 0.35, LR R² 0.83, ANN AUC 0.82, NB 88.7%.
- [ ] Open each of the six algorithm pages and `dashboard.html` in a browser (light and dark theme, phone width). Check that controls work and no console errors appear.
- [ ] Open `test/checks.html` and confirm 8 PASS.
- [ ] Decide the SVM operating threshold for the demo (default 0.20).
- [ ] Confirm the linear-regression weekday assumption.
- [ ] Review business-impact text and illustrative dashboard figures for claims you cannot support.
- [ ] Optional: silence the SVM FutureWarning (`probability=True` deprecation).
- [ ] Optional: install `google-api-python-client` to run the Drive tests.
- [ ] Re-run `export_js.py` after any retraining, then `js_parity.js`.

---

## 13. Git and delivery notes

- Branch `main`. Commit history includes the export and demo-wiring commits; use `git log --oneline` for the latest hashes.
- The sandbox cannot push to `origin`. Changes are delivered as `git format-patch` files (or a bundle) to apply on the Windows machine.
- The repository does not track `ml_pipeline/artifacts/`, credentials, or `__pycache__`.
- Keep `js/ml/model-params.js` in sync with the run it was exported from. Its header records the run ID.
