/**
 * js/ml/ann.js
 * Artificial Neural Network helper functions for training epoch histories,
 * early stopping analysis, and customer churn prediction queries.
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  /**
   * Retrieves epoch slices up to the specified epoch index.
   *
   * @param {number} maxEpoch - Between 1 and 30
   * @returns {{
   *   labels: number[],
   *   trainLoss: number[],
   *   valLoss: number[],
   *   currentTrain: number,
   *   currentVal: number,
   *   earlyStoppingEpoch: number
   * }}
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
   * Looks up stored churn prediction metrics and personalized homepage recommendations for a shopper.
   *
   * @param {string} shopperId - "S-01" to "S-06"
   * @returns {{
   *   shopper: string,
   *   churnProb: number,
   *   riskLevel: string,
   *   homepageItems: Array<{ rank: number, title: string, score: number, reason: string }>,
   *   isIllustrative: boolean
   * }}
   */
  function predictShopperChurn(shopperId) {
    const shoppers = window.Allonola.data.ann.storedShoppers || {};
    const record = shoppers[shopperId];

    if (!record) {
      return {
        shopper: shopperId,
        churnProb: 0.5,
        riskLevel: "Unknown profile",
        homepageItems: [],
        isIllustrative: true,
      };
    }

    return {
      ...record,
      isIllustrative: true,
    };
  }

  window.Allonola.ml.ann = {
    getLossSlice,
    predictShopperChurn,
  };
})();
