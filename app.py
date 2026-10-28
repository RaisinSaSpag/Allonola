from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # This allows your HTML file to communicate with this Python server

print("Loading All Models...")

# --- LOAD LINEAR REGRESSION ---
model_lr = joblib.load('allonola_linear_regression.pkl')
lr_cols = joblib.load('linear_reg_columns.pkl')

# --- LOAD NAIVE BAYES ---
model_nb = joblib.load('allonola_naive_bayes.pkl')

# --- LOAD KNN ---
model_knn = joblib.load('allonola_knn_model.pkl')
knn_matrix = joblib.load('knn_ratings_matrix.pkl')
knn_users = joblib.load('knn_user_ids.pkl')

# --- LOAD SVM ---
model_svm = joblib.load('allonola_svm_model.pkl')

# --- LOAD DECISION TREE ---
model_dt = joblib.load('allonola_decision_tree.pkl')
dt_cols = joblib.load('dt_columns.pkl')

# --- LOAD ANN ---
model_ann = joblib.load('allonola_ann_model.pkl')
ann_scaler = joblib.load('ann_scaler.pkl')
ann_cols = joblib.load('ann_columns.pkl')

print("All models loaded successfully!")

# =========================================================
# API ENDPOINTS (The bridge between HTML and Python)
# =========================================================

@app.route('/api/predict/lr', methods=['POST'])
def predict_lr():
    data = request.json
    input_dict = {
        'Price_PHP': [data['price']],
        'Season_Rainy': [1 if data['season'] == "Rainy" else 0],
        'Season_Holiday': [1 if data['season'] == "Holiday" else 0],
        'Promotion_Yes': [1 if data['promo'] == "Yes" else 0]
    }
    input_df = pd.DataFrame(input_dict)
    for col in lr_cols:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[lr_cols]
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
    user_id = data['user_id']
    
    user_idx = knn_users[knn_users == user_id].index[0]
    user_ratings = knn_matrix.iloc[user_idx].values.reshape(1, -1)
    
    distances, indices = model_knn.kneighbors(user_ratings, n_neighbors=4)
    neighbor_indices = indices[0][1:]
    
    neighbor_ratings = knn_matrix.iloc[neighbor_indices]
    avg_ratings = neighbor_ratings.mean(axis=0)
    user_has_bought = knn_matrix.iloc[user_idx]
    recommendations = avg_ratings[user_has_bought == 0].sort_values(ascending=False)
    
    top_recs = recommendations.head(3)
    return jsonify({
        "recommendations": top_recs.index.tolist(),
        "scores": top_recs.values.tolist()
    })

@app.route('/api/predict/svm', methods=['POST'])
def predict_svm():
    data = request.json
    input_df = pd.DataFrame([[data['amount'], data['age'], data['items']]], 
                             columns=['Order_Amount_PHP', 'Account_Age_Days', 'Items_Per_Order'])
    prediction = int(model_svm.predict(input_df)[0])
    probabilities = model_svm.predict_proba(input_df)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})

@app.route('/api/predict/dt', methods=['POST'])
def predict_dt():
    data = request.json
    input_dict = {
        'Seller_Rating': [data['rating']],
        'Distance_KM': [data['distance']],
        'Courier_B': [1 if data['courier'] == "Courier B" else 0],
        'Courier_C': [1 if data['courier'] == "Courier C" else 0],
        'Product_Type_Fragile': [1 if data['product_type'] == "Fragile" else 0],
        'Product_Type_Perishable': [1 if data['product_type'] == "Perishable" else 0]
    }
    input_df = pd.DataFrame(input_dict)
    for col in dt_cols:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[dt_cols]
    prediction = int(model_dt.predict(input_df)[0])
    probabilities = model_dt.predict_proba(input_df)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})

@app.route('/api/predict/ann', methods=['POST'])
def predict_ann():
    data = request.json
    input_dict = {
        'Pages_Viewed': [data['pages']],
        'Searches_30d': [data['searches']],
        'Past_Purchases': [data['purchases']],
        'Days_Since_Last_Visit': [data['days_since']],
        'Age_Band_25-34': [1 if data['age_band'] == "25-34" else 0],
        'Age_Band_35-44': [1 if data['age_band'] == "35-44" else 0],
        'Age_Band_45+': [1 if data['age_band'] == "45+" else 0]
    }
    input_df = pd.DataFrame(input_dict)
    for col in ann_cols:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[ann_cols]
    input_scaled = ann_scaler.transform(input_df)
    prediction = int(model_ann.predict(input_scaled)[0])
    probabilities = model_ann.predict_proba(input_scaled)[0].tolist()
    return jsonify({"prediction": prediction, "probabilities": probabilities})

if __name__ == '__main__':
    print("Starting Allonola ML API on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)

    