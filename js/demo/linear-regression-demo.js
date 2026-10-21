/**
 * js/demo/linear-regression-demo.js
 * Wires the Linear Regression page controls to the pure functions in js/ml/linear-regression.js.
 */
"use strict";

(function () {
  const L = window.Allonola && window.Allonola.ml && window.Allonola.ml.linearRegression;
  const productSel = document.getElementById("lr-product");
  const priceSlider = document.getElementById("lr-price");
  const priceVal = document.getElementById("lr-price-val");
  const promoBox = document.getElementById("lr-promo");
  const unitsEl = document.getElementById("lr-units");
  const outputEl = document.getElementById("lr-output");
  const rangeNote = document.getElementById("lr-range-note");
  const canvas = document.getElementById("lr-chart");
  if (!L || !productSel || !priceSlider || !promoBox) return;

  let chart = null;

  function formatPeso(n) {
    return "₱" + Math.round(n).toLocaleString("en-US");
  }

  function baseline() {
    return window.Allonola.data.linearRegression.baselines[productSel.value];
  }

  function cssToken(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  // Reset the slider to the product's baseline price and promotion status.
  function resetControls() {
    const b = baseline();
    if (!b) return;
    priceSlider.min = Math.round(b.basePrice * 0.7);
    priceSlider.max = Math.round(b.basePrice * 1.3);
    priceSlider.value = b.basePrice;
    promoBox.checked = b.baselinePromotion;
    rangeNote.textContent =
      "Slider range is ±30% around the baseline price of " + formatPeso(b.basePrice) + ".";
  }

  function drawChart(curve) {
    if (!canvas || !window.Chart) return;
    const data = {
      labels: curve.prices.map(formatPeso),
      datasets: [{
        label: "Predicted units sold",
        data: curve.units,
        borderColor: cssToken("--teal", "#2EC4B6"),
        backgroundColor: "transparent",
        tension: 0.3,
      }],
    };
    if (chart) chart.destroy();
    chart = new window.Chart(canvas, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Price (₱)" } },
          y: { title: { display: true, text: "Units sold" }, beginAtZero: true },
        },
      },
    });
  }

  function render() {
    const price = Number(priceSlider.value);
    const on = promoBox.checked;
    const units = L.predictUnits(productSel.value, price, on);
    const impact = L.calculate10PercentCutImpact(productSel.value, price, on);
    priceVal.textContent = formatPeso(price);
    unitsEl.textContent = units;
    outputEl.textContent =
      "At " + formatPeso(price) + " the model predicts " + units + " units. " +
      "A 10% price cut would change the forecast by about " + impact + " units.";
    drawChart(L.generatePriceCurve(productSel.value, on));
  }

  productSel.addEventListener("change", function () {
    resetControls();
    render();
  });
  priceSlider.addEventListener("input", render);
  promoBox.addEventListener("change", render);

  resetControls();
  render();
})();
