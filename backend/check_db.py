import asyncio
from app.config import settings
from app.supabase import get_supabase

async def check():
    supabase = await get_supabase()
    tables = ["profiles", "attendance", "leave_requests", "payroll", "notifications"]
    for t in tables:
        try:
            res = await supabase.table(t).select("*").limit(1).execute()
            columns = list(res.data[0].keys()) if res.data else "No data / empty table"
            print(f"Table: {t} -> Columns: {columns}")
        except Exception as e:
            print(f"Table: {t} -> Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
