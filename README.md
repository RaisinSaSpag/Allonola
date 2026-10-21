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

This website is built with vanilla HTML5, CSS3, and modern vanilla JavaScript (ES2020) with no build step, no Node.js runtime, no backend server, and no database.

### 1. Opening Directly from the Local File System (`file://`)
You can open the website offline directly in any modern browser:
1. Navigate to the project directory: `D:\Projects\allonola\`.
2. Double-click `index.html` (or right-click → Open with Chrome / Edge / Firefox / Safari).
3. The site runs completely within the browser. Data is bundled directly in `js/data.js` to ensure browsers do not block local `fetch()` requests under the `file://` protocol.

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
   - **Decision Tree**: Evaluates sample order `R-04` (`Perishable`, seller rating `3.4`, `Courier C`, `31 km`, return history `1`) to output **LIKELY LATE** with **82% confidence**.
   - **Linear Regression**: Confirms that unit forecasts return valid whole numbers `≥ 0` across extreme prices and promotion toggles.
   - **SVM**: Evaluates deterministic fraud boundary thresholding on 60 orders.
   - **ANN**: Confirms monotonic training loss convergence and early stopping minimum at epoch 22.
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
├── README.md                   # Project documentation & deployment guide
├── css/
│   ├── base.css                # Design tokens, dark/light themes, reset, typography, accessibility
│   ├── layout.css              # Header, navigation drawer, breadcrumbs, grid system, footer
│   ├── components.css          # Glass cards, buttons, badges, tables, forms, tabs, alerts
│   └── algorithm.css           # 10-part algorithm page template, formula boxes, interactive demo controls
├── js/
│   ├── data.js                 # Single source of truth: facts, datasets, baselines, seeded generators
│   ├── app.js                  # Header, theme controller, navigation, scroll-in reveal, skip links
│   ├── charts.js               # Chart.js helper with CSS tokens, theme rebuilds, accessibility summaries
│   ├── table.js                # Accessible HTML table renderer with "View as table" chart toggles
│   └── ml/
│       ├── linear-regression.js # Pure math for demand forecasting & price elasticity
│       ├── naive-bayes.js       # Multinomial Naive Bayes text classifier with Laplace smoothing
│       ├── knn.js               # Cosine vector similarity & collaborative neighborhood recommender
│       ├── svm.js               # Max-margin fraud thresholding & keyword category lookup
│       ├── decision-tree.js     # Hierarchical rule evaluation & delivery risk path generator
│       └── ann.js               # Training loss epoch slices & shopper churn lookup
├── assets/
│   └── icons/                  # Inline SVGs utilized directly in HTML templates
└── test/
    └── checks.html             # Automated unit tests and console assertion harness
```

---

## 🎨 Design System & Accessibility

- **Theme Mode**: Dark theme by default (`#0B1A2A`) with a light theme toggle (`#F5F8FB`). User preference is saved in `localStorage` inside a `try/catch` wrapper and respects system `prefers-color-scheme` on first visit.
- **Color Contrast**: Compliant with WCAG AA guidelines (minimum 4.5:1 contrast for body text across both dark and light modes).
- **Typography**: Google Fonts [Montserrat](https://fonts.google.com/specimen/Montserrat) (weights 600, 700) for headings and [Open Sans](https://fonts.google.com/specimen/Open+Sans) (weights 400, 600) for readable body text.
- **Motion Accessibility**: All hero looping gradients and scroll animations automatically disable when `prefers-reduced-motion: reduce` is enabled.
- **Assistive Technology**:
  - Semantic HTML5 landmark structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
  - Visible skip-to-content link as the very first focusable element.
  - Visible focus outlines (`2px outline in --teal`).
  - Screen reader text summaries (`.sr-only`) and interactive **"View as table"** toggles on every single Chart.js visualization.
  - Accessible form validation with `aria-required`, `aria-describedby` error associations, and an error summary alert box (`role="alert"`).

---

## ⚙️ Architectural Decisions (Where the Brief was Silent)

1. **Local File System Compatibility (`file://`) vs. ES Modules**:
   Browsers strictly block ES Module `import` statements and local JSON `fetch()` calls under the `file://` protocol due to Cross-Origin Resource Sharing (CORS) security policies. To ensure the site works flawlessly when `index.html` is opened directly from a local drive without running a local web server, all scripts load via classic `<script defer>` tags in their required dependency sequence, sharing a clean global namespace `window.Allonola = { data, ml, ui, charts, table }`.
2. **Chart.js CDN Version**:
   Used Chart.js 4.4.1 UMD distribution loaded from `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`.
3. **Deterministic Random Generation**:
   Implemented a Linear Congruential Generator (LCG) in `js/data.js` so that simulated time-series numbers and the 60 SVM scatter plot orders generate consistently across page reloads without variance.
4. **Currency Formatting**:
   Standardized on the Philippine peso symbol (`₱`) with comma thousands separators formatted through a centralized helper function `formatCurrency(val)` in `js/data.js`.

---

## 📄 License & Academic Citation
© 2026 Allonola. Created for academic and educational evaluation. Fictional platform.
