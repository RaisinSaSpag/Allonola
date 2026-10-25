/**
 * js/ml/inference.js
 * Runs the trained models (exported by ml_pipeline/allonola_ml/export_js.py) in plain JavaScript.
 * Each function re-implements the prediction step of the matching scikit-learn estimator.
 * ml_pipeline/tests/js_parity.js checks that the outputs match Python's on held-out rows.
 *
 * Load order: js/ml/model-params.js, then this file. Classic script, works from file://.
 * (KNN is not here: the website's KNN demo is the item-based recommender in knn.js.)
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};

  function params(name) {
    const all = window.Allonola.modelParams;
    if (!all || !all.models[name]) {
      throw new Error("Model parameters missing for '" + name + "'. Run export_js.py and reload model-params.js.");
    }
    return all.models[name];
  }

  // ---- shared helpers ---------------------------------------------------------
  // Derived column created by the Linear Regression pipeline; not present in raw rows.
  function rawValue(row, col) {
    if (col === "log_price_ratio") return Math.log(row.price / row.base_price);
    return row[col];
  }

  // Row object -> numeric vector, in the column order sklearn used.
  // Spec entries: onehot {col, value}; raw {col, mean?, scale?} (standardised when mean/scale exist).
  function featureVector(spec, row) {
    return spec.map((f) => {
      const v = rawValue(row, f.col);
      if (f.kind === "onehot") return v === f.value ? 1 : 0;
      const x = Number(v);
      return f.mean === undefined ? x : (x - f.mean) / f.scale;
    });
  }

  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  function argmax(values) {
    let best = 0;
    for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
    return best; // first maximum, like numpy
  }

  // ---- 1. Linear regression (demand forecasting) -------------------------------
  // sklearn: TransformedTargetRegressor(log1p / expm1) around Ridge.
  // row: { product, category, price, base_price, promo (0/1), is_weekend (0/1) }
  function predictUnits(row) {
    const m = params("linear_regression");
    const x = featureVector(m.features, row);
    let z = m.intercept;
    for (let i = 0; i < x.length; i++) z += m.coef[i] * x[i];
    return Math.expm1(z); // continuous; the page rounds and clamps
  }

  /** Price elasticity = coefficient on log(price / base_price). */
  function priceElasticity() {
    const m = params("linear_regression");
    const idx = m.features.findIndex((f) => f.col === "log_price_ratio");
    return idx === -1 ? null : m.coef[idx];
  }

  // ---- 2. Naive Bayes (review sentiment / spam) --------------------------------
  // sklearn: TfidfVectorizer(ngram_range, min_df=2) -> MultinomialNB.
  // Tokeniser matches the default pattern \b\w\w+\b on lowercased ASCII text.
  function nbTokens(text, ngramRange) {
    const words = text.toLowerCase().match(/[a-z0-9_]{2,}/g) || [];
    const out = [];
    for (let n = ngramRange[0]; n <= ngramRange[1]; n++) {
      for (let i = 0; i + n <= words.length; i++) out.push(words.slice(i, i + n).join(" "));
    }
    return out;
  }

  // Returns { label, proba: {class: p}, topWords: [{word, weight}] }.
  // topWords: vocabulary terms in this review that favour the predicted class most,
  // weight = tf-idf value x (log-prob for predicted class - mean log-prob for the others).
  function predictReview(text) {
    const m = params("naive_bayes");
    const vocabIndex = {};
    m.vocabulary.forEach((term, i) => (vocabIndex[term] = i));

    const x = new Array(m.vocabulary.length).fill(0);
    nbTokens(String(text || ""), m.ngram_range).forEach((term) => {
      const j = vocabIndex[term];
      if (j !== undefined) x[j] += 1;
    });
    let norm = 0;
    for (let j = 0; j < x.length; j++) {
      x[j] *= m.idf[j];
      norm += x[j] * x[j];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) for (let j = 0; j < x.length; j++) x[j] /= norm;

    const jll = m.classes.map((_, c) => {
      let s = m.class_log_prior[c];
      for (let j = 0; j < x.length; j++) s += x[j] * m.feature_log_prob[c][j];
      return s;
    });
    const maxJ = Math.max(...jll);
    const exps = jll.map((v) => Math.exp(v - maxJ));
    const total = exps.reduce((a, b) => a + b, 0);
    const proba = {};
    m.classes.forEach((c, i) => (proba[c] = exps[i] / total));

    const pred = argmax(jll);
    const others = m.classes.map((_, c) => c).filter((c) => c !== pred);
    const topWords = [];
    for (let j = 0; j < x.length; j++) {
      if (x[j] === 0) continue;
      const meanOther = others.reduce((s, c) => s + m.feature_log_prob[c][j], 0) / others.length;
      topWords.push({ word: m.vocabulary[j], weight: x[j] * (m.feature_log_prob[pred][j] - meanOther) });
    }
    topWords.sort((a, b) => b.weight - a.weight);

    return { label: m.classes[pred], proba, topWords: topWords.slice(0, 5) };
  }

  // ---- 3. SVM (order fraud) -----------------------------------------------------
  // sklearn: ColumnTransformer(one-hot payment & location, scaled numeric) -> SVC(rbf, probability=True).
  function predictFraud(row) {
    const m = params("svm");
    const x = featureVector(m.features, row);

    let f = m.intercept;
    for (let i = 0; i < m.support_vectors.length; i++) {
      const sv = m.support_vectors[i];
      let s = 0;
      for (let j = 0; j < x.length; j++) s += (sv[j] - x[j]) ** 2;
      f += m.dual_coef[i] * Math.exp(-m.gamma * s);
    }
    // label = sign of the decision value (what sklearn's predict() uses).
    // probability = Platt sigmoid, sign convention checked against sklearn: 1 / (1 + exp(A*f - B)).
    const pPositive = 1 / (1 + Math.exp(m.platt_a * f - m.platt_b));
    const label = f > 0 ? m.classes[1] : m.classes[0];
    return { label, decision: f, proba: { [m.classes[0]]: 1 - pPositive, [m.classes[1]]: pPositive } };
  }

  // ---- 4. Decision tree (late delivery) ----------------------------------------
  // sklearn casts inputs to float32 before comparing with thresholds; Math.fround does the same.
  function tracePath(m, x) {
    const steps = [];
    let node = 0;
    while (m.children_left[node] !== -1) {
      const f = m.feature[node];
      const v = Math.fround(x[f]);
      const goLeft = v <= m.threshold[node];
      steps.push({ node, spec: m.features[f], threshold: m.threshold[node], value: x[f], went: goLeft ? "left" : "right" });
      node = goLeft ? m.children_left[node] : m.children_right[node];
    }
    return { steps, leaf: node };
  }

  // row: { category, seller_rating, courier, distance_km, return_history }
  function predictLate(row) {
    const m = params("decision_tree");
    const x = featureVector(m.features, row);
    const { steps, leaf } = tracePath(m, x);
    const counts = m.value[leaf];
    const total = counts.reduce((a, b) => a + b, 0);
    const proba = {};
    m.classes.forEach((c, i) => (proba[c] = total > 0 ? counts[i] / total : 0));
    const idx = argmax(counts);
    return { label: m.classes[idx], proba, leaf, steps };
  }

  /** The whole fitted tree as nested rules, for display. */
  function treeRules() {
    const m = params("decision_tree");
    const names = m.features.map((f) => (f.kind === "onehot" ? f.col + " = " + f.value : f.col));
    const lines = [];
    (function walk(node, depth) {
      const pad = "  ".repeat(depth);
      if (m.children_left[node] === -1) {
        const counts = m.value[node];
        const idx = argmax(counts);
        const total = counts.reduce((a, b) => a + b, 0);
        lines.push(pad + "→ " + m.classes[idx] + " (" + Math.round((counts[idx] / total) * 100) + "% of training orders)");
        return;
      }
      const f = m.feature[node];
      lines.push(pad + "if " + names[f] + " <= " + m.threshold[node].toFixed(2) + ":");
      walk(m.children_left[node], depth + 1);
      lines.push(pad + "else:");
      walk(m.children_right[node], depth + 1);
    })(0, 0);
    return lines;
  }

  // ---- 5. Neural network (shopper churn) ---------------------------------------
  // sklearn: StandardScaler -> MLPClassifier(relu hidden layers, logistic output).
  // row: { pages_viewed_session, searches_30d, past_purchases, days_since_last_visit }
  function predictChurn(row) {
    const m = params("ann");
    let h = featureVector(m.features, row);
    const layers = m.coefs.length;
    for (let l = 0; l < layers; l++) {
      const W = m.coefs[l];
      const b = m.intercepts[l];
      const out = b.slice();
      for (let i = 0; i < W.length; i++) {
        const hi = h[i];
        const weightRow = W[i];
        for (let j = 0; j < out.length; j++) out[j] += hi * weightRow[j];
      }
      h = l < layers - 1 ? out.map((v) => Math.max(0, v)) : out; // ReLU on hidden layers only
    }
    const p1 = sigmoid(h[0]);
    const label = p1 > 0.5 ? m.classes[1] : m.classes[0];
    return { label, proba: { [m.classes[0]]: 1 - p1, [m.classes[1]]: p1 } };
  }

  // ---- demo data (held-out test rows, see export_js.py) -------------------------
  /** The 60 SVM demo orders, each with the model's fraud probability for it. */
  function svmDemoOrders() {
    const all = window.Allonola.modelParams;
    if (!all || !all.demo) return [];
    return all.demo.svmOrders.map((o) => {
      const score = predictFraud(o.row).proba["1"];
      return { ...o, fraudScore: +score.toFixed(2), fraudProbability: score };
    });
  }

  /** Feature row for a demo shopper id ("S-01" .. "S-06"), or null. */
  function demoShopperRow(id) {
    const all = window.Allonola.modelParams;
    const s = all && all.demo && all.demo.shoppers[id];
    return s ? s.row : null;
  }

  window.Allonola.inference = {
    predictUnits,
    priceElasticity,
    predictReview,
    predictFraud,
    predictLate,
    treeRules,
    predictChurn,
    svmDemoOrders,
    demoShopperRow,
  };
})();
