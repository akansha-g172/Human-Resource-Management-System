# HRMS API Contract

Base URL (local): `http://localhost:8000`
Base URL (deployed): `<render-url-here>`

Auth header on all protected routes: `Authorization: Bearer <token>`
All responses are JSON, camelCase keys (Pydantic `alias_generator` handles snake_case → camelCase conversion server-side).

---

## Auth

### POST /signup
Auth: none
Request:
```json
{ "name": "string", "email": "string", "password": "string", "role": "admin" | "employee" }
```
Response 201:
```json
{ "id": "uuid", "name": "string", "email": "string", "role": "admin" | "employee" }
```
Response 400: `{ "error": "Email already registered" }`

### POST /login
Auth: none
Request:
```json
{ "email": "string", "password": "string" }
```
Response 200:
```json
{ "accessToken": "jwt-string", "userId": "uuid", "name": "string", "role": "admin" | "employee" }
```
Response 401: `{ "error": "Invalid email or password" }`

---

## Profile

### GET /profile/me
Auth: any logged-in user
Response 200:
```json
{
  "id": "uuid", "name": "string", "email": "string", "photoUrl": "string|null",
  "jobTitle": "string|null", "department": "string|null", "phone": "string|null",
  "address": "string|null", "salary": "number|null", "dateJoined": "YYYY-MM-DD"
}
```

### PATCH /profile/me
Auth: any logged-in user (can only edit own address/phone/photo)
Request (all optional):
```json
{ "phone": "string", "address": "string", "photoUrl": "string" }
```
Response 200: same shape as GET /profile/me

### GET /employees
Auth: admin only
Response 200: array of profile objects (same shape as above), all employees

### PATCH /employees/{userId}
Auth: admin only (can edit any field)
Request: any subset of employee fields (jobTitle, department, phone, address, salary)
Response 200: updated profile object

---

## Attendance

### POST /attendance/check-in
Auth: employee
Response 200:
```json
{ "id": "uuid", "date": "YYYY-MM-DD", "checkIn": "ISO timestamp", "status": "present" }
```
Response 400: `{ "error": "Already checked in today" }`

### POST /attendance/check-out
Auth: employee
Response 200:
```json
{ "id": "uuid", "date": "YYYY-MM-DD", "checkOut": "ISO timestamp" }
```
Response 400: `{ "error": "No active check-in found" }`

### GET /attendance/me?from=YYYY-MM-DD&to=YYYY-MM-DD
Auth: employee
Response 200: array of
```json
{ "id": "uuid", "date": "YYYY-MM-DD", "status": "present|absent|half-day|leave", "checkIn": "ts|null", "checkOut": "ts|null" }
```

### GET /attendance?userId=uuid&from=&to=
Auth: admin only. If `userId` omitted, returns all employees' records for the date range.
Response 200: array of
```json
{ "userId": "uuid", "userName": "string", "date": "YYYY-MM-DD", "status": "string", "checkIn": "ts|null", "checkOut": "ts|null" }
```

---

## Leave

### POST /leave
Auth: employee
Request:
```json
{ "leaveType": "paid" | "sick" | "unpaid", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "remarks": "string" }
```
Response 201:
```json
{ "id": "uuid", "leaveType": "string", "startDate": "date", "endDate": "date", "remarks": "string", "status": "pending", "createdAt": "ISO timestamp" }
```
Response 400: `{ "error": "endDate must be on or after startDate" }`

### GET /leave/me
Auth: employee
Response 200: array of leave request objects (own requests only), newest first

### GET /leave?status=pending
Auth: admin only. `status` query param optional filter.
Response 200: array of
```json
{
  "id": "uuid", "userId": "uuid", "userName": "string", "leaveType": "string",
  "startDate": "date", "endDate": "date", "remarks": "string",
  "status": "pending|approved|rejected", "reviewerComment": "string|null", "createdAt": "ISO timestamp"
}
```

### PATCH /leave/{id}/status
Auth: admin only
Request:
```json
{ "status": "approved" | "rejected", "reviewerComment": "string" }
```
Response 200: updated leave request object (same shape as above)
Response 403: `{ "error": "Admin only" }`
Response 404: `{ "error": "Leave request not found" }`

---

## Error shape (consistent across all endpoints)
```json
{ "error": "human-readable message" }
```

## Status code conventions
- 200 → success (read/update)
- 201 → success (created)
- 400 → validation error (bad input)
- 401 → not authenticated / invalid token
- 403 → authenticated but not authorized (wrong role)
- 404 → resource not found
