from typing import Optional
from datetime import date, datetime
from pydantic import Field, model_validator
from app.auth.schemas import CamelModel

class LeaveApplyRequest(CamelModel):
    leave_type: str = Field(..., pattern="^(paid|sick|unpaid)$")
    start_date: date
    end_date: date
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self) -> "LeaveApplyRequest":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self

class LeaveReviewRequest(CamelModel):
    reviewer_comment: Optional[str] = None

class LeaveResponse(CamelModel):
    id: str
    user_id: str
    leave_type: str
    start_date: date
    end_date: date
    remarks: Optional[str] = None
    status: str
    reviewer_id: Optional[str] = None
    reviewer_comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class AdminLeaveResponse(LeaveResponse):
    user_name: Optional[str] = None
    employee_id: Optional[str] = None
