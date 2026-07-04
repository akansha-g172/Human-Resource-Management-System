from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from datetime import date
from app.middleware.auth import get_current_user
from app.middleware.role import RequireRole
from app.attendance.service import AttendanceService
from app.attendance.schemas import AttendanceResponse, AdminAttendanceResponse
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post(
    "/checkin",
    response_model=StandardResponse[AttendanceResponse],
    summary="Employee Check-in",
    description="Registers the current date check-in for the logged-in employee."
)
async def check_in(current_user: dict = Depends(RequireRole(["employee"]))):
    record = await AttendanceService.check_in(user_id=current_user["id"])
    attendance_data = AttendanceResponse.model_validate(record)
    return success_response(
        message="Checked in successfully",
        data=attendance_data
    )

@router.post(
    "/checkout",
    response_model=StandardResponse[AttendanceResponse],
    summary="Employee Check-out",
    description="Registers the check-out for today, and automatically calculates the total working hours."
)
async def check_out(current_user: dict = Depends(RequireRole(["employee"]))):
    record = await AttendanceService.check_out(user_id=current_user["id"])
    attendance_data = AttendanceResponse.model_validate(record)
    return success_response(
        message="Checked out successfully",
        data=attendance_data
    )

@router.get(
    "/me",
    response_model=StandardResponse[List[AttendanceResponse]],
    summary="Get Own Attendance History",
    description="Retrieve lists of all check-in/out records for the logged-in employee."
)
async def get_my_attendance(
    from_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    current_user: dict = Depends(RequireRole(["employee"]))
):
    records = await AttendanceService.get_my_attendance(
        user_id=current_user["id"],
        from_date=from_date,
        to_date=to_date
    )
    items = [AttendanceResponse.model_validate(rec) for rec in records]
    return success_response(
        message="Attendance records retrieved successfully",
        data=items
    )

@router.get(
    "/all",
    summary="Get All Attendance (Admin Only)",
    description="Retrieve a paginated, filterable history log of all employee attendance records."
)
async def get_all_attendance(
    from_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    user_id: Optional[str] = Query(None, description="Filter by user UUID"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    records, total = await AttendanceService.get_all_attendance(
        from_date=from_date,
        to_date=to_date,
        user_id=user_id,
        page=page,
        limit=limit
    )
    items = [AdminAttendanceResponse.model_validate(rec) for rec in records]
    return success_response(
        message="Attendance data retrieved successfully",
        data={
            "items": items,
            "total": total,
            "page": page,
            "limit": limit
        }
    )
