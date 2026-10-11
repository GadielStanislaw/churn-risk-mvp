from config.settings import BRONZE_DIR, KAGGLE_DATASET


def run():
    from kaggle.api.kaggle_api_extended import KaggleApi

    api = KaggleApi()
    api.authenticate()
    api.dataset_download_files(KAGGLE_DATASET, path=str(BRONZE_DIR), unzip=True, force=True)

    print(f"Bronze data ready in {BRONZE_DIR}")


if __name__ == "__main__":
    run()
