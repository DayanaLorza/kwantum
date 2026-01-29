import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://username:password@cluster.mongodb.net/polymarket_bot';
const DB_NAME = 'polymarket_bot';

let client = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client;
}

export async function GET() {
  try {
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
    })).reverse(); // Oldest first
    
    return json({
      ...stats,
      recentLogs: formattedLogs,
      connection: 'mongodb',
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('MongoDB error:', error);
    
    // Fallback to demo data
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
        message: 'MongoDB connection failed: ' + error.message
      }],
      connection: 'error'
    });
  }
}
