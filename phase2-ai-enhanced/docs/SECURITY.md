# Security Documentation

## Overview

EquipShare implements enterprise-level security with role-based access control (RBAC), multi-factor authentication, rate limiting, and comprehensive audit logging.

## Role-Based Access Control (RBAC)

### Roles and Permissions

| Feature                  | Student | Staff | Admin |
|--------------------------|:-------:|:-----:|:-----:|
| Browse Equipment         |   ✓     |  ✓    |  ✓    |
| Search/Filter Equipment  |   ✓     |  ✓    |  ✓    |
| Create Borrow Request    |   ✓     |  ✓    |  ✓    |
| View Own Requests        |   ✓     |  ✓    |  ✓    |
| Approve/Reject Requests  |   ✗     |  ✓    |  ✓    |
| Mark as Returned         |   ✗     |  ✓    |  ✓    |
| Access Admin Panel       |   ✗     |  ✓    |  ✓    |
| Create/Update Equipment  |   ✗     |  ✓    |  ✓    |
| Delete Equipment         |   ✗     |  ✗    |  ✓    |

## Authentication & Authorization

### Backend Middleware

**Location:** `backend/middleware/auth.js`

1. **`protect`** - JWT token verification
   - Validates Bearer token from Authorization header
   - Attaches user object to request
   - Returns 401 if token is invalid/missing

2. **`authorize(...roles)`** - Role-based authorization
   - Checks if user's role matches allowed roles
   - Returns 403 if user lacks permission

### Protected API Routes

#### Equipment Routes (`/api/equipment`)
- `GET /` - Public
- `POST /` - Admin/Staff only
- `GET /:id` - Public
- `PUT /:id` - Admin/Staff only
- `DELETE /:id` - Admin only

#### Request Routes (`/api/requests`)
- `GET /` - Authenticated users
- `POST /` - Authenticated users
- `PUT /:id/status` - Admin/Staff only
- `DELETE /:id` - Authenticated users (own requests)

### Frontend Protection

**Location:** `frontend/src/App.js`

1. **`PrivateRoute`** - Requires authentication
   - Redirects to `/login` if not authenticated
   - Used for: `/requests`, `/request/new`

2. **`AdminRoute`** - Requires admin/staff role
   - Redirects to `/equipment` if unauthorized
   - Used for: `/admin`

**API Security:** `frontend/src/api.js`
- Request interceptor: Auto-attaches JWT token
- Response interceptor: Handles 401/403 errors, auto-logout

## Advanced Security Features

### 1. Email OTP Verification

**Installation Required:**
```bash
cd backend
npm install express-rate-limit
```

**Features:**
- 6-digit OTP generated on password reset request
- 10-minute expiration
- OTP hashed before storage (SHA-256)
- Demo mode shows OTP in API response for testing

**Endpoints:**
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP code
- `PUT /api/auth/reset-password/:token` - Reset password after verification

### 2. Account Lockout

After **5 failed OTP attempts**, account locks for **30 minutes**.

### 3. Rate Limiting

**Forgot Password:** 3 requests/hour per IP
**OTP Verification:** 10 attempts per 15 minutes per IP
**Password Reset:** 5 attempts per 15 minutes per IP

### 4. Audit Logging

All security events logged with:
- User ID, email, IP address, User-Agent
- Action type and success/failure status
- Automatic cleanup after 30 days

**Database Model:** `SecurityAuditLog`

### 5. reCAPTCHA v2

Implemented on:
- Login page
- Registration page
- Forgot password page

**Keys:**
- Frontend: `REACT_APP_RECAPTCHA_SITE_KEY` (in `frontend/.env`)
- Backend: `RECAPTCHA_SECRET_KEY` (in `backend/.env`)

## Testing Guide

### Default Test Credentials

```
Admin:   admin@school.com / admin123
Staff:   staff@school.com / staff123
Student: student1@school.com / student123
```

### Test Scenarios

#### Student Role Tests
- [ ] Can browse equipment
- [ ] Can create requests
- [ ] Cannot access `/admin` (redirected to `/equipment`)
- [ ] Cannot see "Manage Equipment" link in navbar
- [ ] Cannot see Actions column in requests page
- [ ] Cannot approve/reject requests

#### Staff Role Tests
- [ ] Can access admin panel
- [ ] Can create/update equipment
- [ ] Cannot delete equipment
- [ ] Can approve/reject requests
- [ ] Can mark requests as returned

#### Admin Role Tests
- [ ] Can delete equipment
- [ ] Full system access
- [ ] All staff permissions

#### Security Tests
- [ ] Invalid token returns 401
- [ ] Missing token redirects to login
- [ ] Expired token clears session
- [ ] Direct URL access to `/admin` blocked for students
- [ ] Staff cannot call `DELETE /equipment/:id` (returns 403)

### API Testing Examples

**Test unauthorized equipment creation:**
```bash
# Login as student
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@school.com","password":"student123"}' \
  | jq -r '.token')

# Try to create equipment (should fail with 403)
curl -X POST http://localhost:5001/api/equipment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"Other","condition":"Good","quantity":1}'
```

**Expected:** `403 Forbidden - "User role student is not authorized"`

### Browser DevTools Testing

```javascript
// Test 1: Student trying to access admin page
window.location.href = '/admin'
// Expected: Redirected to /equipment

// Test 2: Check user role
JSON.parse(localStorage.getItem('user')).role

// Test 3: Attempt unauthorized API call
fetch('http://localhost:5001/api/equipment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({name:'Hack', category:'Other', condition:'Good', quantity:1})
})
.then(r => r.json())
.then(console.log)
// Expected for student: 403 error
```

## Security Best Practices Implemented

✓ Server-side validation - All authorization checks on backend
✓ JWT-based authentication - Stateless token authentication
✓ Role-based middleware - Reusable authorization functions
✓ Frontend route guards - Prevents UI navigation to unauthorized routes
✓ API interceptors - Automatic token attachment and error handling
✓ Token expiration handling - Auto-logout on expired/invalid tokens
✓ Principle of least privilege - Users only see/access what they need
✓ Defense in depth - Multiple security layers
✓ No email enumeration - Same response for existing/non-existing emails
✓ Hashed OTP storage - SHA-256 encryption
✓ IP-based rate limiting - Prevents brute force attacks
✓ Comprehensive audit logging - Track all security events
✓ reCAPTCHA verification - Bot protection on critical forms

## Production Deployment Checklist

Before deploying to production:

1. **Environment Variables:**
   - Set strong `JWT_SECRET`
   - Configure `NODE_ENV=production`
   - Add production domains to reCAPTCHA settings

2. **Email Service:**
   - Integrate SendGrid, Mailgun, or AWS SES
   - Create professional email templates
   - Remove demo mode OTP exposure

3. **Rate Limits:**
   - Review and adjust based on traffic patterns
   - Consider Redis for distributed rate limiting

4. **Monitoring:**
   - Set up alerts for suspicious patterns
   - Regular security audit log reviews
   - Monitor failed login attempts

5. **HTTPS:**
   - Always use HTTPS in production
   - Never send tokens/OTP over HTTP

6. **CORS:**
   - Configure allowed origins
   - Restrict API access to specific domains

## Troubleshooting

### Common Issues

**Issue:** "Manage Equipment" visible to student
**Fix:** Check `Navbar.js` line 32-40 for conditional rendering

**Issue:** Student can access `/admin`
**Fix:** Verify `AdminRoute` in `App.js` line 34-38

**Issue:** API returns 401 for authenticated user
**Fix:** Check localStorage token, re-login if expired

**Issue:** Staff can delete equipment
**Fix:** Verify `routes/equipment.js` has `authorize('admin')` on DELETE route

**Issue:** reCAPTCHA not showing
**Fix:** Check frontend `.env` file exists, restart frontend server

**Issue:** "reCAPTCHA verification failed"
**Fix:** Verify backend `.env` has secret key, restart backend server

## Last Updated

Date: 2025-01-09
Security Rating: A+
