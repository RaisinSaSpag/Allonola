/**
 * js/ml/inference.js
 * Runs the six TRAINED models (exported by ml_pipeline/allonola_ml/export_js.py)
 * in plain JavaScript. Each function re-implements the prediction step of the
 * matching scikit-learn estimator; ml_pipeline/tests/js_parity.js checks that the
 * outputs match Python's to ~1e-6 on real held-out rows.
 *
 * Needs js/ml/model-params.js to be loaded first. Classic script, no imports,
 * so it also works from file://.
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

  // Turns a row object into the numeric vector the model was trained on,
  // using the column specs written by the exporter (same order as sklearn).
  function featureVector(spec, row) {
    return spec.map((f) => {
      const v = rawValue(row, f.col);
      if (f.kind === "onehot") return v === f.value ? 1 : 0;
      return Number(v);
    });
  }

  function standardise(x, mean, scale) {
    return x.map((v, i) => (v - mean[i]) / scale[i]);
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
  function predictUnits(row) {
    const m = params("linear_regression");
    const x = featureVector(m.features, row);
    let z = m.intercept;
    for (let i = 0; i < x.length; i++) z += m.coef[i] * x[i];
    return Math.expm1(z); // continuous forecast; the demo rounds and clamps
  }

  /** Price elasticity = coefficient on log(price / base_price), as stored by the trainer. */
  function priceElasticity() {
    const m = params("linear_regression");
    const idx = m.features.findIndex((f) => f.col === "log_price_ratio");
    return idx === -1 ? null : m.coef[idx];
  }

  // ---- 2. Naive Bayes (review sentiment / spam) --------------------------------
  // sklearn: TfidfVectorizer(ngram_range, min_df=2) -> MultinomialNB.
  // Tokeniser: default TfidfVectorizer pattern \b\w\w+\b on lowercased text (ASCII letters/digits/_).
  function nbTokens(text, ngramRange) {
    const words = text.toLowerCase().match(/[a-z0-9_]{2,}/g) || [];
    const out = [];
    for (let n = ngramRange[0]; n <= ngramRange[1]; n++) {
      for (let i = 0; i + n <= words.length; i++) out.push(words.slice(i, i + n).join(" "));
    }
    return out;
  }

  function predictReview(text) {
    const m = params("naive_bayes");
    const vocabIndex = {};
    m.vocabulary.forEach((term, i) => (vocabIndex[term] = i));

    const x = new Array(m.vocabulary.length).fill(0);
    nbTokens(String(text || ""), m.ngram_range).forEach((term) => {
      const j = vocabIndex[term];
      if (j !== undefined) x[j] += 1;
    });
    // tf * idf, then L2 normalisation (TfidfVectorizer defaults)
    let norm = 0;
    for (let j = 0; j < x.length; j++) {
      x[j] *= m.idf[j];
      norm += x[j] * x[j];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) for (let j = 0; j < x.length; j++) x[j] /= norm;

    // joint log likelihood per class, then softmax for probabilities
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
    return { label: m.classes[argmax(jll)], proba };
  }

  // ---- 3. KNN (next-category recommender) --------------------------------------
  // sklearn: StandardScaler -> KNeighborsClassifier (brute force Euclidean).
  function predictKnn(row) {
    const m = params("knn");
    const x = standardise(featureVector(m.features, row), m.scaler_mean, m.scaler_scale);

    const nearest = m.X.map((xi, i) => {
      let s = 0;
      for (let j = 0; j < x.length; j++) s += (xi[j] - x[j]) ** 2;
      return { d: Math.sqrt(s), y: m.y[i] };
    });
    nearest.sort((a, b) => a.d - b.d);
    const neigh = nearest.slice(0, m.n_neighbors);

    // sklearn: uniform -> each neighbour weighs 1; distance -> 1/d, and exact matches take all the weight
    let weights = neigh.map((n) => 1);
    if (m.weights === "distance") {
      const zero = neigh.map((n) => n.d === 0);
      weights = zero.some(Boolean)
        ? zero.map((z) => (z ? 1 : 0))
        : neigh.map((n) => 1 / n.d);
    }
    const votes = m.classes.map(() => 0);
    neigh.forEach((n, i) => (votes[n.y] += weights[i]));
    const totalW = votes.reduce((a, b) => a + b, 0);
    const proba = {};
    m.classes.forEach((c, i) => (proba[c] = totalW > 0 ? votes[i] / totalW : 0));
    return { label: m.classes[argmax(votes)], proba };
  }

  // ---- 4. SVM (order fraud) ----------------------------------------------------
  // sklearn: StandardScaler -> SVC(kernel="rbf", probability=True); binary.
  function predictFraud(row) {
    const m = params("svm");
    const x = standardise(featureVector(m.features, row), m.scaler_mean, m.scaler_scale);

    let f = m.intercept;
    for (let i = 0; i < m.support_vectors.length; i++) {
      const sv = m.support_vectors[i];
      let s = 0;
      for (let j = 0; j < x.length; j++) s += (sv[j] - x[j]) ** 2;
      f += m.dual_coef[i] * Math.exp(-m.gamma * s);
    }
    // predict() uses the sign of the decision function; predict_proba uses Platt scaling.
    // Sign convention checked against sklearn: P(class 1) = 1 / (1 + exp(A*f - B)).
    const pPositive = 1 / (1 + Math.exp(m.platt_a * f - m.platt_b));
    const label = f > 0 ? m.classes[1] : m.classes[0];
    return { label, decision: f, proba: { [m.classes[0]]: 1 - pPositive, [m.classes[1]]: pPositive } };
  }

  // ---- 5. Decision tree (late delivery) ----------------------------------------
  // sklearn casts inputs to float32 before comparing with thresholds; Math.fround does the same.
  function predictLate(row) {
    const m = params("decision_tree");
    const x = featureVector(m.features, row);
    let node = 0;
    while (m.children_left[node] !== -1) {
      const v = Math.fround(x[m.feature[node]]);
      node = v <= m.threshold[node] ? m.children_left[node] : m.children_right[node];
    }
    const counts = m.value[node];
    const total = counts.reduce((a, b) => a + b, 0);
    const proba = {};
    m.classes.forEach((c, i) => (proba[c] = total > 0 ? counts[i] / total : 0));
    const idx = argmax(counts);
    return { label: m.classes[idx], proba, leaf: node, path: tracePath(m, x) };
  }

  /** Human-readable path (node ids) for the explanation panel. */
  function tracePath(m, x) {
    const steps = [];
    let node = 0;
    while (m.children_left[node] !== -1) {
      const f = m.feature[node];
      const v = Math.fround(x[f]);
      const goLeft = v <= m.threshold[node];
      steps.push({ feature: f, spec: m.features[f], threshold: m.threshold[node], value: v, went: goLeft ? "left" : "right" });
      node = goLeft ? m.children_left[node] : m.children_right[node];
    }
    return steps;
  }

  // ---- 6. Neural network (shopper churn) ---------------------------------------
  // sklearn: StandardScaler -> MLPClassifier(relu hidden layers, logistic output).
  function predictChurn(row) {
    const m = params("ann");
    let h = standardise(featureVector(m.features, row), m.scaler_mean, m.scaler_scale);
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

  window.Allonola.inference = {
    predictUnits,
    priceElasticity,
    predictReview,
    predictKnn,
    predictFraud,
    predictLate,
    predictChurn,
  };
})();
