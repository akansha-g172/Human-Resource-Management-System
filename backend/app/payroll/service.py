from datetime import datetime, timezone
from typing import List, Tuple, Optional
from fastapi import HTTPException, status
from app.supabase import get_supabase
from app.payroll.schemas import PayrollUpdateRequest

class PayrollService:
    """
    Service containing business logic for payroll management.
    """

    @staticmethod
    async def get_my_payroll(user_id: str) -> List[dict]:
        """
        Retrieves payroll records for the currently authenticated employee.
        """
        supabase = await get_supabase()
        response = await supabase.table("payroll") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("year", desc=True) \
            .order("month", desc=True) \
            .execute()
        return response.data

    @staticmethod
    async def get_all_payrolls(
        month: Optional[int] = None,
        year: Optional[int] = None,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[dict], int]:
        """
        Retrieves paginated, filterable payrolls including employee profiles.
        """
        supabase = await get_supabase()
        
        query = supabase.table("payroll").select("*, profiles(name, employee_id)", count="exact")
        
        if month:
            query = query.eq("month", month)
        if year:
            query = query.eq("year", year)
            
        start = (page - 1) * limit
        end = start + limit - 1
        
        response = await query.range(start, end).order("year", desc=True).order("month", desc=True).execute()
        
        # Flatten profiles join structure
        flattened_records = []
        for rec in response.data:
            profile = rec.pop("profiles", {}) or {}
            rec["user_name"] = profile.get("name")
            rec["employee_id"] = profile.get("employee_id")
            flattened_records.append(rec)
            
        total = response.count if response.count is not None else len(flattened_records)
        return flattened_records, total

    @staticmethod
    async def upsert_payroll(employee_id_str: str, request: PayrollUpdateRequest) -> dict:
        """
        Admin action to create or update an employee's monthly payroll.
        Resolves the custom employeeId string (e.g. ODJD260704007) to User UUID.
        Automatically computes net salary and sets payment timestamp.
        """
        supabase = await get_supabase()
        
        # 1. Resolve employee_id string to user UUID
        profile_res = await supabase.table("profiles").select("id, name").eq("employee_id", employee_id_str).execute()
        if not profile_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID '{employee_id_str}' not found."
            )
            
        user_uuid = profile_res.data[0]["id"]
        user_name = profile_res.data[0]["name"]
        
        # 2. Compute Net Salary
        net_salary = request.basic_salary + request.allowances - request.deductions
        
        # 3. Determine payment timestamp
        paid_at = None
        if request.status == "paid":
            paid_at = datetime.now(timezone.utc).isoformat()
            
        payroll_data = {
            "user_id": user_uuid,
            "month": request.month,
            "year": request.year,
            "basic_salary": request.basic_salary,
            "allowances": request.allowances,
            "deductions": request.deductions,
            "net_salary": net_salary,
            "status": request.status,
            "paid_at": paid_at
        }
        
        # 4. Perform upsert on conflict (user_id, month, year)
        # In PostgREST, upsert resolves conflict based on unique constraints automatically.
        response = await supabase.table("payroll").upsert(
            payroll_data, 
            on_conflict="user_id,month,year"
        ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record payroll record"
            )
            
        record = response.data[0]
        
        # 5. Automatically create notification for the employee
        try:
            status_desc = "disbursed" if request.status == "paid" else "updated"
            await supabase.table("notifications").insert({
                "user_id": user_uuid,
                "title": f"Payroll {request.month}/{request.year} {request.status.capitalize()}",
                "message": f"Your payroll details for {request.month}/{request.year} have been {status_desc}. Net Salary: ${net_salary:.2f}."
            }).execute()
        except Exception:
            pass
            
        return record
