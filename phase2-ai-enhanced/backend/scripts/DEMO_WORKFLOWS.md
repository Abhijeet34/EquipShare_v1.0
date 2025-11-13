# Demo Data Testing Workflows

This guide provides step-by-step workflows for testing all major features using the pre-populated demo data.

## Setup

```bash
cd backend
npm run demo:reset
cd ..
./manage.sh start
```

Wait for services to start, then open http://localhost:3000

---

## Workflow 1: Student Request Lifecycle

### Objective
Test the complete journey of a borrowing request from creation to return.

### Steps

1. **Create Request (as Student)**
   - Login: `student1@school.com` / `Student@123`
   - Navigate to Equipment page
   - Find "USB Hub" (20 available)
   - Click "Borrow" → Fill form:
     - Quantity: 2
     - Borrow Date: Tomorrow
     - Return Date: 7 days from now
     - Reason: "Testing USB connectivity for project"
   - Submit request
   - ✓ Verify: Request appears in "My Requests" as PENDING
   - ✓ Verify: USB Hub available count decreased by 2

2. **Approve Request (as Staff)**
   - Logout → Login: `staff@school.com` / `Staff@123`
   - Navigate to Requests page
   - Find the new USB Hub request
   - Click "Approve"
   - Add approval note: "Approved for project work"
   - ✓ Verify: Request status changes to APPROVED
   - ✓ Verify: Inventory remains reserved

3. **Process Return (as Staff)**
   - Find the approved USB Hub request
   - Click "Mark as Returned"
   - Confirm return
   - ✓ Verify: Request status changes to RETURNED
   - ✓ Verify: USB Hub available count increased by 2

4. **View History (as Student)**
   - Logout → Login: `student1@school.com` / `Student@123`
   - Navigate to My Requests
   - Find the USB Hub request
   - Click to view details
   - ✓ Verify: Complete status history visible
   - ✓ Verify: Timestamps and actors shown

**Expected Result**: Complete request lifecycle from creation → approval → return with proper inventory management.

---

## Workflow 2: Overdue Management

### Objective
Test the overdue monitoring and resolution process.

### Pre-populated Data
- Jane Student (student2): 2 Footballs - 3 days overdue
- Mike Student (student3): 3 Arduino Kits - 7 days overdue
- Jane Student (student2): 1 Projector - 1 day overdue

### Steps

1. **View Overdue Dashboard**
   - Login: `admin@school.com` / `Admin@123`
   - Navigate to "Overdues" tab
   - ✓ Verify: All 3 overdue requests visible
   - ✓ Verify: Days overdue calculated correctly
   - ✓ Verify: Sorted by overdue duration

2. **Filter and Sort**
   - Sort by student name
   - Sort by days overdue
   - Filter by equipment category
   - ✓ Verify: Filters work correctly

3. **Process Overdue Return**
   - Select Jane's Projector request (1 day overdue)
   - Click "Process Return"
   - Confirm return
   - ✓ Verify: Request removed from overdue list
   - ✓ Verify: Inventory restored (Projector available +1)

4. **Contact Student (Simulated)**
   - View Mike's Arduino Kit request (7 days overdue)
   - Note student email and contact info
   - ✓ Verify: All necessary contact details visible

**Expected Result**: Clear visibility of overdue items with ability to track and process returns.

---

## Workflow 3: Analytics and Reporting

### Objective
Verify analytics dashboard shows accurate statistics from historical data.

### Pre-populated Data
- 5 completed (returned) requests
- Various equipment categories used
- Different time periods covered

### Steps

1. **View Summary Statistics**
   - Login: `admin@school.com` / `Admin@123`
   - Navigate to "Analytics" tab
   - ✓ Verify: Total requests count (14)
   - ✓ Verify: Status breakdown:
     - Pending: 2
     - Approved: 5
     - Returned: 5
     - Rejected: 1
     - Partial: 1

2. **Equipment Utilization**
   - View "Popular Equipment" section
   - ✓ Verify: Shows most borrowed items
   - ✓ Verify: Counts are accurate

3. **Category Analysis**
   - View breakdown by category
   - ✓ Verify: Categories shown: Sports, Lab, Electronics, Musical, Other
   - ✓ Verify: Request counts per category

4. **Time-based Trends**
   - View requests over time chart
   - ✓ Verify: Shows requests from past 3 weeks
   - ✓ Verify: Chart displays correctly

5. **Return Rate**
   - Check on-time vs late return statistics
   - ✓ Verify: Calculates percentage correctly
   - ✓ Verify: Shows overdue impacts

**Expected Result**: Comprehensive analytics dashboard with accurate real-world data.

---

## Workflow 4: Multi-Item Request

### Objective
Test requesting and managing multiple items in a single request.

### Pre-populated Data
- Mike Student has a multi-item request (Guitar + Camera)

### Steps

1. **View Multi-Item Request**
   - Login: `student3@school.com` / `Student@123`
   - View "My Requests"
   - Find request with Guitar and Camera
   - ✓ Verify: Both items shown in single request
   - ✓ Verify: Individual return dates visible
   - ✓ Verify: Quantities shown separately

2. **Create New Multi-Item Request**
   - Navigate to Equipment
   - Add "Whiteboard" (quantity: 1) to cart
   - Add "Projector" (quantity: 1) to cart
   - Submit single request for both
   - ✓ Verify: Single request ID created
   - ✓ Verify: Both items in same request

3. **Approve Multi-Item (as Staff)**
   - Login: `staff@school.com` / `Staff@123`
   - Find the multi-item request
   - Approve entire request
   - ✓ Verify: All items approved together
   - ✓ Verify: Inventory reserved for both

4. **Partial Return (as Staff)**
   - Return only the Whiteboard
   - Keep Projector as active borrow
   - ✓ Verify: Request status becomes PARTIAL
   - ✓ Verify: Whiteboard inventory restored
   - ✓ Verify: Projector remains borrowed

5. **Complete Return**
   - Return the Projector
   - ✓ Verify: Request status becomes RETURNED
   - ✓ Verify: All inventory restored

**Expected Result**: Seamless handling of multi-item requests with partial return support.

---

## Workflow 5: Request Rejection

### Objective
Test the rejection workflow and communication.

### Pre-populated Data
- Mike Student has a rejected Violin request

### Steps

1. **View Rejected Request (as Student)**
   - Login: `student3@school.com` / `Student@123`
   - Navigate to My Requests
   - Find rejected Violin request
   - ✓ Verify: Status shows REJECTED
   - ✓ Verify: Rejection reason visible
   - ✓ Verify: Rejected by staff name shown

2. **Create Request for Rejection Test**
   - Login: `student2@school.com` / `Student@123`
   - Request "Microscope" for 30 days
   - Submit request

3. **Reject Request (as Staff)**
   - Login: `staff@school.com` / `Staff@123`
   - Find the Microscope request
   - Click "Reject"
   - Add reason: "Duration exceeds maximum allowed (14 days). Please resubmit with shorter period."
   - Submit rejection
   - ✓ Verify: Request status changes to REJECTED
   - ✓ Verify: Inventory released back to available
   - ✓ Verify: Student notified (if notifications enabled)

4. **Verify Inventory Release**
   - Navigate to Equipment page
   - Find Microscope
   - ✓ Verify: Available count increased

5. **Re-submit Corrected Request (as Student)**
   - Login: `student2@school.com` / `Student@123`
   - Create new Microscope request
   - Duration: 7 days (within limit)
   - Submit
   - ✓ Verify: New request created successfully

**Expected Result**: Clear rejection workflow with reasons, inventory management, and ability to resubmit.

---

## Workflow 6: Equipment Management (Admin)

### Objective
Test CRUD operations on equipment items.

### Steps

1. **View Equipment Inventory**
   - Login: `admin@school.com` / `Admin@123`
   - Navigate to Equipment page
   - ✓ Verify: All 18 items visible
   - ✓ Verify: Available vs Total quantities shown

2. **Add New Equipment**
   - Click "Add Equipment"
   - Fill form:
     - Name: "VR Headset"
     - Category: Electronics
     - Quantity: 2
     - Condition: Excellent
     - Description: "Virtual Reality headset for educational experiences"
   - Submit
   - ✓ Verify: New item appears in list
   - ✓ Verify: Available = Total quantity

3. **Edit Equipment**
   - Find "VR Headset"
   - Click "Edit"
   - Change quantity to 4
   - Update description
   - Save
   - ✓ Verify: Changes reflected
   - ✓ Verify: Available quantity adjusted correctly

4. **Attempt to Delete Borrowed Equipment**
   - Find equipment that's currently borrowed (e.g., Microscope)
   - Try to delete
   - ✓ Verify: Deletion blocked with error message
   - ✓ Verify: Reason shown: "Equipment currently borrowed"

5. **Delete Available Equipment**
   - Find "VR Headset" (not borrowed)
   - Click "Delete"
   - Confirm deletion
   - ✓ Verify: Item removed from list

**Expected Result**: Full CRUD operations with protection against deleting borrowed items.

---

## Workflow 7: Role-Based Access Control

### Objective
Verify that each role has appropriate permissions.

### Steps

1. **Test Student Permissions**
   - Login: `student1@school.com` / `Student@123`
   - ✓ Can: View equipment
   - ✓ Can: Create requests
   - ✓ Can: View own requests
   - ✗ Cannot: See other students' requests
   - ✗ Cannot: Approve/reject requests
   - ✗ Cannot: Add/edit equipment
   - ✗ Cannot: Access Analytics
   - ✗ Cannot: Access Overdues

2. **Test Staff Permissions**
   - Login: `staff@school.com` / `Staff@123`
   - ✓ Can: All student permissions
   - ✓ Can: View all pending requests
   - ✓ Can: Approve/reject requests
   - ✓ Can: Mark as returned
   - ✓ Can: View Analytics
   - ✓ Can: View Overdues
   - ✗ Cannot: Add/edit/delete equipment
   - ✗ Cannot: View rejected requests

3. **Test Admin Permissions**
   - Login: `admin@school.com` / `Admin@123`
   - ✓ Can: All staff permissions
   - ✓ Can: Add/edit/delete equipment
   - ✓ Can: View all request history
   - ✓ Can: View rejected requests
   - ✓ Can: Full Analytics access
   - ✓ Can: System-wide oversight

**Expected Result**: Clear separation of permissions based on user role.

---

## Workflow 8: Partial Returns

### Objective
Test incremental return of borrowed items.

### Pre-populated Data
- John Student has Extension Cable request: 3 borrowed, 1 returned, 2 outstanding

### Steps

1. **View Partial Return Status**
   - Login: `staff@school.com` / `Staff@123`
   - Find John Student's Extension Cable request
   - ✓ Verify: Status shows PARTIAL
   - ✓ Verify: Shows "1 of 3 returned"
   - ✓ Verify: Outstanding quantity: 2

2. **Process Incremental Return**
   - Click "Process Return"
   - Select quantity: 1
   - Note condition: "Good"
   - Submit
   - ✓ Verify: Now shows "2 of 3 returned"
   - ✓ Verify: Outstanding quantity: 1
   - ✓ Verify: Inventory updated (+1)

3. **Complete Final Return**
   - Click "Process Return" again
   - Select quantity: 1 (last item)
   - Note condition: "Good"
   - Submit
   - ✓ Verify: Status changes to RETURNED
   - ✓ Verify: Shows "3 of 3 returned"
   - ✓ Verify: All inventory restored

4. **View Return History**
   - Click to view request details
   - ✓ Verify: Each partial return logged
   - ✓ Verify: Timestamps for each return
   - ✓ Verify: Conditions recorded

**Expected Result**: Smooth partial return process with accurate tracking.

---

## Workflow 9: Search and Filter

### Objective
Test search and filtering capabilities.

### Steps

1. **Search Equipment**
   - Login: any user
   - Navigate to Equipment
   - Search: "camera"
   - ✓ Verify: DSLR Camera shown
   - Clear search
   - Search: "arduino"
   - ✓ Verify: Arduino Kit shown

2. **Filter by Category**
   - Select category: "Sports"
   - ✓ Verify: Only Basketball and Football shown
   - Select category: "Lab"
   - ✓ Verify: Only Microscope and Chemistry Set shown
   - Select category: "All"
   - ✓ Verify: All equipment shown

3. **Filter by Availability**
   - Toggle "Available Only"
   - ✓ Verify: Only items with available > 0 shown
   - ✓ Verify: Borrowed-out items hidden
   - Toggle off
   - ✓ Verify: All items shown again

4. **Combined Filters**
   - Select category: "Electronics"
   - Toggle "Available Only"
   - ✓ Verify: Only available Electronics shown
   - Search: "camera"
   - ✓ Verify: Results match all criteria

5. **Filter Requests (as Staff)**
   - Login: `staff@school.com` / `Staff@123`
   - Navigate to Requests
   - Filter by status: "Pending"
   - ✓ Verify: Only pending requests shown
   - Filter by status: "Approved"
   - ✓ Verify: Only approved requests shown

**Expected Result**: Robust search and filtering across all pages.

---

## Workflow 10: API Testing with Swagger

### Objective
Test API endpoints directly using Swagger UI.

### Steps

1. **Generate Token**
   ```bash
   cd backend
   node scripts/getToken.js admin@school.com
   ```
   - Copy the generated token

2. **Access Swagger UI**
   - Open: http://localhost:5001/api/docs
   - Click "Authorize" button
   - Paste token (without "Bearer " prefix)
   - Click "Authorize"

3. **Test Equipment Endpoints**
   - GET /api/equipment
   - ✓ Verify: Returns all 18 items
   - GET /api/equipment/{id}
   - Use any equipment ID from previous response
   - ✓ Verify: Returns single item details

4. **Test Request Endpoints**
   - GET /api/requests
   - ✓ Verify: Returns all requests for admin
   - GET /api/requests/overdue
   - ✓ Verify: Returns 3 overdue requests

5. **Test Analytics Endpoint**
   - GET /api/analytics/summary
   - ✓ Verify: Returns statistics object
   - ✓ Verify: Contains counts, trends, popular items

6. **Test Create Request**
   - POST /api/requests
   - Use request body:
     ```json
     {
       "items": [
         {
           "equipment": "<equipment_id>",
           "quantity": 1,
           "returnDate": "2025-11-20"
         }
       ],
       "borrowDate": "2025-11-13",
       "reason": "API testing via Swagger"
     }
     ```
   - ✓ Verify: Request created successfully
   - ✓ Verify: Returns request with ID

**Expected Result**: All API endpoints accessible and functional via Swagger.

---

## Troubleshooting Common Issues

### Issue: Can't see pending requests as staff
**Solution**: Staff can only see pending/approved/returned requests, not rejected ones. This is by design for privacy.

### Issue: Can't delete equipment
**Solution**: Check if equipment is currently borrowed or has pending/approved requests. Deletion is blocked for data integrity.

### Issue: Inventory doesn't match expected
**Solution**: Run `node scripts/fixOrphanedInventory.js` then `npm run demo:reset`

### Issue: Request not appearing
**Solution**: Check you're logged in as the correct user role. Students only see their own requests.

### Issue: Analytics shows zero
**Solution**: Ensure demo data was populated. Run `npm run demo:reset`

---

## Summary

These workflows cover:
- ✓ Complete request lifecycle
- ✓ Overdue management
- ✓ Analytics and reporting
- ✓ Multi-item requests
- ✓ Request rejection
- ✓ Equipment CRUD
- ✓ Role-based permissions
- ✓ Partial returns
- ✓ Search and filtering
- ✓ API testing

**All features are immediately testable with the pre-populated demo data!**

For quick reference, see [DEMO_QUICK_REFERENCE.md](../../DEMO_QUICK_REFERENCE.md)
