import httpx
import json
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
            definitions = spec.get("definitions", {})
            for table_name, definition in definitions.items():
                properties = definition.get("properties", {})
                cols = list(properties.keys())
                print(f"Table: {table_name}")
                print(f"  Columns: {cols}")
        else:
            print(f"Error fetching OpenAPI spec: {response.status_code} - {response.text}")

if __name__ == "__main__":
    asyncio.run(main())
