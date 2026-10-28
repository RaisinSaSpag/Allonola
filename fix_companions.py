import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler

print("Regenerating companion files from your real datasets...")

# --- 1. LINEAR REGRESSION COLUMNS ---
try:
    df = pd.read_csv('Allonola_LinearReg_DataSet.csv')
    X = df[['Price_PHP', 'Season', 'Promotion']]
    X_encoded = pd.get_dummies(X, drop_first=True)
    joblib.dump(list(X_encoded.columns), 'linear_reg_columns.pkl')
    print("✅ linear_reg_columns.pkl created")
except Exception as e:
    print(f"❌ Linear Regression failed: {e}")

# --- 2. KNN USERS & MATRIX ---
try:
    df = pd.read_excel('Allonola_KNN_User_Item_Matrix.xlsx') 
    user_ids = df['User_ID']
    ratings_matrix = df.drop(columns=['User_ID'])
    joblib.dump(ratings_matrix, 'knn_ratings_matrix.pkl')
    joblib.dump(user_ids, 'knn_user_ids.pkl')
    print("✅ knn_ratings_matrix.pkl and knn_user_ids.pkl created")
except Exception as e:
    print(f"❌ KNN failed: {e}")

# --- 3. DECISION TREE COLUMNS ---
try:
    df = pd.read_excel('Allonola_Delivery_Late_Prediction_Dataset.xlsx')
    X = df[['Seller_Rating', 'Distance_KM', 'Courier', 'Product_Type']]
    X_encoded = pd.get_dummies(X, drop_first=True)
    joblib.dump(list(X_encoded.columns), 'dt_columns.pkl')
    print("✅ dt_columns.pkl created")
except Exception as e:
    print(f"❌ Decision Tree failed: {e}")

# --- 4. ANN SCALER & COLUMNS ---
try:
    df = pd.read_excel('Allonola_Customer_Churn_ANN_Dataset.xlsx')
    X = df[['Pages_Viewed', 'Searches_30d', 'Past_Purchases', 'Days_Since_Last_Visit', 'Age_Band']]
    X_encoded = pd.get_dummies(X, drop_first=True)
    
    scaler = StandardScaler()
    scaler.fit(X_encoded)
    
    joblib.dump(scaler, 'ann_scaler.pkl')
    joblib.dump(list(X_encoded.columns), 'ann_columns.pkl')
    print("✅ ann_scaler.pkl and ann_columns.pkl created")
except Exception as e:
    print(f"❌ ANN failed: {e}")

print("\nDone! You can now run 'python app.py'")
