"""
Application Settings
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Server Configuration
    ENVIRONMENT: str = "development"
    SERVICE_NAME: str = "complaint-service"
    SERVICE_VERSION: str = "1.0.0"
    PORT: int = 5004
    API_VERSION: str = "v1"
    
    # MongoDB Configuration
    MONGODB_URI: str
    MONGODB_MIN_POOL_SIZE: int = 10
    MONGODB_MAX_POOL_SIZE: int = 50
    
    # JWT Configuration
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    
    @property
    def SECRET_KEY(self) -> str:
        """Alias for JWT_SECRET for compatibility"""
        return self.JWT_SECRET
    
    # Service URLs
    AUTH_SERVICE_URL: str = "http://localhost:5001"
    CUSTOMER_SERVICE_URL: str = "http://localhost:5002"
    ORDER_SERVICE_URL: str = "http://localhost:5003"
    
    # Service API Key
    SERVICE_API_KEY: str
    
    # Email Configuration
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: str = ""
    EMAIL_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@rman-ecommerce.com"
    EMAIL_FROM_NAME: str = "R-MAN E-Commerce Support"
    
    # Complaint Configuration
    COMPLAINT_ID_PREFIX: str = "CMP"
    
    # CORS Configuration
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:3001"]'
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string"""
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            return ["http://localhost:3000"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
