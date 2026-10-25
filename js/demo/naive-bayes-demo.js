/**
 * js/demo/naive-bayes-demo.js
 * Wires the Naive Bayes page controls to js/ml/naive-bayes.js.
 */
"use strict";

(function () {
  const NB = window.Allonola && window.Allonola.ml && window.Allonola.ml.naiveBayes;
  const textEl = document.getElementById("nb-text");
  const runBtn = document.getElementById("nb-run");
  const outputEl = document.getElementById("nb-output");
  if (!NB || !textEl || !runBtn || !outputEl) return;

  function pct(p) {
    return Math.round(p * 100) + "%";
  }

  function run() {
    const text = textEl.value.trim();
    if (!text) {
      outputEl.textContent = "Please type a review to classify.";
      return;
    }
    const r = NB.classify(text);
    if (r.predictedClass === "Neutral") {
      outputEl.textContent = "The model found no recognizable words. Try a longer review.";
      return;
    }
    let message =
      "Prediction: " + r.predictedClass + ". Probabilities: Positive " + pct(r.probabilities.Positive) +
      ", Negative " + pct(r.probabilities.Negative) + ", Spam " + pct(r.probabilities.Spam) + ".";
    if (r.topWords && r.topWords.length) {
      message += " Words with the strongest influence: " +
        r.topWords.map(function (w) { return '"' + w.word + '"'; }).join(", ") + ".";
    }
    message += " The model was trained on 3,000 synthetic reviews; real moderation needs real review data.";
    outputEl.textContent = message;
  }

  runBtn.addEventListener("click", run);

  document.querySelectorAll("[data-nb-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      textEl.value = btn.getAttribute("data-nb-example");
      run();
    });
  });
})();
