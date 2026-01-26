// server.js
// Main server file - Express + MongoDB

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB, getCollection, closeDB } from './config/database.js';
import { Server } from "socket.io";
import http from "http";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

const server = http.createServer(app);


const io = new Server(server,
  { cors: { origin: "*" , methods: ["GET", "POST"] } }
);

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// REST API ROUTES
// ==========================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const ordersCollection = getCollection('orders');
    const orders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    res.json({ 
      success: true, 
      count: orders.length, 
      orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get single order by ID
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const ordersCollection = getCollection('orders');
    const order = await ordersCollection.findOne({ 
      orderId: req.params.orderId 
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n👋 Shutting down gracefully...');
  await closeDB();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  🚀 Server Running                     ║
║  📡 Port: ${PORT}                         ║
║  🌐 http://localhost:${PORT}              ║
║  📊 MongoDB: Connected                 ║
╚════════════════════════════════════════╝
    `);
    console.log('📝 API Endpoints:');
    console.log(`   GET  /health`);
    console.log(`   GET  /api/orders`);
    console.log(`   GET  /api/orders/:orderId`);
    console.log('\n✨ Ready! time to explore Socket.IO \n');
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});