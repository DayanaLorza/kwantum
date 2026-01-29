import { json } from '@sveltejs/kit';

const VPS_API = 'http://5.75.141.76:8080/stats';

export async function GET() {
  console.log('Fetching from VPS:', VPS_API);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(VPS_API, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log('VPS Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('VPS Data:', JSON.stringify(data).substring(0, 100));
    
    return json({
      ...data,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    return json({
      scans: 0,
      markets: 494,
      opportunities: 0,
      trades: 0,
      profit: 0,
      status: 'VPS Error: ' + error.message,
      lastScan: null,
      recentLogs: [{
        time: new Date().toLocaleTimeString(),
        level: 'ERROR',
        message: 'Cannot connect to VPS: ' + error.message
      }],
      connection: 'error'
    });
  }
}
