import secrets
import string
from datetime import date
from typing import List, Tuple, Optional
from fastapi import HTTPException, status
from app.supabase import get_supabase
from app.employee.schemas import EmployeeCreateRequest, EmployeeUpdateRequest, EmployeeUpdateMeRequest

class EmployeeService:
    """
    Service containing business logic for employee profile management.
    """

    @staticmethod
    def generate_temp_password(length: int = 12) -> str:
        """
        Generate a cryptographically secure random password matching safety criteria:
        Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character.
        """
        uppercase = string.ascii_uppercase
        lowercase = string.ascii_lowercase
        digits = string.digits
        special = "!@#$%&*?"
        
        # Guarantee at least one of each class
        password = [
            secrets.choice(uppercase),
            secrets.choice(lowercase),
            secrets.choice(digits),
            secrets.choice(special)
        ]
        
        # Fill the remainder
        all_chars = uppercase + lowercase + digits + special
        password += [secrets.choice(all_chars) for _ in range(length - 4)]
        
        # Shuffle cryptographically
        secrets.SystemRandom().shuffle(password)
        return "".join(password)

    @classmethod
    async def create_employee(cls, request: EmployeeCreateRequest, password: Optional[str] = None) -> dict:
        """
        Admin or self-service action to create a new employee.
        Generates login_id, employee_id, registers in Supabase auth,
        inserts the database profile, and publishes a welcome notification.
        """
        supabase = await get_supabase()
        
        # 1. Check for duplicate email
        email_check = await supabase.table("profiles").select("id").eq("email", request.email).execute()
        if email_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An employee with this email is already registered."
            )
            
        # 2. Generate unique login_id
        # Normalize name: lower case, remove spaces/special characters
        parts = [p.lower() for p in request.name.strip().split() if p]
        first = parts[0] if len(parts) > 0 else "emp"
        last = parts[-1] if len(parts) > 1 else ""
        
        base_login = f"{first}.{last}" if last else first
        base_login = "".join(c for c in base_login if c.isalnum() or c == ".")
        
        login_id = base_login
        counter = 1
        while True:
            login_check = await supabase.table("profiles").select("id").eq("login_id", login_id).execute()
            if not login_check.data:
                break
            login_id = f"{base_login}{counter}"
            counter += 1
            
        # 3. Generate atomic employee_id using PostgreSQL RPC
        try:
            rpc_response = await supabase.rpc(
                "generate_employee_id",
                {
                    "first_name": first.capitalize(),
                    "last_name": (last.capitalize() if last else "Employee"),
                    "join_date": request.date_joined.isoformat()
                }
            ).execute()
            employee_id = rpc_response.data
            if not employee_id:
                raise ValueError("RPC returned empty employee ID")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Atomic employee ID generation failed: {str(e)}"
            )

        # 4. Use the provided password if available, otherwise generate one
        generated_password = password if password else cls.generate_temp_password()
        
        # 5. Create user in Supabase Auth via Admin API
        try:
            auth_response = await supabase.auth.admin.create_user({
                "email": request.email,
                "password": generated_password,
                "email_confirm": True,
                "user_metadata": {
                    "name": request.name,
                    "role": request.role
                }
            })
            auth_user_id = auth_response.user.id
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create auth user in Supabase: {str(e)}"
            )

        # 6. Create database profile
        try:
            profile_data = {
                "id": auth_user_id,
                "employee_id": employee_id,
                "login_id": login_id,
                "name": request.name,
                "email": request.email,
                "role": request.role,
                "job_title": request.job_title,
                "department": request.department,
                "phone": request.phone,
                "address": request.address,
                "salary": request.salary,
                "date_joined": request.date_joined.isoformat()
            }
            profile_response = await supabase.table("profiles").insert(profile_data).execute()
            created_profile = profile_response.data[0]
        except Exception as e:
            # Rollback Auth User if DB creation fails
            try:
                await supabase.auth.admin.delete_user(auth_user_id)
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to insert employee profile: {str(e)}"
            )

        # 7. Create notification welcoming the employee
        try:
            await supabase.table("notifications").insert({
                "user_id": auth_user_id,
                "title": "Welcome to HRMS!",
                "message": f"Hello {request.name}, your account is active. Employee ID: {employee_id}, Login ID: {login_id}. For security, reset your password on your first login."
            }).execute()
        except Exception:
            pass

        if not password:
            created_profile["temporary_password"] = generated_password
        return created_profile

    @staticmethod
    async def get_all_employees(
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        department: Optional[str] = None,
        role: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        """
        Retrieve paginated, filtered, and searched list of profiles.
        """
        supabase = await get_supabase()
        
        # Build query
        query = supabase.table("profiles").select("*", count="exact")
        
        if department:
            query = query.eq("department", department)
        if role:
            query = query.eq("role", role)
        if search:
            # Multi-field search
            search_param = f"%{search}%"
            query = query.or_(
                f"name.ilike.{search_param},"
                f"email.ilike.{search_param},"
                f"employee_id.ilike.{search_param},"
                f"department.ilike.{search_param},"
                f"job_title.ilike.{search_param}"
            )
            
        # Pagination
        start = (page - 1) * limit
        end = start + limit - 1
        query = query.range(start, end).order("created_at", desc=True)
        
        response = await query.execute()
        
        # Safe extraction of count
        total = response.count if response.count is not None else len(response.data)
        return response.data, total

    @staticmethod
    async def get_employee_by_id(user_id: str) -> dict:
        """
        Fetch profile by user UUID.
        """
        supabase = await get_supabase()
        response = await supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profile not found"
            )
        return response.data[0]

    @staticmethod
    async def update_employee_profile(user_id: str, updates: dict) -> dict:
        """
        Update profile fields.
        """
        supabase = await get_supabase()
        
        # Remove None values so we only update provided fields
        filtered_updates = {k: v for k, v in updates.items() if v is not None}
        if not filtered_updates:
            # Nothing to update, return current profile
            return await EmployeeService.get_employee_by_id(user_id)
            
        response = await supabase.table("profiles").update(filtered_updates).eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profile not found or update failed"
            )
        return response.data[0]
