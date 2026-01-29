import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Get stats from VPS logs
    const { stdout } = await execAsync(`
      ssh -p 2222 -o ConnectTimeout=5 -o StrictHostKeyChecking=no lilone@5.75.141.76 '
        cd /root/clawd/polymarket-agents-daybliss && 
        LOG=$(ls -t logs/debug_run.log 2>/dev/null | head -1) &&
        if [ -n "$LOG" ]; then
          SCANS=$(grep -c "📊 Scan #" "$LOG" 2>/dev/null || echo "0")
          OPPS=$(grep -c "ARBITRAGE FOUND" "$LOG" 2>/dev/null || echo "0")
          TRADES=$(grep -c "PAPER TRADE" "$LOG" 2>/dev/null || echo "0")
          LAST=$(tail -1 "$LOG" 2>/dev/null | cut -d" " -f1,2)
          echo "{\"scans\":$SCANS,\"markets\":494,\"opportunities\":$OPPS,\"trades\":$TRADES,\"profit\":0.00,\"status\":\"Running\",\"lastScan\":\"$LAST\"}"
        else
          echo "{\"scans\":0,\"markets\":0,\"opportunities\":0,\"trades\":0,\"profit\":0.00,\"status\":\"Offline\",\"lastScan\":\"N/A\"}"
        fi
      ' 2>/dev/null || echo "{\"scans\":0,\"markets\":0,\"opportunities\":0,\"trades\":0,\"profit\":0.00,\"status\":\"Disconnected\",\"lastScan\":\"N/A\"}"
    `);
    
    const stats = JSON.parse(stdout.trim());
    
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
