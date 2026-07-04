from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None

    model_config = {
        "populate_by_name": True
    }

def success_response(message: str, data: Any = None, status_code: int = 200) -> JSONResponse:
    """
    Generate a standard JSON success response.
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": jsonable_encoder(data, by_alias=True) if data is not None else None
        }
    )

def error_response(message: str, status_code: int = 400, data: Any = None) -> JSONResponse:
    """
    Generate a standard JSON error response.
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": jsonable_encoder(data) if data is not None else None
        }
    )
