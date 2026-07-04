import asyncio
from datetime import date
from app.supabase import get_supabase

async def create_admin():
    supabase = await get_supabase()
    email = "admin@company.com"
    password = "AdminPassword123!"
    
    print("Checking if admin already exists...")
    res = await supabase.table("profiles").select("id").eq("email", email).execute()
    if res.data:
        print("Admin user already exists in profiles.")
        return

    print("Creating admin in Supabase Auth...")
    try:
        auth_user = await supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "name": "Admin User",
                "role": "admin"
            }
        })
        user_uuid = auth_user.user.id
        print(f"Auth user created. UUID: {user_uuid}")
    except Exception as e:
        print(f"Failed to create auth user: {e}")
        return

    print("Inserting admin profile...")
    profile_data = {
        "id": user_uuid,
        "employee_id": "ODAD260704001",
        "login_id": "admin.user",
        "name": "Admin User",
        "email": email,
        "role": "admin",
        "job_title": "HR Administrator",
        "department": "Human Resources",
        "phone": "9999999999",
        "address": "HR Office",
        "salary": 10000.0,
        "date_joined": date.today().isoformat()
    }
    
    try:
        await supabase.table("profiles").insert(profile_data).execute()
        print("Admin profile inserted successfully.")
    except Exception as e:
        print(f"Failed to insert admin profile: {e}")
        # Clean up auth user
        await supabase.auth.admin.delete_user(user_uuid)

if __name__ == "__main__":
    asyncio.run(create_admin())
