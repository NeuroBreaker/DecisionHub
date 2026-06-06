import os
from dotenv import load_dotenv
from pathlib import Path
from loguru import logger

CURRENT_FILE_PATH = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE_PATH.parent.parent
SRC_DIR = BACKEND_DIR / "src"
PROJECT_ROOT = BACKEND_DIR.parent  # DecisionHub/
DOTENV_PATH = PROJECT_ROOT / ".env"


try:
    logger.info(f"Path is... {DOTENV_PATH}")
    load_dotenv(dotenv_path=DOTENV_PATH)
    DATABASE_URL = os.environ["DATABASE_URL"]
    logger.info(f"dblink is... {DATABASE_URL}")

except Exception as e:
    logger.error(f"Cant load .env data {e}", exc_info=True)
    raise RuntimeError
