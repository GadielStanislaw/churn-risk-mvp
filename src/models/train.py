import itertools

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from config.settings import GOLD_DIR, MODELS_DIR

XGB_GRID = {
    "max_depth": [3, 4, 6],
    "n_estimators": [100, 200],
    "learning_rate": [0.05, 0.1],
}


def _load(split):
    df = pd.read_parquet(GOLD_DIR / f"{split}.parquet")
    return df.drop(columns=["churn"]), df["churn"]


def _report(label, y_true, y_pred, y_proba):
    print(f"\n--- {label} ---")
    print(f"ROC-AUC: {roc_auc_score(y_true, y_proba):.4f}")
    print(classification_report(y_true, y_pred, digits=3))
    print("Confusion matrix:\n", confusion_matrix(y_true, y_pred))


def run():
    X_train, y_train = _load("train")
    X_val, y_val = _load("val")
    X_test, y_test = _load("test")

    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

    baseline = make_pipeline(
        StandardScaler(), LogisticRegression(max_iter=1000, class_weight="balanced")
    )
    baseline.fit(X_train, y_train)
    baseline_auc = roc_auc_score(y_val, baseline.predict_proba(X_val)[:, 1])
    print(f"Baseline (Logistic Regression) val ROC-AUC: {baseline_auc:.4f}")

    best_model, best_auc, best_params = None, -1.0, None
    param_combos = itertools.product(
        XGB_GRID["max_depth"], XGB_GRID["n_estimators"], XGB_GRID["learning_rate"]
    )
    for max_depth, n_estimators, learning_rate in param_combos:
        model = XGBClassifier(
            max_depth=max_depth,
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            scale_pos_weight=scale_pos_weight,
            eval_metric="auc",
            random_state=42,
        )
        model.fit(X_train, y_train)
        auc = roc_auc_score(y_val, model.predict_proba(X_val)[:, 1])
        if auc > best_auc:
            best_model, best_auc = model, auc
            best_params = {
                "max_depth": max_depth,
                "n_estimators": n_estimators,
                "learning_rate": learning_rate,
            }

    print(f"Best XGBoost params: {best_params} (val ROC-AUC: {best_auc:.4f})")

    use_xgb = best_auc >= baseline_auc
    chosen = best_model if use_xgb else baseline
    chosen_name = "XGBoost" if use_xgb else "Logistic Regression"
    print(f"\nSelected model: {chosen_name}")

    y_test_pred = chosen.predict(X_test)
    y_test_proba = chosen.predict_proba(X_test)[:, 1]
    _report("FINAL TEST RESULT (touched once)", y_test, y_test_pred, y_test_proba)

    if use_xgb:
        importances = pd.Series(chosen.feature_importances_, index=X_train.columns)
        print("\nTop 10 features:\n", importances.sort_values(ascending=False).head(10))

    model_path = MODELS_DIR / "churn_model.joblib"
    joblib.dump(
        {"model": chosen, "model_name": chosen_name, "feature_columns": list(X_train.columns)},
        model_path,
    )
    print(f"\nModel saved to {model_path}")


if __name__ == "__main__":
    run()
