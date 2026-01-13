// config/database.js
// MongoDB connection using native driver

import { MongoClient } from 'mongodb';

let client = null;
let db = null;

/**
 * Connect to MongoDB Atlas
 */
export const connectDB = async () => {
  try {
    // Create MongoDB client
    client = new MongoClient(process.env.MONGODB_URI);
    
    // Connect to database
    await client.connect();
    
    // Get database instance
    db = client.db();
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${db.databaseName}`);
    
    return db;
  } catch (error) {
    console.log(error)
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

/**
 * Get database instance
 */
export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first!');
  }
  return db;
};

/**
 * Get collection
 */
export const getCollection = (collectionName) => {
  return getDB().collection(collectionName);
};

/**
 * Close database connection
 */
export const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('🔒 MongoDB connection closed');
  }
};

