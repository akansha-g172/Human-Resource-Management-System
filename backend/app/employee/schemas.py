from typing import Optional
from datetime import date, datetime
from pydantic import Field, EmailStr
from app.auth.schemas import CamelModel, ProfileResponse

class EmployeeCreateRequest(CamelModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = Field("employee", pattern="^(admin|employee)$")
    job_title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    salary: Optional[float] = 0.0
    date_joined: Optional[date] = Field(default_factory=date.today)

class EmployeeCreateResponse(ProfileResponse):
    temporary_password: str

class EmployeeUpdateRequest(CamelModel):
    name: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(admin|employee)$")
    job_title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    salary: Optional[float] = None
    photo_url: Optional[str] = None

class EmployeeUpdateMeRequest(CamelModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None
