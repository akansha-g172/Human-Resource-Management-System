from fastapi import APIRouter, Depends
from app.middleware.role import RequireRole
from app.admin.service import AdminService
from app.admin.schemas import AdminStatisticsResponse
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/admin", tags=["Admin Statistics"])

@router.get(
    "/statistics",
    response_model=StandardResponse[AdminStatisticsResponse],
    summary="Get System Statistics",
    description="Retrieve high-level statistics of departments, roles, leave counts, salaries, and attendance trends. Admin only."
)
async def get_statistics(current_admin: dict = Depends(RequireRole(["admin"]))):
    stats = await AdminService.get_statistics()
    stats_data = AdminStatisticsResponse.model_validate(stats)
    return success_response(
        message="System statistics retrieved successfully",
        data=stats_data
    )
