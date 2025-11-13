# EquipShare - Role-Based Access Control (RBAC)

## Overview
EquipShare implements industry-standard role-based access control with three user roles:
- **Admin** - Full system control
- **Staff** - Operational management
- **Student** - End-user access

---

## Role Permissions Matrix

| Feature                      | Admin | Staff | Student |
|------------------------------|:-----:|:-----:|:-------:|
| **Equipment Management**     |       |       |         |
| View Equipment List          |  ✓    |  ✓    |   ✓     |
| Add New Equipment            |  ✓    |  ✓    |   ✗     |
| Edit Equipment               |  ✓    |  ✓    |   ✗     |
| Delete Equipment             |  ✓    |  ✗    |   ✗     |
| **Request Management**       |       |       |         |
| Create Request               |  ✓    |  ✓    |   ✓     |
| View Own Requests            |  ✓    |  ✓    |   ✓     |
| View All Requests            |  ✓    |  ✓    |   ✗     |
| Approve Requests             |  ✓    |  ✓    |   ✗     |
| Reject Requests              |  ✓    |  ✓    |   ✗     |
| **Notifications**            |       |       |         |
| Subscribe to Equipment       |  ✓    |  ✓    |   ✓     |
| Receive Email Notifications  |  ✓    |  ✓    |   ✓     |
| **Administrative**           |       |       |         |
| Access Admin Panel           |  ✓    |  ✓    |   ✗     |
| Manage Users                 |  ✓    |  ✗    |   ✗     |

---

## Detailed Permissions

### Admin Role
**Full Control** - Complete access to all system features

#### Equipment Management
- ✓ Create new equipment items
- ✓ Edit existing equipment (name, category, condition, quantity, description)
- ✓ Delete equipment (with safety checks)
  - Cannot delete if currently borrowed
  - Cannot delete if has pending/approved requests

#### Request Management
- ✓ View all requests from all users
- ✓ Approve pending requests
- ✓ Reject pending requests
- ✓ Create requests on behalf of users

#### User Management
- ✓ Access to all administrative functions
- ✓ System configuration
- ✓ View system logs

---

### Staff Role
**Operational Management** - Day-to-day equipment and request management

#### Equipment Management
- ✓ Create new equipment items
- ✓ Edit existing equipment details
- ✗ **Cannot delete equipment** (prevents accidental data loss)
  - UI hides delete button for staff
  - Backend enforces this restriction (403 Forbidden)

#### Request Management
- ✓ View all requests from all users
- ✓ Approve pending requests
- ✓ Reject pending requests
- ✓ Create requests

#### Rationale
Staff can manage inventory and handle requests but cannot permanently delete records. This follows industry best practices:
- Prevents accidental data deletion
- Maintains audit trails
- Requires admin oversight for destructive operations

---

### Student Role
**End-User Access** - Equipment borrowing and request management

#### Equipment Browsing
- ✓ View available equipment
- ✓ Search and filter equipment
- ✓ View equipment details
- ✓ Subscribe to out-of-stock notifications

#### Request Management
- ✓ Create equipment requests
- ✓ View own requests only
- ✓ Track request status
- ✗ Cannot view other users' requests
- ✗ Cannot approve/reject requests

#### Restrictions
- ✗ No access to Equipment Management panel
- ✗ No access to Admin panel
- ✗ Cannot modify equipment inventory
- ✗ Cannot manage other users' requests

---

## Implementation Details

### Backend Protection
Located in: `backend/routes/equipment.js`

```javascript
// Anyone can view equipment
.get(getEquipment)

// Admin and Staff can create
.post(protect, authorize('admin', 'staff'), createEquipment)

// Admin and Staff can edit
.put(protect, authorize('admin', 'staff'), updateEquipment)

// Only Admin can delete
.delete(protect, authorize('admin'), deleteEquipment)
```

### Frontend UI Controls
Located in: `frontend/src/pages/AdminPanel.js`

```javascript
// Delete button only shown to admins
{user?.role === 'admin' && (
  <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>
    Delete
  </button>
)}
```

### Route Protection
Located in: `frontend/src/App.js`

```javascript
// Admin/Staff only route
const AdminRoute = ({ children }) => {
  return user && (user.role === 'admin' || user.role === 'staff')
    ? children
    : <Navigate to="/equipment" />;
};
```

---

## Security Features

### Multi-Layer Protection
1. **Frontend UI** - Hides unauthorized actions
2. **Frontend Routing** - Redirects unauthorized users
3. **Backend API** - Enforces permissions at the server level
4. **Database** - Validates all operations

### Error Handling
- **403 Forbidden** - User lacks permission for action
- **401 Unauthorized** - User not authenticated
- **404 Not Found** - Resource doesn't exist or user lacks access

---

## Default Test Accounts

| Role      | Email                  | Password    | Access Level         |
|-----------|------------------------|-------------|----------------------|
| Admin     | admin@school.com       | Admin@123   | Full access          |
| Staff     | staff@school.com       | Staff@123   | Create/Edit only     |
| Student   | student1@school.com    | Student@123 | View/Request only    |

---

## Best Practices Implemented

### 1. Principle of Least Privilege
Each role has only the permissions necessary for their function.

### 2. Defense in Depth
Multiple layers of security checks (UI, routing, API, database).

### 3. Fail Secure
Unauthorized actions return errors rather than allowing access.

### 4. Clear User Feedback
Users see only the actions they can perform - no confusing disabled buttons.

### 5. Audit Trail
All equipment modifications are trackable through request history.

---

## Future Enhancements

### Potential Additional Features
- [ ] Role-based dashboard widgets
- [ ] Request approval workflows (multi-level)
- [ ] Equipment maintenance logs (admin/staff only)
- [ ] Automated role assignment rules
- [ ] Custom role creation
- [ ] Permission inheritance models
- [ ] Activity logs per role

---

## Testing Role Permissions

### Manual Testing
1. Log in as each role
2. Attempt to access restricted features
3. Verify appropriate error messages
4. Check UI hides unauthorized actions

### Automated Testing
See `backend/tests/` for role-based API tests.

---

**Last Updated:** November 09, 2025
**Version:** 1.0
**Author:** Abhijeet Halder
