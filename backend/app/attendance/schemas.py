from typing import Optional
from datetime import date, datetime
from app.auth.schemas import CamelModel

class AttendanceResponse(CamelModel):
    id: str
    user_id: str
    date: date
    status: str
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    working_hours: float
    created_at: datetime

class AdminAttendanceResponse(AttendanceResponse):
    user_name: Optional[str] = None
    employee_id: Optional[str] = None
