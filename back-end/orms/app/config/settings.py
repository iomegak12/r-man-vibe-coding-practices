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
    SERVICE_NAME: str = "order-service"
    SERVICE_VERSION: str = "1.0.0"
    PORT: int = 5003
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
    
    @property
    def ALGORITHM(self) -> str:
        """Alias for JWT_ALGORITHM for compatibility"""
        return self.JWT_ALGORITHM
    
    # Service Communication
    AUTH_SERVICE_URL: str
    CUSTOMER_SERVICE_URL: str
    SERVICE_API_KEY: str
    SERVICE_TIMEOUT: int = 30
    
    # CORS Configuration
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:19006"]'
    CORS_CREDENTIALS: bool = True
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Order Configuration
    ORDER_ID_PREFIX: str = "ORD"
    RETURN_ID_PREFIX: str = "RET"
    ORDER_CANCELLATION_ALLOWED_STATUSES: str = '["Placed","Processing"]'
    ORDER_RETURN_ALLOWED_STATUSES: str = '["Delivered"]'
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string"""
        return json.loads(self.CORS_ORIGINS)
    
    @property
    def cancellation_allowed_statuses(self) -> List[str]:
        """Parse cancellation allowed statuses"""
        return json.loads(self.ORDER_CANCELLATION_ALLOWED_STATUSES)
    
    @property
    def return_allowed_statuses(self) -> List[str]:
        """Parse return allowed statuses"""
        return json.loads(self.ORDER_RETURN_ALLOWED_STATUSES)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
