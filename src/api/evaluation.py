import pandas as pd
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support, roc_auc_score, roc_curve

from config.settings import GOLD_DIR


def compute_model_evaluation(model, feature_columns: list[str]) -> dict:
    df = pd.read_parquet(GOLD_DIR / "test.parquet")
    X = df[feature_columns]
    y_true = df["churn"]

    y_proba = model.predict_proba(X)[:, 1]
    y_pred = (y_proba >= 0.5).astype(int)

    fpr, tpr, thresholds = roc_curve(y_true, y_proba)
    roc_points = [
        {"fpr": round(float(f), 4), "tpr": round(float(t), 4), "threshold": round(float(th), 4)}
        for f, t, th in zip(fpr, tpr, thresholds)
    ]

    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="binary", zero_division=0
    )

    return {
        "roc_auc": round(float(roc_auc_score(y_true, y_proba)), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "roc_curve": roc_points,
        "confusion_matrix": {
            "true_negative": int(tn),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_positive": int(tp),
        },
    }
