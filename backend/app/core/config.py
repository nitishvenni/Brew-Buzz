from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Brew Buzz"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/brewbuzz"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"

settings = Settings()
