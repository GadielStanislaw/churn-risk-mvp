import re


def normalize_column(col: str) -> str:
    col = re.sub(r"[^0-9a-zA-Z]+", "_", col.strip())
    return col.strip("_").lower()


def find_column(columns, *keywords):
    for col in columns:
        if all(k in col for k in keywords):
            return col
    return None
