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
        baselineRow: { week: "W42", price: 219, promotion: "Yes", unitsSold: 91, season: "Rainy" },
        basePrice: 219,
        baseUnitsSold: 91,
        baselinePromotion: true,
      },
      "Running shoes (P-220)": {
        product: "Running shoes (P-220)",
        baselineRow: { week: "W44", price: 1790, promotion: "No", unitsSold: 110, season: "Holiday" },
        basePrice: 1790,
        baseUnitsSold: 110,
        baselinePromotion: false,
      },
      "Phone stand": {
        product: "Phone stand",
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
      example: "Running shoes (P-220), week 44: predicted 118 units; 110 sold (over-forecast by 8).",
      testSet: "240 product-weeks",
      rmse: 9.8,
      mae: 7.4,
      r2: 0.81,
      interpretation:
        "RMSE is larger than MAE because a few large misses weigh more heavily in the squared penalty of RMSE. An R² of 0.81 indicates the model captures 81% of variance driven by price, baseline sales, and seasonality; remaining variance reflects external factors not in the model, such as competitor price cuts or flash stock clearances.",
      businessImpact:
        "Forecasts remain within about 7 units of actual demand on average. Pilot merchant sellers estimate a 15% reduction in overstock holding costs, demonstrating steady progress toward the corporate target of keeping MAPE under 20% for top 200 sellers.",
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
        { text: "Click this link for a free gift card", expectedClass: "Spam", probability: 0.93 },
        { text: "Battery lasts all day, great value", expectedClass: "Positive", probability: 0.88 },
      ],
      testSetSize: "1,000 reviews",
      accuracy: "91.6%",
      spamPrecision: 0.88,
      spamRecall: 0.84,
      interpretation:
        "Recall matters most for marketplace trust because a missed spam or deceptive review directly reaches and misleads buyers. Precision matters for merchant and reviewer fairness, as a genuine customer review wrongly suppressed creates friction and damages seller reputation.",
      businessImpact:
        "Approximately 84 out of every 100 fraudulent spam reviews are caught automatically before publication. About 1 in 8 flagged reviews is genuine; borderline predictions near the probability threshold are automatically routed to human moderators.",
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
        "A hit rate of 71% proves the model is genuinely useful for the vast majority of shoppers. A Precision@5 of 0.34 demonstrates that many exploratory suggestions miss, which is typical and expected in sparse retail matrices with broad inventory.",
      businessImpact:
        "Seven in ten shoppers discover and purchase at least one relevant complementary item from their recommendations, driving discovery for cross-category sellers. Allonola plans to combine KNN neighborhood matching with category-based ranking to avoid repeating already-owned accessories.",
    },
  };

  // 4. SVM Datasets, 60 Deterministic Orders, and Categories
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
      orderExample: "Order O-1004 flagged with fraud score 0.91, sent to analyst queue with reasons; confirmed as fraud.",
      testSet: "5,000 orders (90 confirmed fraud = 1.8%)",
      f1Score: 0.72,
      rocAuc: 0.94,
      thresholdSummary: "At chosen threshold: 100 flagged, 68 confirmed (precision 0.68); 68 of 90 fraud cases caught (recall 0.76).",
      categoryAccuracy: "88% on 1,000 held-out listings",
      interpretation:
        "Accuracy alone is misleading (a naive model that never flags fraud would achieve 98.2% accuracy while letting all fraud through). F1-score and ROC-AUC evaluate performance on rare positive classes. The 32 false alarms represent an intentional trade-off because human analysts can review 100 flagged cases swiftly.",
      businessImpact:
        "Fraud analysts review a targeted queue of 100 orders rather than auditing 5,000 transactions blindly, catching three out of four fraudulent orders before dispatch. Thresholds are calibrated monthly to balance analyst capacity against fraud risk.",
    },
  };

  // Generate 60 deterministic orders for SVM scatter plot with a fixed seed
  // Approximate fraud rate ~1 in 50 (around 2 or 3 fraud cases in 60 orders)
  (function generateDeterministicSVMOrders() {
    const rng = createSeededRandom(42);
    const locations = ["Metro", "Province"];
    const payments = ["E-wallet", "Card", "COD"];
    const orders = [];

    // Include the 6 exact sample orders first
    orders.push(
      { orderId: "O-1001", amount: 640, location: "Metro", payment: "E-wallet", accountAge: 812, items: 2, fraud: 0, fraudScore: 0.08 },
      { orderId: "O-1002", amount: 4850, location: "Province", payment: "COD", accountAge: 3, items: 6, fraud: 1, fraudScore: 0.88 },
      { orderId: "O-1003", amount: 1220, location: "Metro", payment: "Card", accountAge: 150, items: 1, fraud: 0, fraudScore: 0.15 },
      { orderId: "O-1004", amount: 9300, location: "Province", payment: "COD", accountAge: 1, items: 8, fraud: 1, fraudScore: 0.91 },
      { orderId: "O-1005", amount: 380, location: "Metro", payment: "COD", accountAge: 430, items: 1, fraud: 0, fraudScore: 0.05 },
      { orderId: "O-1006", amount: 2700, location: "Metro", payment: "Card", accountAge: 5, items: 4, fraud: 1, fraudScore: 0.84 }
    );

    // Generate remaining 54 deterministic orders (O-1007 to O-1060)
    for (let i = 7; i <= 60; i++) {
      const orderId = "O-" + (1000 + i);
      const isProvince = rng() > 0.55;
      const location = isProvince ? "Province" : "Metro";
      const payment = payments[Math.floor(rng() * payments.length)];
      
      // Let order 38 be an additional subtle fraud point
      const isFraud = i === 38;
      let amount, accountAge, items, fraudScore;

      if (isFraud) {
        amount = 5400 + Math.floor(rng() * 3000);
        accountAge = 2 + Math.floor(rng() * 6);
        items = 5 + Math.floor(rng() * 4);
        fraudScore = +(0.78 + rng() * 0.12).toFixed(2);
      } else {
        // Normal orders: older accounts, lower to moderate amounts, low fraud score
        accountAge = 20 + Math.floor(rng() * 900);
        amount = 250 + Math.floor(rng() * 3200);
        items = 1 + Math.floor(rng() * 4);
        // Fraud score correlates with high amount, young account, COD
        const amountRisk = Math.min(1, amount / 6000);
        const ageRisk = Math.max(0, 1 - accountAge / 300);
        fraudScore = +(Math.max(0.02, Math.min(0.48, (amountRisk * 0.25 + ageRisk * 0.2 + rng() * 0.15)))).toFixed(2);
      }

      orders.push({
        orderId,
        amount,
        location,
        payment,
        accountAge,
        items,
        fraud: isFraud ? 1 : 0,
        fraudScore,
      });
    }

    svm.deterministicOrders = orders;
  })();

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
        "Order R-04 followed 'rating below 3.5 → distance above 25 km → perishable' to the leaf 'likely late' with 82% confidence; it arrived 1 day late.",
      testSet: "1,200 orders",
      accuracy: "85.8%",
      confusionMatrix: {
        totalOrders: 1200,
        actualOnTime: 960,
        actualLate: 240,
        predictedOnTimeActualOnTime: 850, // True Negatives
        predictedLateActualOnTime: 110,   // False Positives
        predictedOnTimeActualLate: 60,    // False Negatives
        predictedLateActualLate: 180,     // True Positives
      },
      latePrecision: 0.62,
      latePrecisionNote: "180 of 290 warnings correct",
      lateRecall: 0.75,
      lateRecallNote: "180 of 240 late orders caught",
      interpretation:
        "The decision tree is deliberately tuned to favor recall over precision: a missed late delivery directly frustrates a buyer waiting for essentials, whereas an unnecessary early warning simply triggers proactive seller follow-up. 180 of 240 delayed shipments are intercepted before customer complaints occur.",
      businessImpact:
        "Operations specialists audit 290 flagged high-risk orders rather than all 1,200 dispatches, catching 75% of delays early. The explainable branch rules empower constructive root-cause conversations with specific courier hubs and lower-rated sellers.",
    },
    // Teaching rules and display confidence values (illustrative)
    rulesDefinition: {
      rootCondition: "Seller rating below 3.5?",
      branchYesRating: {
        condition: "Distance above 25 km?",
        branchYesDistance: {
          condition: "Product type is Perishable or Fragile?",
          outcomeYes: { label: "LIKELY LATE", confidence: "82%", confidenceNum: 0.82 },
          outcomeNo: { label: "LIKELY ON TIME", confidence: "60%", confidenceNum: 0.60 },
        },
        branchNoDistance: {
          condition: "Courier C?",
          outcomeYes: { label: "LIKELY LATE", confidence: "55%", confidenceNum: 0.55 },
          outcomeNo: { label: "LIKELY ON TIME", confidence: "70%", confidenceNum: 0.70 },
        },
      },
      branchNoRating: {
        condition: "Return history 2 or more?",
        outcomeYes: { label: "LIKELY LATE", confidence: "58%", confidenceNum: 0.58 },
        outcomeNo: { label: "LIKELY ON TIME", confidence: "90%", confidenceNum: 0.90 },
      },
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
      shopperHighlights: [
        "Shopper S-04 churn probability 0.78 (high risk), added to retention campaign.",
        "Shopper S-01 homepage led by running shoes and a phone stand, related to recent searches; S-01 bought one of the top three items next day.",
      ],
      testSet: "10,000 shoppers",
      accuracy: "88%",
      auc: 0.91,
      lossCurveNote:
        "Training loss fell from 0.69 (epoch 1) to 0.31 (epoch 30); validation loss stopped improving near epoch 22 (0.34) and rose, so training stopped early.",
      interpretation:
        "An AUC of 0.91 means a randomly chosen churned shopper receives a higher predicted risk score than a randomly chosen active shopper 91% of the time. The widening gap between training loss and validation loss past epoch 22 signals parameter memorization, which early stopping halts in production.",
      businessImpact:
        "Retention discount vouchers and re-engagement emails are targeted strictly at the top 5% of churn-risk shoppers, measured against an untreated holdout control group. This initiative directly supports raising the repeat-buyer rate from 28% to the 35% operational target.",
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
        churnProb: 0.12,
        riskLevel: "Low risk (Active loyal)",
        homepageItems: [
          { rank: 1, title: "Running shoes (P-220)", score: 0.94, reason: "Matches high sports apparel query sequence" },
          { rank: 2, title: "Phone stand", score: 0.89, reason: "Frequently paired complementary desktop accessory" },
          { rank: 3, title: "Adjustable desk lamp with USB port", score: 0.81, reason: "Trending in Home and Office category" },
        ],
      },
      "S-02": {
        shopper: "S-02",
        churnProb: 0.85,
        riskLevel: "High risk (Inactive 75 days)",
        homepageItems: [],
      },
      "S-03": {
        shopper: "S-03",
        churnProb: 0.08,
        riskLevel: "Very low risk (Frequent visitor)",
        homepageItems: [],
      },
      "S-04": {
        shopper: "S-04",
        churnProb: 0.78,
        riskLevel: "High risk (Enrolled in retention campaign)",
        homepageItems: [],
      },
      "S-05": {
        shopper: "S-05",
        churnProb: 0.31,
        riskLevel: "Moderate engagement",
        homepageItems: [],
      },
      "S-06": {
        shopper: "S-06",
        churnProb: 0.92,
        riskLevel: "Critical churn risk (Inactive 90 days)",
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
            { period: "Latest", primary: 0.81, secondary: 7.4 }, // Matches reported
          ],
        },
        {
          name: "Naive Bayes (Spam Moderation)",
          metricName: "Precision & Recall",
          history: [
            { period: "Q1", primary: 0.83, secondary: 0.79 },
            { period: "Q2", primary: 0.85, secondary: 0.81 },
            { period: "Q3", primary: 0.87, secondary: 0.83 },
            { period: "Latest", primary: 0.88, secondary: 0.84 }, // Matches reported
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
            { period: "Latest", primary: 0.94, secondary: 0.72 }, // Matches reported
          ],
        },
        {
          name: "Decision Tree (Delivery Risk)",
          metricName: "Accuracy & Recall",
          history: [
            { period: "Q1", primary: 0.82, secondary: 0.69 },
            { period: "Q2", primary: 0.83, secondary: 0.71 },
            { period: "Q3", primary: 0.84, secondary: 0.73 },
            { period: "Latest", primary: 0.858, secondary: 0.75 }, // Matches reported
          ],
        },
        {
          name: "ANN (Shopper Churn & Relevance)",
          metricName: "AUC & Accuracy",
          history: [
            { period: "Q1", primary: 0.86, secondary: 0.83 },
            { period: "Q2", primary: 0.88, secondary: 0.85 },
            { period: "Q3", primary: 0.90, secondary: 0.87 },
            { period: "Latest", primary: 0.91, secondary: 0.88 }, // Matches reported
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
