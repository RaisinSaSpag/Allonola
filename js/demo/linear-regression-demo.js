/**
 * js/demo/linear-regression-demo.js
 * Connects the Linear Regression page controls to the Python Flask API.
 */
"use strict";

(function () {
  const productSel = document.getElementById("lr-product");
  const priceSlider = document.getElementById("lr-price");
  const priceVal = document.getElementById("lr-price-val");
  const promoBox = document.getElementById("lr-promo");
  const unitsEl = document.getElementById("lr-units");
  const outputEl = document.getElementById("lr-output");
  const rangeNote = document.getElementById("lr-range-note");
  const canvas = document.getElementById("lr-chart");
  
  if (!productSel || !priceSlider || !promoBox) return;

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

  function resetControls() {
    const b = baseline();
    if (!b) return;
    priceSlider.min = Math.round(b.basePrice * 0.7);
    priceSlider.max = Math.round(b.basePrice * 1.3);
    priceSlider.value = b.basePrice;
    promoBox.checked = b.baselinePromotion;
    
    const observed = window.Allonola.data.linearRegression.sampleDataset
      .filter(function (row) { return row.product === productSel.value; })
      .map(function (row) { return row.price; });
    const observedText = observed.length
      ? "Observed sample prices: " + formatPeso(Math.min.apply(null, observed)) + " to " +
        formatPeso(Math.max.apply(null, observed)) + "."
      : "No observed sample prices for this product.";
    rangeNote.textContent =
      "Slider range is ±30% around the baseline price of " + formatPeso(b.basePrice) + ". " +
      observedText + " Prices outside the observed range are extrapolations.";
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

  // ---------------------------------------------------------
  // NEW: Connect to the Python Flask API
  // ---------------------------------------------------------
  async function render() {
    const price = Number(priceSlider.value);
    const promo = promoBox.checked ? "Yes" : "No";
    // We hardcode season to "Normal" because the HTML doesn't have a season dropdown yet.
    const season = "Normal"; 
    
    priceVal.textContent = formatPeso(price);
    unitsEl.textContent = "..."; // Show loading state
    outputEl.textContent = "Asking Python model...";

    try {
      // Send data to the Python server
      const response = await fetch('http://127.0.0.1:5000/api/predict/lr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: price, season: season, promo: promo })
      });

      if (!response.ok) throw new Error("Server error");
      
      const result = await response.json();
      const units = result.prediction;

      // Update the UI
      unitsEl.textContent = units;
      outputEl.textContent = "At " + formatPeso(price) + " the Python model predicts " + units + " units.";
      
      // Draw a "fake" curve for the chart (since the Python server only returns one prediction at a time)
      const fakeCurve = { prices: [], units: [] };
      for(let p = Number(priceSlider.min); p <= Number(priceSlider.max); p += (priceSlider.max - priceSlider.min)/10) {
          fakeCurve.prices.push(p);
          fakeCurve.units.push(Math.max(5, units + (price - p) * 0.2)); // Simple visual curve
      }
      drawChart(fakeCurve);

    } catch (error) {
      console.error("Error connecting to Python server:", error);
      unitsEl.textContent = "Error";
      outputEl.textContent = "⚠️ Could not connect to the Python ML server. Make sure 'python app.py' is running in your terminal.";
    }
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
