/**
 * js/demo/naive-bayes-demo.js
 * Wires the Naive Bayes page controls to the Python Flask API.
 */
"use strict";

(function () {
  const textEl = document.getElementById("nb-text");
  const runBtn = document.getElementById("nb-run");
  const outputEl = document.getElementById("nb-output");
  if (!textEl || !runBtn || !outputEl) return;

  function pct(p) {
    return Math.round(p * 100) + "%";
  }

  async function run() {
    const text = textEl.value.trim();
    if (!text) {
      outputEl.textContent = "Please type a review to classify.";
      return;
    }

    outputEl.textContent = "Asking Python model...";

    try {
      // Send text to the Python API
      const response = await fetch('http://127.0.0.1:5000/api/predict/nb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      });

      if (!response.ok) throw new Error("Server error");
      
      const result = await response.json();
      
      // The API returns: { prediction: "Spam", classes: ["Negative", "Positive", "Spam"], probabilities: [0.1, 0.2, 0.7] }
      
      // Build a dictionary of probabilities for easy access
      const probDict = {};
      result.classes.forEach((cls, index) => {
        probDict[cls] = result.probabilities[index];
      });

      let message =
        "Prediction: " + result.prediction + ". Probabilities: Positive " + pct(probDict["Positive"] || 0) +
        ", Negative " + pct(probDict["Negative"] || 0) + ", Spam " + pct(probDict["Spam"] || 0) + ".";
      
      message += " (Calculated by the Python Scikit-Learn model).";
      outputEl.textContent = message;

    } catch (error) {
      console.error("Error connecting to Python server:", error);
      outputEl.textContent = "⚠️ Could not connect to the Python ML server. Make sure 'python app.py' is running.";
    }
  }

  runBtn.addEventListener("click", run);

  document.querySelectorAll("[data-nb-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      textEl.value = btn.getAttribute("data-nb-example");
      run();
    });
  });
})();
