import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';

// MongoDB connection from environment variable
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'polymarket_bot';

let client = null;

async function getClient() {
  if (!client) {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI not set');
    }
    client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 8000
    });
    await client.connect();
  }
  return client;
}

export async function GET() {
  try {
    if (!MONGO_URI) {
      return json({
        scans: 0,
        markets: 494,
        opportunities: 0,
        trades: 0,
        profit: 0,
        status: 'Config Error',
        lastScan: null,
        recentLogs: [{
          time: new Date().toLocaleTimeString(),
          level: 'ERROR',
          message: 'MONGO_URI not configured'
        }],
        connection: 'error'
      });
    }

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
    
  } catch (error) {
    console.error('MongoDB error:', error.message);
    
    return json({
      scans: 0,
      markets: 494,
      opportunities: 0,
      trades: 0,
      profit: 0,
      status: 'MongoDB Error',
      lastScan: null,
      recentLogs: [{
        time: new Date().toLocaleTimeString(),
        level: 'ERROR',
        message: 'MongoDB: ' + error.message
      }],
      connection: 'error'
    });
  }
}
