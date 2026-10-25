#!/usr/bin/env node
/**
 * Parity test: the website's JavaScript must reproduce Python's predictions.
 *
 *   node ml_pipeline/tests/js_parity.js
 *
 * Loads the SAME classic scripts the browser loads (js/ml/model-params.js and js/ml/inference.js)
 * into a sandbox, runs every held-out row in parity_fixture.json through the JavaScript engine,
 * and compares with what scikit-learn predicted for those rows. It also checks the demo data
 * the pages display (the 60 SVM orders and the 6 churn shoppers).
 * Exit code 0 = every check passed.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const siteJs = path.resolve(__dirname, "../../js/ml");
const fixturePath = path.resolve(__dirname, "parity_fixture.json");
const TOL = 1e-6;
// sklearn 1.9's SVC.predict_proba is a Platt sigmoid that differs slightly from the stored
// (A, B) on this model (max ~0.0035, see README). Labels and decision values stay exact.
const PROBA_TOL = { svm: 5e-3 };

const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const file of ["model-params.js", "inference.js"]) {
  vm.runInContext(fs.readFileSync(path.join(siteJs, file), "utf8"), sandbox, { filename: file });
}
const inf = sandbox.Allonola.inference;
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

// Each engine maps a fixture row to the JS prediction.
const engines = {
  linear_regression: (row) => ({ value: inf.predictUnits(row) }),
  naive_bayes: (row) => inf.predictReview(row.text),
  svm: (row) => inf.predictFraud(row),
  decision_tree: (row) => inf.predictLate(row),
  ann: (row) => inf.predictChurn(row),
};

let failures = 0;
const report = [];

for (const [name, engine] of Object.entries(engines)) {
  const { rows, python } = fixture[name];
  let labelMismatch = 0;
  let maxProbDiff = 0;
  let maxDecisionDiff = 0;
  let maxRelValueDiff = 0;

  rows.forEach((row, i) => {
    const js = engine(row);
    if ("value" in python) {
      const diff = Math.abs(js.value - python.value[i]);
      maxRelValueDiff = Math.max(maxRelValueDiff, diff / Math.max(1, Math.abs(python.value[i])));
      return;
    }
    if (String(js.label) !== String(python.label[i])) labelMismatch++;
    if (python.decision) maxDecisionDiff = Math.max(maxDecisionDiff, Math.abs(js.decision - python.decision[i]));
    Object.keys(js.proba).forEach((c, k) => {
      maxProbDiff = Math.max(maxProbDiff, Math.abs(js.proba[c] - python.proba[i][k]));
    });
  });

  const probTol = PROBA_TOL[name] ?? TOL;
  const ok =
    labelMismatch === 0 &&
    maxDecisionDiff <= TOL &&
    maxProbDiff <= probTol &&
    maxRelValueDiff <= TOL;
  if (!ok) failures++;
  report.push({
    check: name,
    rows: rows.length,
    labelMismatches: labelMismatch,
    maxDecisionDiff,
    maxProbDiff,
    maxRelValueDiff,
    result: ok ? "PASS" : "FAIL",
  });
}

// Demo data shown on the SVM and ANN pages must score exactly as Python scored it.
const demo = fixture._demo;
{
  const orders = inf.svmDemoOrders();
  const diff = Math.max(...orders.map((o, i) => Math.abs(o.fraudProbability - demo.svmOrders[i].pythonScore)));
  const ok = orders.length === 60 && diff <= PROBA_TOL.svm;
  if (!ok) failures++;
  report.push({ check: "svm demo orders (60)", rows: orders.length, maxProbDiff: diff, result: ok ? "PASS" : "FAIL" });
}
{
  const ids = Object.keys(demo.shoppers);
  const diff = Math.max(...ids.map((id) => Math.abs(inf.predictChurn(inf.demoShopperRow(id)).proba["1"] - demo.shoppers[id].pythonChurnProb)));
  const ok = ids.length === 6 && diff <= TOL;
  if (!ok) failures++;
  report.push({ check: "ann demo shoppers (6)", rows: ids.length, maxProbDiff: diff, result: ok ? "PASS" : "FAIL" });
}

console.table(report);
if (failures) {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
}
console.log("All JavaScript checks reproduce the Python predictions.");
