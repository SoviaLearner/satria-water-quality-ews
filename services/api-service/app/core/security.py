import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

logger = logging.getLogger("api-service.security")
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    FastAPI dependency to validate Supabase JWT tokens.
    Returns the decoded token payload if valid.
    """
    token = credentials.credentials
    
    if not settings.SUPABASE_JWT_SECRET:
        logger.error("SUPABASE_JWT_SECRET is not configured in the environment variables.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server security configuration error. Please contact administrator."
        )

    try:
        # Decode the Supabase JWT.
        # Supabase uses HS256 signed with SUPABASE_JWT_SECRET.
        # The 'aud' (audience) claim is usually 'authenticated'.
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False} # We bypass strict audience validation to avoid mismatch issues
        )
        
        # Ensure user_id (sub) exists in payload
        user_id = payload.get("sub")
        if not user_id:
            raise jwt.InvalidTokenError("Missing subject (sub) claim.")
            
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("JWT validation failed: Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"JWT validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
