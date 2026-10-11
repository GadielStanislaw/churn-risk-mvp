import pandas as pd

NUMERIC_FIELDS = ["tenure_months", "monthly_charges", "total_charges"]


def to_feature_row(features: dict, feature_columns: list[str]) -> pd.DataFrame:
    """Build a one-row, one-hot-encoded frame matching the training columns.

    pd.get_dummies on a single row can't reproduce drop_first semantics (only
    one category is ever present), so dummy columns are built explicitly from
    the saved training column names instead.
    """
    row = {col: 0 for col in feature_columns}

    for field, value in features.items():
        if field in NUMERIC_FIELDS:
            if field in row:
                row[field] = value
            continue
        dummy_col = f"{field}_{value}"
        if dummy_col in row:
            row[dummy_col] = 1

    return pd.DataFrame([row], columns=feature_columns)
