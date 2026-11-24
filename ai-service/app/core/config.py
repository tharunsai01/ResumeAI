from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "HireSmart AI Service"
    environment: str = "development"
    model_version: str = "hiresmart-match-1.0.0"

    # Shared secret the Express backend sends in X-Internal-Token.
    internal_service_token: str = ""

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"
    groq_base_url: str = "https://api.groq.com/openai/v1"
    groq_timeout_seconds: float = 20.0
    llm_enabled: bool = True

    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embeddings_enabled: bool = True

    max_file_mb: int = 5
    max_pdf_pages: int = 20
    max_text_chars: int = 60_000


@lru_cache
def get_settings() -> Settings:
    return Settings()
