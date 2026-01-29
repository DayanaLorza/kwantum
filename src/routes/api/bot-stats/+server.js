import { json } from '@sveltejs/kit';

// VPS API endpoint for bot stats
const VPS_API_URL = 'http://5.75.141.76:8080/api/stats';

export async function GET() {
  try {
    // Fetch from VPS API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(VPS_API_URL, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`VPS API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return json({
      ...data,
      connection: 'connected',
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dashboard API Error:', error.message);
    
    // Return fallback data
    return json({
      scans: 0,
      markets: 494,
      opportunities: 0,
      trades: 0,
      profit: 0,
      status: 'Connecting to VPS...',
      lastScan: null,
      recentLogs: [{
        time: new Date().toLocaleTimeString(),
        level: 'INFO',
        message: 'Connecting to bot on VPS...'
      }],
      connection: 'connecting'
    }, { status: 200 });
  }
}
