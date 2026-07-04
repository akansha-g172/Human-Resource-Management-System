from typing import Optional
from supabase import acreate_client, AsyncClient
from app.config import settings

# Global async client reference
supabase_client: Optional[AsyncClient] = None

async def get_supabase() -> AsyncClient:
    """
    Get the global async Supabase client instance.
    Initializes the client if it hasn't been initialized yet.
    """
    global supabase_client
    if supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables or .env file"
            )
        supabase_client = await acreate_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
    return supabase_client
