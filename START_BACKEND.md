# How to Start the Backend Server

## Quick Start

1. **Open a new terminal/command prompt**

2. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

3. **Start the backend server:**
   ```bash
   npm run dev
   ```

4. **Wait for these messages:**
   - ✅ `Connected to MongoDB database`
   - ✅ `Database initialization complete`
   - 🚀 `HSO Backend Server running on port 5000`

5. **Keep this terminal open** - the server needs to keep running

## If MongoDB is not running:

### On Windows:
1. Check if MongoDB is installed
2. Start MongoDB service:
   - Open Services (Win + R, type `services.msc`)
   - Find "MongoDB" service
   - Right-click → Start
   
   OR
   
   Run in terminal:
   ```bash
   mongod --dbpath C:\data\db
   ```

### Check MongoDB Connection:
- Default connection: `mongodb://127.0.0.1:27017/hso_platform`
- Make sure MongoDB is running on port 27017

## Troubleshooting

### Backend won't start:
- Check if port 5000 is already in use
- Make sure all dependencies are installed: `npm install`
- Check `.env` file exists in backend folder

### Database connection fails:
- Ensure MongoDB is running
- Check `MONGO_URI` in backend `.env` file
- Verify MongoDB is accessible on port 27017

### Still having issues?
- Check backend terminal for error messages
- Verify Node.js version: `node --version` (should be v18+)
- Try: `npm install` in backend folder

## Password reset link: "localhost refused to connect" on phone

The reset email uses `FRONTEND_URL` from backend `.env`. `localhost` only works on the PC where the app runs. **On your phone, use your PC’s LAN address instead.**

1. **Get your PC’s IP** (same WiFi as phone):
   - Windows: `ipconfig` → look for "IPv4 Address" (e.g. `192.168.1.10`)
   - Mac/Linux: `ifconfig` or `ip addr`

2. **In `backend/.env`**, set:
   ```bash
   FRONTEND_URL=http://YOUR_PC_IP:5173
   ```
   Example: `FRONTEND_URL=http://192.168.1.10:5173`

3. **Run frontend with network access** (already configured):
   ```bash
   cd frontend && npm run dev
   ```
   Vite will show both `http://localhost:5173` and `http://192.168.x.x:5173`. Use the second URL on your phone.

4. **Restart the backend** after changing `.env`, then request a new password reset. The new email link will use `http://YOUR_PC_IP:5173/...` and will work when opened on your phone.

