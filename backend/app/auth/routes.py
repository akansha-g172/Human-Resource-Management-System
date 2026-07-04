from fastapi import APIRouter, Depends, status
from app.middleware.auth import get_current_user
from app.auth.service import AuthService
from app.auth.schemas import (
    ProfileResponse,
    AuthLoginRequest,
    AuthSignUpRequest,
    AuthLoginResponse
)
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/login",
    response_model=StandardResponse[AuthLoginResponse],
    summary="User Login",
    description="Authenticate a user and return an access token along with profile metadata."
)
async def login(request: AuthLoginRequest):
    auth_data = await AuthService.login(request.identifier, request.password)
    return success_response(
        message="Logged in successfully",
        data=AuthLoginResponse.model_validate(auth_data)
    )

@router.post(
    "/signup",
    response_model=StandardResponse[ProfileResponse],
    status_code=status.HTTP_201_CREATED,
    summary="User Sign Up",
    description="Register a new employee account and create the associated HRMS profile."
)
async def signup(request: AuthSignUpRequest):
    created_profile = await AuthService.signup(request)
    profile_data = ProfileResponse.model_validate(created_profile)
    return success_response(
        message="Employee registered successfully",
        data=profile_data,
        status_code=status.HTTP_201_CREATED
    )

@router.get(
    "/me",
    response_model=StandardResponse[ProfileResponse],
    summary="Get Current User Profile",
    description="Returns the profile details of the currently authenticated user."
)
async def get_me(current_user: dict = Depends(get_current_user)):
    profile = await AuthService.get_current_profile(current_user)
    profile_data = ProfileResponse.model_validate(profile)
    return success_response(
        message="User profile fetched successfully",
        data=profile_data
    )
