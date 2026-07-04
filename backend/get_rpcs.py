import httpx
import asyncio
from app.config import settings

async def main():
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"
    }
    url = f"{settings.SUPABASE_URL}/rest/v1/"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            spec = response.json()
            paths = spec.get("paths", {})
            rpcs = [p for p in paths.keys() if p.startswith("/rpc/")]
            print("RPCs found:")
            for rpc in rpcs:
                print(f"  {rpc}")
        else:
            print(f"Error fetching: {response.status_code}")

if __name__ == "__main__":
    asyncio.run(main())
