# School Equipment Lending Portal - Phase 2 (AI-Enhanced)

## Overview
Full-stack web application for managing school equipment loans with role-based access control.

## Project Structure
```
phase1-manual/
├── backend/          # Node.js + Express API
└── frontend/         # React Application
```

## Features Implemented

New in Phase 2:
- Swagger docs at /api/docs
- Health and version endpoints
- Overdue monitor + Admin Overdues screen
- Analytics summary endpoint + Admin Analytics screen with charts
- Security hardening (helmet, morgan, CORS whitelist)

### Core Features
- User Authentication & Authorization (JWT-based)
- Role-based Access Control (Student, Staff, Admin)
- Equipment Management (CRUD operations)
- Borrow Request System
- Request Approval Workflow
- Equipment Availability Tracking
- Overlapping Booking Prevention
- Search & Filter Functionality

### User Roles
- **Student**: View equipment, create requests, view own requests
- **Staff**: Student features + approve/reject requests, mark as returned
- **Admin**: All features + equipment management (add/edit/delete)

## Technology Stack

### Backend
- Node.js v18+
- Express.js v4
- MongoDB v4.4+
- Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router v6
- Axios for HTTP requests
- Custom CSS with utility classes

## Quick Start

### Prerequisites
1. Node.js (v14 or higher)
2. MongoDB (v4.4 or higher)

### Installation

1. Install MongoDB:
```bash
brew install mongodb-community
```

2. Start the application:
```bash
./manage.sh start
```

That's it! The script will:
- Start MongoDB if not running
- Install dependencies if needed
- Create .env file from template
- Seed database with initial data
- Start backend on port 5001
- Start frontend on port 3000

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

### Management Commands

The `manage.sh` script works in two modes:

**Interactive Mode** (recommended for beginners):
```bash
./manage.sh            # Shows interactive menu
```

**Command Mode** (for quick operations):
```bash
./manage.sh start      # Start all services
./manage.sh stop       # Stop all services and clean up
./manage.sh restart    # Restart all services
./manage.sh status     # Check service status
./manage.sh seed       # Seed database
./manage.sh reseed     # Clear and reseed database
./manage.sh logs       # View logs (backend, frontend, all)
./manage.sh clean      # Clean caches and temp files
./manage.sh help       # Show all commands
```

### Default Login Credentials

**Basic Seed (4 users):**
- Admin: admin@school.com / Admin@123
- Staff: staff@school.com / Staff@123
- Student 1: student1@school.com / Student@123
- Student 2: student2@school.com / Student@123

**Demo Data (5 users):**
- Admin: admin@school.com / Admin@123
- Staff: staff@school.com / Staff@123
- Student 1: student1@school.com / Student@123
- Student 2: student2@school.com / Student@123
- Student 3: student3@school.com / Student@123

### Demo Data Population (NEW!)

When you run `./manage.sh start` for the first time on an empty database, you'll be prompted to choose:

**Option 1: Demo Data (Recommended)**
- 5 users (admin, staff, 3 students)
- 18 equipment items across all categories
- 2 pending requests
- 2 approved requests
- 3 overdue requests (for testing overdue management)
- 5 returned requests (for analytics)
- 1 rejected request
- 1 partial return
- **Perfect for demos, testing, and showcasing all features immediately!**

**Option 2: Basic Data**
- 4 users (admin, staff, 2 students)
- 18 equipment items
- No requests (start from scratch)

```bash
# Integrated into manage.sh - just run:
./manage.sh start    # Choose option 1 for demo data

# Or populate demo data directly:
./manage.sh demo     # Then ./manage.sh start

# Or via npm (manual):
cd backend && npm run demo:reset
```

**Quick Reference**: See [DEMO_QUICK_REFERENCE.md](./DEMO_QUICK_REFERENCE.md) for credentials and demo scenarios
**Full Guide**: See [backend/scripts/DEMO_DATA_GUIDE.md](./backend/scripts/DEMO_DATA_GUIDE.md) for comprehensive documentation

## API Documentation

### Authentication Endpoints
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/auth/register  | Register new user   |
| POST   | /api/auth/login     | User login          |
| GET    | /api/auth/me        | Get current user    |

### Equipment Endpoints
| Method | Endpoint                | Access      | Description            |
|--------|-------------------------|-------------|------------------------|
| GET    | /api/equipment          | All         | Get all equipment      |
| GET    | /api/equipment/:id      | All         | Get equipment by ID    |
| POST   | /api/equipment          | Admin/Staff | Create equipment       |
| PUT    | /api/equipment/:id      | Admin/Staff | Update equipment       |
| DELETE | /api/equipment/:id      | Admin       | Delete equipment       |

### Request Endpoints
| Method | Endpoint                    | Access       | Description      |
|--------|-----------------------------|--------------|------------------|
| GET    | /api/requests               | All          | Get requests     |
| POST   | /api/requests               | All          | Create request   |
| PUT    | /api/requests/:id/status    | Admin/Staff  | Update status    |
| DELETE | /api/requests/:id           | Owner/Admin  | Delete request   |

## Database Schema

### User
- name, email, password, role (student/staff/admin)

### Equipment
- name, category, condition, quantity, available, description

### Request
- user, equipment, quantity, borrowDate, returnDate, status, reason, approvedBy

## Documentation

### Phase 1 Specific Documentation
- **[docs/SECURITY.md](./docs/SECURITY.md)** - Comprehensive security guide covering RBAC, authentication, OTP verification, rate limiting, reCAPTCHA, and testing procedures
- **[docs/ROLE_PERMISSIONS.md](./docs/ROLE_PERMISSIONS.md)** - Detailed role-based access control implementation and testing
- **[docs/EQUIPMENT_DELETION_HANDLING.md](./docs/EQUIPMENT_DELETION_HANDLING.md)** - Equipment deletion logic and request integrity handling

### Component Documentation
- **[backend/README.md](./backend/README.md)** - Backend setup and API documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend setup and features

### Project-Wide Documentation (Root Level)
- **[../docs/QUICKSTART.md](../docs/QUICKSTART.md)** - Quick start guide for both phases
- **[../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)** - System architecture and API documentation
- **[../docs/REQUIREMENTS.md](../docs/REQUIREMENTS.md)** - System requirements and setup
- **[../docs/AI_USAGE_LOG.md](../docs/AI_USAGE_LOG.md)** - AI usage and reflection report

## Security Features

- JWT-based authentication with token expiration
- Role-based access control (Student, Staff, Admin)
- Email OTP verification for password reset
- Account lockout after 5 failed attempts
- IP-based rate limiting
- reCAPTCHA v2 protection on critical forms
- Comprehensive audit logging
- Multiple security layers (frontend + backend)

See [SECURITY.md](./SECURITY.md) for detailed security documentation and testing procedures.

## Development Approach

This is Phase 1 - built manually without AI assistance to understand core concepts and establish baseline functionality.
