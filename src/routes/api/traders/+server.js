import { json } from '@sveltejs/kit';

// Known profitable traders
const KNOWN_TRADERS = [
  '0x93C22116E4402C9', // The "invisible" arbitrage whale
  '0xe90bec87d9ef430f27f9dcfe72c34b76967d5da2',
];

export async function GET() {
  try {
    const traders = await Promise.all(
      KNOWN_TRADERS.map(async (address) => {
        try {
          // Fetch activity
          const activityRes = await fetch(
            `https://data-api.polymarket.com/activity?user=${address}&type=TRADE&limit=100`
          );
          const activities = await activityRes.json();
          
          // Fetch positions
          const positionsRes = await fetch(
            `https://data-api.polymarket.com/positions?user=${address}`
          );
          const positions = await positionsRes.json();
          
          if (!Array.isArray(activities) || activities.length === 0) {
            return null;
          }

          // Calculate metrics
          const totalVolume = activities.reduce((sum, t) => sum + (t.usdcSize || 0), 0);
          const totalTrades = activities.length;
          
          let profitLoss = 0;
          let winRate = 0;
          
          if (Array.isArray(positions) && positions.length > 0) {
            const totalPnl = positions.reduce((sum, p) => sum + (p.cashPnl || 0), 0);
            const winningPositions = positions.filter(p => (p.percentPnl || 0) > 0).length;
            profitLoss = totalPnl;
            winRate = (winningPositions / positions.length) * 100;
          }

          // Determine strategy
          const strategy = classifyStrategy(activities);
          
          // Calculate score
          const score = calculateScore({
            totalVolume,
            profitLoss,
            winRate,
            totalTrades,
            strategy
          });

          const tags = generateTags(activities, positions, strategy);
          const latestActivity = activities[0];

          return {
            address,
            name: latestActivity?.name,
            pseudonym: latestActivity?.pseudonym,
            totalVolume,
            profitLoss,
            winRate,
            totalTrades,
            avgTradeSize: totalVolume / totalTrades,
            strategy,
            score,
            tags
          };
        } catch (error) {
          console.error(`Error analyzing trader ${address}:`, error);
          return null;
        }
      })
    );

    const validTraders = traders.filter(t => t !== null);
    
    return json({ traders: validTraders, count: validTraders.length });
  } catch (error) {
    return json({ error: 'Failed to fetch traders' }, { status: 500 });
  }
}

function classifyStrategy(activities) {
  const buyCount = activities.filter(a => a.side === 'BUY').length;
  const sellCount = activities.filter(a => a.side === 'SELL').length;
  
  const marketTitles = activities.map(a => a.title);
  const uniqueMarkets = new Set(marketTitles).size;
  const duplicateMarkets = marketTitles.length - uniqueMarkets;
  
  if (duplicateMarkets > activities.length * 0.3) {
    return 'Internal Arbitrage';
  }
  
  const sportsKeywords = ['nfl', 'nba', 'soccer', 'football', 'tennis', 'ufc', 'mlb'];
  const sportsTrades = activities.filter(a => 
    sportsKeywords.some(kw => a.title?.toLowerCase().includes(kw))
  ).length;
  
  if (sportsTrades > activities.length * 0.5) {
    return 'Sports Arbitrage';
  }
  
  return 'Mixed';
}

function calculateScore(metrics) {
  let score = 0;
  score += Math.min(20, metrics.totalVolume / 10000);
  if (metrics.profitLoss > 0) {
    score += Math.min(40, metrics.profitLoss / 100);
  }
  score += (metrics.winRate / 100) * 25;
  if (metrics.totalTrades > 50) score += 10;
  else if (metrics.totalTrades > 20) score += 5;
  if (metrics.strategy === 'Internal Arbitrage') score += 5;
  return Math.min(100, Math.max(0, score));
}

function generateTags(activities, positions, strategy) {
  const tags = [strategy];
  if (activities.length > 100) tags.push('High Volume');
  if (activities.length > 500) tags.push('Whale');
  
  const timestamps = activities.map(a => a.timestamp);
  const daysActive = (Math.max(...timestamps) - Math.min(...timestamps)) / 86400;
  if (daysActive > 30) tags.push('Consistent');
  if (daysActive > 90) tags.push('Veteran');
  
  const totalPnl = positions?.reduce((sum, p) => sum + (p.cashPnl || 0), 0) || 0;
  if (totalPnl > 10000) tags.push('High Profit');
  if (totalPnl > 100000) tags.push('Elite');
  
  return tags;
}
