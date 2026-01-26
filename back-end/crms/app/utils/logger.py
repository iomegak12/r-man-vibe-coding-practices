"""
Logger Utility
Simple logging utility for the application
"""
import logging
import sys
from datetime import datetime
from app.config.settings import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(settings.SERVICE_NAME)


def info(message: str, **kwargs):
    """Log info message"""
    if kwargs:
        logger.info(f"{message} - {kwargs}")
    else:
        logger.info(message)


def error(message: str, **kwargs):
    """Log error message"""
    if kwargs:
        logger.error(f"{message} - {kwargs}")
    else:
        logger.error(message)


def warning(message: str, **kwargs):
    """Log warning message"""
    if kwargs:
        logger.warning(f"{message} - {kwargs}")
    else:
        logger.warning(message)


def debug(message: str, **kwargs):
    """Log debug message"""
    if kwargs:
        logger.debug(f"{message} - {kwargs}")
    else:
        logger.debug(message)
