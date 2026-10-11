"""Gold stage: drop leakage/noise columns, encode features, split train/val/test."""
import pandas as pd
from sklearn.model_selection import train_test_split

from config.settings import GOLD_DIR, SILVER_DIR
from src.pipeline.utils import find_column

# Leakage: Churn Score is IBM's own pre-computed churn-prediction output, and
# Churn Reason is only populated for customers who already churned - both
# would hand the model the answer. Churn Label duplicates Churn Value.
LEAKAGE_COLUMNS = ["churn_score", "churn_reason", "churn_label", "cltv"]

# No signal: constant across all rows, or an identifier rather than a feature.
NOISE_COLUMNS = ["count", "country", "state"]

# Too high-cardinality to one-hot encode usefully in a baseline model.
HIGH_CARDINALITY_COLUMNS = ["city", "zip_code", "lat_long", "latitude", "longitude"]


def run():
    df = pd.read_parquet(SILVER_DIR / "customers_clean.parquet")

    id_col = find_column(df.columns, "customer", "id")
    target_col = find_column(df.columns, "churn", "value") or find_column(df.columns, "churn")

    y = df[target_col]
    if y.dtype == object or str(y.dtype).startswith("string"):
        y = y.astype(str).str.strip().str.lower().isin(["yes", "1", "true"])
    y = y.astype(int)

    drop_cols = [
        c
        for c in {id_col, target_col, *LEAKAGE_COLUMNS, *NOISE_COLUMNS, *HIGH_CARDINALITY_COLUMNS}
        if c and c in df.columns
    ]
    X = pd.get_dummies(df.drop(columns=drop_cols), drop_first=True)

    # 70% train / 15% validation / 15% test, stratified so each split keeps
    # the same churn ratio as the full dataset.
    X_train, X_rest, y_train, y_rest = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_rest, y_rest, test_size=0.5, random_state=42, stratify=y_rest
    )

    X_train.assign(churn=y_train.values).to_parquet(GOLD_DIR / "train.parquet", index=False)
    X_val.assign(churn=y_val.values).to_parquet(GOLD_DIR / "val.parquet", index=False)
    X_test.assign(churn=y_test.values).to_parquet(GOLD_DIR / "test.parquet", index=False)

    print(
        f"Gold data ready: train={len(X_train)} rows, val={len(X_val)} rows, "
        f"test={len(X_test)} rows, features={X.shape[1]}"
    )


if __name__ == "__main__":
    run()
