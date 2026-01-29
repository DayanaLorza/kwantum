import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

export async function GET({ url }) {
  const lines = parseInt(url.searchParams.get('lines') || '50');
  
  try {
    const logPath = '/root/clawd/polymarket-agents-daybliss/logs/debug_run.log';
    
    // Find latest log file
    let actualLogPath = logPath;
    if (!existsSync(logPath)) {
      const findCmd = `ls -t /root/clawd/polymarket-agents-daybliss/logs/*.log 2>/dev/null | head -1`;
      actualLogPath = execSync(findCmd).toString().trim();
    }
    
    if (!actualLogPath || !existsSync(actualLogPath)) {
      return new Response(JSON.stringify({
        logs: [{ time: 'N/A', level: 'INFO', message: 'No log files found' }]
      }), { headers: { 'Content-Type': 'application/json' }});
    }
    
    // Read last N lines
    const logContent = execSync(`tail -${lines} "${actualLogPath}"`).toString();
    const lines_array = logContent.split('\n').filter(l => l.trim());
    
    // Parse log lines
    const logs = lines_array.map(line => {
      // Try to parse standard log format: "2026-01-29 18:52:11,811 - agents... - INFO - Message"
      const match = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})[^-]*-\s*\w+\s*-\s*(\w+)\s*-\s*(.+)/);
      
      if (match) {
        const time = match[1].split(' ')[1].substring(0, 8);
        const level = match[2];
        let message = match[3];
        
        // Clean up common patterns
        message = message
          .replace(/INFO - agents\.strategies\.arbitrage - INFO - /, '')
          .replace(/INFO - __main__ - INFO - /, '');
        
        return { time, level, message };
      }
      
      // Fallback for lines that don't match
      return { 
        time: line.substring(11, 19) || 'N/A', 
        level: 'INFO', 
        message: line.substring(50) || line 
      };
    }).filter(log => log.message && log.message.length > 0);
    
    return new Response(JSON.stringify({ logs }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      logs: [{ time: 'N/A', level: 'ERROR', message: 'Failed to fetch logs: ' + error.message }]
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
