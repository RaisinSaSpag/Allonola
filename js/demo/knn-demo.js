/**
 * js/demo/knn-demo.js
 * Wires the KNN page controls to js/ml/knn.js.
 */
"use strict";

(function () {
  const K = window.Allonola && window.Allonola.ml && window.Allonola.ml.knn;
  const userSel = document.getElementById("knn-user");
  const kSlider = document.getElementById("knn-k");
  const kVal = document.getElementById("knn-k-val");
  const neighborsEl = document.getElementById("knn-neighbors");
  const outputEl = document.getElementById("knn-output");
  if (!K || !userSel || !kSlider) return;

  // Populate the shopper list from the dataset (once).
  if (!userSel.options.length) {
    window.Allonola.data.knn.matrix.forEach(function (row) {
      const opt = document.createElement("option");
      opt.value = row.user;
      opt.textContent = row.user;
      userSel.appendChild(opt);
    });
    userSel.value = "U1";
  }

  function render() {
    const k = Number(kSlider.value);
    kVal.textContent = k;
    const res = K.recommend(userSel.value, k);

    neighborsEl.textContent =
      "Nearest neighbors: " +
      res.neighbors.map(function (n) {
        return n.user + " (similarity " + n.similarity.toFixed(2) + ")";
      }).join(", ") + ". Neighbors with similarity 0 share no purchases with this shopper.";

    outputEl.textContent = "";
    if (!res.recommendations.length) {
      outputEl.textContent =
        "No recommendations for this shopper with these neighbors yet. Try a larger k or another shopper.";
      return;
    }
    const heading = document.createElement("p");
    heading.textContent = "Recommended items, highest predicted score first (score out of 5):";
    const list = document.createElement("ol");
    res.recommendations.forEach(function (r) {
      const li = document.createElement("li");
      li.textContent = r.item + " — predicted score " + r.predictedScore;
      list.appendChild(li);
    });
    outputEl.appendChild(heading);
    outputEl.appendChild(list);
  }

  userSel.addEventListener("change", render);
  kSlider.addEventListener("input", render);
  render();
})();
