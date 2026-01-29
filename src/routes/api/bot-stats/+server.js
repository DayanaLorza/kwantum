import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';

// MongoDB connection - HARDCODED for reliability
const MONGO_URI = 'mongodb+srv://daybliss01_db_user:69UAWyMqJaW2qCqf@cluster0.lapvetq.mongodb.net/polymarket_bot?retryWrites=true&w=majority';
const DB_NAME = 'polymarket_bot';

let client = null;
let connectionPromise = null;

async function getClient() {
  if (client) return client;
  
  // Prevent multiple simultaneous connection attempts
  if (connectionPromise) return connectionPromise;
  
  connectionPromise = (async () => {
    try {
      // Create client with timeout options
      client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 8000, // 8 second timeout
        connectTimeoutMS: 8000,
        socketTimeoutMS: 8000,
        maxPoolSize: 1 // Minimal for serverless
      });
      
      await client.connect();
      console.log('MongoDB connected successfully');
      return client;
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      client = null;
      throw error;
    } finally {
      connectionPromise = null;
    }
  })();
  
  return connectionPromise;
}

export async function GET() {
  // Set a timeout for the entire operation
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 9000);
  });
  
  try {
    // Race between MongoDB operation and timeout
    const result = await Promise.race([
      fetchData(),
      timeoutPromise
    ]);
    
    return result;
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Return fallback data quickly
    return json({
      scans: 0,
      markets: 494,
      opportunities: 0,
      trades: 0,
      profit: 0,
      status: 'Connecting...',
      lastScan: null,
      recentLogs: [{
        time: new Date().toLocaleTimeString(),
        level: 'INFO',
        message: 'Connecting to database... (retrying)'
      }],
      connection: 'retrying',
      error: error.message
    }, { status: 200 }); // Return 200 so dashboard doesn't break
  }
}

async function fetchData() {
  const mongoClient = await getClient();
  const db = mongoClient.db(DB_NAME);
  
  // Get current stats
  const stats = await db.collection('stats').findOne({ _id: 'current' }) || {
    scans: 0,
    markets: 494,
    opportunities: 0,
    trades: 0,
    profit: 0,
    status: 'Unknown',
    lastScan: null
  };
  
  // Get recent logs
  const logs = await db.collection('logs')
    .find()
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();
  
  // Format logs for dashboard
  const formattedLogs = logs.map(log => ({
    time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A',
    level: log.level || 'INFO',
    message: log.message || ''
  })).reverse();
  
  return json({
    ...stats,
    recentLogs: formattedLogs,
    connection: 'connected',
    updatedAt: new Date().toISOString()
  });
}
