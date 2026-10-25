/**
 * js/ml/linear-regression.js
 * Demand forecasting and price elasticity for the Linear Regression page.
 * Runs the trained model via js/ml/inference.js (parameters from js/ml/model-params.js).
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  // Build the feature row the trained model expects for one product at one price.
  // The forecast is for a weekday (is_weekend = 0), as the page does not ask for the day.
  function rowFor(productName, price, promotionOn) {
    const b = window.Allonola.data.linearRegression.baselines[productName];
    if (!b) return null;
    return {
      product: productName,
      category: b.category,
      price: price,
      base_price: b.basePrice,
      promo: promotionOn ? 1 : 0,
      is_weekend: 0,
    };
  }

  /**
   * Predicted units sold for a product at a given price (whole number, >= 0).
   * @param {string} productName - "Ceramic mug", "Running shoes (P-220)", or "Phone stand"
   * @param {number} newPrice - price in ₱
   * @param {boolean} promotionOn - whether a promotion is running
   */
  function predictUnits(productName, newPrice, promotionOn) {
    const row = rowFor(productName, newPrice, promotionOn);
    if (!row) return 0;
    return Math.max(0, Math.round(window.Allonola.inference.predictUnits(row)));
  }

  /** Change in units from a 10% price cut (positive number). */
  function calculate10PercentCutImpact(productName, currentPrice, promotionOn) {
    const currentUnits = predictUnits(productName, currentPrice, promotionOn);
    const newUnits = predictUnits(productName, currentPrice * 0.9, promotionOn);
    return Math.abs(newUnits - currentUnits);
  }

  /** Forecast curve across ±30% of the baseline price. */
  function generatePriceCurve(productName, promotionOn) {
    const data = window.Allonola.data.linearRegression.baselines[productName];
    if (!data) return { prices: [], units: [] };

    const basePrice = data.basePrice;
    const minPrice = Math.round(basePrice * 0.7);
    const maxPrice = Math.round(basePrice * 1.3);
    const step = basePrice > 1000 ? 50 : 10;
    const prices = [];
    const units = [];
    for (let p = minPrice; p <= maxPrice; p += step) {
      prices.push(p);
      units.push(predictUnits(productName, p, promotionOn));
    }
    return { prices, units };
  }

  window.Allonola.ml.linearRegression = {
    predictUnits,
    calculate10PercentCutImpact,
    generatePriceCurve,
    priceElasticity: () => window.Allonola.inference.priceElasticity(),
  };
})();
