import { json } from '@sveltejs/kit';

// Simple VPS API - no MongoDB needed
const VPS_API = 'http://5.75.141.76:8080/stats';

export async function GET() {
  try {
    const response = await fetch(VPS_API, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    return json({
      ...data,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Return fallback
    return json({
      scans: 0,
      markets: 494,
      opportunities: 0,
      trades: 0,
      profit: 0,
      status: 'Connecting...',
      lastScan: null,
      recentLogs: [],
      connection: 'connecting'
    });
  }
}
