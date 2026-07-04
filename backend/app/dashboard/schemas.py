from typing import Dict, Any
from app.auth.schemas import CamelModel

class DashboardResponse(CamelModel):
    role: str
    stats: Dict[str, Any]
