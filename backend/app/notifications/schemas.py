from datetime import datetime
from app.auth.schemas import CamelModel

class NotificationResponse(CamelModel):
    id: str
    user_id: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
