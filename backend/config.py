from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    groq_api_key: str
    safety_agent_secret: str
    log_level: str = "INFO"
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
