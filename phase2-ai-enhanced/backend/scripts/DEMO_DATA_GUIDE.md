# Demo Data Population Guide

## Quick Command Reference

| What You Want                        | Command                              | Notes                 |
|--------------------------------------|--------------------------------------|-----------------------|
| Start with demo data                 | `./manage.sh start` → Choose 1       | Recommended for demos |
| Start with basic data                | `./manage.sh start` → Choose 2       | Clean slate           |
| Switch to demo (services running)    | `./manage.sh demo`                   | No need to stop!      |
| Switch to basic (services running)   | `./manage.sh reseed` → Choose 2      | No need to stop!      |
| Reset to demo data                   | `./manage.sh reseed` → Choose 1      | Clears & repopulates  |

💡 **Pro Tip:** You can switch data types without stopping services - just run the command and refresh your browser!

---

## Overview

The `populateDemoData.js` script is a comprehensive utility designed to automatically seed your EquipShare database with realistic demo data that showcases all application features and functionalities. This eliminates the need for manual data entry and allows you to immediately demonstrate the full capabilities of the system.

## Features

### What This Script Does

1. **Seeds Base Data**
   - Creates 5 users (1 admin, 1 staff, 3 students)
   - Creates 18 different equipment items across all categories
   - Sets up proper initial inventory levels

2. **Creates Pending Requests**
   - Demonstrates the request approval workflow
   - Shows how students submit equipment requests
   - Tests the 24-hour auto-expiration feature

3. **Creates Approved Requests**
   - Shows active borrowing scenarios
   - Demonstrates multi-item requests
   - Tests inventory reservation

4. **Creates Overdue Requests**
   - Populates the Overdue Management dashboard
   - Shows items with different overdue periods (1, 3, 7 days)
   - Enables testing of overdue notifications

5. **Creates Returned Requests**
   - Populates Analytics dashboard with historical data
   - Shows successful return scenarios
   - Provides data for statistics and reports

6. **Creates Rejected Requests**
   - Demonstrates the rejection workflow
   - Shows rejection reasons
   - Tests request history tracking

7. **Creates Partial Returns**
   - Shows incremental return functionality
   - Tests partial inventory releases
   - Demonstrates the "partial" status

## Usage

### Basic Usage

```bash
# From backend directory
node scripts/populateDemoData.js

# Or using npm script
npm run demo
```

This will add demo data to your existing database without clearing it.

### Reset and Populate

```bash
# Clear all data and populate fresh
node scripts/populateDemoData.js --reset

# Or using npm script
npm run demo:reset
```

⚠️ **Warning**: The `--reset` flag will delete ALL existing data including:
- All users (except those you manually created)
- All equipment
- All requests
- Request counter

### When to Use Each Option

| Scenario             | Command               | Use Case                       |
|----------------------|-----------------------|--------------------------------|
| Initial setup        | `npm run demo:reset`  | First time setting up demo     |
| Demo prep            | `npm run demo:reset`  | Before a presentation          |
| Testing new features | `npm run demo`        | Add more test data             |
| Clean slate          | `npm run demo:reset`  | Start fresh after testing      |

## What Gets Created

### Users

**Demo Data creates 5 users:**

| Name          | Email                | Password     | Role    | Purpose                |
|---------------|----------------------|--------------|---------|------------------------|
| Admin User    | admin@school.com     | Admin@123    | admin   | Full system access     |
| Staff Member  | staff@school.com     | Staff@123    | staff   | Approve/manage requests|
| John Student  | student1@school.com  | Student@123  | student | Test user #1           |
| Jane Student  | student2@school.com  | Student@123  | student | Test user #2           |
| Mike Student  | student3@school.com  | Student@123  | student | Test user #3           |

*Note: Basic seed creates only 4 users (admin, staff, student1, student2)*

### Equipment Categories

- **Sports**: Basketball (10), Football (8)
- **Lab**: Microscope (5), Chemistry Set (6)
- **Electronics**: DSLR Camera (3), Arduino Kit (15), **VR Headset (2, 0 available)**, **Studio Light Kit (1, 0 available)**
- **Musical**: Acoustic Guitar (4), Violin (2), **Digital Piano (3, 1 available)**
- **Other**: Projector (4), Whiteboard (6), Extension Cable (12), Wireless Microphone (8), Laptop Stand (15), Document Scanner (3), Presentation Clicker (10), Portable Speaker (7), Tripod Stand (5), USB Hub (20)

### Request Scenarios

| Status   | Count | Details                               |
|----------|-------|---------------------------------------|
| Pending  | 2     | Awaiting staff approval               |
| Approved | 2     | Currently borrowed, not overdue       |
| Overdue  | 3     | 1, 3, and 7 days overdue              |
| Returned | 5     | Completed transactions for analytics  |
| Rejected | 1     | Example of rejection workflow         |
| Partial  | 1     | Incremental return in progress        |

## Testing Scenarios

### 1. Student Experience

**Login as**: student1@school.com

**What to test**:
- View available equipment
- Filter by category (Sports, Lab, Electronics, etc.)
- Check your pending request (Basketball)
- View your approved request (Microscope)
- See your returned requests history
- Create a new request for available items
- Check request status and details

### 2. Staff Experience

**Login as**: staff@school.com

**What to test**:
- View all pending requests
- Approve or reject pending requests
- See active approved requests
- Process returns (mark as returned)
- View overdue requests dashboard
- Check analytics and statistics
- Filter requests by status

### 3. Admin Experience

**Login as**: admin@school.com

**What to test**:
- All staff capabilities, plus:
- Add new equipment items
- Edit existing equipment
- View all request history (including rejected)
- Access comprehensive analytics
- Manage overdue situations
- View system-wide statistics

### 4. Overdue Management

**Navigate to**: Overdues tab (Admin/Staff only)

**What you'll see**:
- Jane Student - 2 Footballs (3 days overdue)
- Mike Student - 3 Arduino Kits (7 days overdue)
- Jane Student - 1 Projector (1 day overdue)

**What to test**:
- View overdue details
- Contact students (via displayed info)
- Process returns for overdue items
- See how overdue counts update

### 5. Analytics Dashboard

**Navigate to**: Analytics tab (Admin/Staff only)

**What you'll see**:
- Total requests breakdown
- Equipment utilization stats
- Return rate percentages
- Popular equipment items
- Request trends over time

**What to test**:
- Different time period filters
- Category-wise breakdowns
- Export capabilities (if implemented)
- Visual charts and graphs

### 6. Out-of-Stock & Notification System

**What to test**:
- View equipment with zero availability (VR Headset, Studio Light Kit)
- Try to request out-of-stock items
- Subscribe to notifications for unavailable equipment
- Process a return for VR Headset or Studio Light Kit
- Verify subscribed students receive notifications
- Check notification history

**Out-of-stock items**:
- **VR Headset** - 2 units borrowed by Jane Williams (returns in 4 days)
  - Subscribed: John Smith, Jane Williams
- **Studio Light Kit** - 1 unit borrowed by Michael Chen (returns in 6 days)
  - Subscribed: Michael Chen, Jane Williams
- **Digital Piano** - 2 of 3 borrowed by Jane Williams (1 available, returns in 10 days)
  - Subscribed: John Smith

### 7. Request History & Audit Trail

**What to test**:
- View complete request lifecycle
- Check status change timestamps
- See who approved/rejected requests
- Review rejection reasons
- Track equipment through different users

## Advanced Testing

### Out-of-Stock Notification Workflow

**Test the complete notification flow**:

1. **As Student1 (John Smith)**:
   - Browse equipment
   - Find VR Headset (shows 0 available)
   - Try to subscribe to notifications
   - Verify subscription is recorded

2. **As Staff/Admin**:
   - View active requests
   - Find Jane Williams' VR Headset request
   - Process the return (mark as returned)

3. **Verify Notifications**:
   - Check that notification service triggers
   - Subscribed students (John Smith, Jane Williams) should receive notifications
   - Verify notification status updated to `notified: true`

4. **As Student1 Again**:
   - Check notifications (if implemented in UI)
   - See that VR Headset is now available
   - Create a new request for VR Headset

### Equipment Availability

1. Note current availability of an item
2. Create a request for that item (as student)
3. Verify inventory decreases (soft reservation)
4. Approve the request (as staff)
5. Return the item
6. Verify inventory restores

### Overlapping Bookings

1. Try to borrow equipment already borrowed for overlapping dates
2. System should show available quantity for your dates
3. Test with multiple items in a single request

### Request Expiration

The script sets pending requests to expire in 24 hours. To test:

1. Wait 24 hours (or modify expiration in DB)
2. Run the expiration monitor: `node scripts/testExpiration.js`
3. Verify expired requests return inventory

### Analytics Over Time

Returned requests are backdated to create a timeline:
- 16 days ago: Request created
- 15 days ago: Request approved
- 6 days ago: Item returned

This provides meaningful analytics data immediately.

## Integration with Existing Workflows

### Starting Fresh

```bash
# Using manage.sh (Recommended)
./manage.sh start
# Choose option 1 for Demo data OR option 2 for Basic data

# Or use interactive menu
./manage.sh
# Option 1: Start → Choose data type
```

### Switching Between Basic and Demo Data

**The best part: You don't need to stop services to switch data!**

#### Switch to Demo Data (from Basic or any state)
```bash
./manage.sh demo
# Services keep running, just refresh your browser
```

#### Switch to Basic Data (or reset Demo)
```bash
./manage.sh reseed
# Choose option 2 for Basic data OR option 1 for Demo data
# Services keep running, just refresh your browser
```

### Complete Workflow Examples

**Day 1: Start with Basic Data**
```bash
./manage.sh start → Choose 2 (Basic)
# Test basic functionality, create requests manually
```

**Day 2: Switch to Demo Data**
```bash
./manage.sh demo    # Quick switch while services run
# Refresh browser → See all features populated
```

**Day 3: Back to Clean Basic Data**
```bash
./manage.sh reseed → Choose 2 (Basic)
# Refresh browser → Clean slate
```

### Legacy Manual Method

```bash
# If you prefer the old way
./manage.sh stop
./manage.sh clean
cd backend && npm run demo:reset
cd .. && ./manage.sh start
```

### With Swagger API

1. Run the demo script
2. Get a token: `node scripts/getToken.js admin@school.com`
3. Use token in Swagger UI to test API endpoints
4. Create new requests via API
5. Update request statuses
6. Test all endpoints with realistic data

## Troubleshooting

### Script Fails to Connect

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
```bash
# Start MongoDB
brew services start mongodb-community

# Or use manage.sh
./manage.sh start
```

### Duplicate Key Error

**Error**: `E11000 duplicate key error`

**Solution**:
```bash
# Use reset flag to clear existing data
npm run demo:reset
```

### Request Counter Issues

**Error**: Request IDs not incrementing properly

**Solution**:
```bash
# Reset clears counters automatically
npm run demo:reset
```

### Inventory Mismatches

**Issue**: Available quantity doesn't match expected

**Solution**:
```bash
# Use the inventory fix script
node scripts/fixOrphanedInventory.js

# Then repopulate
npm run demo:reset
```

## Customization

### Modifying the Script

The script is well-commented and organized. Key sections:

```javascript
// Line 68-126: Base data (users and equipment)
// Line 128-184: Pending requests
// Line 186-252: Approved requests
// Line 254-330: Overdue requests
// Line 332-453: Returned requests
// Line 455-489: Rejected requests
// Line 491-527: Partial returns
```

### Adding More Scenarios

To add custom scenarios:

1. Create a new function following existing patterns
2. Call it from `main()` function
3. Update the summary statistics

Example:
```javascript
async function createCustomScenario(users, equipment) {
  log.section('Step 8: Creating Custom Scenario');

  // Your custom logic here

  log.success('Custom scenario created');
}

// In main()
await createCustomScenario(users, equipment);
```

## Best Practices

### Before Demo/Presentation

1. Run `npm run demo:reset` for clean slate
2. Verify all services are running: `./manage.sh status`
3. Test login for each user role
4. Open multiple browser windows for role-switching
5. Keep credentials handy for quick access

### During Development

1. Use `npm run demo` to add test data
2. Don't use `--reset` unless you need to
3. Keep backup of custom data before resetting
4. Use the script to test new features immediately

### For Testing

1. Create baseline with `npm run demo:reset`
2. Perform your tests
3. Reset for next test cycle
4. Use different user accounts for isolation

## FAQ

**Q: Can I run this on production?**
A: No. This is for development/demo only. It uses test credentials and bypasses security features.

**Q: Will this affect my custom data?**
A: Without `--reset`, it adds to existing data. With `--reset`, it deletes everything.

**Q: How long does it take?**
A: About 2-3 seconds for a complete population with reset.

**Q: Can I modify the passwords?**
A: Yes, edit the script's user array (line 71-77), but remember to update documentation.

**Q: Does this work with Docker?**
A: Yes, as long as MongoDB is accessible at the URI in your .env file.

## Support

If you encounter issues:

1. Check MongoDB is running
2. Verify .env configuration
3. Check script output for specific errors
4. Review this guide's troubleshooting section
5. Check server logs: `./manage.sh logs backend`

## Related Scripts

- `getToken.js` - Generate JWT tokens for API testing
- `seedData.js` - Basic seed (users + equipment only)
- `fixOrphanedInventory.js` - Fix inventory mismatches
- `testExpiration.js` - Test request expiration logic

## Summary

This demo data script is your one-stop solution for:
- ✓ Quick demo preparation
- ✓ Feature testing
- ✓ User training
- ✓ Development workflow
- ✓ Presentation readiness

Run it, and your EquipShare instance is immediately ready to showcase!
