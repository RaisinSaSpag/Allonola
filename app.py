import os
import warnings
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

warnings.filterwarnings("ignore", category=UserWarning)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_model(filename):
    return joblib.load(os.path.join(BASE_DIR, filename))

app = Flask(__name__)
CORS(app)

print("Loading Allonola Models...")
model_lr = load_model("allonola_linear_regression.pkl")
lr_cols = load_model("linear_reg_columns.pkl")
model_nb = load_model("allonola_naive_bayes.pkl")
model_knn = load_model("allonola_knn_model.pkl")
knn_matrix = load_model("knn_ratings_matrix.pkl")
knn_users = load_model("knn_user_ids.pkl")
model_svm = load_model("allonola_svm_model.pkl")
model_dt = load_model("allonola_decision_tree.pkl")
dt_cols = load_model("dt_columns.pkl")
model_ann = load_model("allonola_ann_model.pkl")
ann_scaler = load_model("ann_scaler.pkl")
ann_cols = load_model("ann_columns.pkl")
print("All models loaded successfully!")

class BadInput(ValueError):
    pass

def get_json():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise BadInput("Request body must be a JSON object.")
    return data

def get_field(data, key, cast=str, allowed=None):
    if key not in data or data[key] in (None, ""):
        raise BadInput(f"Missing field: '{key}'.")
    try:
        value = cast(data[key])
    except (TypeError, ValueError):
        raise BadInput(f"Field '{key}' has an invalid value.")
    if allowed is not None and value not in allowed:
        raise BadInput(f"Field '{key}' must be one of {sorted(allowed)}.")
    return value

def align_columns(df, expected_cols):
    for col in expected_cols:
        if col not in df.columns:
            df[col] = 0
    return df[expected_cols]

@app.errorhandler(BadInput)
def handle_bad_input(err):
    return jsonify({"error": str(err)}), 400

@app.errorhandler(Exception)
def handle_unexpected(err):
    # Let Flask handle its own HTTP errors (like 404 Not Found, 405 Method Not Allowed)
    if isinstance(err, HTTPException):
        return err
    
    # For our own custom errors (like a Python crash), return a 500
    app.logger.exception("Unhandled error")
    return jsonify({"error": "Internal server error."}), 500

@app.route("/api/predict/lr", methods=["POST"])
def predict_lr():
    data = get_json()
    price = get_field(data, "price", float)
    season = get_field(data, "season", str, allowed={"Normal", "Rainy"})
    promo = get_field(data, "promo", str, allowed={"Yes", "No"})
    row = {"Price_PHP": price, "Season_Normal": int(season == "Normal"), "Season_Rainy": int(season == "Rainy"), "Promotion_Yes": int(promo == "Yes")}
    X = align_columns(pd.DataFrame([row]), lr_cols)
    prediction = max(5, int(round(model_lr.predict(X)[0])))
    return jsonify({"prediction": prediction})

@app.route("/api/predict/nb", methods=["POST"])
def predict_nb():
    data = get_json()
    text = get_field(data, "text", str)
    prediction = model_nb.predict([text])[0]
    probabilities = model_nb.predict_proba([text])[0].tolist()
    return jsonify({"prediction": prediction, "classes": model_nb.classes_.tolist(), "probabilities": probabilities})

@app.route("/api/predict/knn", methods=["POST"])
def predict_knn():
    data = get_json()
    user_id = get_field(data, "user_id", str)
    matches = knn_users[knn_users.astype(str) == user_id]
    if matches.empty:
        raise BadInput(f"Unknown user_id: '{user_id}'.")
    user_pos = knn_users.index.get_loc(matches.index[0])
    user_ratings = knn_matrix.iloc[user_pos].values.reshape(1, -1)
    _, indices = model_knn.kneighbors(user_ratings, n_neighbors=4)
    neighbor_pos = [i for i in indices[0] if i != user_pos][:3]
    avg_ratings = knn_matrix.iloc[neighbor_pos].mean(axis=0)
    not_bought = knn_matrix.iloc[user_pos] == 0
    recs = avg_ratings[not_bought].sort_values(ascending=False).head(3)
    return jsonify({"recommendations": recs.index.tolist(), "scores": [round(float(s), 3) for s in recs.values]})

@app.route("/api/predict/svm", methods=["POST"])
def predict_svm():
    data = get_json()
    X = pd.DataFrame([{"Order_Amount_PHP": get_field(data, "amount", float), "Account_Age_Days": get_field(data, "age", float), "Items_Per_Order": get_field(data, "items", float)}])
    prediction = int(model_svm.predict(X)[0])
    probabilities = model_svm.predict_proba(X)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})

@app.route("/api/predict/dt", methods=["POST"])
def predict_dt():
    data = get_json()
    rating = get_field(data, "rating", float)
    distance = get_field(data, "distance", float)
    courier = get_field(data, "courier", str, allowed={"Courier A", "Courier B", "Courier C"})
    product = get_field(data, "product_type", str, allowed={"Standard", "Perishable"})
    row = {"Seller_Rating": rating, "Distance_KM": distance, "Courier_Courier B": int(courier == "Courier B"), "Courier_Courier C": int(courier == "Courier C"), "Product_Type_Perishable": int(product == "Perishable"), "Product_Type_Standard": int(product == "Standard")}
    X = align_columns(pd.DataFrame([row]), dt_cols)
    prediction = int(model_dt.predict(X)[0])
    probabilities = model_dt.predict_proba(X)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})

@app.route("/api/predict/ann", methods=["POST"])
def predict_ann():
    data = get_json()
    age_band = get_field(data, "age_band", str, allowed={"25-34", "35-44", "45+"})
    row = {"Pages_Viewed": get_field(data, "pages", float), "Searches_30d": get_field(data, "searches", float), "Past_Purchases": get_field(data, "purchases", float), "Days_Since_Last_Visit": get_field(data, "days_since", float), "Age_Band_25-34": int(age_band == "25-34"), "Age_Band_35-44": int(age_band == "35-44"), "Age_Band_45+": int(age_band == "45+")}
    X = align_columns(pd.DataFrame([row]), ann_cols)
    X_scaled = ann_scaler.transform(X)
    prediction = int(model_ann.predict(X_scaled)[0])
    probabilities = model_ann.predict_proba(X_scaled)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})

if __name__ == "__main__":
    print("Starting Allonola ML API on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)