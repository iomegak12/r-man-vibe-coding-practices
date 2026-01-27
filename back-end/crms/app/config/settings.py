"""
Application Configuration
Load and validate environment variables using Pydantic Settings
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Server Configuration
    ENVIRONMENT: str = "development"
    SERVICE_NAME: str = "customer-service"
    SERVICE_VERSION: str = "1.0.0"
    PORT: int = 5002
    API_VERSION: str = "v1"
    
    # MongoDB Configuration
    MONGODB_URI: str
    MONGODB_MIN_POOL_SIZE: int = 10
    MONGODB_MAX_POOL_SIZE: int = 50
    
    # JWT Configuration
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    
    # Service-to-Service Communication
    AUTH_SERVICE_URL: str = "http://localhost:5001"
    ORDER_SERVICE_URL: str = "http://localhost:5003"
    COMPLAINT_SERVICE_URL: str = "http://localhost:5004"
    SERVICE_API_KEY: str
    SERVICE_TIMEOUT: int = 30
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:19006"]
    CORS_CREDENTIALS: bool = True
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from JSON string if needed"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v


# Create global settings instance
settings = Settings()
