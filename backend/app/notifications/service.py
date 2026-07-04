from typing import List, Tuple, Optional
from fastapi import HTTPException, status
from app.supabase import get_supabase

class NotificationService:
    """
    Service containing business logic for user notifications.
    """

    @staticmethod
    async def get_my_notifications(
        user_id: str,
        is_read: Optional[bool] = None,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[dict], int]:
        """
        List notifications for the logged-in user with pagination and read state filtering.
        """
        supabase = await get_supabase()
        
        query = supabase.table("notifications").select("*", count="exact").eq("user_id", user_id)
        
        if is_read is not None:
            query = query.eq("is_read", is_read)
            
        start = (page - 1) * limit
        end = start + limit - 1
        
        response = await query.range(start, end).order("created_at", desc=True).execute()
        
        total = response.count if response.count is not None else len(response.data)
        return response.data, total

    @staticmethod
    async def mark_as_read(notification_id: str, user_id: str) -> dict:
        """
        Mark a specific notification as read.
        """
        supabase = await get_supabase()
        
        # Verify the notification exists and belongs to the user
        existing = await supabase.table("notifications") \
            .select("*") \
            .eq("id", notification_id) \
            .eq("user_id", user_id) \
            .execute()
            
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found or access denied."
            )
            
        response = await supabase.table("notifications") \
            .update({"is_read": True}) \
            .eq("id", notification_id) \
            .execute()
            
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update notification"
            )
            
        return response.data[0]

    @staticmethod
    async def mark_all_as_read(user_id: str) -> List[dict]:
        """
        Mark all notifications for the user as read.
        """
        supabase = await get_supabase()
        response = await supabase.table("notifications") \
            .update({"is_read": True}) \
            .eq("user_id", user_id) \
            .eq("is_read", False) \
            .execute()
        return response.data
