"""
Rate Limiting Middleware
Prevents abuse by limiting the number of requests per IP/user
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from typing import Callable, Dict
from time import time
from collections import defaultdict
from app.utils.logger import warning


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware
    
    Limits:
    - 100 requests per minute per IP
    - 1000 requests per hour per IP
    
    Note: For production, consider using Redis-based rate limiting
    """
    
    def __init__(
        self,
        app: ASGIApp,
        requests_per_minute: int = 100,
        requests_per_hour: int = 1000
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        
        # In-memory storage: {client_ip: [(timestamp, count)]}
        self.minute_requests: Dict[str, list] = defaultdict(list)
        self.hour_requests: Dict[str, list] = defaultdict(list)
        
        # Excluded paths that don't count toward rate limit
        self.excluded_paths = ["/health", "/docs", "/openapi.json", "/redoc"]
    
    async def dispatch(self, request: Request, call_next: Callable):
        """Check rate limit before processing request"""
        
        # Skip rate limiting for excluded paths
        if request.url.path in self.excluded_paths:
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Skip rate limiting for unknown clients
        if client_ip == "unknown":
            return await call_next(request)
        
        current_time = time()
        
        # Check minute rate limit
        if not self._check_rate_limit(
            client_ip,
            current_time,
            self.minute_requests,
            self.requests_per_minute,
            60  # 1 minute
        ):
            warning(f"Rate limit exceeded (minute): {client_ip} on {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later."
            )
        
        # Check hour rate limit
        if not self._check_rate_limit(
            client_ip,
            current_time,
            self.hour_requests,
            self.requests_per_hour,
            3600  # 1 hour
        ):
            warning(f"Rate limit exceeded (hour): {client_ip} on {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Hourly rate limit exceeded. Please try again later."
            )
        
        # Record this request
        self._record_request(client_ip, current_time, self.minute_requests)
        self._record_request(client_ip, current_time, self.hour_requests)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit-Minute"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Limit-Hour"] = str(self.requests_per_hour)
        
        return response
    
    def _check_rate_limit(
        self,
        client_ip: str,
        current_time: float,
        storage: Dict[str, list],
        limit: int,
        window_seconds: int
    ) -> bool:
        """Check if request is within rate limit"""
        
        # Clean old entries
        cutoff_time = current_time - window_seconds
        storage[client_ip] = [
            timestamp for timestamp in storage[client_ip]
            if timestamp > cutoff_time
        ]
        
        # Check if limit exceeded
        return len(storage[client_ip]) < limit
    
    def _record_request(
        self,
        client_ip: str,
        current_time: float,
        storage: Dict[str, list]
    ):
        """Record a request timestamp"""
        storage[client_ip].append(current_time)
