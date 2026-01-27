"""
Request/Response Logging Middleware
Tracks all API requests and responses for monitoring and debugging
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from time import time
from typing import Callable
import json
from app.utils.logger import info, error, warning


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all incoming requests and outgoing responses
    
    Tracks:
    - Request method, path, query params
    - Request headers (excluding sensitive data)
    - Response status code
    - Response time
    - User information (if authenticated)
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.excluded_paths = ["/health", "/docs", "/openapi.json", "/redoc"]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process and log request/response"""
        
        # Skip logging for excluded paths
        if request.url.path in self.excluded_paths:
            return await call_next(request)
        
        # Start timer
        start_time = time()
        
        # Extract request information
        method = request.method
        path = request.url.path
        query_params = str(request.query_params) if request.query_params else None
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Extract user info from request state (set by auth middleware)
        user_id = None
        user_email = None
        user_role = None
        
        if hasattr(request.state, "user"):
            user = request.state.user
            user_id = getattr(user, "user_id", None)
            user_email = getattr(user, "email", None)
            user_role = getattr(user, "role", None)
        
        # Log incoming request
        request_log = {
            "type": "REQUEST",
            "method": method,
            "path": path,
            "query": query_params,
            "client_ip": client_host,
            "user_agent": user_agent,
            "user_id": user_id,
            "user_email": user_email,
            "user_role": user_role
        }
        
        info(f"→ {method} {path} from {client_host}", **request_log)
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate response time
            process_time = time() - start_time
            process_time_ms = round(process_time * 1000, 2)
            
            # Log response
            response_log = {
                "type": "RESPONSE",
                "method": method,
                "path": path,
                "status_code": response.status_code,
                "duration_ms": process_time_ms,
                "user_id": user_id
            }
            
            # Log based on status code
            if response.status_code >= 500:
                error(f"✗ {method} {path} - {response.status_code} ({process_time_ms}ms)", **response_log)
            elif response.status_code >= 400:
                warning(f"⚠ {method} {path} - {response.status_code} ({process_time_ms}ms)", **response_log)
            else:
                info(f"✓ {method} {path} - {response.status_code} ({process_time_ms}ms)", **response_log)
            
            # Add custom headers
            response.headers["X-Process-Time"] = str(process_time_ms)
            response.headers["X-Service-Name"] = "CRMS"
            
            return response
            
        except Exception as e:
            # Log exception
            process_time = time() - start_time
            process_time_ms = round(process_time * 1000, 2)
            
            error_log = {
                "type": "ERROR",
                "method": method,
                "path": path,
                "error": str(e),
                "duration_ms": process_time_ms,
                "user_id": user_id
            }
            
            error(f"✗ {method} {path} - ERROR: {str(e)}", **error_log)
            raise
