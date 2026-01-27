"""Logging utility for the application"""
import logging
from app.config.settings import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(settings.SERVICE_NAME)


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
