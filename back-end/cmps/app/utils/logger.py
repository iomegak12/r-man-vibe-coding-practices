"""Logging utility for the application"""
import logging

# Import settings with try/except to handle initialization issues
try:
    from app.config.settings import settings
    SERVICE_NAME = settings.SERVICE_NAME
    LOG_LEVEL = settings.LOG_LEVEL
except Exception:
    SERVICE_NAME = "complaint-service"
    LOG_LEVEL = "INFO"

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(SERVICE_NAME)


def info(message: str):
    """Log info message"""
    logger.info(message)


def error(message: str):
    """Log error message"""
    logger.error(message)


def warning(message: str):
    """Log warning message"""
    logger.warning(message)


def debug(message: str):
    """Log debug message"""
    logger.debug(message)
