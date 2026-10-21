/**
 * js/ml/linear-regression.js
 * Pure mathematical functions for demand forecasting and price elasticity.
 * No DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  /**
   * Calculates predicted units sold based on price elasticity and promotion lift.
   *
   * Formula:
   *   adjusted = base * (1 + (-0.4) * (newPrice - basePrice) / basePrice)
   *   if (promotionOn && !baselinePromo) adjusted *= 1.15;
   *   if (!promotionOn && baselinePromo) adjusted *= 0.87;
   *   clamp to minimum 0, round to integer.
   *
   * @param {string} productName - "Ceramic mug", "Running shoes (P-220)", or "Phone stand"
   * @param {number} newPrice - Evaluated price in ₱
   * @param {boolean} promotionOn - Whether promotion is active
   * @returns {number} Predicted units sold (whole number >= 0)
   */
  function predictUnits(productName, newPrice, promotionOn) {
    const data = window.Allonola.data.linearRegression.baselines[productName];
    if (!data) return 0;

    const base = data.baseUnitsSold;
    const basePrice = data.basePrice;
    const baselinePromo = data.baselinePromotion;

    let adjusted = base * (1 + (-0.4) * (newPrice - basePrice) / basePrice);

    if (promotionOn && !baselinePromo) {
      adjusted *= 1.15;
    } else if (!promotionOn && baselinePromo) {
      adjusted *= 0.87;
    }

    const clamped = Math.max(0, Math.round(adjusted));
    return clamped;
  }

  /**
   * Computes the forecasted delta in units sold resulting from a 10% price cut.
   *
   * @param {string} productName
   * @param {number} currentPrice
   * @param {boolean} promotionOn
   * @returns {number} Difference in units (positive or zero)
   */
  function calculate10PercentCutImpact(productName, currentPrice, promotionOn) {
    const currentUnits = predictUnits(productName, currentPrice, promotionOn);
    const discountedPrice = currentPrice * 0.9;
    const newUnits = predictUnits(productName, discountedPrice, promotionOn);
    return Math.abs(newUnits - currentUnits);
  }

  /**
   * Generates a series of price points and corresponding unit forecasts across +-30% range.
   *
   * @param {string} productName
   * @param {boolean} promotionOn
   * @returns {{ prices: number[], units: number[] }}
   */
  function generatePriceCurve(productName, promotionOn) {
    const data = window.Allonola.data.linearRegression.baselines[productName];
    if (!data) return { prices: [], units: [] };

    const basePrice = data.basePrice;
    const minPrice = Math.round(basePrice * 0.7);
    const maxPrice = Math.round(basePrice * 1.3);
    const prices = [];
    const units = [];

    // Step by 10 or 20 depending on price magnitude
    const step = basePrice > 1000 ? 50 : 10;
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
  };
})();
