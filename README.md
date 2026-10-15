# Churn Risk Prediction MVP

Predicts which clients of a subscription-based service are at risk of cancelling. Built as a proof-of-work demo for an AI/ML consulting pitch; currently runs on the IBM Telco Customer Churn dataset (Kaggle) as a structural proxy until real client data is available. See `docs/report.pdf` for the full architecture writeup.

## Prerequisites

- Python 3.11+ and a Kaggle account (for the dataset download)
- Node.js 18+ and npm
- A `.env` file with real credentials (copy `.env.example` and fill in):
  - `KAGGLE_USERNAME` / `KAGGLE_KEY` — from your Kaggle account settings
  - `JWT_SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_hex(32))"`
  - `API_USERNAME` / `API_PASSWORD` — the login for the dashboard

## Quick start

If `data/gold/` and `models/churn_model.joblib` already exist, skip straight to **Run the app**.

### 1. Install dependencies

```bash
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

### 2. Build the data pipeline and train the model

```bash
python main.py                  # bronze -> silver -> gold
python -m src.models.train      # trains XGBoost, saves models/churn_model.joblib
```

### 3. Run the app

Two terminals, both left running:

**Terminal 1 — backend**
```bash
python -m uvicorn src.api.main:app --reload --port 8000
```
Wait for `Uvicorn running on http://127.0.0.1:8000` before continuing.

**Terminal 2 — frontend**
```bash
cd frontend
npm run dev
```
Open the URL it prints (usually `http://localhost:5173` — check the terminal, Vite shifts to 5174/5175 if that port's taken).

Log in with the `API_USERNAME` / `API_PASSWORD` from your `.env`.

## Troubleshooting

- **"Failed to fetch" on login** — almost always means the backend isn't running. Check Terminal 1 for `Uvicorn running on...`; if it's not there, start it. A `curl http://127.0.0.1:8000/health` from a third terminal should return `{"status":"ok",...}`.
- **`python-multipart` / xgboost version errors on backend startup** — if you use a conda environment, make sure dependencies are installed in the *active* environment the backend actually runs in, not a different one. Check with `python -m pip list | grep xgboost` and compare against `requirements.txt`.
- **CORS errors in the browser console** — the backend allows any `localhost`/`127.0.0.1` port by default (`src/api/main.py`), so this shouldn't happen in normal local dev; if it does, confirm the frontend's dev server origin matches what you're hitting in the browser.

## Project structure

```
config/settings.py       # paths, env vars
src/pipeline/             # bronze -> silver -> gold data pipeline
src/models/train.py        # XGBoost training, saves model + feature columns
src/api/                    # FastAPI backend (JWT auth, predict, portfolio, evaluation)
frontend/                    # React + TypeScript dashboard
docs/report.tex               # LaTeX architecture report (compile with pdflatex)
```
