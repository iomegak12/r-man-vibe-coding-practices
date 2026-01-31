"""
Configuration for Integration Tests
Manages service URLs, test data, and environment settings
"""
import os
from dataclasses import dataclass
from typing import Dict


@dataclass
class ServiceConfig:
    """Service configuration"""
    name: str
    url: str
    port: int


class Config:
    """Test configuration"""
    
    # Service Configurations
    ATHS = ServiceConfig("ATHS", "http://localhost:5001", 5001)
    CRMS = ServiceConfig("CRMS", "http://localhost:5002", 5002)
    ORMS = ServiceConfig("ORMS", "http://localhost:5003", 5003)
    CMPS = ServiceConfig("CMPS", "http://localhost:5004", 5004)
    
    # Service API Key for internal endpoints
    SERVICE_API_KEY = "b3a285fafe93756687343b95de0d4c82"
    
    # Test Timeout
    REQUEST_TIMEOUT = 30
    
    # Test User Credentials
    ADMIN_USER = {
        "email": "jtdhamodharan@gmail.com",
        "password": "Madurai54321!",
        "role": "Administrator"
    }
    
    # Dynamic Test Data Prefix (to identify test data for cleanup)
    TEST_DATA_PREFIX = "TEST_AUTO_"
    
    # Report Configuration
    REPORT_DIR = "reports"
    REPORT_TITLE = "R-MAN E-Commerce Integration Test Report"
    
    @classmethod
    def get_service_url(cls, service: str) -> str:
        """Get service URL by name"""
        service_map = {
            "aths": cls.ATHS.url,
            "crms": cls.CRMS.url,
            "orms": cls.ORMS.url,
            "cmps": cls.CMPS.url
        }
        return service_map.get(service.lower(), "")
    
    @classmethod
    def get_all_services(cls) -> Dict[str, ServiceConfig]:
        """Get all service configurations"""
        return {
            "aths": cls.ATHS,
            "crms": cls.CRMS,
            "orms": cls.ORMS,
            "cmps": cls.CMPS
        }
