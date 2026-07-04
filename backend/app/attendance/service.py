from datetime import date, datetime, timezone
from typing import List, Tuple, Optional
from fastapi import HTTPException, status
from app.supabase import get_supabase

class AttendanceService:
    """
    Service containing business logic for attendance management.
    """

    @staticmethod
    async def check_in(user_id: str) -> dict:
        """
        Registers employee check-in for today.
        Prevents duplicate check-ins.
        """
        supabase = await get_supabase()
        today = date.today().isoformat()
        now_ts = datetime.now(timezone.utc).isoformat()
        
        # Check if record exists for today
        existing = await supabase.table("attendance").select("*").eq("user_id", user_id).eq("date", today).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked in today."
            )
            
        attendance_data = {
            "user_id": user_id,
            "date": today,
            "status": "present",
            "check_in": now_ts
        }
        
        response = await supabase.table("attendance").insert(attendance_data).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record check-in"
            )
            
        record = response.data[0]
        
        # Create notification
        try:
            check_in_local = datetime.fromisoformat(now_ts).astimezone().strftime("%H:%M:%S")
            await supabase.table("notifications").insert({
                "user_id": user_id,
                "title": "Attendance: Checked In",
                "message": f"You successfully checked in at {check_in_local} today."
            }).execute()
        except Exception:
            pass
            
        return record

    @staticmethod
    async def check_out(user_id: str) -> dict:
        """
        Registers employee check-out for today.
        Computes working hours and prevents check-out before check-in.
        """
        supabase = await get_supabase()
        today = date.today().isoformat()
        now_ts = datetime.now(timezone.utc)
        
        # Check if check-in exists for today
        existing = await supabase.table("attendance").select("*").eq("user_id", user_id).eq("date", today).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active check-in found for today. Please check in first."
            )
            
        record = existing.data[0]
        if record.get("check_out"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked out today."
            )
            
        check_in_time = datetime.fromisoformat(record["check_in"].replace("Z", "+00:00"))
        working_hours = (now_ts - check_in_time).total_seconds() / 3600.0
        working_hours = max(0.0, round(working_hours, 2))
        
        # Update attendance
        update_data = {
            "check_out": now_ts.isoformat(),
            "working_hours": working_hours
        }
        
        response = await supabase.table("attendance").update(update_data).eq("id", record["id"]).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record check-out"
            )
            
        updated_record = response.data[0]
        
        # Create notification
        try:
            check_out_local = now_ts.astimezone().strftime("%H:%M:%S")
            await supabase.table("notifications").insert({
                "user_id": user_id,
                "title": "Attendance: Checked Out",
                "message": f"Checked out successfully at {check_out_local}. Hours worked: {working_hours} hrs."
            }).execute()
        except Exception:
            pass
            
        return updated_record

    @staticmethod
    async def get_my_attendance(user_id: str, from_date: Optional[date] = None, to_date: Optional[date] = None) -> List[dict]:
        """
        List attendance records for the currently authenticated employee.
        """
        supabase = await get_supabase()
        query = supabase.table("attendance").select("*").eq("user_id", user_id)
        
        if from_date:
            query = query.gte("date", from_date.isoformat())
        if to_date:
            query = query.lte("date", to_date.isoformat())
            
        response = await query.order("date", desc=True).execute()
        return response.data

    @staticmethod
    async def get_all_attendance(
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        user_id: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[dict], int]:
        """
        Admin query to retrieve attendance history with user name and employee_id details.
        """
        supabase = await get_supabase()
        
        # PostgREST join query to pull profile info
        query = supabase.table("attendance").select("*, profiles(name, employee_id)", count="exact")
        
        if user_id:
            query = query.eq("user_id", user_id)
        if from_date:
            query = query.gte("date", from_date.isoformat())
        if to_date:
            query = query.lte("date", to_date.isoformat())
            
        start = (page - 1) * limit
        end = start + limit - 1
        
        response = await query.range(start, end).order("date", desc=True).execute()
        
        # Flatten profiles join structure
        flattened_records = []
        for rec in response.data:
            profile = rec.pop("profiles", {}) or {}
            rec["user_name"] = profile.get("name")
            rec["employee_id"] = profile.get("employee_id")
            flattened_records.append(rec)
            
        total = response.count if response.count is not None else len(flattened_records)
        return flattened_records, total
