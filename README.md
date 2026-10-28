# Allonola — Online-Only Retail Marketplace

> **"Shop smarter. Sell with confidence."**

Allonola is a complete, multi-page full-stack web application for a fictional online retail marketplace connecting buyers, independent sellers, and delivery couriers. The platform demonstrates six core machine learning algorithms through interactive demos served by a **Python Flask backend** and a vanilla HTML/JS frontend.

---

## ⚠️ Important Academic & Synthetic Data Notice

> **All datasets, transaction histories, model outputs, and metrics on this website are illustrative and synthetically generated.**
>
> Allonola is a fictional company created for academic study. No real customer, seller, transaction, or financial data is collected, stored, or processed. Predictions and metrics reflect educational illustrations of statistical and machine learning methodologies.

---

## 🏗️ System Architecture

This project uses a **decoupled full-stack architecture**:
1. **Frontend (HTML/CSS/JS):** Serves the user interface and sends HTTP `fetch()` requests to the backend.
2. **Backend (Python/Flask):** Loads real trained Scikit-Learn `.pkl` models and returns JSON predictions in real-time.

### 🚀 How to Run the Application (Local Development)

Because this is a full-stack app, you must run **two separate servers** in **two terminal windows**.

#### Prerequisites
Make sure you have Python installed. Then, install the required backend dependencies:
```powershell
cd D:\Projects\allonola
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

> **Note on SVM:** The interactive scatter plot on this page uses pre-computed fraud scores from the Python model (saved as a JSON file) to avoid sending 60 API requests per second. The `/api/predict/svm` endpoint is fully live and available for single-order predictions.