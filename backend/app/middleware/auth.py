from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.supabase import get_supabase

# Declare security scheme but do not raise auto_error inside FastAPI, 
# so we can return our custom uniform error format.
security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    """
    Dependency to authenticate requests. Decodes the Bearer token,
    validates the signature, and retrieves the user profile from Supabase DB.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are required"
        )
    
    token = credentials.credentials
    user_id = None
    
    # 1. Attempt local JWT signature decoding using SUPABASE_JWT_SECRET (HS256)
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            user_id = payload.get("sub")
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired"
            )
        except jwt.InvalidTokenError:
            # Fallback to GoTrue Auth API if decoding fails due to formatting/key mismatch
            pass

    # 2. Fallback to querying the Supabase GoTrue Auth server if local decoding failed
    if not user_id:
        try:
            supabase = await get_supabase()
            auth_response = await supabase.auth.get_user(token)
            if auth_response and auth_response.user:
                user_id = auth_response.user.id
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token or session expired"
            )
            
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
        
    # 3. Retrieve user profile from our DB profiles table
    try:
        supabase = await get_supabase()
        response = await supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User profile not registered in HRMS database"
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during authentication: {str(e)}"
        )
