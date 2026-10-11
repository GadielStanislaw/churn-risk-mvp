import pandas as pd

from config.settings import GOLD_DIR


def risk_label(probability: float) -> str:
    if probability < 0.3:
        return "low"
    if probability < 0.6:
        return "medium"
    return "high"


def compute_portfolio_summary(model, feature_columns: list[str]) -> dict:
    frames = [pd.read_parquet(GOLD_DIR / f"{split}.parquet") for split in ("train", "val", "test")]
    df = pd.concat(frames, ignore_index=True)
    X = df[feature_columns]

    probabilities = model.predict_proba(X)[:, 1]
    risk_counts = {"low": 0, "medium": 0, "high": 0}
    for p in probabilities:
        risk_counts[risk_label(p)] += 1

    top_features = []
    if hasattr(model, "feature_importances_"):
        importances = pd.Series(model.feature_importances_, index=feature_columns)
        top_features = [
            {"feature": name, "importance": round(float(value), 4)}
            for name, value in importances.sort_values(ascending=False).head(10).items()
        ]

    return {
        "total_clients": len(df),
        "risk_counts": risk_counts,
        "average_churn_probability": round(float(probabilities.mean()), 4),
        "top_features": top_features,
    }
