import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    // Get monitored traders
    const traders = ['0x93C22116E4402C9', '0xe90bec87d9ef430f27f9dcfe72c34b76967d5da2'];
    
    const traderData = await Promise.all(
      traders.map(async (address) => {
        try {
          const [positionsRes, activityRes] = await Promise.all([
            fetch(`https://data-api.polymarket.com/positions?user=${address}`),
            fetch(`https://data-api.polymarket.com/activity?user=${address}&type=TRADE&limit=200`)
          ]);
          
          const positions = await positionsRes.json();
          const activities = await activityRes.json();
          
          return {
            address,
            positions: Array.isArray(positions) ? positions : [],
            activities: Array.isArray(activities) ? activities : []
          };
        } catch (error) {
          return { address, positions: [], activities: [] };
        }
      })
    );
    
    // Calculate metrics
    const analytics = {
      traders: traderData.map(t => ({
        address: t.address,
        totalTrades: t.activities.length,
        totalVolume: t.activities.reduce((sum, a) => sum + (a.usdcSize || 0), 0),
        openPositions: t.positions.length,
        unrealizedPnl: t.positions.reduce((sum, p) => sum + (p.cashPnl || 0), 0),
        avgPnl: t.positions.length > 0 
          ? t.positions.reduce((sum, p) => sum + (p.percentPnl || 0), 0) / t.positions.length 
          : 0
      })),
      summary: {
        totalTraders: traderData.length,
        totalTrades: traderData.reduce((sum, t) => sum + t.activities.length, 0),
        totalVolume: traderData.reduce((sum, t) => sum + t.activities.reduce((s, a) => s + (a.usdcSize || 0), 0), 0),
        totalOpenPositions: traderData.reduce((sum, t) => sum + t.positions.length, 0),
        combinedUnrealizedPnl: traderData.reduce((sum, t) => sum + t.positions.reduce((s, p) => s + (p.cashPnl || 0), 0), 0)
      }
    };
    
    return json(analytics);
  } catch (error) {
    return json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
