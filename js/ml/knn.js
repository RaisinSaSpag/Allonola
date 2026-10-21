/**
 * js/ml/knn.js
 * Collaborative filtering recommender using k-nearest neighbors and cosine similarity.
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  /**
   * Computes cosine similarity between two rating vectors.
   *
   * cos(u, v) = (u . v) / (||u|| * ||v||)
   *
   * @param {number[]} vecA
   * @param {number[]} vecB
   * @returns {number} Value between 0.0 and 1.0
   */
  function cosineSimilarity(vecA, vecB) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return +(dot / (Math.sqrt(normA) * Math.sqrt(normB))).toFixed(4);
  }

  /**
   * Finds the k nearest neighbors for a target user and predicts ratings for unbought items.
   *
   * @param {string} targetUserId - e.g., "U1"
   * @param {number} k - Neighborhood size (1 to 5)
   * @returns {{
   *   targetUser: string,
   *   k: number,
   *   allSimilarities: Array<{ user: string, similarity: number, ratings: number[], isNeighbor: boolean }>,
   *   neighbors: Array<{ user: string, similarity: number, ratings: number[] }>,
   *   recommendations: Array<{ item: string, itemIndex: number, predictedScore: number }>,
   *   unboughtItems: string[]
   * }}
   */
  function recommend(targetUserId, k = 3) {
    const knnData = window.Allonola.data.knn;
    const items = knnData.items;
    const matrix = knnData.matrix;

    const targetRow = matrix.find((r) => r.user === targetUserId);
    if (!targetRow) return null;

    const targetRatings = targetRow.ratings;

    // Calculate similarity with all other users
    const similarities = [];
    matrix.forEach((row) => {
      if (row.user !== targetUserId) {
        const sim = cosineSimilarity(targetRatings, row.ratings);
        similarities.push({
          user: row.user,
          similarity: sim,
          ratings: row.ratings,
        });
      }
    });

    // Sort descending by similarity
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Pick top k
    const clampedK = Math.max(1, Math.min(k, similarities.length));
    const neighbors = similarities.slice(0, clampedK);

    const allSimilarities = similarities.map((s, index) => ({
      ...s,
      isNeighbor: index < clampedK,
    }));

    // Find items target user has NOT bought (rating === 0)
    const unboughtItems = [];
    const recommendations = [];

    items.forEach((item, index) => {
      if (targetRatings[index] === 0) {
        unboughtItems.push(item);

        // Weighted average of neighbors who rated this item
        let weightedSum = 0;
        let simSum = 0;

        neighbors.forEach((n) => {
          const rating = n.ratings[index];
          if (rating > 0 && n.similarity > 0) {
            weightedSum += n.similarity * rating;
            simSum += n.similarity;
          }
        });

        const predictedScore = simSum > 0 ? +(weightedSum / simSum).toFixed(1) : 0;
        recommendations.push({
          item,
          itemIndex: index,
          predictedScore,
        });
      }
    });

    // Sort recommendations descending by predicted score
    recommendations.sort((a, b) => b.predictedScore - a.predictedScore);

    return {
      targetUser: targetUserId,
      k: clampedK,
      allSimilarities,
      neighbors,
      recommendations,
      unboughtItems,
    };
  }

  window.Allonola.ml.knn = {
    cosineSimilarity,
    recommend,
  };
})();
