from collections import Counter
from datetime import date, timedelta
from typing import Dict, Any, List
from app.supabase import get_supabase

class AdminService:
    """
    Service containing business logic for administrative reporting statistics.
    """

    @staticmethod
    async def get_statistics() -> dict:
        """
        Aggregate enterprise statistics across profiles, leave requests, and attendance logs.
        """
        supabase = await get_supabase()
        
        # 1. Gather all profile records
        profiles_res = await supabase.table("profiles").select("role, department, salary").execute()
        profiles = profiles_res.data if profiles_res.data else []
        
        # Department and role distribution counters
        departments = [p.get("department") or "Unassigned" for p in profiles if p.get("role") == "employee"]
        dept_dist = dict(Counter(departments))
        
        roles = [p.get("role") for p in profiles]
        role_dist = dict(Counter(roles))
        
        # Salary stats
        salaries = [float(p["salary"]) for p in profiles if p.get("salary") is not None and p.get("role") == "employee"]
        if salaries:
            salary_stats = {
                "averageSalary": round(sum(salaries) / len(salaries), 2),
                "maxSalary": max(salaries),
                "minSalary": min(salaries)
            }
        else:
            salary_stats = {
                "averageSalary": 0.0,
                "maxSalary": 0.0,
                "minSalary": 0.0
            }
            
        # 2. Gather leave requests stats
        leaves_res = await supabase.table("leave_requests").select("status").execute()
        leave_statuses = [l.get("status") for l in leaves_res.data] if leaves_res.data else []
        leave_stats = {
            "pending": leave_statuses.count("pending"),
            "approved": leave_statuses.count("approved"),
            "rejected": leave_statuses.count("rejected")
        }
        
        # 3. Attendance trends (last 7 days)
        today = date.today()
        seven_days_ago = (today - timedelta(days=7)).isoformat()
        
        attendance_res = await supabase.table("attendance") \
            .select("date") \
            .gte("date", seven_days_ago) \
            .execute()
            
        attendance_dates = [a.get("date") for a in attendance_res.data] if attendance_res.data else []
        attendance_counts = Counter(attendance_dates)
        
        # Format the trend for the last 7 days including days with 0 check-ins
        trends = []
        for i in range(7):
            d = today - timedelta(days=i)
            d_str = d.isoformat()
            trends.append({
                "date": d_str,
                "count": attendance_counts.get(d_str, 0)
            })
            
        return {
            "department_distribution": dept_dist,
            "role_distribution": role_dist,
            "salary_stats": salary_stats,
            "leave_stats": leave_stats,
            "recent_attendance_trends": trends
        }
