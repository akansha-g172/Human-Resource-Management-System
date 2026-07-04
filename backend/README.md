# HRMS Backend Service

This is the production-ready backend service for the Human Resource Management System (HRMS). Built as a **Modular Monolith** using **FastAPI**, **Python 3.12**, and **Supabase**, this service handles employee life-cycle management, attendance check-ins, leave tracking, payroll calculation, notifications, and analytics dashboard aggregation.

---

## Technical Stack
- **Framework**: FastAPI (Asynchronous endpoints)
- **Language**: Python 3.12
- **Database/Auth/Storage**: Supabase (PostgreSQL, GoTrue Admin API)
- **Token Verification**: Local HS256 JWT decoding + fallback Supabase API validation

---

## Architectural Principles
This application follows a strict **Modular Monolith** design. Business logic is completely separated from endpoints:
1. **Routes (`routes.py`)**: Interface definition, request parameters parsing, response models, role authorization.
2. **Services (`service.py`)**: Core business logic, data mutation, validations, notifications trigger, and Supabase interaction.
3. **Schemas (`schemas.py`)**: Input validation and output serialization. Utilizes Pydantic v2 `alias_generator` to seamlessly convert standard database `snake_case` properties to frontend-friendly `camelCase` outputs.

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # Application entry point, global exception handlers
│   ├── config.py            # Pydantic settings loading env variables
│   ├── supabase.py          # Asynchronous Supabase client initialization
│   ├── middleware/
│   │   ├── auth.py          # JWT authentication and user profile resolver
│   │   └── role.py          # Role guards (admin/employee check)
│   ├── utils/
│   │   └── response.py      # Standardized JSON response envelope wrappers
│   ├── auth/                # Auth profile route/service
│   ├── employee/            # Employee lifecycle CRUD
│   ├── attendance/          # Check-in, check-out, working hours
│   ├── leave/               # Leave requests & approval logic
│   ├── payroll/             # Salary management and upserts
│   ├── dashboard/           # Summary dashboard data for roles
│   ├── admin/               # Administrator analytics statistics
│   └── notifications/       # User notification manager
├── schema.sql               # Supabase PostgreSQL tables & PL/pgSQL routines
├── requirements.txt         # Package dependencies
└── README.md                # Developer Documentation
```

---

## Database Configuration

Apply the `schema.sql` file at the root of the project to your Supabase PostgreSQL database. This file will set up:
- **`profiles`**: Tied 1:1 with `auth.users` UUID.
- **`attendance`**: Daily log checking check-in/out and working hours.
- **`leave_requests`**: Stores leaves and prevents overlap.
- **`payroll`**: Tracks basic salary, allowances, deductions, and net salary.
- **`notifications`**: User alerts system.
- **`employee_id_counters` & `generate_employee_id` RPC**: Atomically increments serial keys to construct employee IDs in format `OD` + `Initials` + `YYMMDD` + `3-digit sequence` (e.g., `ODJD260704007`).

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
PORT=8000
DEBUG=True
```

*Note: The `SUPABASE_SERVICE_ROLE_KEY` is required because only the Service Role has administrative privileges to bypass RLS and create/manage users via the GoTrue Admin API.*

---

## Local Setup & Run

1. **Install Python 3.12**
2. **Create a virtual environment & install requirements**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Run the server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
4. **Access the interactive documentation**:
   - Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Core API Documentation

Every response is wrapped in a standard JSON envelope format:
```json
{
  "success": true,
  "message": "Human-readable description",
  "data": ...
}
```

### 1. Authentication
- **`GET /auth/me`**: Get current user profile details.
  - *Header*: `Authorization: Bearer <JWT>`

### 2. Employees (Admin Restricted)
- **`POST /employees`**: Create employee.
  - *Payload*:
    ```json
    {
      "name": "Jane Smith",
      "email": "jane.smith@company.com",
      "role": "employee",
      "jobTitle": "Software Engineer",
      "department": "Engineering",
      "phone": "+1234567890",
      "address": "123 Main St, New York",
      "salary": 7500.0,
      "dateJoined": "2026-07-04"
    }
    ```
  - *Response (201 Created)*:
    ```json
    {
      "success": true,
      "message": "Employee profile created successfully",
      "data": {
        "id": "uuid",
        "employeeId": "ODJS260704001",
        "loginId": "jane.smith",
        "name": "Jane Smith",
        "email": "jane.smith@company.com",
        "role": "employee",
        "temporaryPassword": "Aq#7Pm9X",
        "dateJoined": "2026-07-04"
      }
    }
    ```
- **`GET /employees`**: List all employees (supports `page`, `limit`, `search`, `department`, `role` query parameters).
- **`GET /employees/me`**: Get own profile details.
- **`PUT /employees/me`**: Update own profile details (`phone`, `address`, `photoUrl`).
- **`GET /employees/{id}`**: Get specific employee profile.

### 3. Attendance
- **`POST /attendance/checkin`**: Employee check-in for the day. (Fails if already checked in today).
- **`POST /attendance/checkout`**: Employee check-out for the day. (Calculates working hours).
- **`GET /attendance/me`**: Employee views own history.
- **`GET /attendance/all`**: Admin views all attendance lists (supports `from_date`, `to_date`, `user_id`, `page`, `limit` parameters).

### 4. Leaves
- **`POST /leave/apply`**: Apply for leave (Fails if overlapping).
  - *Payload*: `{"leaveType": "paid", "startDate": "2026-07-10", "endDate": "2026-07-15", "remarks": "Vacation"}`
- **`GET /leave/my`**: Employee gets own leaves.
- **`GET /leave/all`**: Admin lists all leave requests (supports `status` query filter).
- **`PUT /leave/{id}/approve`**: Approve leave request (admin).
- **`PUT /leave/{id}/reject`**: Reject leave request (admin).

### 5. Payroll
- **`GET /payroll/me`**: Employee gets own payrolls.
- **`GET /payroll/all`**: Admin lists payroll records (supports `month`, `year` filters).
- **`PUT /payroll/{employeeId}`**: Create or update payroll by custom Employee ID string.
  - *Payload*:
    ```json
    {
      "month": 7,
      "year": 2026,
      "basicSalary": 7500.0,
      "allowances": 500.0,
      "deductions": 200.0,
      "status": "paid"
    }
    ```

### 6. Dashboard & Statistics
- **`GET /dashboard`**: Unified summary stats (Admin gets system metrics; Employee gets check-ins/notifications).
- **`GET /admin/statistics`**: Deep admin reporting on role/dept distribution, salaries, and attendance trend lines.

### 7. Notifications
- **`GET /notifications`**: Get paginated notifications (supports `isRead` filter).
- **`PUT /notifications/{id}/read`**: Mark specific notification as read.
- **`PUT /notifications/read-all`**: Mark all notifications as read.

---

## Render Deployment Guide

Follow these steps to deploy this FastAPI application to Render:

1. **Commit and Push**: Push your codebase to a Git repository (GitHub/GitLab).
2. **Create a Web Service on Render**:
   - Go to your Render Dashboard -> **New** -> **Web Service**.
   - Connect your Git repository.
3. **Configure Settings**:
   - **Name**: `hrms-backend`
   - **Environment**: `Python 3`
   - **Region**: Select target closest to users
   - **Branch**: `main`
   - **Root Directory**: `backend` (If backend files are contained inside `/backend` subfolder)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   Add the following environment variables in the Render dashboard environment configuration:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `PORT` (Render defines this automatically, but you can override if needed)
   - `DEBUG` (`False` for production)
5. **Deploy**: Render will automatically build the package and serve it at a public HTTPS URL.
