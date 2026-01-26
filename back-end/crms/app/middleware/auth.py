"""
JWT Authentication Middleware
Validates JWT access tokens from Authorization header
"""
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config.settings import settings
from app.utils.logger import error, debug


security = HTTPBearer(auto_error=False)


class JWTUser:
    """Decoded JWT user information"""
    def __init__(self, user_id: str, email: str, role: str):
        self.user_id = user_id
        self.email = email
        self.role = role
        
    def is_admin(self) -> bool:
        """Check if user is an administrator"""
        # Accept both 'Admin' (from ATHS) and 'Administrator'
        return self.role in ["Administrator", "Admin"]
    
    def is_customer(self) -> bool:
        """Check if user is a customer"""
        return self.role == "Customer"


def decode_jwt_token(token: str) -> Optional[dict]:
    """
    Decode and validate JWT token
    
    Args:
        token: JWT access token
        
    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        error(f"JWT validation failed: {str(e)}")
        return None


async def get_token_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Extract and validate JWT token from Authorization header
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    payload = decode_jwt_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify required claims
    user_id = payload.get("userId")
    email = payload.get("email")
    role = payload.get("role")
    
    if not user_id or not email or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    debug(f"Token validated for user: {email} (role: {role})")
    
    return payload


async def get_current_user(
    payload: dict = Depends(get_token_payload)
) -> JWTUser:
    """
    Get current authenticated user from JWT token
    
    Args:
        payload: Decoded JWT payload
        
    Returns:
        JWTUser instance with user information
    """
    return JWTUser(
        user_id=payload["userId"],
        email=payload["email"],
        role=payload["role"]
    )
