from typing import Dict, Any, List
from app.auth.schemas import CamelModel

class AdminStatisticsResponse(CamelModel):
    department_distribution: Dict[str, int]
    role_distribution: Dict[str, int]
    salary_stats: Dict[str, float]
    leave_stats: Dict[str, int]
    recent_attendance_trends: List[Dict[str, Any]]
