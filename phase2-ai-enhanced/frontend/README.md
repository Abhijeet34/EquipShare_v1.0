# Equipment Lending Portal - Frontend (Phase 1)

## Technology Stack
- React 18
- React Router for navigation
- Axios for API calls
- Custom CSS (Tailwind-like utilities)

## Prerequisites
- Node.js (v14 or higher)
- Backend server running on http://localhost:5000

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

Application will run on http://localhost:3000

## Features

### Student Features
- View available equipment
- Search and filter equipment
- Create borrow requests
- View own request history

### Staff/Admin Features
- All student features
- Approve/reject borrow requests
- Mark equipment as returned
- Manage equipment (add, edit, delete)

## Pages
- /login - User login
- /register - New user registration
- /equipment - Equipment listing with search/filter
- /request/new - Create new borrow request
- /requests - View and manage requests
- /admin - Equipment management (admin/staff only)

## Default Credentials
- Admin: admin@school.com / admin123
- Staff: staff@school.com / staff123
- Student: student1@school.com / student123
