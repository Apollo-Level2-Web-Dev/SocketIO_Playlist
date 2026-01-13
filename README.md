# 🚀 Order Tracking Backend - Starter Pack

## 📋 What You'll Build

In this video series, you'll build a complete real-time order tracking backend with:
- ✅ REST API with Express
- ✅ Real-time updates with Socket.IO
- ✅ MongoDB database integration
- ✅ Order management system
- ✅ Admin dashboard backend

---

## 🎯 Before You Start

### Prerequisites
- [ ] Node.js installed (v18 or higher) - [Download](https://nodejs.org/)
- [ ] Basic JavaScript knowledge
- [ ] Text editor (VS Code recommended)
- [ ] MongoDB Atlas account (free tier)

### Check Your Setup
```bash
# Check Node.js version
node --version
# Should show v14 or higher

# Check npm version
npm --version
```

---

## 📦 Installation Steps

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This will install:
- `express` - Web server
- `socket.io` - Real-time communication
- `mongodb` - Database driver
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `nodemon` - Auto-restart server (dev only)

### Step 2: MongoDB Atlas Setup

**Create Free Account:**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Sign up with Google or email

**Create Cluster:**
1. Choose **FREE** tier (M0 Sandbox)
2. Select cloud provider: **AWS**
3. Select region: **Closest to you**
4. Click "Create Cluster" (wait 3-5 minutes)

**Create Database User:**
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `ordertracking_user`
4. Password: Click "Autogenerate" (SAVE THIS!)
5. Privileges: "Read and write to any database"
6. Click "Add User"

**Setup Network Access:**
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

**Get Connection String:**
1. Go to "Database" (Clusters)
2. Click "Connect"
3. Choose "Connect your application"
4. Driver: **Node.js**
5. Copy the connection string

Example:
```
mongodb+srv://ordertracking_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://ordertracking_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/order_tracking_db?retryWrites=true&w=majority
   ADMIN_PASSWORD=admin123
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. Replace:
   - `YOUR_PASSWORD` with your actual MongoDB password
   - `cluster0.xxxxx.mongodb.net` with your cluster URL

⚠️ **IMPORTANT**: Never commit `.env` file to Git!

---

## 🏗️ Project Structure (We'll Build Together)

```
backend/
├── config/
│   └── database.js          # MongoDB connection (Video 4)
├── utils/
│   └── helpers.js           # Helper functions (Video 5)
├── socket/
│   └── orderHandlers.js     # Socket.IO events (Videos 6-7)
├── server.js                # Main server file (Video 4)
├── .env                     # Your secrets (DON'T commit!)
├── .env.example             # Template (safe to commit)
├── .gitignore               # What to ignore in Git
└── package.json             # Dependencies
```

**We'll create each file together in the videos!**

---

## 🎬 Follow Along

### Video 1: Introduction
- See the final demo
- Understand what we're building

### Video 2: Real-time Basics
- Learn HTTP vs WebSocket
- Understand Socket.IO


## ✅ Quick Start Checklist

Before Video 2:
- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] `.env` file created and configured

---

## 🆘 Need Help?

**Common Issues:**

**"Cannot find module"**
```bash
npm install
```

**"MongoServerError: bad auth"**
- Check your password in `.env`
- Make sure you replaced `<password>` with actual password

**"Connection timeout"**
- Check network access is set to 0.0.0.0/0
- Check your internet connection

**"Port 5000 already in use"**
- Change PORT in `.env` to 5001

---

## 🎓 Learning Resources

- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 📺 Ready to Start?


Let's build something amazing together!