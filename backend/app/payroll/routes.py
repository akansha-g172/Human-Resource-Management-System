from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from app.middleware.auth import get_current_user
from app.middleware.role import RequireRole
from app.payroll.service import PayrollService
from app.payroll.schemas import PayrollUpdateRequest, PayrollResponse, AdminPayrollResponse
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/payroll", tags=["Payroll"])

@router.get(
    "/me",
    response_model=StandardResponse[List[PayrollResponse]],
    summary="Get Own Payroll Records",
    description="Retrieve all salary and disbursement logs for the authenticated employee."
)
async def get_my_payroll(current_user: dict = Depends(RequireRole(["employee"]))):
    records = await PayrollService.get_my_payroll(user_id=current_user["id"])
    items = [PayrollResponse.model_validate(rec) for rec in records]
    return success_response(
        message="Payroll records retrieved successfully",
        data=items
    )

@router.get(
    "/all",
    summary="Get All Payrolls (Admin Only)",
    description="Retrieve a paginated history log of all salary sheets and payroll records."
)
async def get_all_payrolls(
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter by year"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    records, total = await PayrollService.get_all_payrolls(
        month=month,
        year=year,
        page=page,
        limit=limit
    )
    items = [AdminPayrollResponse.model_validate(rec) for rec in records]
    return success_response(
        message="Payroll data retrieved successfully",
        data={
            "items": items,
            "total": total,
            "page": page,
            "limit": limit
        }
    )

@router.put(
    "/{employeeId}",
    response_model=StandardResponse[PayrollResponse],
    summary="Update or Create Payroll (Admin Only)",
    description="Create or update payroll details for a specific employee by their custom Employee ID string (e.g. ODJD260704007)."
)
async def upsert_payroll(
    employeeId: str,
    request: PayrollUpdateRequest,
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    record = await PayrollService.upsert_payroll(
        employee_id_str=employeeId,
        request=request
    )
    payroll_data = PayrollResponse.model_validate(record)
    return success_response(
        message="Payroll record updated successfully",
        data=payroll_data
    )
