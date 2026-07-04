from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.dashboard.service import DashboardService
from app.dashboard.schemas import DashboardResponse
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get(
    "",
    response_model=StandardResponse[DashboardResponse],
    summary="Get Dashboard Data",
    description="Retrieve dashboard metrics and notifications tailored to the current user's role (admin or employee)."
)
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    data = await DashboardService.get_dashboard_data(current_user)
    dashboard_data = DashboardResponse.model_validate(data)
    return success_response(
        message="Dashboard data retrieved successfully",
        data=dashboard_data
    )
