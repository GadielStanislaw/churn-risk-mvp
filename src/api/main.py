import joblib
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from config.settings import MODELS_DIR
from src.api.auth import create_access_token, get_current_client, verify_credentials
from src.api.evaluation import compute_model_evaluation
from src.api.portfolio import compute_portfolio_summary, risk_label
from src.api.preprocess import to_feature_row
from src.api.schemas import (
    ClientFeatures,
    ModelEvaluation,
    PortfolioSummary,
    PredictionResponse,
    TokenResponse,
)

app = FastAPI(title="Churn Risk API")

app.add_middleware(
    CORSMiddleware,
    # Local dev only: Vite shifts ports (5173, 5174, ...) when one is taken,
    # so any localhost port is allowed rather than a fixed list.
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

_artifact = joblib.load(MODELS_DIR / "churn_model.joblib")
_model = _artifact["model"]
_model_name = _artifact["model_name"]
_feature_columns = _artifact["feature_columns"]
_portfolio_summary = compute_portfolio_summary(_model, _feature_columns)
_model_evaluation = compute_model_evaluation(_model, _feature_columns)


@app.get("/health")
def health():
    return {"status": "ok", "model": _model_name}


@app.post("/auth/token", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not verify_credentials(form_data.username, form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(subject=form_data.username)
    return TokenResponse(access_token=token)


@app.get("/portfolio/summary", response_model=PortfolioSummary)
def portfolio_summary(client: str = Depends(get_current_client)):
    return _portfolio_summary


@app.get("/model/evaluation", response_model=ModelEvaluation)
def model_evaluation(client: str = Depends(get_current_client)):
    return _model_evaluation


@app.post("/predict", response_model=PredictionResponse)
def predict(features: ClientFeatures, client: str = Depends(get_current_client)):
    X = to_feature_row(features.model_dump(), _feature_columns)
    probability = float(_model.predict_proba(X)[0, 1])
    return PredictionResponse(
        churn_probability=round(probability, 4),
        risk_label=risk_label(probability),
        model_name=_model_name,
    )
