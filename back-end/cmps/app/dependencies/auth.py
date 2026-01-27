"""
Authentication dependencies
JWT token validation for protected endpoints
"""
from fastapi import Header, HTTPException, status, Depends
from jose import JWTError, jwt
from typing import Optional, Dict
from app.config.settings import settings
from app.utils.logger import error


async def get_current_user(authorization: str = Header(..., description="Bearer token")) -> Dict:
    """
    Validate JWT token and extract user information
    
    Args:
        authorization: Authorization header with Bearer token
        
    Returns:
        Dictionary containing user information
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    try:
        # Extract token from "Bearer <token>" format
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )
        
        token = authorization.replace("Bearer ", "")
        
        # Decode and validate token
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
        except JWTError as e:
            error(f"JWT validation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Extract user information
        user_id = payload.get("sub") or payload.get("userId")
        email = payload.get("email")
        role = payload.get("role")
        name = payload.get("name")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return {
            "userId": user_id,
            "email": email,
            "role": role,
            "name": name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def get_current_customer(current_user: Dict = Depends(get_current_user)) -> Dict:
    """
    Ensure current user is a customer
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User information
        
    Raises:
        HTTPException: If user is not a customer
    """
    role = current_user.get("role", "").lower()
    
    if role not in ["customer", "administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer or Administrator access required"
        )
    
    return current_user


async def get_current_admin(current_user: Dict = Depends(get_current_user)) -> Dict:
    """
    Ensure current user is an administrator
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User information
        
    Raises:
        HTTPException: If user is not an administrator
    """
    role = current_user.get("role", "").lower()
    
    if role != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
    
    return current_user


def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[Dict]:
    """
    Get user information if token is provided, otherwise return None
    
    Args:
        authorization: Optional authorization header
        
    Returns:
        User information or None
    """
    if not authorization:
        return None
    
    try:
        if not authorization.startswith("Bearer "):
            return None
        
        token = authorization.replace("Bearer ", "")
        
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        user_id = payload.get("sub") or payload.get("userId")
        
        if not user_id:
            return None
        
        return {
            "userId": user_id,
            "email": payload.get("email"),
            "role": payload.get("role"),
            "name": payload.get("name")
        }
    except:
        return None
