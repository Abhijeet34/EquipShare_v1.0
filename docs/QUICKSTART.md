# EquipShare - QuickStart Guide

**Get up and running in 5 minutes!**

---

## Prerequisites

Ensure you have these installed:
- Node.js (v14+)
- MongoDB
- npm or yarn

---

## Option 1: One-Command Startup (Recommended)

### Phase 1 - EquipShare

```bash
cd phase1-manual
./manage.sh
```

### Phase 2 - EquipShare Pro (Enhanced)

```bash
cd phase2-ai-enhanced
./manage.sh start
```

The script will:
- Check and start MongoDB if needed
- Create .env file if missing (from .env.example)
- Install dependencies if missing
- Seed DB if empty
- Start backend and frontend
- Display access URLs and credentials

**That's it!** Your application will be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

---

## Option 2: Using Root Package Scripts

From the project root directory:

```bash
# Install all dependencies for both phases
npm run install:all

# Seed database for Phase 1
npm run seed:p1

# Start Phase 1 (both backend and frontend)
npm run dev:p1

# OR start Phase 2
npm run seed:p2
npm run dev:p2
```

---

## Option 3: Manual Setup

### For Phase 1:

```bash
# Backend
cd phase1-manual/backend
npm install
cp .env.example .env
npm run seed
npm start

# Frontend (in new terminal)
cd phase1-manual/frontend
npm install
npm start
```

### For Phase 2:

```bash
# Backend
cd phase2-ai-enhanced/backend
npm install
cp .env.example .env
npm run seed
npm start

# Frontend (in new terminal)
cd phase2-ai-enhanced/frontend
npm install
npm start
```

---

## Default Login Credentials

After seeding, use these accounts:

**Administrator:**
- Email: admin@school.com
- Password: admin123
- Access: Full system control

**Staff Member:**
- Email: staff@school.com
- Password: staff123
- Access: Approve requests, manage returns

**Student:**
- Email: student1@school.com
- Password: student123
- Access: View equipment, create requests

---

## Troubleshooting

### MongoDB not connecting?

```bash
# Start MongoDB
brew services start mongodb/brew/mongodb-community

# Check status
brew services list | grep mongodb
```

### Port already in use?

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill

# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

### node_modules issues?

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## What's Next?

1. **Explore Phase 1** - Core functionality, clean implementation
2. **Try Phase 2** - Enhanced with AI-suggested patterns, better UX
3. **Compare** - See the improvements in error handling, validation, and UI
4. **Read Documentation** - Check README.md, ARCHITECTURE.md, and AI_USAGE_LOG.md

---

## Quick Tips

- Use **Cmd+K** in browser to search equipment quickly
- **Admin** users can add new equipment from the admin panel
- **Overlapping bookings** are automatically prevented
- Check **requests page** for approval workflow
- **Loading states** in Phase 2 provide better user feedback

---

## Project Structure

```
├── phase1-manual/         # Version 1: Manual development
│   ├── backend/           # Express API
│   ├── frontend/          # React app
│   └── start.sh           # One-command startup
│
├── phase2-ai-enhanced/    # Version 2: AI-assisted enhancements
│   ├── backend/           # Enhanced API
│   ├── frontend/          # Enhanced UI with landing page
│   └── start.sh           # One-command startup
│
├── package.json           # Root scripts for unified management
└── QUICKSTART.md          # This file
```

---

## Need Help?

- **Documentation**: See README.md for detailed information
- **API Docs**: Check ARCHITECTURE.md for API endpoints
- **AI Usage**: Read AI_USAGE_LOG.md for development insights

---

**Ready to explore EquipShare!**
