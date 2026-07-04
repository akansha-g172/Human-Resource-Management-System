import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    SUPABASE_URL: str = Field(default="", validation_alias="SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_JWT_SECRET: str = Field(default="", validation_alias="SUPABASE_JWT_SECRET")
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

settings = Settings()
