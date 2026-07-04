from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.config import settings

# Import routers
from app.auth.routes import router as auth_router
from app.employee.routes import router as employee_router
from app.attendance.routes import router as attendance_router
from app.leave.routes import router as leave_router
from app.payroll.routes import router as payroll_router
from app.dashboard.routes import router as dashboard_router
from app.admin.routes import router as admin_router
from app.notifications.routes import router as notifications_router

# Import custom error response helper
from app.utils.response import error_response

app = FastAPI(
    title="HRMS Backend Monolith",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sub-routers
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(attendance_router)
app.include_router(leave_router)
app.include_router(payroll_router)
app.include_router(dashboard_router)
app.include_router(admin_router)
app.include_router(notifications_router)

# ---------------------------------------------------------
# Global Exception Handlers for Unified JSON Response Shape
# ---------------------------------------------------------

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Format standard FastAPI/Starlette HTTPExceptions into consistent JSON format.
    """
    return error_response(
        message=exc.detail,
        status_code=exc.status_code
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Format Pydantic schema validation errors into consistent JSON format.
    """
    # Extract details of validation issues
    errors = exc.errors()
    error_msgs = []
    for err in errors:
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        error_msgs.append(f"{loc}: {msg}")
        
    unified_message = "; ".join(error_msgs) if error_msgs else "Validation error"
    
    return error_response(
        message=unified_message,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        data=errors
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler to ensure internal server errors return standard shape.
    """
    message = str(exc) if settings.DEBUG else "An unexpected internal server error occurred."
    return error_response(
        message=message,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

@app.get("/", tags=["Health Check"])
async def root_health_check():
    """
    API health check status.
    """
    return {
        "success": True,
        "message": "HRMS Backend API Monolith is active and healthy.",
        "data": {
            "status": "healthy",
            "version": "1.0.0"
        }
    }
