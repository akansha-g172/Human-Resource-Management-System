from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    """
    Base model that automatically generates camelCase aliases for all fields,
    allowing snake_case properties to be serialized/deserialized as camelCase.
    """
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class ProfileResponse(CamelModel):
    id: str
    employee_id: str
    login_id: str
    name: str
    email: EmailStr
    role: str
    photo_url: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    salary: Optional[float] = None
    date_joined: Optional[date] = None
    created_at: Optional[datetime] = None
