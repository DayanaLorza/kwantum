<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { io } from 'socket.io-client';
  import { TrendingUp, TrendingDown, Users, Activity, DollarSign, Copy, ExternalLink } from 'lucide-svelte';
  
  // Private access - SECURED
  let isAuthenticated = $state(false);
  let authToken = $state('');
  const SECRET_TOKEN = 'kwtm-dckjcecp-7917';
  
  // Tab management
  let activeTab = $state('arbitrage'); // 'arbitrage' | 'copytrading' | 'analytics'
  
  // Arbitrage Bot stats
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
  
  // Copy Trading state
  let socket = $state(null);
  let traders = $state([]);
  let trades = $state([]);
  let copyStats = $state({
    totalTraders: 0,
    totalTrades: 0,
    totalVolume: 0,
    avgPnl: 0
  });
  
  let logs = $state([]);
  let refreshInterval = $state(null);
  let lastUpdate = $state(null);
  let connectionStatus = $state('connecting');
  let copyConnectionStatus = $state('disconnected');
  
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
  
  async function fetchCopyTradingData() {
    try {
      // Fetch traders
      const tradersRes = await fetch('/api/traders');
      const tradersData = await tradersRes.json();
      traders = tradersData.traders || [];
      
      // Fetch analytics
      const analyticsRes = await fetch('/api/analytics/performance');
      const analyticsData = await analyticsRes.json();
      copyStats = {
        totalTraders: analyticsData.summary?.totalTraders || 0,
        totalTrades: analyticsData.summary?.totalTrades || 0,
        totalVolume: analyticsData.summary?.totalVolume || 0,
        avgPnl: analyticsData.summary?.combinedUnrealizedPnl || 0
      };
    } catch (error) {
      console.error('Failed to fetch copy trading data:', error);
    }
  }
  
  function startDataRefresh() {
    fetchData();
    fetchCopyTradingData();
    refreshInterval = setInterval(() => {
      fetchData();
      if (activeTab === 'copytrading') {
        fetchCopyTradingData();
      }
    }, 5000);
    
    // Connect to copy trading WebSocket
    connectCopyTradingSocket();
  }
  
  function connectCopyTradingSocket() {
    if (!browser) return;
    
    try {
      socket = io(window.location.origin);
      copyConnectionStatus = 'connecting';
      
      socket.on('connect', () => {
        copyConnectionStatus = 'connected';
      });
      
      socket.on('disconnect', () => {
        copyConnectionStatus = 'disconnected';
      });
      
      socket.on('trade:new', (trade) => {
        trades = [trade, ...trades].slice(0, 50);
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      copyConnectionStatus = 'error';
    }
  }
  
  function stopDataRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    if (socket) {
      socket.close();
      socket = null;
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
  
  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'copytrading') {
      fetchCopyTradingData();
    }
  }
  
  function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
    <h1 class="text-4xl mb-8 text-cyan-400">🔒 KWANTUM Alpha Dashboard</h1>
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
        <h1 class="text-2xl text-cyan-400">💰 KWANTUM Alpha Engine</h1>
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
        <!-- Tab Navigation -->
        <div class="flex bg-gray-800 rounded-lg p-1">
          <button 
            onclick={() => switchTab('arbitrage')}
            class="px-4 py-2 rounded text-sm transition {activeTab === 'arbitrage' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}"
          >
            Arbitrage Bot
          </button>
          <button 
            onclick={() => switchTab('copytrading')}
            class="px-4 py-2 rounded text-sm transition {activeTab === 'copytrading' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}"
          >
            Copy Trading
          </button>
          <button 
            onclick={() => switchTab('analytics')}
            class="px-4 py-2 rounded text-sm transition {activeTab === 'analytics' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}"
          >
            Analytics
          </button>
        </div>
        
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
    
    {#if activeTab === 'arbitrage'}
    <!-- ARBITRAGE BOT TAB -->
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
          </div>
        </div>
      </div>
    </div>
    {/if}
    
    {#if activeTab === 'copytrading'}
    <!-- COPY TRADING TAB -->
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-gray-900 border border-purple-500/30 rounded p-4">
        <div class="flex items-center gap-2 mb-1">
          <Users class="w-4 h-4 text-purple-400" />
          <span class="text-gray-400 text-xs">Active Traders</span>
        </div>
        <div class="text-3xl text-purple-400">{copyStats.totalTraders}</div>
      </div>
      
      <div class="bg-gray-900 border border-purple-500/30 rounded p-4">
        <div class="flex items-center gap-2 mb-1">
          <Activity class="w-4 h-4 text-purple-400" />
          <span class="text-gray-400 text-xs">Total Trades</span>
        </div>
        <div class="text-3xl text-purple-400">{copyStats.totalTrades.toLocaleString()}</div>
      </div>
      
      <div class="bg-gray-900 border border-purple-500/30 rounded p-4">
        <div class="flex items-center gap-2 mb-1">
          <DollarSign class="w-4 h-4 text-purple-400" />
          <span class="text-gray-400 text-xs">Total Volume</span>
        </div>
        <div class="text-3xl text-purple-400">${(copyStats.totalVolume / 1000000).toFixed(2)}M</div>
      </div>
      
      <div class="bg-gray-900 border border-purple-500/30 rounded p-4">
        <div class="flex items-center gap-2 mb-1">
          <TrendingUp class="w-4 h-4 text-purple-400" />
          <span class="text-gray-400 text-xs">Combined P&L</span>
        </div>
        <div class="text-3xl {copyStats.avgPnl >= 0 ? 'text-green-400' : 'text-red-400'}">${copyStats.avgPnl.toLocaleString()}</div>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Top Traders -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl text-purple-400">🏆 Top Traders to Copy</h2>
          <span class="text-xs text-gray-400">
            {copyConnectionStatus === 'connected' ? '🟢 Live' : '🔴 Disconnected'}
          </span>
        </div>
        
        {#if traders.length === 0}
          <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-8 text-center text-gray-400">
            Loading traders...
          </div>
        {:else}
          {#each traders as trader (trader.address)}
            <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-4 hover:bg-gray-800 transition-colors">
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-full flex items-center justify-center text-lg font-bold">
                    {(trader.name || trader.pseudonym || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{trader.name || trader.pseudonym || `${trader.address.slice(0, 6)}...${trader.address.slice(-4)}`}</h3>
                    <a 
                      href={`https://polymarket.com/profile/${trader.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-gray-400 hover:text-purple-400 flex items-center"
                    >
                      {trader.address.slice(0, 8)}...{trader.address.slice(-4)}
                      <ExternalLink class="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="text-2xl font-bold text-purple-400">{trader.score}</span>
                  <span class="text-xs text-gray-400">score</span>
                </div>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  {trader.strategy}
                </span>
                {#each trader.tags.slice(0, 3) as tag}
                  <span class="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">{tag}</span>
                {/each}
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p class="text-gray-400 text-xs">P&L</p>
                  <p class="font-semibold flex items-center {trader.profitLoss > 0 ? 'text-green-400' : 'text-red-400'}">
                    {#if trader.profitLoss > 0}
                      <TrendingUp class="w-3 h-3 mr-1" />
                    {:else}
                      <TrendingDown class="w-3 h-3 mr-1" />
                    {/if}
                    ${trader.profitLoss.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Win Rate</p>
                  <p class="font-semibold">{trader.winRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Trades</p>
                  <p class="font-semibold">{trader.totalTrades}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Volume</p>
                  <p class="font-semibold">${(trader.totalVolume / 1000).toFixed(1)}K</p>
                </div>
              </div>

              <!-- Action Button -->
              <div class="mt-4 pt-3 border-t border-gray-800 flex justify-end">
                <button class="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
                  <Copy class="w-4 h-4 mr-2" />
                  Copy Trader
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Live Trade Feed -->
      <div>
        <h2 class="text-xl text-purple-400 mb-4">📡 Live Trades</h2>
        <div class="bg-gray-900 border border-purple-500/30 rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
          {#if trades.length === 0}
            <div class="p-8 text-center text-gray-400">
              <p>Waiting for trades...</p>
              <p class="text-sm mt-2">Live trades will appear here</p>
            </div>
          {:else}
            <div class="divide-y divide-gray-800">
              {#each trades as trade (trade.transactionHash)}
                <div class="p-3 hover:bg-gray-800 transition-colors">
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2">
                        <span class="text-xs font-semibold {trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}">
                          {trade.side === 'BUY' ? '↑' : '↓'} {trade.side}
                        </span>
                        <span class="text-xs text-gray-500">{formatTime(trade.timestamp)}</span>
                      </div>
                      <p class="text-sm font-medium truncate mt-1">
                        {trade.traderName || `${trade.traderAddress.slice(0, 6)}...`}
                      </p>
                      <p class="text-xs text-gray-400 truncate">{trade.marketTitle}</p>
                    </div>
                    <div class="text-right ml-3">
                      <p class="text-sm font-semibold">${trade.usdcSize.toFixed(2)}</p>
                      <p class="text-xs text-gray-500">@{trade.price.toFixed(3)}</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
    {/if}
    
    {#if activeTab === 'analytics'}
    <!-- ANALYTICS TAB -->
    <div class="text-center py-20">
      <h2 class="text-2xl text-gray-400 mb-4">📊 Advanced Analytics</h2>
      <p class="text-gray-500">Coming Soon - Performance analytics and strategy optimization</p>
      <div class="mt-8 text-sm text-gray-600">
        <p>Planned features:</p>
        <ul class="mt-2 space-y-1">
          <li>Probabilistic Forest Arbitrage Scanner</li>
          <li>Performance backtesting</li>
          <li>Strategy correlation analysis</li>
          <li>Risk-adjusted returns</li>
        </ul>
      </div>
    </div>
    {/if}

    <!-- Footer -->
    <footer class="mt-12 text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
      <p>KWANTUM Tech - Alpha Engine | Arbitrage + Copy Trading</p>
      <p class="mt-1 text-xs">Data refreshes every 5 seconds | 3-Day Paper Trading Period</p>
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
