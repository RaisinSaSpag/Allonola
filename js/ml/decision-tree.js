/**
 * js/ml/decision-tree.js
 * Late-delivery risk for the Decision Tree page.
 * Runs the trained tree via js/ml/inference.js (parameters from js/ml/model-params.js).
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  const NAMES = {
    category: "Product type",
    seller_rating: "Seller rating",
    courier: "Courier",
    distance_km: "Transit distance",
    return_history: "Past returns",
  };

  // One human-readable sentence for a rule the order passed through.
  function describeStep(step) {
    const spec = step.spec;
    const name = NAMES[spec.col] || spec.col;
    if (spec.kind === "onehot") {
      return step.went === "right" ? name + " is " + spec.value : name + " is not " + spec.value;
    }
    const v = Number(step.value);
    const shown = Number.isInteger(v) ? String(v) : v.toFixed(2);
    return name + " is " + shown + (step.went === "left" ? " (at or below " : " (above ") +
      step.threshold.toFixed(2) + ")";
  }

  /**
   * Predicts whether an order will arrive late, using the trained decision tree.
   *
   * @param {{
   *   productType: string,    // "Standard", "Fragile", or "Perishable"
   *   sellerRating: number,   // 1.0 to 5.0
   *   courier: string,        // "Courier A", "Courier B", "Courier C"
   *   distanceKm: number,
   *   returnHistory: number
   * }} order
   * @returns {{
   *   prediction: string,     // "LIKELY LATE" or "LIKELY ON TIME"
   *   confidence: string,     // e.g. "74%": share of training orders with the same outcome in this leaf
   *   confidenceNum: number,
   *   leafId: string,
   *   pathSteps: string[],
   *   explanation: string
   * }}
   */
  function predictDeliveryRisk(order) {
    const r = window.Allonola.inference.predictLate({
      category: order.productType,
      seller_rating: order.sellerRating,
      courier: order.courier,
      distance_km: order.distanceKm,
      return_history: order.returnHistory,
    });
    const late = String(r.label) === "1";
    const confidenceNum = late ? r.proba["1"] : r.proba["0"];
    const confidence = Math.round(confidenceNum * 100) + "%";
    const prediction = late ? "LIKELY LATE" : "LIKELY ON TIME";
    const pathSteps = r.steps.map(describeStep);
    const explanation =
      "Predicted " + prediction + " with " + confidence + " confidence. " +
      "The order passed " + pathSteps.length + " rule" + (pathSteps.length === 1 ? "" : "s") + ": " +
      pathSteps.join("; ") + ".";
    return {
      prediction,
      confidence,
      confidenceNum,
      leafId: "leaf-" + r.leaf,
      pathSteps,
      explanation,
    };
  }

  /** The trained tree as nested rules, one line per row (for display). */
  function treeRules() {
    return window.Allonola.inference.treeRules();
  }

  window.Allonola.ml.decisionTree = {
    predictDeliveryRisk,
    treeRules,
  };
})();
