# Allonola — Online-Only Retail Marketplace

> **"Shop smarter. Sell with confidence."**

Allonola is a complete, multi-page static website for a fictional online retail marketplace connecting buyers, independent sellers, and delivery couriers. The platform demonstrates six core machine learning algorithms through fully client-side interactive demos, simulated operational dashboards, and accessible data visualizations.

---

## ⚠️ Important Academic & Synthetic Data Notice

> **All datasets, transaction histories, model outputs, and metrics on this website are illustrative and synthetically generated.**
>
> Allonola is a fictional company created for academic study. No real customer, seller, transaction, or financial data is collected, stored, or processed. Predictions and metrics reflect educational illustrations of statistical and machine learning methodologies.

---

## 🚀 How to Open and Run the Website

This website is built with vanilla HTML5, CSS3, and modern vanilla JavaScript (ES2020) with no build step, no Node.js runtime, no backend server, and no database. **Chart.js and Google Fonts are hosted locally**, meaning the site is 100% offline-capable and requires no internet connection to run.

### 1. Opening Directly from the Local File System (`file://`)
You can open the website offline directly in any modern browser:
1. Open the folder that contains `index.html`.
2. Double-click `index.html` (or right-click → Open with Chrome / Edge / Firefox / Safari).
3. All data, scripts, styles, and fonts are bundled locally, so the site needs no internet connection.

### 2. Hosting on GitHub Pages
To publish this repository on GitHub Pages:
1. Push the `allonola/` directory to a GitHub repository (e.g., `main` branch).
2. Go to **Settings** → **Pages** in your GitHub repository.
3. Under **Branch**, select `main` (and `/root` or `/docs` if placed in docs).
4. Save the configuration. GitHub Pages will serve the static site at `https://<username>.github.io/<repo>/`.
5. All assets, stylesheets, scripts, and internal page links use relative paths, ensuring complete portability across custom domains, root domains, and nested project subpaths.

### 3. Running Automated Tests & Verification Checks
To verify the accuracy of the underlying algorithms:
1. Double-click or open `test/checks.html` in your web browser.
2. The page executes automated assertion checks on all pure ML functions:
   - **Naive Bayes**: Classifies `"Click this link for a free gift card"` as **Spam**.
   - **K-Nearest Neighbors (KNN)**: Verifies that target user `U1` with `k = 3` identifies nearest neighbors `U2`, `U4`, and `U6`, recommending **Earbuds** first with predicted score `~4.3`.
   - **Decision Tree**: Evaluates a sample order (`Perishable`, seller rating `3.4`, `Courier C`, `31 km`, return history `1`) with the trained tree to output **LIKELY LATE** with **86% confidence**, after 4 rules.
   - **Linear Regression**: Confirms that forecasts are whole numbers `≥ 0`, fall when price rises, and rise with a promotion.
   - **SVM**: Applies a fraud threshold of 0.20 to the trained SVM's scores for the 60 demo orders.
   - **ANN**: Confirms the trained network scores the six sample shoppers consistently with their churn flags, and that the illustrative loss curve has its early-stopping minimum at epoch 22.
3. Open browser developer tools (`F12` → Console) for detailed diagnostic logs.

---

## 📁 Project Directory Structure

```text
allonola/
├── index.html                  # Home (Hero, ecosystem cards, problem-algorithm grid, ML strip)
├── about.html                  # About (Company context, mission/vision, operational goals, data approach, team)
├── algorithms.html             # Algorithms overview (Filterable & sortable comparison matrix, selection guide)
├── algo-linear-regression.html # Algorithm 1: Demand forecasting & price elasticity
├── algo-naive-bayes.html       # Algorithm 2: Review sentiment & spam filtering
├── algo-knn.html               # Algorithm 3: Collaborative item recommendations
├── algo-svm.html               # Algorithm 4: Order fraud detection & auto-categorization
├── algo-decision-tree.html     # Algorithm 5: Delivery delay risks & return rules
├── algo-ann.html               # Algorithm 6: Shopper churn & personalized homepage feed
├── dashboard.html              # Interactive Dashboard (Seller view, Admin view, Model performance view)
├── contact.html                # Contact (Accessible form validation, FAQ, online-only notice)
├── DOCUMENTATION.md            # Comprehensive technical & architectural documentation
├── README.md                   # Project overview & deployment guide
├── css/
│   ├── base.css                # Design tokens, dark/light themes, reset, typography, accessibility
│   ├── layout.css              # Header, navigation drawer, breadcrumbs, grid system, footer
│   ├── components.css          # Glass cards, buttons, badges, tables, forms, tabs, alerts
│   ├── algorithm.css           # 10-part algorithm page template, formula boxes, interactive demo controls
│   └── fonts.css               # @font-face rules for local fonts
├── js/
│   ├── data.js                 # Single source of truth: facts, datasets, baselines, seeded generators
│   ├── app.js                  # Header, theme controller, navigation, scroll-in reveal, skip links
│   ├── charts.js               # Chart.js helper with CSS tokens, theme rebuilds, accessibility summaries
│   ├── table.js                # Accessible HTML table renderer with "View as table" chart toggles
│   ├── chart.umd.min.js        # Chart.js 4.4.1 bundled locally for offline support
│   └── ml/
│       ├── model-params.js     # GENERATED: Trained weights from the Python ML pipeline
│       ├── inference.js        # JavaScript engine that runs the trained model weights
│       ├── linear-regression.js# Pure math for demand forecasting & price elasticity
│       ├── naive-bayes.js      # Multinomial Naive Bayes text classifier with Laplace smoothing
│       ├── knn.js              # Cosine vector similarity & collaborative neighborhood recommender
│       ├── svm.js              # Max-margin fraud thresholding & keyword category lookup
│       ├── decision-tree.js    # Hierarchical rule evaluation & delivery risk path generator
│       └── ann.js              # Training loss epoch slices & shopper churn lookup
│   └── demo/                   # Page controllers that connect the ML modules to the interactive demos
│       ├── linear-regression-demo.js
│       ├── knn-demo.js
│       └── naive-bayes-demo.js
├── assets/
│   ├── fonts/                  # Montserrat and Open Sans (woff2)
│   └── icons/                  # Inline SVGs utilized directly in HTML templates
├── test/
│   └── checks.html             # Automated unit tests and console assertion harness
└── ml_pipeline/                # Python: real model training (60/20/20), Google Drive storage, JSON API
    └── README.md               # Setup and usage (separate from the static site)