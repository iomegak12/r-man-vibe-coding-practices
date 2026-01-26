"""
Authentication Middleware for Order Management Service
Handles JWT token validation and user context extraction
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from app.config.settings import settings
from app.utils.logger import info, error
from typing import Optional


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate JWT tokens and extract user information
    Adds user context to request.state for use in route handlers
    """

    # Paths that don't require authentication
    PUBLIC_PATHS = [
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
    ]

    async def dispatch(self, request: Request, call_next):
        """
        Process each request to validate authentication
        """
        # Allow public paths without authentication
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)

        # Allow OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Initialize user context
        request.state.user = None
        request.state.user_id = None
        request.state.role = None

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
            try:
                # Decode and validate JWT token
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=[settings.ALGORITHM]
                )
                
                # Extract user information from token
                # ATHS uses 'userId' not 'sub'
                user_id = payload.get("userId") or payload.get("sub")
                role = payload.get("role")
                email = payload.get("email")
                
                if user_id is None:
                    error(f"Invalid token payload: missing 'userId' or 'sub' field")
                    return JSONResponse(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        content={
                            "success": False,
                            "message": "Invalid authentication token",
                            "data": None
                        }
                    )
                
                # Normalize role to lowercase for consistency
                normalized_role = role.lower() if role else None
                
                # Store user context in request state
                request.state.user = {
                    "userId": user_id,
                    "role": normalized_role,
                    "email": email
                }
                request.state.user_id = user_id
                request.state.role = normalized_role
                
                info(f"Authenticated user: {user_id} with role: {role}")
                
            except JWTError as e:
                error(f"JWT validation error: {str(e)}")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "message": "Invalid or expired authentication token",
                        "data": None
                    }
                )
            except Exception as e:
                error(f"Authentication error: {str(e)}")
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={
                        "success": False,
                        "message": "Authentication failed",
                        "data": None
                    }
                )

        # Continue to route handler
        response = await call_next(request)
        return response


def get_current_user_from_request(request: Request) -> Optional[dict]:
    """
    Helper function to get current user from request state
    Returns None if no user is authenticated
    """
    return getattr(request.state, "user", None)


def get_user_id_from_request(request: Request) -> Optional[str]:
    """
    Helper function to get current user ID from request state
    Returns None if no user is authenticated
    """
    return getattr(request.state, "user_id", None)


def get_role_from_request(request: Request) -> Optional[str]:
    """
    Helper function to get current user role from request state
    Returns None if no user is authenticated
    """
    return getattr(request.state, "role", None)
