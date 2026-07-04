from datetime import date, datetime, timezone
from typing import List, Tuple, Optional
from fastapi import HTTPException, status
from app.supabase import get_supabase
from app.leave.schemas import LeaveApplyRequest

class LeaveService:
    """
    Service containing business logic for leave management.
    """

    @staticmethod
    async def apply_leave(user_id: str, request: LeaveApplyRequest) -> dict:
        """
        Submits a leave request after validating that the requested dates do not overlap
        with any existing non-rejected leave requests for the employee.
        """
        supabase = await get_supabase()
        
        # 1. Prevent overlapping leave requests
        # Overlap criteria: (existing.start_date <= request.end_date) AND (existing.end_date >= request.start_date)
        overlapping = await supabase.table("leave_requests") \
            .select("id") \
            .eq("user_id", user_id) \
            .neq("status", "rejected") \
            .gte("end_date", request.start_date.isoformat()) \
            .lte("start_date", request.end_date.isoformat()) \
            .execute()
            
        if overlapping.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have an overlapping leave request during the specified period."
            )
            
        # 2. Insert leave request
        leave_data = {
            "user_id": user_id,
            "leave_type": request.leave_type,
            "start_date": request.start_date.isoformat(),
            "end_date": request.end_date.isoformat(),
            "remarks": request.remarks,
            "status": "pending"
        }
        
        response = await supabase.table("leave_requests").insert(leave_data).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit leave request"
            )
            
        record = response.data[0]
        
        # 3. Automatically create notifications for all Admins
        try:
            employee_profile = await supabase.table("profiles").select("name").eq("id", user_id).execute()
            emp_name = employee_profile.data[0]["name"] if employee_profile.data else "An employee"
            
            admins = await supabase.table("profiles").select("id").eq("role", "admin").execute()
            for admin in admins.data:
                await supabase.table("notifications").insert({
                    "user_id": admin["id"],
                    "title": "New Leave Request Submitted",
                    "message": f"{emp_name} has applied for {request.leave_type} leave from {request.start_date} to {request.end_date}."
                }).execute()
        except Exception:
            pass
            
        return record

    @staticmethod
    async def get_my_leaves(user_id: str) -> List[dict]:
        """
        Retrieve lists of own leave requests for the logged-in employee.
        """
        supabase = await get_supabase()
        response = await supabase.table("leave_requests") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data

    @staticmethod
    async def get_all_leaves(
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[dict], int]:
        """
        Retrieve paginated leave requests with matching profile details (for Admin review).
        """
        supabase = await get_supabase()
        
        query = supabase.table("leave_requests").select("*, profiles(name, employee_id)", count="exact")
        
        if status_filter:
            query = query.eq("status", status_filter)
            
        start = (page - 1) * limit
        end = start + limit - 1
        
        response = await query.range(start, end).order("created_at", desc=True).execute()
        
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
    async def review_leave(
        leave_id: str,
        reviewer_id: str,
        new_status: str,
        reviewer_comment: Optional[str] = None
    ) -> dict:
        """
        Allows admin to approve or reject a pending leave request.
        Updates status and reviews, and notifications are sent back to the applicant.
        """
        supabase = await get_supabase()
        
        # Fetch the leave request to verify existence and check if it's pending
        existing = await supabase.table("leave_requests").select("*").eq("id", leave_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leave request not found."
            )
            
        leave_record = existing.data[0]
        if leave_record["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot review leave request. It is already '{leave_record['status']}'."
            )
            
        # Update leave request
        update_data = {
            "status": new_status,
            "reviewer_id": reviewer_id,
            "reviewer_comment": reviewer_comment,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        response = await supabase.table("leave_requests").update(update_data).eq("id", leave_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update leave request status"
            )
            
        updated_record = response.data[0]
        
        # Automatically create notification for the employee
        try:
            await supabase.table("notifications").insert({
                "user_id": updated_record["user_id"],
                "title": f"Leave Request {new_status.capitalize()}",
                "message": f"Your leave request from {updated_record['start_date']} to {updated_record['end_date']} has been {new_status}." + 
                           (f" Comment: {reviewer_comment}" if reviewer_comment else "")
            }).execute()
        except Exception:
            pass
            
        return updated_record
