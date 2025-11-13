# System Architecture Documentation

## Equipment Lending Portal - Full Stack Application

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Component Hierarchy](#component-hierarchy)
7. [Data Flow](#data-flow)
8. [Security](#security)

---

## System Overview

The Equipment Lending Portal is a full-stack web application designed to manage school equipment borrowing and returns. It features role-based access control, real-time availability tracking, and an approval workflow system.

### Key Features
- JWT-based authentication
- Role-based authorization (Student, Staff, Admin)
- Equipment CRUD operations
- Borrow request management
- Overlap prevention for bookings
- Search and filter capabilities

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               React Application                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐     │   │
│  │  │  Pages   │ │Components│ │   State Mgmt     │     │   │
│  │  │          │ │          │ │ (localStorage)   │     │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘     │   │
│  │                     │                               │   │
│  │                     │ Axios HTTP Client             │   │
│  └────────────────────-┼───────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         │
┌────────────────────────┼──────────────────────────────────┐
│                        ▼                                  │
│                   SERVER LAYER                            │
│  ┌───────────────────────────────────────────────────┐    │
│  │           Node.js + Express Server                │    │
│  │                                                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │    │
│  │  │ Routes   │ │Middleware│ │   Controllers    │   │    │
│  │  │          │ │  - Auth  │ │                  │   │    │
│  │  │          │ │  - Error │ │                  │   │    │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │    │
│  │                     │                             │    │
│  │                     │ Mongoose ODM                │    │
│  └────────────────────-┼─────────────────────────────┘    │
└────────────────────────┼──────────────────────────────────┘
                         │
                         │
┌────────────────────────┼─────────────────────────────-────┐
│                        ▼                                  │
│                  DATABASE LAYER                           │
│  ┌───────────────────────────────────────────────────┐    │
│  │                  MongoDB                          │    │
│  │                                                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │    │
│  │  │  Users   │ │Equipment │ │    Requests      │   │    │
│  │  │Collection│ │Collection│ │   Collection     │   │    │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │    │
│  └───────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS (utility-based)
- **State Management**: React Hooks + localStorage

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4
- **Database**: MongoDB 8
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **AI Assistant**: Claude (Phase 2)

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min: 6),
  role: String (enum: ['student', 'staff', 'admin'], default: 'student'),
  createdAt: Date (default: Date.now)
}
```

**Indexes**: email (unique)

### Equipment Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  category: String (required, enum: ['Sports', 'Lab', 'Electronics', 'Musical', 'Other']),
  condition: String (enum: ['Excellent', 'Good', 'Fair', 'Poor'], default: 'Good'),
  quantity: Number (required, min: 0),
  available: Number (required, min: 0),
  description: String,
  createdAt: Date (default: Date.now)
}
```

**Business Logic**: available = quantity - borrowed_count

### Request Collection (Phase 2 schema)
```javascript
{
  _id: ObjectId,
  requestId: String (unique, e.g., REQ-000123),
  user: ObjectId (ref: 'User', required),
  borrowDate: Date (required),
  items: [{
    equipment: ObjectId (ref: 'Equipment', required),
    equipmentName: String (required),
    equipmentCategory: String (required),
    quantity: Number (required, min: 1),
    returnDate: Date (required),
    status: String (enum: ['pending','approved','rejected','returned','expired','overdue'], default: 'pending'),
    actualReturnDate: Date
  }],
  status: String (enum: ['pending','approved','rejected','returned','partial','expired','overdue'], default: 'pending'),
  expiresAt: Date (auto-expiry for pending requests),
  reason: String (required),
  approvedBy: ObjectId (ref: 'User'),
  rejectedBy: ObjectId (ref: 'User'),
  statusHistory: [{ status, changedBy: ObjectId, changedAt: Date, comment: String }],
  createdAt: Date (default: Date.now)
}
```

**Relationships**:
- User → Requests (one-to-many)
- Equipment → Request.items.equipment (one-to-many)
- User (approvedBy / rejectedBy) → Requests

---

## API Documentation

### Base URL
```
http://localhost:5001/api
```

### Observability and Docs
- GET /health — API health
- GET /version — API version
- GET /docs — Swagger UI

### New Endpoints (Phase 2)
- GET /requests/overdue — List overdue requests (admin/staff)
- GET /analytics/summary — Usage analytics (admin/staff)

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "name": "string",
  "email": "string",
  "password": "string (min 6 chars)",
  "role": "student|staff|admin"
}

Response: 201 Created
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Equipment Endpoints

#### Get All Equipment
```http
GET /equipment?category=Sports&search=ball&available=true
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "equipment_id",
      "name": "string",
      "category": "string",
      "condition": "string",
      "quantity": 10,
      "available": 8,
      "description": "string",
      "createdAt": "date"
    }
  ]
}
```

#### Get Equipment by ID
```http
GET /equipment/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": { equipment_object }
}
```

#### Create Equipment (Admin/Staff)
```http
POST /equipment
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "string",
  "category": "Sports|Lab|Electronics|Musical|Other",
  "condition": "Excellent|Good|Fair|Poor",
  "quantity": number,
  "description": "string"
}

Response: 201 Created
{
  "success": true,
  "data": { equipment_object }
}
```

#### Update Equipment (Admin/Staff)
```http
PUT /equipment/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body: (partial update)
{
  "name": "string",
  "quantity": number,
  ...
}

Response: 200 OK
{
  "success": true,
  "data": { updated_equipment }
}
```

#### Delete Equipment (Admin)
```http
DELETE /equipment/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {}
}
```

### Request Endpoints

#### Get All Requests
```http
GET /requests
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "request_id",
      "user": { populated_user },
      "equipment": { populated_equipment },
      "quantity": number,
      "status": "string",
      "borrowDate": "date",
      "returnDate": "date",
      "reason": "string",
      "createdAt": "date"
    }
  ]
}
```

#### Create Request
```http
POST /requests
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "equipment": "equipment_id",
  "quantity": number,
  "borrowDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD",
  "reason": "string"
}

Response: 201 Created
{
  "success": true,
  "data": { request_object }
}
```

#### Update Request Status (Admin/Staff)
```http
PUT /requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "status": "approved|rejected|returned"
}

Response: 200 OK
{
  "success": true,
  "data": { updated_request }
}
```

---

## Component Hierarchy

### Frontend Component Structure

```
App
├── Router
│   ├── Navbar (user, setUser)
│   └── Routes
│       ├── Login (setUser)
│       ├── Register (setUser)
│       ├── EquipmentList
│       ├── NewRequest
│       ├── RequestsList (user)
│       └── AdminPanel
│
├── Shared Components
│   ├── Loading
│   └── ErrorMessage
│
└── Utils
    └── api.js (Axios instance)
```

---

## Data Flow

### Authentication Flow
```
1. User enters credentials → Login component
2. POST /api/auth/login → Backend validates
3. Backend generates JWT → Returns token + user
4. Frontend stores token in localStorage
5. Frontend stores user in state + localStorage
6. All subsequent API calls include token in Authorization header
```

### Equipment Request Flow
```
1. User views equipment → GET /api/equipment
2. User selects item → Navigate to NewRequest
3. User fills form → POST /api/requests
4. Backend validates:
   - Equipment exists
   - Quantity available
   - Date validity
   - No overlapping bookings
5. Request created → Navigate to RequestsList
6. Admin/Staff views requests → GET /api/requests
7. Admin approves → PUT /api/requests/:id/status
8. Backend updates equipment.available
9. Request status updated → Frontend refreshes
```

---

## Security

### Authentication
- JWT tokens with configurable expiry
- Passwords hashed with bcryptjs (salt rounds: 10)
- Tokens stored in localStorage (client-side)
- Tokens sent via Authorization header

### Authorization
- Middleware checks token validity
- Role-based access control (RBAC)
- Protected routes require authentication
- Admin/Staff routes require elevated permissions

### Input Validation
- Email regex validation
- Password minimum length (6 characters)
- Date validation (borrow < return, >= today)
- Quantity validation (> 0, <= available)
- Sanitization of string inputs (trim)

### Error Handling
- Generic error messages to prevent information leakage
- Specific errors for TokenExpiredError
- 401 for unauthorized, 403 for forbidden
- 400 for validation errors, 404 for not found

---

## Deployment Considerations

### Environment Variables
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/equipment-lending
JWT_SECRET=secure_random_string
JWT_EXPIRE=7d
NODE_ENV=production
```

### Production Checklist
- [ ] Use strong JWT_SECRET
- [ ] Enable CORS with specific origins
- [ ] Use HTTPS for all communications
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up MongoDB replica set
- [ ] Implement database backups
- [ ] Use environment-specific configs
- [ ] Add health check endpoint
- [ ] Implement graceful shutdown

---

## Assumptions

1. **User Management**: Users self-register (no admin approval required)
2. **Equipment**: Single location for all equipment
3. **Booking**: No partial returns (all or nothing)
4. **Availability**: Calculated real-time from requests
5. **Dates**: Borrow/return dates are full days (no time)
6. **Overlap**: Same equipment, overlapping dates prevented
7. **Deletion**: Equipment can't be deleted if borrowed
8. **Approval**: Only staff/admin can approve requests
9. **Students**: Can only view own requests
10. **Authentication**: Token stored client-side (localStorage)

---

## Future Enhancements

- Email notifications for approvals/rejections
- Request history and analytics dashboard
- Equipment damage/repair logging
- Overdue tracking with automated reminders
- Image upload for equipment
- Multi-location support
- Reservation system (book in advance)
- Equipment categories with sub-categories
- User profile management
- Export reports (PDF/CSV)
