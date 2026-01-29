import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const logPath = '/root/clawd/polymarket-agents-daybliss/logs/debug_run.log';
    
    // Check if log file exists
    if (!existsSync(logPath)) {
      // Try to find any recent log file
      const findCmd = `ls -t /root/clawd/polymarket-agents-daybliss/logs/*.log 2>/dev/null | head -1`;
      const latestLog = execSync(findCmd).toString().trim();
      
      if (!latestLog) {
        return new Response(JSON.stringify({
          scans: 0,
          markets: 0,
          opportunities: 0,
          trades: 0,
          profit: 0.00,
          status: 'Offline',
          lastScan: 'N/A'
        }), { headers: { 'Content-Type': 'application/json' }});
      }
    }
    
    const actualLogPath = existsSync(logPath) ? logPath : 
      execSync(`ls -t /root/clawd/polymarket-agents-daybliss/logs/*.log 2>/dev/null | head -1`).toString().trim();
    
    // Read log file
    const logContent = readFileSync(actualLogPath, 'utf-8');
    const lines = logContent.split('\n');
    
    // Count stats from logs
    const scans = (logContent.match(/📊 Scan #/g) || []).length;
    const opportunities = (logContent.match(/🎯 ARBITRAGE FOUND/g) || []).length;
    const trades = (logContent.match(/PAPER TRADE/g) || []).length;
    
    // Get last scan time
    const lastScanMatch = logContent.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}).*📊 Scan #/g);
    const lastScan = lastScanMatch ? lastScanMatch[lastScanMatch.length - 1].substring(0, 19) : 'N/A';
    
    // Check if bot is running
    let status = 'Offline';
    try {
      execSync('pgrep -f run_arbitrage.py');
      status = 'Running';
    } catch {
      status = 'Stopped';
    }
    
    const stats = {
      scans,
      markets: 494, // From the debug logs
      opportunities,
      trades,
      profit: 0.00, // Will calculate from trades later
      status,
      lastScan: lastScan !== 'N/A' ? lastScan.split(' ')[1] : 'N/A'
    };
    
    return new Response(JSON.stringify(stats), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      scans: 0,
      markets: 0,
      opportunities: 0,
      trades: 0,
      profit: 0.00,
      status: 'Error',
      lastScan: 'N/A',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
