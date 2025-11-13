# EquipShare Demo - Quick Reference Card

## Quick Start

```bash
# Simplest way - Interactive menu
./manage.sh
# Then: Choose option 1 (Start) → Choose option 1 (Demo data)

# Or direct command
./manage.sh start
# When prompted for seeding, choose option 1 (Demo data)

# Or fully automated
./manage.sh demo    # Populates demo data only
./manage.sh start   # Then start services
```

Access: http://localhost:3000

---

## Test Credentials

**Basic Seed (4 users):**
| Role          | Email                 | Password     |
|---------------|-----------------------|--------------|
| **Admin**     | `admin@school.com`    | `Admin@123`  |
| **Staff**     | `staff@school.com`    | `Staff@123`  |
| **Student 1** | `student1@school.com` | `Student@123`|
| **Student 2** | `student2@school.com` | `Student@123`|

**Demo Data (5 users):**
| Role         | Email                  | Password     |
|--------------|------------------------|--------------|
| **Admin**    | `admin@school.com`     | `Admin@123`  |
| **Staff**    | `staff@school.com`     | `Staff@123`  |
| **Student 1**| `student1@school.com`  | `Student@123`|
| **Student 2**| `student2@school.com`  | `Student@123`|
| **Student 3**| `student3@school.com`  | `Student@123`|

---

## What's Pre-Populated

- **5 Users** (1 admin, 1 staff, 3 students)
- **18 Equipment Items** (all categories)
- **2 Pending Requests** (awaiting approval)
- **2 Approved Requests** (active borrows)
- **3 Overdue Requests** (1, 3, 7 days)
- **5 Returned Requests** (for analytics)
- **1 Rejected Request** (with reason)
- **1 Partial Return** (incremental return)

---

## Key Features to Demo

### As Student (student1@school.com)
1. Browse equipment catalog
2. Filter by category
3. View your pending request
4. Check approved borrow
5. Create new request

### As Staff (staff@school.com)
1. Approve/reject pending requests
2. Process returns
3. View overdue dashboard
4. Check analytics
5. Manage active borrows

### As Admin (admin@school.com)
1. All staff features +
2. Add/edit equipment
3. View all request history
4. Comprehensive analytics
5. System oversight

---

## Commands

### Demo Data
```bash
npm run demo          # Add demo data
npm run demo:reset    # Clear & fresh populate
```

### Application
```bash
./manage.sh start     # Start all services
./manage.sh stop      # Stop all services
./manage.sh status    # Check status
./manage.sh logs      # View logs
```

### Testing
```bash
node scripts/getToken.js admin@school.com    # Get API token
```

---

## Direct Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **API Docs**: http://localhost:5001/api/docs
- **Health Check**: http://localhost:5001/api/health

---

## Demo Scenarios

### Scenario 1: Request Workflow
1. Login as Student2 → View pending basketball request
2. Logout → Login as Staff → Approve request
3. Back to Student2 → See approved status

### Scenario 2: Overdue Management
1. Login as Staff/Admin
2. Navigate to Overdues tab
3. See 3 overdue items with different durations
4. Process a return

### Scenario 3: Analytics
1. Login as Admin
2. View Analytics dashboard
3. See 5 returned requests
4. Check utilization stats

### Scenario 4: Partial Returns
1. Login as Staff
2. Find John Student's Extension Cable request
3. Process partial return (1 of 3)
4. See "partial" status

---

## Pro Tips

- Use **multiple browser windows** or incognito for testing different roles simultaneously
- **Bookmark** the quick reference for presentations
- Run `npm run demo:reset` before each major demo for consistency
- Check Swagger docs at `/api/docs` for API exploration
- Use `getToken.js` for direct API testing

---

## Quick Troubleshooting

| Issue          | Solution                                               |
|----------------|--------------------------------------------------------|
| Can't login    | Verify you ran `npm run demo:reset`                    |
| No data        | Run demo script from backend folder                    |
| Port in use    | Run `./manage.sh stop` first                           |
| MongoDB error  | Check MongoDB: `brew services start mongodb-community` |

---

## Full Documentation

For comprehensive guide: `backend/scripts/DEMO_DATA_GUIDE.md`

---

**Last Updated**: 2025-11-09
**Version**: Phase 2 (AI-Enhanced)
