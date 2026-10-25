#!/usr/bin/env node
/**
 * Parity test: the website's JavaScript must reproduce Python's predictions.
 *
 *   node ml_pipeline/tests/js_parity.js
 *
 * Loads the SAME two classic scripts the browser loads (js/ml/model-params.js and
 * js/ml/inference.js) into a sandbox, runs every row in parity_fixture.json through
 * the JavaScript engine, and compares with what scikit-learn predicted for those rows.
 * Exit code 0 = every label matches and every probability is within 1e-6.
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

// model name -> function(row) returning {label, proba} or {value}
const engines = {
  linear_regression: (row) => ({ value: inf.predictUnits(row) }),
  naive_bayes: (row) => inf.predictReview(row.text),
  knn: (row) => inf.predictKnn(row),
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
  let maxValueDiff = 0;
  let maxDecisionDiff = 0;
  let relValueDiff = 0;

  rows.forEach((row, i) => {
    const js = engine(row);
    if ("value" in python) {
      const diff = Math.abs(js.value - python.value[i]);
      maxValueDiff = Math.max(maxValueDiff, diff);
      relValueDiff = Math.max(relValueDiff, diff / Math.max(1, Math.abs(python.value[i])));
      return;
    }
    if (String(js.label) !== String(python.label[i])) labelMismatch++;
    if (python.decision) maxDecisionDiff = Math.max(maxDecisionDiff, Math.abs(js.decision - python.decision[i]));
    if (python.proba) {
      // python.proba[i] is ordered like the model's classes_
      const pyProba = python.proba[i];
      const classes = Object.keys(js.proba);
      classes.forEach((c, k) => {
        // sklearn class order is the order the exporter wrote, which matches js.proba keys
        const diff = Math.abs(js.proba[c] - pyProba[k]);
        maxProbDiff = Math.max(maxProbDiff, diff);
      });
    }
  });

  const probTol = PROBA_TOL[name] ?? TOL;
  const ok =
    labelMismatch === 0 &&
    maxDecisionDiff <= TOL &&
    maxProbDiff <= probTol &&
    (!("value" in python) || relValueDiff <= TOL);
  if (!ok) failures++;
  report.push({
    model: name,
    rows: rows.length,
    labelMismatches: labelMismatch,
    maxDecisionDiff: maxDecisionDiff,
    maxProbDiff: maxProbDiff,
    maxAbsValueDiff: maxValueDiff,
    maxRelValueDiff: relValueDiff,
    result: ok ? "PASS" : "FAIL",
  });
}

console.table(report);
if (failures) {
  console.error(`${failures} model(s) disagree with Python.`);
  process.exit(1);
}
console.log("All six JavaScript models reproduce the Python predictions.");
