# System Requirements & Setup

## Prerequisites

### Required Software

**Node.js & npm**
- Version: Node.js v14 or higher
- Check: `node --version` and `npm --version`
- Install: Download from [nodejs.org](https://nodejs.org/)

**MongoDB**
- Version: MongoDB 4.4 or higher
- Install on macOS:
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  ```
- Start MongoDB:
  ```bash
  brew services start mongodb/brew/mongodb-community
  ```
- Verify:
  ```bash
  mongosh --eval "db.version()"
  ```

**Git** (for version control)
- Check: `git --version`
- Pre-installed on macOS

### Optional but Recommended

**VS Code** - IDE used for development
**Postman** - For API testing
**MongoDB Compass** - GUI for MongoDB

---

## Installation Steps

### Option 1: Quick Start (Recommended)

```bash
# Navigate to assignment folder
cd path/to/EquipShare

# For Phase 1
cd phase1-manual
./manage.sh

# For Phase 2
cd phase2-ai-enhanced
./manage.sh
```

**That's it!** The script handles everything.

---

### Option 2: Manual Setup

#### Phase 1 Setup

```bash
# Backend Setup
cd phase1-manual/backend
npm install
cp .env.example .env
npm run seed        # Seed database with sample data
npm start           # Starts on port 5000

# Frontend Setup (new terminal)
cd phase1-manual/frontend
npm install
npm start           # Starts on port 3000
```

#### Phase 2 Setup

```bash
# Backend Setup
cd phase2-ai-enhanced/backend
npm install
cp .env.example .env
npm run seed
npm start

# Frontend Setup (new terminal)
cd phase2-ai-enhanced/frontend
npm install
npm start
```

---

## Environment Variables

Both phases require a `.env` file in the backend folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/equipment-lending
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

**Note:** `.env.example` files are provided - copy and rename to `.env`

---

## Verification

### Check MongoDB is Running

```bash
brew services list | grep mongodb
# Should show "started"
```

### Check Ports are Free

```bash
lsof -ti:5000  # Backend port (should be empty)
lsof -ti:3000  # Frontend port (should be empty)
```

### Test Backend

```bash
curl http://localhost:5000
# Should return JSON with API info
```

### Test Frontend

Open browser: `http://localhost:3000`

---

## Default Credentials

After running `npm run seed`, these accounts are available:

| Role    | Email                |  Password  | Permissions      |
|---------|----------------------|------------|------------------|
| Admin   | admin@school.com     | admin123   | Full access      |
| Staff   | staff@school.com     | staff123   | Approve requests |
| Student | student1@school.com  | student123 | View & request   |
| Student | student2@school.com  | student123 | View & request   |

---

## System Requirements

**Minimum:**
- RAM: 4GB
- Storage: 500MB free space
- OS: macOS 10.14+, Windows 10+, Ubuntu 18.04+

**Recommended:**
- RAM: 8GB
- Storage: 1GB free space
- SSD for better MongoDB performance

---

## Port Usage

| Service      | Port | Purpose                   |
|--------------|------|---------------------------|
| Backend API  | 5000 | REST API endpoints        |
| Frontend     | 3000 | React development server  |
| MongoDB      | 27017| Database connection       |

---

## Development Tools

**Package Manager:** npm (comes with Node.js)

**Frontend Framework:** React 18
- react-router-dom for routing
- axios for HTTP requests

**Backend Framework:** Express.js 4
- mongoose for MongoDB ODM
- jsonwebtoken for authentication
- bcryptjs for password hashing

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB status
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community

# Check logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill

# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

### npm Installation Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Permission Errors

```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

---

## Build for Production

### Frontend Build

```bash
cd phase1-manual/frontend  # or phase2-ai-enhanced/frontend
npm run build

# Outputs to build/ folder
# Serve with: npx serve -s build
```

### Backend Production Mode

Update `.env`:
```env
NODE_ENV=production
```

Then start with:
```bash
npm start
```

---

## Running Tests

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## Additional Resources

- **QuickStart Guide:** [QUICKSTART.md](QUICKSTART.md)
- **API Documentation:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **AI Usage Details:** [AI_USAGE_LOG.md](AI_USAGE_LOG.md)
- **Main README:** [../README.md](../README.md)

---

## Support

For issues or questions:
1. Check [QUICKSTART.md](QUICKSTART.md) troubleshooting section
2. Review logs in terminal/console
3. Verify all prerequisites are installed
4. Check MongoDB is running

---

**Ready to start?** Run `./manage.sh` in either phase folder!
