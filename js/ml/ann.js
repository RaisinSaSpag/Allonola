/**
 * js/ml/ann.js
 * Shopper churn for the Neural Network page.
 * Churn comes from the trained network (js/ml/inference.js). The loss curve is illustrative:
 * the exported model does not include per-epoch validation loss.
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  /**
   * Illustrative training-loss slice up to the given epoch (1 to 30).
   * Not produced by the trained model; see the page note.
   */
  function getLossSlice(maxEpoch = 30) {
    const history = window.Allonola.data.ann.lossHistory || [];
    const clamped = Math.max(1, Math.min(30, maxEpoch));
    const slice = history.slice(0, clamped);

    return {
      labels: slice.map((h) => h.epoch),
      trainLoss: slice.map((h) => h.trainLoss),
      valLoss: slice.map((h) => h.valLoss),
      currentTrain: slice[slice.length - 1].trainLoss,
      currentVal: slice[slice.length - 1].valLoss,
      earlyStoppingEpoch: 22,
    };
  }

  /**
   * Churn probability and homepage items for a demo shopper ("S-01" to "S-06").
   * churnProb is the trained network's output for that shopper's features.
   */
  function predictShopperChurn(shopperId) {
    const inf = window.Allonola.inference;
    const row = inf.demoShopperRow(shopperId);
    const stored = (window.Allonola.data.ann.storedShoppers || {})[shopperId];
    if (!row || !stored) {
      return {
        shopper: shopperId,
        churnProb: null, riskLevel: "Error: Shopper ID not found",
        homepageItems: [],
        isIllustrative: true,
      };
    }

    const churnProb = inf.predictChurn(row).proba["1"];
    const riskLevel =
      churnProb < 0.33 ? "Low churn risk" : churnProb < 0.66 ? "Moderate churn risk" : "High churn risk";
    return {
      shopper: shopperId,
      churnProb,
      riskLevel,
      homepageItems: stored.homepageItems || [],
      features: row,
      isIllustrative: false,
    };
  }

  window.Allonola.ml.ann = {
    getLossSlice,
    predictShopperChurn,
  };
})();

