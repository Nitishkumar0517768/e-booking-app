# e-Booking API Documentation

## Base URL
- Local: `http://localhost:5000/api`
- Android Emulator: `http://10.0.2.2:5000/api`
- Physical Device / Production: `http://<LAN_IP>:5000/api` or configured backend URL.

## Authentication & Authorization
All secured endpoints expect the JWT token passed in the Authorization header:
```http
Authorization: Bearer <TOKEN>
```

---

## 1. System & Health

### `GET /api/health`
Health check endpoint.
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "e-Booking API is running successfully",
  "timestamp": "2026-11-15T06:39:36.000Z",
  "environment": "development"
}
```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
Register a new student account (always assigned `student` role).
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@college.edu",
  "password": "Password123!",
  "studentId": "ST-2026-001",
  "department": "Computer Science",
  "phone": "+1 555-0100"
}
```

### `POST /api/auth/login`
Authenticate a student or administrator.
- **Access:** Public
- **Request Body:**
```json
{
  "email": "admin@college.edu",
  "password": "Admin@123456"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6af952...",
      "name": "System Administrator",
      "email": "admin@college.edu",
      "role": "admin",
      "department": "Resource Management Center"
    },
    "token": "eyJhbGciOi..."
  }
}
```

### `GET /api/auth/me`
Get current authenticated user profile.
- **Access:** Authenticated (Student / Admin)

### `PATCH /api/auth/profile`
Update current user profile.
- **Access:** Authenticated (Student / Admin)
- **Request Body:**
```json
{
  "name": "Jane Doe Updated",
  "department": "Information Science",
  "phone": "+1 555-0101"
}
```

---

## 3. Resources (`/api/resources`)

### `GET /api/resources`
List resources with filters, search, and pagination.
- **Access:** Public / Authenticated
- **Query Params:**
  - `category`: `Electronics`, `Laboratory Equipment`, `Sports Equipment`, `Rooms and Facilities`, `Other Resources`
  - `search`: string keyword
  - `status`: `available`, `maintenance`, `inactive`
  - `page`: number (default: 1)
  - `limit`: number (default: 20)

### `GET /api/resources/:id`
Get resource details and real-time active reservation count.
- **Access:** Public / Authenticated

### `GET /api/resources/:id/availability`
Accurate interval availability check calculated via the sweep-line algorithm.
- **Access:** Public / Authenticated
- **Query Params:**
  - `startAt`: ISO DateTime string
  - `endAt`: ISO DateTime string
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "resourceId": "6af952...",
    "name": "Dell Precision 5570 Workstation Laptop",
    "totalQuantity": 8,
    "availableQuantity": 6,
    "maxReserved": 2,
    "overlappingCount": 1,
    "isBookable": true
  }
}
```

### `POST /api/resources`
Create a new resource.
- **Access:** Admin only
- **Request Body:**
```json
{
  "name": "4K Laser Projector",
  "description": "5000 Lumens Ultra HD Conference Projector",
  "category": "Electronics",
  "resourceType": "equipment",
  "imageUrl": "https://example.com/projector.jpg",
  "department": "Media Center",
  "location": "Room 201",
  "totalQuantity": 3,
  "condition": "New",
  "operationalStatus": "available",
  "requiresIssueReturn": true
}
```

### `PATCH /api/resources/:id`
Update resource information.
- **Access:** Admin only

### `PATCH /api/resources/:id/status`
Update operational status (`available`, `maintenance`, `inactive`).
- **Access:** Admin only

### `DELETE /api/resources/:id`
Soft-delete / archive resource.
- **Access:** Admin only

---

## 4. Bookings (`/api/bookings`)

### `POST /api/bookings`
Submit a booking request with double-booking prevention.
- **Access:** Student / Authenticated
- **Request Body:**
```json
{
  "resourceId": "6af952...",
  "quantity": 2,
  "startAt": "2026-11-20T10:00:00.000Z",
  "endAt": "2026-11-20T14:00:00.000Z",
  "purpose": "Hardware simulation lab test"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking request submitted successfully",
  "data": {
    "booking": {
      "_id": "6af953...",
      "bookingCode": "EB-2026-8812",
      "status": "Pending",
      "quantity": 2,
      "startAt": "2026-11-20T10:00:00.000Z",
      "endAt": "2026-11-20T14:00:00.000Z"
    }
  }
}
```

### `GET /api/bookings/my`
List bookings for the logged-in student.
- **Access:** Student / Authenticated
- **Query Params:** `status` (`All`, `Pending`, `Approved`, `Issued`, `Returned`, `Cancelled`, `Overdue`), `page`, `limit`

### `GET /api/bookings`
List all institution bookings.
- **Access:** Admin only
- **Query Params:** `status`, `search`, `page`, `limit`

### `GET /api/bookings/:id`
Get single booking details (ownership verified for students).
- **Access:** Booking Owner or Admin

### `PATCH /api/bookings/:id/cancel`
Cancel an upcoming `Pending` or `Approved` booking.
- **Access:** Booking Owner or Admin

### `PATCH /api/bookings/:id/decision`
Approve or reject a booking request.
- **Access:** Admin only
- **Request Body:**
```json
{
  "action": "approve", // or "reject"
  "remarks": "Approved for lab assignment",
  "rejectionReason": "Required only if action is reject"
}
```

### `PATCH /api/bookings/:id/issue`
Record equipment handed out to the student.
- **Access:** Admin only
- **Request Body:**
```json
{
  "remarks": "Equipment handed over with original charger and case"
}
```

### `PATCH /api/bookings/:id/return`
Record equipment safely returned and verified.
- **Access:** Admin only
- **Request Body:**
```json
{
  "remarks": "Equipment verified without damages"
}
```

---

## 5. Notifications (`/api/notifications`)

### `GET /api/notifications`
Get user in-app notifications and unread count.
- **Access:** Authenticated

### `PATCH /api/notifications/:id/read`
Mark a single notification as read.
- **Access:** Authenticated

### `PATCH /api/notifications/read-all`
Mark all notifications as read.
- **Access:** Authenticated

---

## 6. Admin Dashboard (`/api/admin`)

### `GET /api/admin/dashboard-summary`
Aggregated real-time metrics and latest activity.
- **Access:** Admin only
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalResources": 10,
      "activeResources": 10,
      "maintenanceResources": 0,
      "totalBookings": 12,
      "pendingRequests": 3,
      "approvedBookings": 4,
      "issuedEquipment": 2,
      "overdueEquipment": 0,
      "totalStudents": 28
    },
    "recentActivity": [...]
  }
}
```

