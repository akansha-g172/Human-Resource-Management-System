from fastapi import HTTPException, status
from app.supabase import get_supabase
from app.employee.service import EmployeeService
from app.employee.schemas import EmployeeCreateRequest
from app.auth.schemas import AuthSignUpRequest

class AuthService:
    """
    Service to manage authentication and profile loading logic.
    """

    @staticmethod
    async def get_current_profile(current_user: dict) -> dict:
        """
        Processes and returns the authenticated user's profile.
        """
        return current_user

    @staticmethod
    async def login(identifier: str, password: str) -> dict:
        supabase = await get_supabase()

        profile = None
        email = identifier if "@" in identifier else None

        if email:
            response = await supabase.table("profiles").select("*").eq("email", email).execute()
            if response.data:
                profile = response.data[0]
        else:
            response = await supabase.table("profiles").select("*").eq("employee_id", identifier).execute()
            if response.data:
                profile = response.data[0]
            else:
                response = await supabase.table("profiles").select("*").eq("login_id", identifier).execute()
                if response.data:
                    profile = response.data[0]
                    email = profile.get("email")

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login credentials"
            )

        if not email:
            email = profile.get("email")

        try:
            auth_response = await supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login credentials"
            )

        session = getattr(auth_response, "session", None)
        if not session or not getattr(auth_response, "user", None):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login credentials"
            )

        return {
            "access_token": session.access_token,
            "refresh_token": getattr(session, "refresh_token", None),
            "token_type": getattr(session, "token_type", "bearer"),
            "user_id": profile["id"],
            "employee_id": profile.get("employee_id"),
            "name": profile.get("name"),
            "role": profile.get("role")
        }

    @staticmethod
    async def signup(request: AuthSignUpRequest) -> dict:
        if request.role != "employee":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Self-registration is only available for employee accounts."
            )

        employee_request = EmployeeCreateRequest(
            name=request.name,
            email=request.email,
            role=request.role,
            job_title=None,
            department=None,
            phone=None,
            address=None,
            salary=0.0,
            date_joined=request.start_date
        )

        return await EmployeeService.create_employee(employee_request, password=request.password)
