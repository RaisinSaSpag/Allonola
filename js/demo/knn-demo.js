/**
 * js/demo/knn-demo.js
 * Wires the KNN page controls to the Python Flask API.
 */
"use strict";

(function () {
  const userSel = document.getElementById("knn-user");
  const kSlider = document.getElementById("knn-k");
  const kVal = document.getElementById("knn-k-val");
  const neighborsEl = document.getElementById("knn-neighbors");
  const outputEl = document.getElementById("knn-output");
  
  if (!userSel || !kSlider) return;

  // Populate the shopper list to match the Python model (U001 to U030)
  if (!userSel.options.length) {
    for (let i = 1; i <= 30; i++) {
      const userId = 'U' + String(i).padStart(3, '0');
      const opt = document.createElement("option");
      opt.value = userId;
      opt.textContent = userId;
      userSel.appendChild(opt);
    }
    userSel.value = "U001";
  }

  async function render() {
    const k = Number(kSlider.value);
    kVal.textContent = k;
    
    neighborsEl.textContent = "Asking Python model...";
    outputEl.innerHTML = "";

    try {
      // Send the selected user AND the k value to the Python API
      const response = await fetch('http://127.0.0.1:5000/api/predict/knn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_id: userSel.value,
            k: k
        })
      });

      if (!response.ok) throw new Error("User not found or server error");
      
      const result = await response.json();
      
      // Update the UI
      neighborsEl.textContent = "Python model successfully found the nearest neighbors based on cosine similarity.";
      
      if (!result.recommendations || result.recommendations.length === 0) {
        outputEl.textContent = "No recommendations for this shopper yet.";
        return;
      }

      const heading = document.createElement("p");
      heading.textContent = "Recommended items, highest predicted score first (score out of 5):";
      const list = document.createElement("ol");
      
      // Loop through the JSON response from Python
      result.recommendations.forEach(function (item, index) {
        const li = document.createElement("li");
        const score = result.scores[index];
        // Clean up the item name (e.g., "Phone_Case" -> "Phone Case")
        const cleanName = item.replace(/_/g, ' ');
        li.textContent = cleanName + " — predicted score " + score;
        list.appendChild(li);
      });
      
      outputEl.appendChild(heading);
      outputEl.appendChild(list);

    } catch (error) {
      console.error("Error connecting to Python server:", error);
      neighborsEl.textContent = "";
      outputEl.textContent = "⚠️ Could not connect to the Python ML server. Make sure 'python app.py' is running.";
    }
  }

  userSel.addEventListener("change", render);
  kSlider.addEventListener("input", render);
  
  // Initial load
  render(); 
})();