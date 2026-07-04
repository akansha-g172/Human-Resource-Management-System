from typing import List
from fastapi import Depends, HTTPException, status
from app.middleware.auth import get_current_user

class RequireRole:
    """
    Dependency to enforce role-based access control.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{user_role}' is not authorized to access this resource"
            )
        return current_user
