# Equipment Lending Portal - Backend (Phase 2)

## Technology Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Installation

### 1. Install MongoDB
```bash
brew install mongodb-community
brew services start mongodb-community
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create or update `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/equipment-lending
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Start Server
```bash
npm start
```

Server will run on http://localhost:5001

## Observability & Docs
- Swagger UI: GET http://localhost:5001/api/docs
- Health: GET http://localhost:5001/api/health
- Version: GET http://localhost:5001/api/version

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user (protected)

### Equipment
- GET /api/equipment - Get all equipment (with filters)
- GET /api/equipment/:id - Get equipment by ID
- POST /api/equipment - Create equipment (admin/staff)
- PUT /api/equipment/:id - Update equipment (admin/staff)
- DELETE /api/equipment/:id - Delete equipment (admin)

### Requests
- GET /api/requests - Get all requests
- GET /api/requests/overdue - Get overdue requests (admin/staff)
- GET /api/requests/:id - Get request by ID
- POST /api/requests - Create new request
- PUT /api/requests/:id/status - Update request status (admin/staff)
- DELETE /api/requests/:id - Delete request

### Analytics (admin/staff)
- GET /api/analytics/summary - Status counts, top equipment, monthly trend

## Default Users (after seeding)
- Admin: admin@school.com / admin123
- Staff: staff@school.com / staff123
- Student: student1@school.com / student123
