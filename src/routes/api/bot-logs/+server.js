import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET({ url }) {
  const lines = url.searchParams.get('lines') || '50';
  
  try {
    // Get logs from VPS
    const { stdout } = await execAsync(`
      ssh -p 2222 -o ConnectTimeout=5 -o StrictHostKeyChecking=no lilone@5.75.141.76 '
        cd /root/clawd/polymarket-agents-dayblisa && 
        LOG=$(ls -t logs/debug_run.log 2>/dev/null | head -1) &&
        if [ -n "$LOG" ]; then
          tail -${lines} "$LOG" | grep -E "INFO|ERROR|WARNING" | 
          sed "s/\\[.*\\] //" | 
          awk "{print \\"{\\"time\\":\\"\\"substr(\$1,12,8)\\"\\",\\"level\\":\\"\\"\$3\\"\\",\\"message\\":\\"\\"substr(\$0, index(\$0,\$4))\\"\\"}\\"}"
        else
          echo "[]"
        fi
      ' 2>/dev/null || echo "[{\\"time\\":\\"N/A\\",\\"level\\":\\"ERROR\\",\\"message\\":\\"Cannot connect to VPS\\"}]"
    `);
    
    // Parse the logs into JSON
    const logs = stdout.trim().split('\n').filter(line => line).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return { time: 'N/A', level: 'INFO', message: line };
      }
    });
    
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
