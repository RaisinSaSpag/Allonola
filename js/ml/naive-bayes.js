/**
 * js/ml/naive-bayes.js
 * Multinomial Naive Bayes text classifier trained on illustrative review corpus.
 * Uses Laplace smoothing (alpha = 1) and log probabilities to avoid underflow.
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  /**
   * Tokenizes input text: lowercase, splits on non-letters, keeps all tokens.
   * @param {string} text
   * @returns {string[]}
   */
  // Common English words that carry no sentiment or spam signal.
  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at", "for", "from",
    "with", "by", "is", "it", "its", "this", "that", "these", "those", "was", "were",
    "be", "been", "am", "are", "as", "so", "if", "i", "me", "my", "we", "our", "you",
    "your", "they", "them", "he", "she", "his", "her", "do", "did", "not", "no",
  ]);

  function tokenize(text) {
    if (!text || typeof text !== "string") return [];
    return text
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((t) => t.length > 0 && !STOP_WORDS.has(t));
  }

  // Model training state initialized from sample reviews
  let modelState = null;

  function trainModel() {
    const samples = window.Allonola.data.naiveBayes.sampleDataset;
    const classes = ["Positive", "Negative", "Spam"];
    const classDocCounts = { Positive: 0, Negative: 0, Spam: 0 };
    const classWordCounts = { Positive: {}, Negative: {}, Spam: {} };
    const classTotalWords = { Positive: 0, Negative: 0, Spam: 0 };
    const vocabulary = new Set();

    samples.forEach(({ text, label }) => {
      if (!classes.includes(label)) return;
      classDocCounts[label]++;
      const tokens = tokenize(text);
      tokens.forEach((token) => {
        vocabulary.add(token);
        classWordCounts[label][token] = (classWordCounts[label][token] || 0) + 1;
        classTotalWords[label]++;
      });
    });

    const totalDocs = samples.length;
    const vocabSize = vocabulary.size;

    modelState = {
      classes,
      totalDocs,
      vocabSize,
      classDocCounts,
      classWordCounts,
      classTotalWords,
      vocabulary,
    };

    return modelState;
  }

  /**
   * Classifies a review string into Positive, Negative, or Spam.
   *
   * @param {string} text
   * @returns {{
   *   predictedClass: string,
   *   probabilities: { Positive: number, Negative: number, Spam: number },
   *   logScores: { Positive: number, Negative: number, Spam: number },
   *   topWords: Array<{ word: string, weight: number, class: string }>,
   *   tokens: string[]
   * }}
   */
  function classify(text) {
    if (!modelState) trainModel();

    const tokens = tokenize(text);
    const { classes, totalDocs, vocabSize, classDocCounts, classWordCounts, classTotalWords } = modelState;

    if (tokens.length === 0) {
      return {
        predictedClass: "Neutral",
        probabilities: { Positive: 0.333, Negative: 0.333, Spam: 0.334 },
        logScores: { Positive: 0, Negative: 0, Spam: 0 },
        topWords: [],
        tokens: [],
      };
    }

    const logScores = {};
    const wordContributions = {}; // token -> { Positive, Negative, Spam }

    classes.forEach((c) => {
      // Prior probability: P(c) = docCount(c) / totalDocs
      let score = Math.log(classDocCounts[c] / totalDocs);

      tokens.forEach((token) => {
        const count = classWordCounts[c][token] || 0;
        // Laplace smoothed conditional probability: (count + 1) / (totalWordsInClass + |V|)
        const pWordGivenClass = (count + 1) / (classTotalWords[c] + vocabSize);
        const logP = Math.log(pWordGivenClass);
        score += logP;

        if (!wordContributions[token]) wordContributions[token] = {};
        wordContributions[token][c] = logP;
      });

      logScores[c] = score;
    });

    // Softmax normalization to derive valid probabilities that sum to 1
    const maxLog = Math.max(logScores.Positive, logScores.Negative, logScores.Spam);
    const expScores = {
      Positive: Math.exp(logScores.Positive - maxLog),
      Negative: Math.exp(logScores.Negative - maxLog),
      Spam: Math.exp(logScores.Spam - maxLog),
    };
    const sumExp = expScores.Positive + expScores.Negative + expScores.Spam;

    const probabilities = {
      Positive: +(expScores.Positive / sumExp).toFixed(4),
      Negative: +(expScores.Negative / sumExp).toFixed(4),
      Spam: +(expScores.Spam / sumExp).toFixed(4),
    };

    // Determine predicted class
    let predictedClass = "Positive";
    let highestProb = -1;
    classes.forEach((c) => {
      if (probabilities[c] > highestProb) {
        highestProb = probabilities[c];
        predictedClass = c;
      }
    });

    // Identify top words that favored the predicted class over alternative classes
    const scoredWords = [];
    tokens.forEach((token) => {
      const classLog = wordContributions[token][predictedClass];
      // Compare against average log score of other classes
      let otherSum = 0;
      let otherCount = 0;
      classes.forEach((other) => {
        if (other !== predictedClass) {
          otherSum += wordContributions[token][other];
          otherCount++;
        }
      });
      const advantage = classLog - otherSum / otherCount;
      scoredWords.push({ word: token, weight: +advantage.toFixed(3), class: predictedClass });
    });

    // Sort by descending impact and deduplicate
    const uniqueTopWords = [];
    const seen = new Set();
    scoredWords
      .sort((a, b) => b.weight - a.weight)
      .forEach((item) => {
        if (!seen.has(item.word)) {
          seen.add(item.word);
          uniqueTopWords.push(item);
        }
      });

    return {
      predictedClass,
      probabilities,
      logScores,
      topWords: uniqueTopWords.slice(0, 5),
      tokens,
    };
  }

  window.Allonola.ml.naiveBayes = {
    tokenize,
    trainModel,
    classify,
  };
})();
