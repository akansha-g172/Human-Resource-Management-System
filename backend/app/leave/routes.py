from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from app.middleware.auth import get_current_user
from app.middleware.role import RequireRole
from app.leave.service import LeaveService
from app.leave.schemas import LeaveApplyRequest, LeaveReviewRequest, LeaveResponse, AdminLeaveResponse
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/leave", tags=["Leave"])

@router.post(
    "/apply",
    response_model=StandardResponse[LeaveResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Apply for Leave",
    description="Allows an employee to submit a leave request. Validates date bounds and overlaps."
)
async def apply_leave(
    request: LeaveApplyRequest,
    current_user: dict = Depends(RequireRole(["employee"]))
):
    record = await LeaveService.apply_leave(user_id=current_user["id"], request=request)
    leave_data = LeaveResponse.model_validate(record)
    return success_response(
        message="Leave request submitted successfully",
        data=leave_data,
        status_code=status.HTTP_201_CREATED
    )

@router.get(
    "/my",
    response_model=StandardResponse[List[LeaveResponse]],
    summary="Get Own Leaves",
    description="Retrieve all leave requests submitted by the logged-in employee."
)
async def get_my_leaves(current_user: dict = Depends(RequireRole(["employee"]))):
    records = await LeaveService.get_my_leaves(user_id=current_user["id"])
    items = [LeaveResponse.model_validate(rec) for rec in records]
    return success_response(
        message="Leave requests retrieved successfully",
        data=items
    )

@router.get(
    "/all",
    summary="Get All Leaves (Admin Only)",
    description="Retrieve a paginated list of all leave requests in the system."
)
async def get_all_leaves(
    status_filter: Optional[str] = Query(None, description="Filter by status (pending, approved, rejected)"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    records, total = await LeaveService.get_all_leaves(
        status_filter=status_filter,
        page=page,
        limit=limit
    )
    items = [AdminLeaveResponse.model_validate(rec) for rec in records]
    return success_response(
        message="All leave requests retrieved successfully",
        data={
            "items": items,
            "total": total,
            "page": page,
            "limit": limit
        }
    )

@router.put(
    "/{id}/approve",
    response_model=StandardResponse[LeaveResponse],
    summary="Approve Leave (Admin Only)",
    description="Allows an administrator to approve a pending leave request."
)
async def approve_leave(
    id: str,
    review: LeaveReviewRequest,
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    record = await LeaveService.review_leave(
        leave_id=id,
        reviewer_id=current_admin["id"],
        new_status="approved",
        reviewer_comment=review.reviewer_comment
    )
    leave_data = LeaveResponse.model_validate(record)
    return success_response(
        message="Leave request approved successfully",
        data=leave_data
    )

@router.put(
    "/{id}/reject",
    response_model=StandardResponse[LeaveResponse],
    summary="Reject Leave (Admin Only)",
    description="Allows an administrator to reject a pending leave request."
)
async def reject_leave(
    id: str,
    review: LeaveReviewRequest,
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    record = await LeaveService.review_leave(
        leave_id=id,
        reviewer_id=current_admin["id"],
        new_status="rejected",
        reviewer_comment=review.reviewer_comment
    )
    leave_data = LeaveResponse.model_validate(record)
    return success_response(
        message="Leave request rejected successfully",
        data=leave_data
    )
