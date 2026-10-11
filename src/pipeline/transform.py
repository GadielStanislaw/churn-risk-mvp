import pandas as pd

from config.settings import BRONZE_DIR, SILVER_DIR
from src.pipeline.utils import find_column, normalize_column


def _load_raw():
    csv_files = list(BRONZE_DIR.glob("*.csv"))
    if csv_files:
        return pd.read_csv(csv_files[0])
    xlsx_files = list(BRONZE_DIR.glob("*.xlsx"))
    if xlsx_files:
        return pd.read_excel(xlsx_files[0])
    raise FileNotFoundError(f"No .csv or .xlsx file found in {BRONZE_DIR}")


def run():
    df = _load_raw()
    df.columns = [normalize_column(c) for c in df.columns]

    id_col = find_column(df.columns, "customer", "id")
    charges_col = find_column(df.columns, "total", "charge")

    if charges_col:
        df[charges_col] = pd.to_numeric(df[charges_col], errors="coerce")
        df = df.dropna(subset=[charges_col])
    if id_col:
        df = df.drop_duplicates(subset=[id_col])

    out_path = SILVER_DIR / "customers_clean.parquet"
    df.to_parquet(out_path, index=False)
    print(f"Silver data ready at {out_path} ({len(df)} rows, {df.shape[1]} cols)")


if __name__ == "__main__":
    run()
