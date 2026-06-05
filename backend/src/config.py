import os
from dotenv import load_dotenv
from pathlib import Path

from loguru import logger
from enum import Enum
from dataclasses import dataclass

BASE_DIR = Path(__file__).resolve().parent
CURRENT_FILE_PATH = Path(__file__).resolve()
SRC_DIR = BASE_DIR / "src"
DOTENV_PATH = SRC_DIR.parent / ".env"


try:
    load_dotenv(dotenv_path=DOTENV_PATH)
    DATABASE_URL = os.environ["DATABASE_URL"]
    logger.info(f"dblink is... {DATABASE_URL}")

except Exception as e:
    logger.error(f"Cant load .env data {e}", exc_info=True)
    raise RuntimeError
