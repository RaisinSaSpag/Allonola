/**
 * js/ml/naive-bayes.js
 * Review sentiment / spam classifier for the Naive Bayes page.
 * Runs the trained model via js/ml/inference.js (parameters from js/ml/model-params.js).
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  // Same tokenisation as the trained model: lowercase ASCII words of 2+ characters.
  function tokenize(text) {
    if (!text || typeof text !== "string") return [];
    return text.toLowerCase().match(/[a-z0-9_]{2,}/g) || [];
  }

  const LABEL = { negative: "Negative", positive: "Positive", spam: "Spam" };

  /**
   * Classifies a review as Positive, Negative or Spam using the trained model.
   *
   * @param {string} text
   * @returns {{
   *   predictedClass: string,                       // "Positive" | "Negative" | "Spam" | "Neutral"
   *   probabilities: { Positive: number, Negative: number, Spam: number },
   *   topWords: Array<{ word: string, weight: number, class: string }>,
   *   tokens: string[]
   * }}
   */
  function classify(text) {
    const tokens = tokenize(text);
    const neutral = {
      predictedClass: "Neutral",
      probabilities: { Positive: 0.333, Negative: 0.333, Spam: 0.334 },
      topWords: [],
      tokens,
    };
    if (tokens.length === 0) return neutral;

    const r = window.Allonola.inference.predictReview(text);
    if (r.topWords.length === 0) return neutral; // no words the model knows

    const predicted = LABEL[r.label];
    return {
      predictedClass: predicted,
      probabilities: {
        Positive: +r.proba.positive.toFixed(4),
        Negative: +r.proba.negative.toFixed(4),
        Spam: +r.proba.spam.toFixed(4),
      },
      topWords: r.topWords.map((w) => ({ word: w.word, weight: +w.weight.toFixed(3), class: predicted })),
      tokens,
    };
  }

  window.Allonola.ml.naiveBayes = { tokenize, classify };
})();
