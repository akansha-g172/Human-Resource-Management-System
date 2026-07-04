from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.auth.service import AuthService
from app.auth.schemas import ProfileResponse
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get(
    "/me",
    response_model=StandardResponse[ProfileResponse],
    summary="Get Current User Profile",
    description="Returns the profile details of the currently authenticated user."
)
async def get_me(current_user: dict = Depends(get_current_user)):
    profile = await AuthService.get_current_profile(current_user)
    # Serialize matching our camelCase schema
    profile_data = ProfileResponse.model_validate(profile)
    return success_response(
        message="User profile fetched successfully",
        data=profile_data
    )
