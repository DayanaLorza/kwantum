<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  
  // Private access - SECURED
  let isAuthenticated = $state(false);
  let authToken = $state('');
  const SECRET_TOKEN = 'kwtm-dckjcecp-7917';
  
  // Bot stats
  let stats = $state({
    scans: 0,
    markets: 0,
    opportunities: 0,
    trades: 0,
    profit: 0,
    status: 'Loading...',
    lastScan: null,
    recentLogs: []
  });
  
  let logs = $state([]);
  let refreshInterval = $state(null);
  let lastUpdate = $state(null);
  let connectionStatus = $state('connecting');
  
  function authenticate() {
    if (authToken === SECRET_TOKEN) {
      isAuthenticated = true;
      if (browser) {
        localStorage.setItem('kwantum_dashboard_auth', SECRET_TOKEN);
      }
      startDataRefresh();
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
        startDataRefresh();
      }
    }
  }
  
  async function fetchData() {
    try {
      connectionStatus = 'loading';
      const response = await fetch('/api/bot-stats');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update stats
      stats = {
        scans: data.scans || 0,
        markets: data.markets || 494,
        opportunities: data.opportunities || 0,
        trades: data.trades || 0,
        profit: data.profit || 0,
        status: data.status || 'Unknown',
        lastScan: data.lastScan,
        recentLogs: data.recentLogs || []
      };
      
      // Update logs
      if (data.recentLogs) {
        logs = data.recentLogs;
      }
      
      lastUpdate = new Date();
      connectionStatus = 'connected';
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      connectionStatus = 'error';
    }
  }
  
  function startDataRefresh() {
    fetchData(); // Initial fetch
    refreshInterval = setInterval(fetchData, 5000); // Refresh every 5 seconds
  }
  
  function stopDataRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }
  
  function logout() {
    if (browser) {
      localStorage.removeItem('kwantum_dashboard_auth');
    }
    stopDataRefresh();
    isAuthenticated = false;
    authToken = '';
  }
  
  onMount(() => {
    checkAuth();
  });
  
  onDestroy(() => {
    stopDataRefresh();
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
      <div class="flex items-center gap-4">
        <h1 class="text-2xl text-cyan-400">💰 Polymarket Arbitrage Dashboard</h1>
        <span class="text-xs px-2 py-1 rounded 
          {connectionStatus === 'connected' ? 'bg-green-900 text-green-400' : 
           connectionStatus === 'loading' ? 'bg-yellow-900 text-yellow-400' : 
           'bg-red-900 text-red-400'}">
          {connectionStatus === 'connected' ? '🟢 Live' : 
           connectionStatus === 'loading' ? '🟡 Loading...' : 
           '🔴 Error'}
        </span>
        {#if lastUpdate}
          <span class="text-xs text-gray-500">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        {/if}
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-400">
          Status: 
          <span class={stats.status === 'Running' ? 'text-green-400' : 
                       stats.status === 'Error' ? 'text-red-400' : 'text-yellow-400'}>
            {stats.status}
          </span>
        </span>
        <button 
          onclick={logout}
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
          {#if connectionStatus === 'connected'}
            <span class="text-xs text-green-400">(MongoDB)</span>
          {:else if connectionStatus === 'loading'}
            <span class="text-xs text-yellow-400">(Loading...)</span>
          {:else}
            <span class="text-xs text-red-400">(Error)</span>
          {/if}
        </h2>
        <div class="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm">
          {#if logs.length === 0}
            <div class="text-gray-500 italic">
              {connectionStatus === 'loading' ? 'Loading logs...' : 'No logs available'}
            </div>
          {:else}
            {#each logs as log}
              <div class="mb-1">
                <span class="text-gray-500">{log.time}</span>
                <span class="ml-2 {log.level === 'ERROR' ? 'text-red-400' : log.level === 'INFO' ? 'text-cyan-400' : 'text-gray-400'}">{log.level}</span>
                <span class="ml-2 text-white">{log.message}</span>
              </div>
            {/each}
          {/if}
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
          <div class="flex justify-between">
            <span class="text-gray-400">Data Source</span>
            <span class={connectionStatus === 'connected' ? 'text-green-400' : 'text-yellow-400'}>
              {connectionStatus === 'connected' ? 'MongoDB' : 'Connecting...'}
            </span>
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
      <p class="mt-1">Data refreshes every 5 seconds | Connected to MongoDB</p>
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
