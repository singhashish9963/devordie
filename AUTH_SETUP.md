# Authentication & Configuration Management System

## Features Implemented ✅

### Backend (JWT Authentication + MongoDB)
- **User Authentication**
  - Signup with email validation
  - Login with password hashing (bcrypt)
  - JWT token-based sessions (7-day expiry)
  - HTTP-only cookies for security
  - Protected routes with middleware

- **Configuration Management**
  - Save battle configurations (terrain, units, code)
  - Load saved configurations
  - Delete configurations
  - Public/Private configurations
  - Tags and descriptions
  - Usage statistics tracking

### Frontend (React + Context API)
- **Auth UI Components**
  - Login modal with validation
  - Signup modal with password confirmation
  - User menu with dropdown
  - Session persistence

- **Configuration Manager**
  - Save current battle setup
  - Load saved configurations
  - Browse all saved configs
  - Delete configurations
  - Tags and metadata display

### New Unit Types Added 🚁
- **Drone** - Fast reconnaissance (Speed 5, Range 4, ignores terrain)
- **Sniper** - Long-range specialist (Range 5, 30% crit chance, high damage)
- **Medic** - Heals allies (Range 2 heal, 15 HP per heal)

## MongoDB Setup

### Option 1: Local MongoDB Installation
1. **Download MongoDB Community Server**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Install and Start MongoDB**
   - Windows: MongoDB installs as a service automatically
   - Or manually: `"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"`

3. **Verify MongoDB is Running**
   ```powershell
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier)
1. **Create Account**: https://www.mongodb.com/cloud/atlas/register
2. **Create Free Cluster** (M0 Sandbox)
3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. **Update `.env`**
   ```env
   MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/devordie
   ```

### Option 3: Docker (Fastest for Development)
```powershell
# Pull and run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# MongoDB will be available at mongodb://localhost:27017
```

## Running the Application

### 1. Start MongoDB
- **Local**: Ensure MongoDB service is running
- **Atlas**: No action needed (cloud-hosted)
- **Docker**: `docker start mongodb`

### 2. Start Backend
```powershell
cd backend
npm start
```
Backend runs on `http://localhost:5000`

### 3. Start Frontend
```powershell
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Configurations
- `POST /api/configurations` - Save configuration (requires auth)
- `GET /api/configurations` - Get user's configs (requires auth)
- `GET /api/configurations/:id` - Get specific config
- `PUT /api/configurations/:id` - Update config (requires auth)
- `DELETE /api/configurations/:id` - Delete config (requires auth)
- `GET /api/configurations/public` - Get public configs
- `POST /api/configurations/:id/stats` - Update stats (requires auth)

## Database Collections

### users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  lastLogin: Date
}
```

### configurations
```javascript
{
  userId: ObjectId (ref: User),
  name: String,
  description: String,
  config: {
    gridSize: { width, height },
    terrain: [[String]], // 2D array
    units: { teamA: [], teamB: [] },
    code: { teamA: String, teamB: String }
  },
  isPublic: Boolean,
  tags: [String],
  stats: {
    timesUsed: Number,
    wins: Number,
    losses: Number,
    draws: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Flow

### 1. First Time User
1. Open app → Click "Login / Sign Up"
2. Create account with name, email, password
3. Automatically logged in

### 2. Save Configuration
1. Design battlefield (terrain editor)
2. Add units (unit sidebar)
3. Write AI code (code editor)
4. Click "💾 Save / Load" button
5. Enter name, description, tags
6. Choose public/private
7. Click "Save Configuration"

### 3. Load Configuration
1. Click "💾 Save / Load" button
2. Switch to "Load" tab
3. Browse saved configurations
4. Click "Load" on desired config
5. Battlefield, units, and code will load

### 4. Manage Configurations
- **Delete**: Click "Delete" button (with confirmation)
- **Edit**: Load config, make changes, save with same/different name
- **Share**: Mark as public for others to see

## Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens stored in HTTP-only cookies
- ✅ CORS configured for frontend origins
- ✅ Input validation with express-validator
- ✅ Protected routes with auth middleware
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection (React escaping)

## Environment Variables

```env
# Backend .env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/devordie
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
- Windows: `net start MongoDB`
- Or check if port 27017 is in use: `netstat -ano | findstr :27017`

### CORS Error
```
Access-Control-Allow-Origin missing
```
**Solution**: Backend CORS already configured for ports 3000, 3001, 3004, 5173

### JWT Token Not Working
- Clear browser cookies
- Check if JWT_SECRET is set in `.env`
- Verify cookies are enabled in browser

### Configuration Not Saving
- Ensure user is logged in
- Check backend console for errors
- Verify MongoDB is connected (check backend startup logs)

## Next Steps / Future Enhancements

- [ ] Password reset via email
- [ ] OAuth (Google, GitHub login)
- [ ] Configuration versioning
- [ ] Fork/clone public configurations
- [ ] Leaderboards and rankings
- [ ] Tournament mode with bracket system
- [ ] Real-time multiplayer battles
- [ ] Spectator mode
- [ ] Replay system
- [ ] Battle analytics and charts
- [ ] AI strategy marketplace

## Technologies Used

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- express-validator (input validation)
- cookie-parser (cookie management)

### Frontend
- React 18.3
- React Router DOM
- Context API (state management)
- Fetch API (HTTP requests)
- CSS3 (styling)

---

## Quick Start Commands

```powershell
# Install dependencies (if not already done)
cd backend; npm install
cd frontend; npm install

# Start MongoDB (choose one)
mongod --dbpath="C:\data\db"  # Local
docker start mongodb          # Docker

# Start backend
cd backend; npm start

# Start frontend (in new terminal)
cd frontend; npm run dev

# Open browser
start http://localhost:3001
```

🎮 **Your battle simulator with authentication is ready to use!**
