from typing import Optional
from datetime import datetime
from pydantic import Field
from app.auth.schemas import CamelModel

class PayrollUpdateRequest(CamelModel):
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)
    basic_salary: float = Field(..., ge=0.0)
    allowances: Optional[float] = Field(0.0, ge=0.0)
    deductions: Optional[float] = Field(0.0, ge=0.0)
    status: str = Field("pending", pattern="^(pending|paid)$")

class PayrollResponse(CamelModel):
    id: str
    user_id: str
    month: int
    year: int
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

class AdminPayrollResponse(PayrollResponse):
    user_name: Optional[str] = None
    employee_id: Optional[str] = None
