from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from app.middleware.auth import get_current_user
from app.middleware.role import RequireRole
from app.employee.service import EmployeeService
from app.employee.schemas import (
    EmployeeCreateRequest,
    EmployeeCreateResponse,
    EmployeeUpdateRequest,
    EmployeeUpdateMeRequest
)
from app.auth.schemas import ProfileResponse
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post(
    "",
    response_model=StandardResponse[EmployeeCreateResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Employee (Admin Only)",
    description="Allows an administrator to create a new employee profile. Generates IDs and temporary password."
)
async def create_employee(
    request: EmployeeCreateRequest,
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    profile = await EmployeeService.create_employee(request)
    profile_data = EmployeeCreateResponse.model_validate(profile)
    return success_response(
        message="Employee profile created successfully",
        data=profile_data,
        status_code=status.HTTP_201_CREATED
    )

@router.get(
    "",
    summary="List Employees (Admin Only)",
    description="Retrieve a paginated, filterable, and searchable list of employee profiles."
)
async def list_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name, email, employee ID, department, or job title"),
    department: Optional[str] = Query(None, description="Filter by department"),
    role: Optional[str] = Query(None, description="Filter by role"),
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    employees, total = await EmployeeService.get_all_employees(
        page=page,
        limit=limit,
        search=search,
        department=department,
        role=role
    )
    
    # Serialize items
    items = [ProfileResponse.model_validate(emp) for emp in employees]
    
    return success_response(
        message="Employees retrieved successfully",
        data={
            "items": items,
            "total": total,
            "page": page,
            "limit": limit
        }
    )

@router.get(
    "/me",
    response_model=StandardResponse[ProfileResponse],
    summary="Get Own Profile",
    description="Retrieve the profile of the currently logged-in user."
)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    profile_data = ProfileResponse.model_validate(current_user)
    return success_response(
        message="Profile retrieved successfully",
        data=profile_data
    )

@router.put(
    "/me",
    response_model=StandardResponse[ProfileResponse],
    summary="Update Own Profile Details",
    description="Allows the logged-in user to modify limited profile fields: phone, address, and photo URL."
)
async def update_my_profile(
    request: EmployeeUpdateMeRequest,
    current_user: dict = Depends(get_current_user)
):
    updated = await EmployeeService.update_employee_profile(
        user_id=current_user["id"],
        updates=request.model_dump()
    )
    profile_data = ProfileResponse.model_validate(updated)
    return success_response(
        message="Profile updated successfully",
        data=profile_data
    )

@router.get(
    "/{id}",
    response_model=StandardResponse[ProfileResponse],
    summary="Get Employee Profile by ID (Admin Only)",
    description="Retrieve any employee's full profile using their unique UUID."
)
async def get_employee_by_id(
    id: str,
    current_admin: dict = Depends(RequireRole(["admin"]))
):
    profile = await EmployeeService.get_employee_by_id(user_id=id)
    profile_data = ProfileResponse.model_validate(profile)
    return success_response(
        message="Employee profile retrieved successfully",
        data=profile_data
    )
