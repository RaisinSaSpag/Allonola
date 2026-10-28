"""
Allonola ML API (Flask).
Run from the project folder:  python app.py
"""
import os
import warnings

import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# Ignore Scikit-Learn version warnings for a clean terminal
warnings.filterwarnings("ignore", category=UserWarning)

# Get absolute path so models load regardless of where you run the script from
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_model(filename):
    return joblib.load(os.path.join(BASE_DIR, filename))

app = Flask(__name__)
CORS(app) # This is crucial for allowing your HTML to talk to the API

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

print("✅ All models loaded successfully!")

# --- HELPER FUNCTIONS ---
def align_columns(df, expected_cols):
    """Ensures the dataframe has exactly the columns the model expects."""
    for col in expected_cols:
        if col not in df.columns:
            df[col] = 0
    return df[expected_cols]

# ==========================================
# API ROUTES
# ==========================================

@app.route('/api/predict/lr', methods=['POST'])
def predict_lr():
    data = request.json
    # The .pkl expects Season_Normal, not Holiday
    input_dict = {
        'Price_PHP': [float(data['price'])],
        'Season_Normal': [1 if data['season'] == "Normal" else 0],
        'Season_Rainy': [1 if data['season'] == "Rainy" else 0],
        'Promotion_Yes': [1 if data['promo'] == "Yes" else 0]
    }
    input_df = align_columns(pd.DataFrame(input_dict), lr_cols)
    prediction = max(5, int(model_lr.predict(input_df)[0]))
    return jsonify({"prediction": prediction})


@app.route('/api/predict/nb', methods=['POST'])
def predict_nb():
    data = request.json
    text = data['text']
    prediction = model_nb.predict([text])[0]
    probabilities = model_nb.predict_proba([text])[0].tolist()
    return jsonify({
        "prediction": prediction,
        "classes": model_nb.classes_.tolist(),
        "probabilities": probabilities
    })


@app.route('/api/predict/knn', methods=['POST'])
def predict_knn():
    data = request.json
    user_id = str(data['user_id'])
    
    # Check if user exists
    matches = knn_users[knn_users.astype(str) == user_id]
    if matches.empty:
        return jsonify({"error": f"User {user_id} not found"}), 404
        
    user_idx = knn_users.index.get_loc(matches.index[0])
    user_ratings = knn_matrix.iloc[user_idx].values.reshape(1, -1)
    
    # Find nearest neighbors
    distances, indices = model_knn.kneighbors(user_ratings, n_neighbors=4)
    neighbor_indices = [i for i in indices[0] if i != user_idx][:3]
    
    # Calculate recommendations
    neighbor_ratings = knn_matrix.iloc[neighbor_indices]
    avg_ratings = neighbor_ratings.mean(axis=0)
    user_has_bought = knn_matrix.iloc[user_idx]
    recommendations = avg_ratings[user_has_bought == 0].sort_values(ascending=False)
    
    top_recs = recommendations.head(3)
    return jsonify({
        "recommendations": top_recs.index.tolist(),
        "scores": [round(float(s), 2) for s in top_recs.values]
    })


@app.route('/api/predict/svm', methods=['POST'])
def predict_svm():
    data = request.json
    input_df = pd.DataFrame([{
        'Order_Amount_PHP': float(data['amount']),
        'Account_Age_Days': float(data['age']),
        'Items_Per_Order': float(data['items'])
    }])
    prediction = int(model_svm.predict(input_df)[0])
    probabilities = model_svm.predict_proba(input_df)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})


@app.route('/api/predict/dt', methods=['POST'])
def predict_dt():
    data = request.json
    # The .pkl expects specific column names with prefixes
    input_dict = {
        'Seller_Rating': [float(data['rating'])],
        'Distance_KM': [float(data['distance'])],
        'Courier_Courier B': [1 if data['courier'] == "Courier B" else 0],
        'Courier_Courier C': [1 if data['courier'] == "Courier C" else 0],
        'Product_Type_Perishable': [1 if data['product_type'] == "Perishable" else 0],
        'Product_Type_Standard': [1 if data['product_type'] == "Standard" else 0]
    }
    input_df = align_columns(pd.DataFrame(input_dict), dt_cols)
    prediction = int(model_dt.predict(input_df)[0])
    probabilities = model_dt.predict_proba(input_df)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})


@app.route('/api/predict/ann', methods=['POST'])
def predict_ann():
    data = request.json
    input_dict = {
        'Pages_Viewed': [float(data['pages'])],
        'Searches_30d': [float(data['searches'])],
        'Past_Purchases': [float(data['purchases'])],
        'Days_Since_Last_Visit': [float(data['days_since'])],
        'Age_Band_25-34': [1 if data['age_band'] == "25-34" else 0],
        'Age_Band_35-44': [1 if data['age_band'] == "35-44" else 0],
        'Age_Band_45+': [1 if data['age_band'] == "45+" else 0]
    }
    input_df = align_columns(pd.DataFrame(input_dict), ann_cols)
    input_scaled = ann_scaler.transform(input_df)
    prediction = int(model_ann.predict(input_scaled)[0])
    probabilities = model_ann.predict_proba(input_scaled)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})


if __name__ == '__main__':
    print("🚀 Starting Allonola ML API on http://127.0.0.1:5000")
    # debug=False is best for final presentations to avoid the server restarting randomly
    app.run(host="127.0.0.1", port=5000, debug=False)

    