import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    PORT = int(os.getenv("PORT", 8000))
    HOST = os.getenv("HOST", "0.0.0.0")

    # CORS allowed origins
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000").split(",")

    # GitHub API token (optional — for doc quality fetching)
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", None)

config = Config()
