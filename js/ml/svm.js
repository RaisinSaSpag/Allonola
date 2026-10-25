/**
 * js/ml/svm.js
 * Support Vector Machine helpers: applies a fraud-probability threshold to the trained SVM's scores,
 * and a keyword-based product category matcher (rule-based; not part of the trained models).
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  /**
   * Evaluates the 60 demo orders against a fraud probability threshold (trained SVM scores).
   *
   * @param {number} threshold - Decision boundary (0.10 to 0.95)
   * @param {Array} [orders] - Optional custom order array; defaults to the 60 demo orders
   * @returns {{
   *   threshold: number,
   *   total: number,
   *   flagged: number,
   *   truePositives: number,
   *   falsePositives: number,
   *   falseNegatives: number,
   *   trueNegatives: number,
   *   precision: number,
   *   recall: number,
   *   f1: number,
   *   annotatedOrders: Array
   * }}
   */
  function evaluateFraudThreshold(threshold, orders) {
    // Default: the 60 demo orders, each scored by the trained SVM (js/ml/inference.js).
    const list = orders || window.Allonola.inference.svmDemoOrders();
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;

    const annotatedOrders = list.map((order) => {
      const isFlagged = order.fraudScore >= threshold;
      const isActualFraud = order.fraud === 1;

      if (isFlagged && isActualFraud) tp++;
      else if (isFlagged && !isActualFraud) fp++;
      else if (!isFlagged && isActualFraud) fn++;
      else tn++;

      return {
        ...order,
        isFlagged,
      };
    });

    const flagged = tp + fp;
    const precision = flagged > 0 ? +(tp / flagged).toFixed(3) : 0;
    const recall = tp + fn > 0 ? +(tp / (tp + fn)).toFixed(3) : 0;
    const f1 = precision + recall > 0 ? +( (2 * precision * recall) / (precision + recall) ).toFixed(3) : 0;

    return {
      threshold,
      total: list.length,
      flagged,
      truePositives: tp,
      falsePositives: fp,
      falseNegatives: fn,
      trueNegatives: tn,
      precision,
      recall,
      f1,
      annotatedOrders,
    };
  }

  /**
   * Keyword lookup for product categorization based on the 5 sample products.
   * Pure stand-in rule-based classifier matching the sample catalogue.
   *
   * @param {string} title
   * @returns {{
   *   category: string,
   *   matchedKeyword: string | null,
   *   isConfident: boolean
   * }}
   */
  function predictProductCategory(title) {
    if (!title || typeof title !== "string") {
      return {
        category: "No confident match; sent to a staff member",
        matchedKeyword: null,
        isConfident: false,
      };
    }

    const t = title.toLowerCase();

    const rules = [
      { keywords: ["bottle", "steel", "kitchen", "cookware", "mug", "pan", "dish"], category: "Home and Kitchen" },
      { keywords: ["earbuds", "wireless", "audio", "charger", "cable", "electronics", "phone", "headphone"], category: "Electronics" },
      { keywords: ["dress", "floral", "cotton", "shirt", "pants", "shoes", "fashion", "apparel"], category: "Fashion" },
      { keywords: ["rice", "organic", "grocery", "groceries", "food", "snack", "grain"], category: "Groceries" },
      { keywords: ["lamp", "desk", "usb", "office", "table", "chair", "stand"], category: "Home and Office" },
    ];

    for (let i = 0; i < rules.length; i++) {
      const match = rules[i].keywords.find((k) => t.includes(k));
      if (match) {
        return {
          category: rules[i].category,
          matchedKeyword: match,
          isConfident: true,
        };
      }
    }

    return {
      category: "No confident match; sent to a staff member",
      matchedKeyword: null,
      isConfident: false,
    };
  }

  window.Allonola.ml.svm = {
    evaluateFraudThreshold,
    predictProductCategory,
  };
})();
