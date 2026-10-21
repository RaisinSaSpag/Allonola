/**
 * js/ml/decision-tree.js
 * Rule-based decision tree for delivery risk classification and explainable audit trails.
 * Pure functions with no DOM access; suitable for automated testing.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ml = window.Allonola.ml || {};

  /**
   * Traverses the delivery risk decision tree according to the specified rule hierarchy.
   *
   * Hierarchy:
   *   1. Seller rating below 3.5?
   *      - Yes -> Distance above 25 km?
   *        - Yes -> Product type is Perishable or Fragile?
   *          - Yes -> LIKELY LATE (82% confidence) [Leaf 1]
   *          - No  -> LIKELY ON TIME (60% confidence) [Leaf 2]
   *        - No  -> Courier C?
   *          - Yes -> LIKELY LATE (55% confidence) [Leaf 3]
   *          - No  -> LIKELY ON TIME (70% confidence) [Leaf 4]
   *      - No  -> Return history 2 or more?
   *        - Yes -> LIKELY LATE (58% confidence) [Leaf 5]
   *        - No  -> LIKELY ON TIME (90% confidence) [Leaf 6]
   *
   * @param {{
   *   productType: string,    // "Standard", "Fragile", or "Perishable"
   *   sellerRating: number,   // 1.0 to 5.0
   *   courier: string,        // "Courier A", "Courier B", "Courier C"
   *   distanceKm: number,     // in km
   *   returnHistory: number   // integer count
   * }} order
   * @returns {{
   *   prediction: string,      // "LIKELY LATE" or "LIKELY ON TIME"
   *   confidence: string,      // e.g. "82%"
   *   confidenceNum: number,   // 0.82
   *   leafId: string,
   *   pathSteps: string[],
   *   explanation: string
   * }}
   */
  function predictDeliveryRisk(order) {
    const { productType, sellerRating, courier, distanceKm, returnHistory } = order;
    const pathSteps = [];

    // Root check
    if (sellerRating < 3.5) {
      pathSteps.push("Seller rating is below 3.5 (" + sellerRating + " < 3.5)");

      if (distanceKm > 25) {
        pathSteps.push("Shipping distance exceeds 25 km (" + distanceKm + " km > 25 km)");

        const isSensitive = productType === "Perishable" || productType === "Fragile";
        if (isSensitive) {
          pathSteps.push("Product category is " + productType + " (requires gentle handling / cold chain)");
          return {
            prediction: "LIKELY LATE",
            confidence: "82%",
            confidenceNum: 0.82,
            leafId: "leaf-1",
            pathSteps,
            explanation:
              "Order flagged as LIKELY LATE with 82% confidence because seller rating is below 3.5 (" +
              sellerRating +
              "), distance is " +
              distanceKm +
              " km (>25 km), and product is " +
              productType +
              ". Note: return history (" +
              returnHistory +
              ") was not evaluated because the rating and distance rules split the decision first.",
          };
        } else {
          pathSteps.push("Product category is " + productType + " (standard durable item)");
          return {
            prediction: "LIKELY ON TIME",
            confidence: "60%",
            confidenceNum: 0.60,
            leafId: "leaf-2",
            pathSteps,
            explanation:
              "Predicted LIKELY ON TIME with 60% confidence: although seller rating is below 3.5 and distance exceeds 25 km, standard durable goods avoid transit hold-ups.",
          };
        }
      } else {
        pathSteps.push("Shipping distance is 25 km or less (" + distanceKm + " km <= 25 km)");

        if (courier === "Courier C") {
          pathSteps.push("Assigned to Courier C (experiencing regional hub congestion)");
          return {
            prediction: "LIKELY LATE",
            confidence: "55%",
            confidenceNum: 0.55,
            leafId: "leaf-3",
            pathSteps,
            explanation:
              "Predicted LIKELY LATE with 55% confidence: seller rating is below 3.5 and shipment was assigned to Courier C.",
          };
        } else {
          pathSteps.push("Assigned to " + courier + " (normal operational transit times)");
          return {
            prediction: "LIKELY ON TIME",
            confidence: "70%",
            confidenceNum: 0.70,
            leafId: "leaf-4",
            pathSteps,
            explanation:
              "Predicted LIKELY ON TIME with 70% confidence: short transit distance under 25 km with reliable partner " +
              courier +
              " mitigates low seller rating.",
          };
        }
      }
    } else {
      pathSteps.push("Seller rating is 3.5 or above (" + sellerRating + " >= 3.5)");

      if (returnHistory >= 2) {
        pathSteps.push("Customer has 2 or more past returns (" + returnHistory + " >= 2)");
        return {
          prediction: "LIKELY LATE",
          confidence: "58%",
          confidenceNum: 0.58,
          leafId: "leaf-5",
          pathSteps,
          explanation:
            "Predicted LIKELY LATE with 58% confidence: despite a reputable seller rating, repeated return attempts correlate with address verification delays or buyer rescheduling.",
        };
      } else {
        pathSteps.push("Customer has clean return history (" + returnHistory + " < 2)");
        return {
          prediction: "LIKELY ON TIME",
          confidence: "90%",
          confidenceNum: 0.90,
          leafId: "leaf-6",
          pathSteps,
          explanation:
            "Predicted LIKELY ON TIME with 90% confidence: high seller rating and minimal return history provide high dispatch reliability.",
        };
      }
    }
  }

  window.Allonola.ml.decisionTree = {
    predictDeliveryRisk,
  };
})();
