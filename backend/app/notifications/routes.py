from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from app.middleware.auth import get_current_user
from app.notifications.service import NotificationService
from app.notifications.schemas import NotificationResponse
from app.utils.response import success_response, StandardResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get(
    "",
    summary="Get Own Notifications",
    description="Retrieve a paginated history of notifications for the logged-in user."
)
async def get_notifications(
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    notifications, total = await NotificationService.get_my_notifications(
        user_id=current_user["id"],
        is_read=is_read,
        page=page,
        limit=limit
    )
    items = [NotificationResponse.model_validate(n) for n in notifications]
    return success_response(
        message="Notifications retrieved successfully",
        data={
            "items": items,
            "total": total,
            "page": page,
            "limit": limit
        }
    )

@router.put(
    "/{id}/read",
    response_model=StandardResponse[NotificationResponse],
    summary="Mark Notification as Read",
    description="Allows a user to mark a specific notification as read."
)
async def mark_notification_as_read(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    updated = await NotificationService.mark_as_read(
        notification_id=id,
        user_id=current_user["id"]
    )
    notification_data = NotificationResponse.model_validate(updated)
    return success_response(
        message="Notification marked as read",
        data=notification_data
    )

@router.put(
    "/read-all",
    summary="Mark All Notifications as Read",
    description="Allows a user to mark all their unread notifications as read."
)
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user)
):
    await NotificationService.mark_all_as_read(user_id=current_user["id"])
    return success_response(
        message="All notifications marked as read"
    )
