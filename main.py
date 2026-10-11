from src.pipeline import gold, ingest, transform


def main():
    ingest.run()
    transform.run()
    gold.run()


if __name__ == "__main__":
    main()
