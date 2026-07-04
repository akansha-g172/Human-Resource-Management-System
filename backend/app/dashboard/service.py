from datetime import date, datetime
from app.supabase import get_supabase

class DashboardService:
    """
    Service containing business logic for dashboard KPI aggregation.
    """

    @staticmethod
    async def get_dashboard_data(current_user: dict) -> dict:
        """
        Gathers dashboard metrics tailored to the user's role.
        """
        supabase = await get_supabase()
        role = current_user.get("role")
        user_id = current_user.get("id")
        
        today = date.today().isoformat()
        current_year = date.today().year
        current_month = date.today().month
        
        stats = {}
        
        if role == "admin":
            # 1. Total employees
            emp_count_res = await supabase.table("profiles") \
                .select("id", count="exact") \
                .eq("role", "employee") \
                .execute()
            total_employees = emp_count_res.count if emp_count_res.count is not None else len(emp_count_res.data)
            
            # 2. Checked-in today
            attendance_res = await supabase.table("attendance") \
                .select("id", count="exact") \
                .eq("date", today) \
                .execute()
            checked_in_today = attendance_res.count if attendance_res.count is not None else len(attendance_res.data)
            
            # 3. Pending leave requests
            leaves_res = await supabase.table("leave_requests") \
                .select("id", count="exact") \
                .eq("status", "pending") \
                .execute()
            pending_leaves = leaves_res.count if leaves_res.count is not None else len(leaves_res.data)
            
            # 4. Total payroll disbursed this month
            payroll_res = await supabase.table("payroll") \
                .select("net_salary") \
                .eq("month", current_month) \
                .eq("year", current_year) \
                .eq("status", "paid") \
                .execute()
            total_payroll_disbursed = sum(float(item["net_salary"]) for item in payroll_res.data) if payroll_res.data else 0.0
            
            stats = {
                "totalEmployees": total_employees,
                "checkedInToday": checked_in_today,
                "pendingLeaveRequests": pending_leaves,
                "totalPayrollDisbursedThisMonth": total_payroll_disbursed
            }
            
        else: # employee
            # 1. Total check-ins this month
            first_day_of_month = date(current_year, current_month, 1).isoformat()
            emp_attendance_res = await supabase.table("attendance") \
                .select("id", count="exact") \
                .eq("user_id", user_id) \
                .gte("date", first_day_of_month) \
                .execute()
            checkins_this_month = emp_attendance_res.count if emp_attendance_res.count is not None else len(emp_attendance_res.data)
            
            # 2. Leaves taken/pending this month
            emp_leaves_res = await supabase.table("leave_requests") \
                .select("status") \
                .eq("user_id", user_id) \
                .execute()
            
            approved_leaves = sum(1 for item in emp_leaves_res.data if item["status"] == "approved")
            pending_leaves = sum(1 for item in emp_leaves_res.data if item["status"] == "pending")
            
            # 3. Recent notifications (up to 5)
            notif_res = await supabase.table("notifications") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(5) \
                .execute()
            
            stats = {
                "checkinsThisMonth": checkins_this_month,
                "approvedLeaves": approved_leaves,
                "pendingLeaves": pending_leaves,
                "recentNotifications": notif_res.data if notif_res.data else []
            }
            
        return {
            "role": role,
            "stats": stats
        }
