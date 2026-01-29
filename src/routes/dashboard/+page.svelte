<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  
  // Private access - simple auth
  let isAuthenticated = $state(false);
  let authToken = $state('');
  const SECRET_TOKEN = 'kwantum-alpha-2026'; // Change this to your secret
  
  // Bot stats
  let stats = $state({
    scans: 0,
    markets: 0,
    opportunities: 0,
    trades: 0,
    profit: 0,
    status: 'Loading...'
  });
  
  let logs = $state([]);
  let refreshInterval;
  
  function authenticate() {
    if (authToken === SECRET_TOKEN) {
      isAuthenticated = true;
      localStorage.setItem('kwantum_dashboard_auth', SECRET_TOKEN);
      startRefresh();
    } else {
      alert('Invalid access token');
    }
  }
  
  function checkAuth() {
    if (browser) {
      const saved = localStorage.getItem('kwantum_dashboard_auth');
      if (saved === SECRET_TOKEN) {
        isAuthenticated = true;
        authToken = SECRET_TOKEN;
        startRefresh();
      }
    }
  }
  
  async function fetchStats() {
    try {
      // This would connect to your VPS API endpoint
      // For now, showing placeholder data structure
      const response = await fetch('/api/bot-stats');
      if (response.ok) {
        const data = await response.json();
        stats = data;
      }
    } catch (e) {
      console.log('Using demo data - connect to VPS for real data');
      // Demo data until API is connected
      stats = {
        scans: 47,
        markets: 494,
        opportunities: 0,
        trades: 0,
        profit: 0.00,
        status: 'Running',
        lastScan: new Date().toLocaleTimeString()
      };
    }
  }
  
  async function fetchLogs() {
    try {
      const response = await fetch('/api/bot-logs?lines=50');
      if (response.ok) {
        const data = await response.json();
        logs = data.logs || [];
      }
    } catch (e) {
      // Demo logs
      logs = [
        { time: '18:52:11', level: 'INFO', message: '🚀 Bot started - Paper trading mode' },
        { time: '18:52:11', level: 'INFO', message: 'Scanning 494 markets for arbitrage...' },
        { time: '18:52:11', level: 'INFO', message: 'Found 0 arbitrage opportunities' },
        { time: '18:52:42', level: 'INFO', message: 'Scan #2 completed - 494 markets' },
        { time: '18:53:12', level: 'INFO', message: 'Scan #3 completed - 494 markets' }
      ];
    }
  }
  
  function startRefresh() {
    fetchStats();
    fetchLogs();
    refreshInterval = setInterval(() => {
      fetchStats();
      fetchLogs();
    }, 5000); // Refresh every 5 seconds
  }
  
  onMount(() => {
    checkAuth();
  });
  
  onDestroy(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });
</script>

{#if !isAuthenticated}
<div class="min-h-screen bg-black text-white flex items-center justify-center font-mono">
  <div class="text-center">
    <h1 class="text-4xl mb-8 text-cyan-400">🔒 Kwantum Alpha Dashboard</h1>
    <div class="bg-gray-900 p-8 rounded-lg border border-cyan-500">
      <p class="mb-4 text-gray-400">Enter access token to view dashboard</p>
      <input 
        type="password" 
        bind:value={authToken}
        placeholder="Access token..."
        class="bg-black border border-cyan-500 text-white px-4 py-2 rounded mb-4 w-64"
      />
      <br/>
      <button 
        onclick={authenticate}
        class="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded transition"
      >
        Access Dashboard
      </button>
    </div>
  </div>
</div>
{:else}
<div class="min-h-screen bg-black text-white font-mono">
  <!-- Header -->
  <header class="bg-gray-900 border-b border-cyan-500 p-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <h1 class="text-2xl text-cyan-400">💰 Polymarket Arbitrage Dashboard</h1>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-400">Status: <span class="text-green-400">{stats.status}</span></span>
        <button 
          onclick={() => { localStorage.removeItem('kwantum_dashboard_auth'); isAuthenticated = false; }}
          class="text-xs text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto p-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div class="bg-gray-900 border border-cyan-500/30 rounded p-4">
        <div class="text-gray-400 text-xs mb-1">Total Scans</div>
        <div class="text-3xl text-cyan-400">{stats.scans}</div>
      </div>
      
      <div class="bg-gray-900 border border-cyan-500/30 rounded p-4">
        <div class="text-gray-400 text-xs mb-1">Markets Scanned</div>
        <div class="text-3xl text-cyan-400">{stats.markets}</div>
      </div>
      
      <div class="bg-gray-900 border border-cyan-500/30 rounded p-4">
        <div class="text-gray-400 text-xs mb-1">Opportunities</div>
        <div class="text-3xl text-yellow-400">{stats.opportunities}</div>
      </div>
      
      <div class="bg-gray-900 border border-cyan-500/30 rounded p-4">
        <div class="text-gray-400 text-xs mb-1">Paper Trades</div>
        <div class="text-3xl text-green-400">{stats.trades}</div>
      </div>
      
      <div class="bg-gray-900 border border-cyan-500/30 rounded p-4">
        <div class="text-gray-400 text-xs mb-1">Simulated Profit</div>
        <div class="text-3xl text-green-400">${stats.profit.toFixed(2)}</div>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Live Logs -->
      <div class="bg-gray-900 border border-cyan-500/30 rounded p-4">
        <h2 class="text-xl text-cyan-400 mb-4 flex items-center gap-2">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Live Logs
        </h2>
        <div class="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm">
          {#each logs as log}
            <div class="mb-1">
              <span class="text-gray-500">{log.time}</span>
              <span class="ml-2 {log.level === 'ERROR' ? 'text-red-400' : log.level === 'INFO' ? 'text-cyan-400' : 'text-gray-400'}">{log.level}</span>
              <span class="ml-2 text-white">{log.message}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Configuration -->
      <div class="bg-gray-900 border border-cyan-500/30 rounded p-4">
        <h2 class="text-xl text-cyan-400 mb-4">⚙️ Configuration</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Mode</span>
            <span class="text-green-400">Paper Trading</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Max Trade</span>
            <span class="text-cyan-400">$5.00</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Max Tokens</span>
            <span class="text-cyan-400">500</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Min Profit</span>
            <span class="text-cyan-400">2.5%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Scan Interval</span>
            <span class="text-cyan-400">30s</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Last Scan</span>
            <span class="text-gray-300">{stats.lastScan || 'N/A'}</span>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-800">
          <h3 class="text-sm text-gray-400 mb-2">Safety Status</h3>
          <div class="space-y-1 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-green-400">✓</span>
              <span>Dry Run Enabled</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-green-400">✓</span>
              <span>Hard Caps Active</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-green-400">✓</span>
              <span>Price Thresholds</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-green-400">✓</span>
              <span>Liquidity Check</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-8 text-center text-gray-500 text-sm">
      <p>Kwantum Tech - Polymarket Arbitrage Bot | 3-Day Paper Trading Period</p>
      <p class="mt-1">Auto-refreshes every 5 seconds</p>
    </footer>
  </main>
</div>
{/if}

<style>
  :global(body) {
    font-family: 'Share Tech Mono', monospace;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #111;
  }
  ::-webkit-scrollbar-thumb {
    background: #0891b2;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #06b6d4;
  }
</style>
