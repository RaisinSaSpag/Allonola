/**
 * js/data.js
 * Single source of truth for all company facts, operational goals,
 * algorithm datasets, model metrics, and illustrative sample points.
 * All data is illustrative and synthetically generated.
 */
"use strict";

(function () {
  // Ensure global Allonola namespace
  window.Allonola = window.Allonola || {};

  // Simple deterministic pseudorandom number generator (Linear Congruential Generator)
  function createSeededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Company Information
  const company = {
    name: "Allonola",
    industry: "Online retail (e-commerce) marketplace",
    tagline: "Shop smarter. Sell with confidence.",
    overview:
      "Online-only marketplace. No physical stores, warehouses, or offices. Independent sellers keep and pack their own stock; delivery partners (couriers) carry orders. Allonola runs the platform connecting buyers, sellers, and couriers. It uses machine learning to suggest products, flag fake reviews and suspicious orders, and warn staff about likely late deliveries or returns.",
    mission:
      "To give every customer an easy, trustworthy, and personalized online shopping experience at fair prices, and to help sellers reach more buyers without needing a physical shop.",
    vision:
      "To become the most customer-friendly online marketplace in our region, where finding a product, paying for it, and receiving it feels simple and stress-free.",
    disclaimer: "All data shown is illustrative and synthetically generated.",
    copyright: "© 2026 Allonola. Fictional company for academic use.",
    operationalGoals: [
      {
        id: 1,
        goal: "Make product discovery faster",
        metric: "Cut median time from first search to first add-to-cart by 20%",
        method: "KNN recommendations, ANN homepage",
      },
      {
        id: 2,
        goal: "Improve seller forecasting",
        metric: "Keep MAPE under 20% for top 200 sellers",
        method: "Linear Regression",
      },
      {
        id: 3,
        goal: "Limit fraud losses",
        metric: "Keep fraud-related losses below 0.5% of GMV",
        method: "SVM, Naive Bayes",
      },
      {
        id: 4,
        goal: "Improve delivery reliability",
        metric: "Reach 92% on-time delivery",
        method: "Decision Tree",
      },
      {
        id: 5,
        goal: "Reduce returns",
        metric: "Keep return rate below 6% of orders",
        method: "Decision Tree",
      },
      {
        id: 6,
        goal: "Retain customers",
        metric: "Raise repeat-buyer rate from 28% to 35%",
        method: "ANN",
      },
      {
        id: 7,
        goal: "Keep the platform dependable",
        metric: "Maintain 99.5% uptime",
        method: "Core engineering",
      },
    ],
    includedServices: [
      "Product browsing and search",
      "Seller marketplace",
      "Cart and checkout (e-wallet, card, cash on delivery)",
      "Order tracking",
      "Returns, refunds, and support",
      "Seller and admin dashboards",
      "Reviews and ratings",
      "Personalized suggestions and offers",
    ],
    notIncludedServices: [
      "Physical stores",
      "Warehouses",
      "In-person services",
      "Native apps",
    ],
    targetGroups: [
      {
        group: "Buyers",
        description: "Shoppers seeking transparent prices, personalized discovery, and reliable delivery across multiple categories.",
      },
      {
        group: "Sellers",
        description: "Small and medium businesses and individual sellers who pack their own stock and need demand forecasting.",
      },
      {
        group: "Delivery Partners (Couriers)",
        description: "Third-party courier companies handling last-mile pickup and delivery.",
      },
      {
        group: "Allonola Staff",
        description: "Platform administrators, support agents, and fraud analysts monitoring marketplace integrity and order flows.",
      },
    ],
    solvedProblems: [
      {
        id: "choices",
        title: "Too many choices",
        description: "Shoppers spend too much time searching through endless listings.",
        algorithmPill: "KNN, ANN",
        link: "algo-knn.html",
        keyQuestion: "Which items do shoppers like this one also buy?",
      },
      {
        id: "forecasting",
        title: "Guesswork for sellers",
        description: "Merchants overstock or run out because demand shifts unexpectedly.",
        algorithmPill: "Linear Regression",
        link: "algo-linear-regression.html",
        keyQuestion: "How many units will sell, and at what price?",
      },
      {
        id: "trust",
        title: "Trust issues: fake reviews and fraud",
        description: "Spam ratings and suspicious payment patterns erode marketplace credibility.",
        algorithmPill: "Naive Bayes, SVM",
        link: "algo-naive-bayes.html",
        keyQuestion: "Is this review genuine, negative, or spam?",
      },
      {
        id: "delivery",
        title: "Delivery and return problems",
        description: "Unpredictable courier delays and high return rates harm customer goodwill.",
        algorithmPill: "Decision Tree",
        link: "algo-decision-tree.html",
        keyQuestion: "Will this order be late or returned, and why?",
      },
      {
        id: "security",
        title: "Weak security and poor visibility",
        description: "Lack of consolidated dashboards and audit controls leaves teams blind.",
        algorithmPill: "Access rules, audit logs, dashboards",
        link: "dashboard.html",
        keyQuestion: "What is platform health and where are anomalies occurring?",
      },
      {
        id: "manual",
        title: "Too much manual work",
        description: "Categorizing millions of new listings and moderating comments drains staff.",
        algorithmPill: "SVM, Naive Bayes",
        link: "algo-svm.html",
        keyQuestion: "Which category does this listing belong to automatically?",
      },
    ],
    dataApproach: [
      {
        principle: "Consent & Transparent Collection",
        detail: "Shoppers and sellers know what data is captured (interactions, purchases, reviews) and why it is used to improve discovery and safeguard accounts.",
      },
      {
        principle: "Data Minimization",
        detail: "Models receive only the features necessary to answer specific business questions. Personal phone numbers and passwords are never fed to ML features.",
      },
      {
        principle: "Pseudonymization",
        detail: "User identities are represented by synthetic identifiers (e.g., U-101, S-01) during model inference and recommendation lookups.",
      },
      {
        principle: "Retention Limits",
        detail: "Temporary session clickstreams and raw web telemetry expire automatically after scheduled retention windows.",
      },
      {
        principle: "Human Review",
        detail: "Machine learning provides decision support; sensitive high-impact decisions (fraud account suspensions, merchant disputes) always route to staff analysts.",
      },
      {
        principle: "Fair Treatment & Transparent Limits",
        detail: "Algorithms are treated as probabilistic estimators rather than absolute arbiters. Confidence thresholds and clear reasoning trails accompany operational flags.",
      },
    ],
    milestones: [
      {
        phase: "Pilot launch",
        label: "Illustrative / synthetically generated",
        details: "Single country launch focusing on top 200 merchant partners, baseline recommendation engine, and courier integration.",
      },
      {
        phase: "First 12 months targets",
        label: "Illustrative / synthetically generated",
        details: "Reach 92% on-time delivery, keep return rate under 6%, cut search-to-cart latency by 20%, and maintain 99.5% uptime.",
      },
      {
        phase: "Expansion planned",
        label: "Illustrative / synthetically generated",
        details: "Rollout of deep personalized homepage feeds, real-time courier dispatch rerouting, and cross-border seller onboarding.",
      },
    ],
    team: [
      { name: "Attos", role: "Group member" },
      { name: "Millondaga", role: "Group member" },
      { name: "Enola", role: "Group member" },
    ],
  };

  // Algorithm Comparison Catalog
  const algorithms = [
    {
      id: "linear-regression",
      name: "Linear Regression",
      taskType: "Predict a number",
      filterCategory: "predict",
      strength: "Simple, fast, easy to interpret",
      limitation: "Assumes a roughly straight-line relationship",
      businessQuestion: "How many units will sell, and at what price?",
      usedIn: "Seller dashboard forecast",
      pageLink: "algo-linear-regression.html",
      prevPage: null,
      nextPage: "algo-naive-bayes.html",
    },
    {
      id: "naive-bayes",
      name: "Naive Bayes",
      taskType: "Classify text",
      filterCategory: "classify",
      strength: "Very fast, works with little data",
      limitation: "Assumes inputs are independent",
      businessQuestion: "Is this review genuine, negative, or spam?",
      usedIn: "Review sentiment labels and spam filtering",
      pageLink: "algo-naive-bayes.html",
      prevPage: "algo-linear-regression.html",
      nextPage: "algo-knn.html",
    },
    {
      id: "knn",
      name: "KNN",
      taskType: "Find similar items",
      filterCategory: "similar",
      strength: "No training, intuitive",
      limitation: "Slow on very large data, sensitive to scaling",
      businessQuestion: "Which items do shoppers like this one also buy?",
      usedIn: "Customers also bought and Similar items",
      pageLink: "algo-knn.html",
      prevPage: "algo-naive-bayes.html",
      nextPage: "algo-svm.html",
    },
    {
      id: "svm",
      name: "SVM",
      taskType: "Classify with clear boundaries",
      filterCategory: "classify",
      strength: "Strong with many input variables",
      limitation: "Slower to train on huge datasets, harder to tune",
      businessQuestion: "Is this order suspicious, and which category does this product belong to?",
      usedIn: "Automatic product categories; fraud and trust dashboard",
      pageLink: "algo-svm.html",
      prevPage: "algo-knn.html",
      nextPage: "algo-decision-tree.html",
    },
    {
      id: "decision-tree",
      name: "Decision Tree",
      taskType: "Classify with explainable rules",
      filterCategory: "classify",
      strength: "Easy to explain and audit",
      limitation: "Can overfit if too deep",
      businessQuestion: "Will this order be late or returned, and why?",
      usedIn: "Admin delivery and return-rate charts; late-delivery warnings",
      pageLink: "algo-decision-tree.html",
      prevPage: "algo-svm.html",
      nextPage: "algo-ann.html",
    },
    {
      id: "ann",
      name: "ANN",
      taskType: "Learn complex patterns",
      filterCategory: "classify",
      strength: "Highest potential accuracy",
      limitation: "Needs lots of data, harder to explain",
      businessQuestion: "What will this shopper browse, and are they at risk of leaving?",
      usedIn: "Personalized homepage; customer loss alerts; image search",
      pageLink: "algo-ann.html",
      prevPage: "algo-decision-tree.html",
      nextPage: null,
    },
  ];

  // 1. Linear Regression Datasets and Baselines
  const linearRegression = {
    sampleDataset: [
      { week: "W40", product: "Ceramic mug", price: 249, season: "Rainy", promotion: "No", pastAvgSales: 62, unitsSold: 58 },
      { week: "W41", product: "Ceramic mug", price: 219, season: "Rainy", promotion: "Yes", pastAvgSales: 60, unitsSold: 84 },
      { week: "W42", product: "Ceramic mug", price: 219, season: "Rainy", promotion: "Yes", pastAvgSales: 84, unitsSold: 91 },
      { week: "W40", product: "Running shoes (P-220)", price: 1890, season: "Dry", promotion: "No", pastAvgSales: 108, unitsSold: 104 },
      { week: "W41", product: "Running shoes (P-220)", price: 1690, season: "Dry", promotion: "Yes", pastAvgSales: 105, unitsSold: 119 },
      { week: "W44", product: "Running shoes (P-220)", price: 1790, season: "Holiday", promotion: "No", pastAvgSales: 112, unitsSold: 110 },
      { week: "W45", product: "Phone stand", price: 399, season: "Holiday", promotion: "Yes", pastAvgSales: 46, unitsSold: 71 },
    ],
    baselines: {
      "Ceramic mug": {
        product: "Ceramic mug",
        category: "Home and Kitchen",
        baselineRow: { week: "W42", price: 219, promotion: "Yes", unitsSold: 91, season: "Rainy" },
        basePrice: 219,
        baseUnitsSold: 91,
        baselinePromotion: true,
      },
      "Running shoes (P-220)": {
        product: "Running shoes (P-220)",
        category: "Fashion",
        baselineRow: { week: "W44", price: 1790, promotion: "No", unitsSold: 110, season: "Holiday" },
        basePrice: 1790,
        baseUnitsSold: 110,
        baselinePromotion: false,
      },
      "Phone stand": {
        product: "Phone stand",
        category: "Home and Office",
        baselineRow: { week: "W45", price: 399, promotion: "Yes", unitsSold: 71, season: "Holiday" },
        basePrice: 399,
        baseUnitsSold: 71,
        baselinePromotion: true,
      },
    },
    inputs: [
      { feature: "Past sales", unit: "4-week average", reason: "Establishes current baseline momentum and recent customer interest" },
      { feature: "Price", unit: "Philippine peso (₱)", reason: "Quantifies price elasticity and direct impact of price adjustments" },
      { feature: "Season", unit: "Dry, Rainy, Holiday", reason: "Captures predictable seasonal demand swings across product categories" },
      { feature: "Promotion", unit: "Yes / No", reason: "Measures lift driven by banner discounts and marketplace campaigns" },
    ],
    reportedResults: {
      example:
        "Phone stand on a weekday with a promotion: the trained model forecasts about 86 units at the baseline price of ₱399. Use the controls above to see how the forecast responds to price.",
      testSet: "480 held-out product-days (last 20% of dates)",
      rmse: 13.8,
      mae: 10.4,
      r2: 0.83,
      interpretation:
        "RMSE is larger than MAE because a few large misses weigh more heavily in the squared penalty of RMSE. An R² of 0.83 means the model explains about 83% of the variation in units sold, using price, promotion, weekend timing and product. The remaining variation reflects factors not in the model, such as competitor prices or stock clearances.",
      businessImpact:
        "On average, forecasts are within about 10 units of actual demand on the test set. This is a synthetic-data result: the value of these forecasts for a real seller depends on real sales data.",
    },
  };

  // 2. Naive Bayes Datasets and Training Examples
  const naiveBayes = {
    sampleDataset: [
      { text: "Arrived fast and the charger works perfectly.", label: "Positive" },
      { text: "Item was cracked and the seller ignored my messages.", label: "Negative" },
      { text: "Good quality for the price, packaging could be better.", label: "Positive" },
      { text: "Stopped working after two days. Very disappointed.", label: "Negative" },
      { text: "WIN a free gift card now, click this link!!!", label: "Spam" },
      { text: "Earn daily guaranteed profit, DM me for details", label: "Spam" },
      { text: "Exactly as pictured. Would buy again.", label: "Positive" },
      { text: "Not what I ordered, wrong color.", label: "Negative" },
    ],
    reportedResults: {
      examples: [
        { text: "Click this link for a free gift card", expectedClass: "Spam", probability: 0.9998 },
        { text: "Battery lasts all day, great value", expectedClass: "Positive", probability: 0.674 },
      ],
      testSetSize: "600 held-out synthetic reviews",
      accuracy: "88.7%",
      spamPrecision: 0.93,
      spamRecall: 0.89,
      interpretation:
        "Recall matters most for marketplace trust because a missed spam or deceptive review directly reaches and misleads buyers. Precision matters for merchant and reviewer fairness, as a genuine customer review wrongly suppressed creates friction and damages seller reputation.",
      businessImpact:
        "On the synthetic test set, the model catches about 89% of spam reviews, and 93% of the reviews it flags as spam really are spam. Real moderation quality depends on real review data.",
    },
  };

  // 3. KNN User-Item Matrix and Reported Results
  const knn = {
    items: ["Phone case", "Charger", "Screen protector", "Earbuds", "Notebook", "Desk lamp"],
    users: ["U1", "U2", "U3", "U4", "U5", "U6"],
    matrix: [
      { user: "U1", ratings: [5, 4, 5, 0, 0, 0] },
      { user: "U2", ratings: [4, 5, 4, 4, 0, 0] },
      { user: "U3", ratings: [0, 0, 0, 0, 5, 4] },
      { user: "U4", ratings: [5, 0, 4, 5, 0, 0] },
      { user: "U5", ratings: [0, 0, 0, 0, 4, 5] },
      { user: "U6", ratings: [4, 4, 0, 4, 0, 0] },
    ],
    reportedResults: {
      userTarget: "U1",
      neighbors: ["U2", "U4", "U6"],
      topRecommendation: "Earbuds",
      predictedScore: 4.3,
      testSetSize: "500 shoppers, top-5 recommendations",
      precisionAt5: 0.34,
      precisionInterpretation: "On average, 1.7 of 5 recommended items were bought or rated highly by the user",
      hitRateAt5: 0.71,
      hitRateInterpretation: "71% of shoppers bought at least one recommended item from their top-5 suggestions",
      interpretation:
        "A hit rate of 71% suggests the model is useful for most shoppers in this illustrative test. A Precision@5 of 0.34 shows that many exploratory suggestions miss, which is typical and expected in sparse retail matrices with broad inventory.",
      businessImpact:
        "Seven in ten shoppers discover and purchase at least one relevant complementary item from their recommendations, driving discovery for cross-category sellers. Allonola plans to combine KNN neighborhood matching with category-based ranking to avoid repeating already-owned accessories.",
    },
  };

  // 4. SVM Datasets and Categories (orders are scored by the trained SVM)
  const svm = {
    sampleDatasetA: [
      { orderId: "O-1001", amount: 640, location: "Metro", payment: "E-wallet", accountAge: 812, items: 2, fraud: 0 },
      { orderId: "O-1002", amount: 4850, location: "Province", payment: "COD", accountAge: 3, items: 6, fraud: 1 },
      { orderId: "O-1003", amount: 1220, location: "Metro", payment: "Card", accountAge: 150, items: 1, fraud: 0 },
      { orderId: "O-1004", amount: 9300, location: "Province", payment: "COD", accountAge: 1, items: 8, fraud: 1 },
      { orderId: "O-1005", amount: 380, location: "Metro", payment: "COD", accountAge: 430, items: 1, fraud: 0 },
      { orderId: "O-1006", amount: 2700, location: "Metro", payment: "Card", accountAge: 5, items: 4, fraud: 1 },
    ],
    sampleDatasetB: [
      { title: "Stainless steel water bottle 1L", category: "Home and Kitchen" },
      { title: "Wireless earbuds with charging case", category: "Electronics" },
      { title: "Cotton summer dress, floral print", category: "Fashion" },
      { title: "Organic brown rice 5 kg", category: "Groceries" },
      { title: "Adjustable desk lamp with USB port", category: "Home and Office" },
    ],
    reportedResults: {
      orderExample: "Order O-1053 (₱753, COD, account 217 days old) has the highest fraud score among the 60 demo orders (0.41); it is a confirmed fraud case.",
      testSet: "800 held-out synthetic orders (66 confirmed fraud = 8.3%)",
      f1Score: 0.35,
      rocAuc: 0.78,
      thresholdSummary: "At the model's default cut-off (probability 0.50): 133 of 800 test orders flagged, 35 of 66 frauds caught (precision 0.26, recall 0.53).",
      categoryAccuracy: "Not measured. The product category matcher is a keyword lookup, not one of the trained models.",
      interpretation:
        "Accuracy alone is misleading: a model that never flags fraud would score about 92% accuracy on this test set while catching no fraud. F1-score and ROC-AUC evaluate performance on the rare fraud class. The 98 false alarms at the default cut-off are a deliberate trade-off, because analysts can review flagged orders before dispatch.",
      businessImpact:
        "At the default cut-off, analysts review 133 flagged orders out of 800 and catch 35 of 66 frauds (53%). Lowering the threshold catches more fraud at the cost of more reviews; the cut-off is a business choice.",
    },
  };


  // 5. Decision Tree Datasets, Tree Rules, and Confusion Matrix
  const decisionTree = {
    sampleDataset: [
      { order: "R-01", productType: "Standard", sellerRating: 4.8, courier: "Courier A", distanceKm: 6, returnHistory: 0, late: 0 },
      { order: "R-02", productType: "Fragile", sellerRating: 3.2, courier: "Courier B", distanceKm: 28, returnHistory: 2, late: 1 },
      { order: "R-03", productType: "Standard", sellerRating: 4.1, courier: "Courier A", distanceKm: 14, returnHistory: 0, late: 0 },
      { order: "R-04", productType: "Perishable", sellerRating: 3.4, courier: "Courier C", distanceKm: 31, returnHistory: 1, late: 1 },
      { order: "R-05", productType: "Standard", sellerRating: 4.6, courier: "Courier B", distanceKm: 9, returnHistory: 0, late: 0 },
      { order: "R-06", productType: "Fragile", sellerRating: 3.9, courier: "Courier C", distanceKm: 22, returnHistory: 3, late: 1 },
      { order: "R-07", productType: "Standard", sellerRating: 3.1, courier: "Courier B", distanceKm: 19, returnHistory: 0, late: 1 },
    ],
    reportedResults: {
      orderExample:
        "Each order's audit trail on the Decision Tree page lists the rules it passed, from the root down to its leaf.",
      testSet: "600 held-out synthetic orders",
      accuracy: "65.8%",
      confusionMatrix: {
        totalOrders: 600,
        actualOnTime: 406,
        actualLate: 194,
        predictedOnTimeActualOnTime: 276, // True Negatives
        predictedLateActualOnTime: 130,   // False Positives
        predictedOnTimeActualLate: 75,    // False Negatives
        predictedLateActualLate: 119,     // True Positives
      },
      latePrecision: 0.48,
      latePrecisionNote: "119 of 249 late warnings correct",
      lateRecall: 0.61,
      lateRecallNote: "119 of 194 late orders caught",
      interpretation:
        "The tree is shallow (depth 4) so that staff can read every rule. Its late precision (0.48) and recall (0.61) show that about half of its warnings are false alarms and it misses about four in ten late orders. The trade-off between warnings and misses is set by the training choices in the pipeline.",
      businessImpact:
        "Operations staff would review 249 flagged orders out of 600 and catch 119 of 194 delays (61%) before dispatch. The rule trails help root-cause conversations with couriers and sellers.",
    },
  };

  // 6. ANN Datasets, Loss Curves, and Shopper Churn
  const ann = {
    sampleDataset: [
      { shopper: "S-01", pagesViewed: 14, searches: 6, pastPurchases: 5, daysSinceLastVisit: 2, ageBand: "25–34", boughtNext: 1, churn: 0 },
      { shopper: "S-02", pagesViewed: 3, searches: 1, pastPurchases: 0, daysSinceLastVisit: 75, ageBand: "18–24", boughtNext: 0, churn: 1 },
      { shopper: "S-03", pagesViewed: 22, searches: 9, pastPurchases: 3, daysSinceLastVisit: 6, ageBand: "35–44", boughtNext: 1, churn: 0 },
      { shopper: "S-04", pagesViewed: 5, searches: 2, pastPurchases: 1, daysSinceLastVisit: 48, ageBand: "45–54", boughtNext: 0, churn: 1 },
      { shopper: "S-05", pagesViewed: 9, searches: 4, pastPurchases: 2, daysSinceLastVisit: 12, ageBand: "25–34", boughtNext: 0, churn: 0 },
      { shopper: "S-06", pagesViewed: 1, searches: 0, pastPurchases: 0, daysSinceLastVisit: 90, ageBand: "18–24", boughtNext: 0, churn: 1 },
    ],
    reportedResults: {
      testSet: "600 held-out synthetic shoppers (25% churned)",
      accuracy: "82.5%",
      auc: 0.82,
      lossCurveNote:
        "Illustrative: the training-loss curve on the page is a teaching example, not the exported model's loss history.",
      interpretation:
        "An AUC of 0.82 means a randomly chosen churned shopper receives a higher predicted risk score than a randomly chosen active shopper about 82% of the time. Accuracy is high partly because most shoppers do not churn; at the default cut-off the network finds 46% of churners (precision 0.75).",
      businessImpact:
        "On the synthetic test set, the network ranks churners well enough to target retention offers at the highest-risk shoppers. Any real campaign would need an A/B test against a control group.",
    },
    // 30 epochs: training loss monotonic 0.69 to 0.31; validation loss min 0.34 at epoch 22, rising to ~0.38 at epoch 30
    lossHistory: [
      { epoch: 1, trainLoss: 0.690, valLoss: 0.695 },
      { epoch: 2, trainLoss: 0.655, valLoss: 0.662 },
      { epoch: 3, trainLoss: 0.624, valLoss: 0.635 },
      { epoch: 4, trainLoss: 0.595, valLoss: 0.609 },
      { epoch: 5, trainLoss: 0.568, valLoss: 0.584 },
      { epoch: 6, trainLoss: 0.543, valLoss: 0.560 },
      { epoch: 7, trainLoss: 0.520, valLoss: 0.537 },
      { epoch: 8, trainLoss: 0.499, valLoss: 0.516 },
      { epoch: 9, trainLoss: 0.479, valLoss: 0.496 },
      { epoch: 10, trainLoss: 0.460, valLoss: 0.478 },
      { epoch: 11, trainLoss: 0.443, valLoss: 0.461 },
      { epoch: 12, trainLoss: 0.427, valLoss: 0.445 },
      { epoch: 13, trainLoss: 0.412, valLoss: 0.430 },
      { epoch: 14, trainLoss: 0.398, valLoss: 0.416 },
      { epoch: 15, trainLoss: 0.385, valLoss: 0.402 },
      { epoch: 16, trainLoss: 0.373, valLoss: 0.389 },
      { epoch: 17, trainLoss: 0.362, valLoss: 0.377 },
      { epoch: 18, trainLoss: 0.352, valLoss: 0.366 },
      { epoch: 19, trainLoss: 0.343, valLoss: 0.356 },
      { epoch: 20, trainLoss: 0.335, valLoss: 0.348 },
      { epoch: 21, trainLoss: 0.328, valLoss: 0.342 },
      { epoch: 22, trainLoss: 0.322, valLoss: 0.340 }, // Min val loss early stopping point
      { epoch: 23, trainLoss: 0.317, valLoss: 0.343 },
      { epoch: 24, trainLoss: 0.314, valLoss: 0.348 },
      { epoch: 25, trainLoss: 0.312, valLoss: 0.354 },
      { epoch: 26, trainLoss: 0.311, valLoss: 0.360 },
      { epoch: 27, trainLoss: 0.310, valLoss: 0.366 },
      { epoch: 28, trainLoss: 0.310, valLoss: 0.371 },
      { epoch: 29, trainLoss: 0.310, valLoss: 0.376 },
      { epoch: 30, trainLoss: 0.310, valLoss: 0.380 },
    ],
    storedShoppers: {
      "S-01": {
        shopper: "S-01",
        homepageItems: [
          { rank: 1, title: "Running shoes (P-220)", score: 0.94, reason: "Matches high sports apparel query sequence" },
          { rank: 2, title: "Phone stand", score: 0.89, reason: "Frequently paired complementary desktop accessory" },
          { rank: 3, title: "Adjustable desk lamp with USB port", score: 0.81, reason: "Trending in Home and Office category" },
        ],
      },
      "S-02": {
        shopper: "S-02",
        homepageItems: [],
      },
      "S-03": {
        shopper: "S-03",
        homepageItems: [],
      },
      "S-04": {
        shopper: "S-04",
        homepageItems: [],
      },
      "S-05": {
        shopper: "S-05",
        homepageItems: [],
      },
      "S-06": {
        shopper: "S-06",
        homepageItems: [],
      },
    },
  };

  // 7. Dashboard Series Generator (Seeded for 7d, 30d, 12m)
  function getDashboardData(timeRange) {
    const rng = createSeededRandom(
      timeRange === "7d" ? 107 : timeRange === "30d" ? 130 : 112
    );

    // Categories and sample products defined in brief
    const topProducts = [
      { name: "Running shoes (P-220)", category: "Fashion & Sports", baseUnits: 110, price: 1790, stock: "amber" },
      { name: "Wireless earbuds with charging case", category: "Electronics", baseUnits: 98, price: 1450, stock: "green" },
      { name: "Ceramic mug", category: "Home and Kitchen", baseUnits: 91, price: 219, stock: "green" },
      { name: "Phone stand", category: "Electronics", baseUnits: 71, price: 399, stock: "green" },
      { name: "Adjustable desk lamp with USB port", category: "Home and Office", baseUnits: 44, price: 890, stock: "coral" },
    ];

    let labels = [];
    let salesSeries = [];
    let ordersSeries = [];
    let revenueSeries = [];
    let newUsersSeries = [];
    let newSellersSeries = [];
    let returnRateSeries = [];

    if (timeRange === "7d") {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      labels.forEach(() => {
        const sales = Math.round(42000 + rng() * 18000);
        salesSeries.push(sales);
        const orders = Math.round(52 + rng() * 26);
        ordersSeries.push(orders);
        revenueSeries.push(Math.round(orders * 920 + rng() * 15000));
        newUsersSeries.push(Math.round(18 + rng() * 12));
        newSellersSeries.push(Math.round(2 + rng() * 4));
        returnRateSeries.push(+(4.2 + rng() * 2.1).toFixed(1));
      });
    } else if (timeRange === "30d") {
      for (let day = 1; day <= 30; day += 2) {
        labels.push("Day " + day);
        const sales = Math.round(44000 + rng() * 21000);
        salesSeries.push(sales);
        const orders = Math.round(50 + rng() * 32);
        ordersSeries.push(orders);
        revenueSeries.push(Math.round(orders * 940 + rng() * 18000));
        newUsersSeries.push(Math.round(22 + rng() * 16));
        newSellersSeries.push(Math.round(3 + rng() * 5));
        returnRateSeries.push(+(4.0 + rng() * 2.3).toFixed(1));
      }
    } else {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      labels.forEach(() => {
        const sales = Math.round(680000 + rng() * 320000);
        salesSeries.push(sales);
        const orders = Math.round(820 + rng() * 380);
        ordersSeries.push(orders);
        revenueSeries.push(Math.round(orders * 960 + rng() * 240000));
        newUsersSeries.push(Math.round(340 + rng() * 180));
        newSellersSeries.push(Math.round(42 + rng() * 24));
        returnRateSeries.push(+(4.8 + rng() * 1.6).toFixed(1));
      });
    }

    return {
      timeRange,
      labels,
      seller: {
        salesLine: salesSeries,
        topProducts: topProducts.map((p) => ({
          ...p,
          units: Math.round(p.baseUnits * (0.85 + rng() * 0.35)),
        })),
        categoryShare: [
          { category: "Electronics", percent: 38 },
          { category: "Fashion & Sports", percent: 27 },
          { category: "Home and Kitchen", percent: 18 },
          { category: "Groceries", percent: 11 },
          { category: "Home and Office", percent: 6 },
        ],
        forecast: {
          baselineRow: { week: "W44", price: 1790, unitsSold: 110 },
          upperBand: salesSeries.map((v) => Math.round(v * 1.12)),
          forecastLine: salesSeries.map((v) => Math.round(v * 1.02)),
          lowerBand: salesSeries.map((v) => Math.round(v * 0.91)),
        },
      },
      admin: {
        totalOrders: ordersSeries,
        revenue: revenueSeries,
        newUsers: newUsersSeries,
        newSellers: newSellersSeries,
        ordersByRegion: [
          { region: "Metro", orders: Math.round(ordersSeries.reduce((a, b) => a + b, 0) * 0.64) },
          { region: "Province", orders: Math.round(ordersSeries.reduce((a, b) => a + b, 0) * 0.36) },
        ],
        deliveryReliability: {
          onTime: 92.4, // Operational target was 92%
          delayed: 7.6,
        },
        returnRate: returnRateSeries,
        targetReturnRate: 6.0, // Operational target is 6.0%
      },
      modelPerformance: [
        {
          name: "Linear Regression (Demand Forecast)",
          metricName: "R² & MAE",
          history: [
            { period: "Q1", primary: 0.77, secondary: 8.6 },
            { period: "Q2", primary: 0.79, secondary: 8.1 },
            { period: "Q3", primary: 0.80, secondary: 7.7 },
            { period: "Latest", primary: 0.83, secondary: 10.4 }, // Test set (retrained pipeline)
          ],
        },
        {
          name: "Naive Bayes (Spam Moderation)",
          metricName: "Precision & Recall",
          history: [
            { period: "Q1", primary: 0.83, secondary: 0.79 },
            { period: "Q2", primary: 0.85, secondary: 0.81 },
            { period: "Q3", primary: 0.87, secondary: 0.83 },
            { period: "Latest", primary: 0.90, secondary: 0.88 }, // Test set (retrained pipeline)
          ],
        },
        {
          name: "KNN (Collaborative Recommendations)",
          metricName: "Hit Rate@5 & Prec@5",
          history: [
            { period: "Q1", primary: 0.65, secondary: 0.30 },
            { period: "Q2", primary: 0.67, secondary: 0.31 },
            { period: "Q3", primary: 0.69, secondary: 0.33 },
            { period: "Latest", primary: 0.71, secondary: 0.34 }, // Matches reported
          ],
        },
        {
          name: "SVM (Order Fraud Screening)",
          metricName: "ROC-AUC & F1-Score",
          history: [
            { period: "Q1", primary: 0.90, secondary: 0.67 },
            { period: "Q2", primary: 0.92, secondary: 0.69 },
            { period: "Q3", primary: 0.93, secondary: 0.71 },
            { period: "Latest", primary: 0.78, secondary: 0.35 }, // Test set (retrained pipeline)
          ],
        },
        {
          name: "Decision Tree (Delivery Risk)",
          metricName: "Accuracy & Recall",
          history: [
            { period: "Q1", primary: 0.82, secondary: 0.69 },
            { period: "Q2", primary: 0.83, secondary: 0.71 },
            { period: "Q3", primary: 0.84, secondary: 0.73 },
            { period: "Latest", primary: 0.66, secondary: 0.61 }, // Test set (retrained pipeline)
          ],
        },
        {
          name: "ANN (Shopper Churn & Relevance)",
          metricName: "AUC & Accuracy",
          history: [
            { period: "Q1", primary: 0.86, secondary: 0.83 },
            { period: "Q2", primary: 0.88, secondary: 0.85 },
            { period: "Q3", primary: 0.90, secondary: 0.87 },
            { period: "Latest", primary: 0.82, secondary: 0.825 }, // Test set (retrained pipeline)
          ],
        },
      ],
    };
  }

  // Currency Formatter Utility: Philippine peso (₱) with thousands separators
  function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return "₱0";
    return "₱" + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Export to namespace
  window.Allonola.data = {
    company,
    algorithms,
    linearRegression,
    naiveBayes,
    knn,
    svm,
    decisionTree,
    ann,
    getDashboardData,
    formatCurrency,
  };
})();
