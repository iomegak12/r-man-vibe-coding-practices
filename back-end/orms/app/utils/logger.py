"""
Logging Utility
Centralized logging configuration
"""
import logging
import sys

# Import settings with try/except to handle initialization issues
try:
    from app.config.settings import settings
    SERVICE_NAME = settings.SERVICE_NAME
    LOG_LEVEL = settings.LOG_LEVEL
except Exception:
    SERVICE_NAME = "order-service"
    LOG_LEVEL = "INFO"

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(SERVICE_NAME)


def info(message: str, **kwargs):
    """Log info message"""
    if kwargs:
        logger.info(message, extra=kwargs)
    else:
        logger.info(message)


def error(message: str, **kwargs):
    """Log error message"""
    if kwargs:
        logger.error(message, extra=kwargs)
    else:
        logger.error(message)


def warning(message: str, **kwargs):
    """Log warning message"""
    if kwargs:
        logger.warning(message, extra=kwargs)
    else:
        logger.warning(message)


def debug(message: str, **kwargs):
    """Log debug message"""
    if kwargs:
        logger.debug(message, extra=kwargs)
    else:
        logger.debug(message)
