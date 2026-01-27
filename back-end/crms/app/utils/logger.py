"""
Logger Utility
Structured logging utility for the application with JSON formatting support
"""
import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict
from app.config.settings import settings


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": settings.SERVICE_NAME,
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


class SimpleFormatter(logging.Formatter):
    """
    Simple human-readable formatter
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as simple text"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        level = record.levelname
        message = record.getMessage()
        
        # Add extra data if present
        extra = ""
        if hasattr(record, 'extra_data') and record.extra_data:
            extra = f" | {json.dumps(record.extra_data)}"
        
        return f"{timestamp} - {settings.SERVICE_NAME} - {level} - {message}{extra}"


# Choose formatter based on environment
if settings.ENVIRONMENT == "production":
    formatter = JSONFormatter()
else:
    formatter = SimpleFormatter()

# Configure logging
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(formatter)

logger = logging.getLogger(settings.SERVICE_NAME)
logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
logger.addHandler(handler)


def info(message: str, **kwargs):
    """Log info message with optional structured data"""
    extra_data = kwargs if kwargs else None
    logger.info(message, extra={'extra_data': extra_data})


def error(message: str, **kwargs):
    """Log error message with optional structured data"""
    extra_data = kwargs if kwargs else None
    logger.error(message, extra={'extra_data': extra_data})


def warning(message: str, **kwargs):
    """Log warning message with optional structured data"""
    extra_data = kwargs if kwargs else None
    logger.warning(message, extra={'extra_data': extra_data})


def debug(message: str, **kwargs):
    """Log debug message with optional structured data"""
    extra_data = kwargs if kwargs else None
    logger.debug(message, extra={'extra_data': extra_data})


def critical(message: str, **kwargs):
    """Log critical message with optional structured data"""
    extra_data = kwargs if kwargs else None
    logger.critical(message, extra={'extra_data': extra_data})


def log_performance(operation: str, duration_ms: float, **kwargs):
    """
    Log performance metrics
    
    Args:
        operation: Name of the operation
        duration_ms: Duration in milliseconds
        **kwargs: Additional context data
    """
    perf_data = {
        "type": "PERFORMANCE",
        "operation": operation,
        "duration_ms": round(duration_ms, 2),
        **kwargs
    }
    info(f"⚡ Performance: {operation} completed in {duration_ms}ms", **perf_data)


def log_database_operation(operation: str, collection: str, duration_ms: float, **kwargs):
    """
    Log database operations
    
    Args:
        operation: Type of operation (find, insert, update, delete, aggregate)
        collection: Collection name
        duration_ms: Duration in milliseconds
        **kwargs: Additional context
    """
    db_data = {
        "type": "DATABASE",
        "operation": operation,
        "collection": collection,
        "duration_ms": round(duration_ms, 2),
        **kwargs
    }
    debug(f"📊 DB {operation} on {collection} ({duration_ms}ms)", **db_data)


def log_api_call(service: str, endpoint: str, status_code: int, duration_ms: float, **kwargs):
    """
    Log external API calls
    
    Args:
        service: Service name (e.g., "ORMS", "CMPS")
        endpoint: API endpoint
        status_code: HTTP status code
        duration_ms: Duration in milliseconds
        **kwargs: Additional context
    """
    api_data = {
        "type": "API_CALL",
        "service": service,
        "endpoint": endpoint,
        "status_code": status_code,
        "duration_ms": round(duration_ms, 2),
        **kwargs
    }
    
    if status_code >= 500:
        error(f"🔴 {service} API call failed: {endpoint} - {status_code}", **api_data)
    elif status_code >= 400:
        warning(f"🟡 {service} API call error: {endpoint} - {status_code}", **api_data)
    else:
        debug(f"🟢 {service} API call: {endpoint} - {status_code} ({duration_ms}ms)", **api_data)

