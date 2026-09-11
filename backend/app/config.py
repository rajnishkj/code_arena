from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application config, loaded from backend/.env (see .env.example)."""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/arena"
    redis_host: str = "localhost"
    redis_port: int = 6379
    piston_url: str = "http://localhost:2000/api/v2/execute"
    jwt_secret: str = "code-arena-jwt-secret-key-must-be-at-least-256-bits-long-for-hs256"
    jwt_expire_hours: int = 24
    cors_origins: str = "http://localhost:3000"
    port: int = 8080

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
