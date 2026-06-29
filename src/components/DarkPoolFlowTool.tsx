import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, ArrowUpRight, ArrowDownLeft, ShieldAlert, BarChart3, Bookmark, Landmark, Database, HelpCircle, Activity, Play, Pause
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend
} from 'recharts';
import { cn } from '../lib/utils';

interface BlockTrade {
  id: string;
  timestamp: string;
  ticker: string;
  name: string;
  price: number;
  size: number;
  valueUSD: number;
  condition: string; // "Block Cross" | "Dark Sweep" | "Inter-Dealer"
  direction: 'buy' | 'sell';
}

const SAMPLE_TICKERS = [
  { symbol: 'GLD', name: 'SPDR Gold Trust (Physical)', basePrice: 245.50 },
  { symbol: 'USO', name: 'United States Oil Fund (WTI)', basePrice: 78.20 },
  { symbol: 'FCX', name: 'Freeport-McMoRan (Copper)', basePrice: 52.10 },
  { symbol: 'LIT', name: 'Global X Lithium & Battery Tech', basePrice: 42.80 },
  { symbol: 'ZIM', name: 'ZIM Integrated Shipping', basePrice: 22.40 }
];

const CONDITIONS = ['Block Cross', 'Dark Sweep', 'Inter-Dealer Private'];

const DarkPoolFlowTool: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [blockTrades, setBlockTrades] = useState<BlockTrade[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Generate initial list of massive block trades
  useEffect(() => {
    const initialTrades: BlockTrade[] = Array.from({ length: 8 }).map((_, i) => {
      const tickerObj = SAMPLE_TICKERS[i % SAMPLE_TICKERS.length];
      const size = Math.floor(25000 + Math.random() * 85000);
      const value = size * tickerObj.basePrice;
      const hoursAgo = i + 1;
      const dateStr = new Date(Date.now() - hoursAgo * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      return {
        id: `block-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: dateStr,
        ticker: tickerObj.symbol,
        name: tickerObj.name,
        price: parseFloat((tickerObj.basePrice + (Math.random() * 2 - 1)).toFixed(2)),
        size,
        valueUSD: Math.round(value),
        condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
        direction: Math.random() > 0.45 ? 'buy' : 'sell'
      };
    });
    setBlockTrades(initialTrades);
  }, []);

  // Live block trade generator simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const tickerObj = SAMPLE_TICKERS[Math.floor(Math.random() * SAMPLE_TICKERS.length)];
      const size = Math.floor(50000 + Math.random() * 120000);
      const value = size * tickerObj.basePrice;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newTrade: BlockTrade = {
        id: `block-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        ticker: tickerObj.symbol,
        name: tickerObj.name,
        price: parseFloat((tickerObj.basePrice + (Math.random() * 1.5 - 0.75)).toFixed(2)),
        size,
        valueUSD: Math.round(value),
        condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
        direction: Math.random() > 0.42 ? 'buy' : 'sell'
      };

      setBlockTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `darkpool-${blockTrades[0]?.ticker || 'main'}`;
        setIsSaved(parsed.some((i: any) => i.id === savedId));
      } else {
        setIsSaved(false);
      }
    } catch (e) {
      setIsSaved(false);
    }
  };

  useEffect(() => {
    checkIfSaved();
  }, [blockTrades]);

  // Aggregate stats from block trades
  const stats = useMemo(() => {
    const totalVolume = blockTrades.reduce((acc, curr) => acc + curr.valueUSD, 0);
    const buyTrades = blockTrades.filter(t => t.direction === 'buy');
    const buyVolume = buyTrades.reduce((acc, curr) => acc + curr.valueUSD, 0);
    const buyRatio = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;

    // Aggregate concentration by Ticker
    const counts: Record<string, number> = {};
    blockTrades.forEach(t => {
      counts[t.ticker] = (counts[t.ticker] || 0) + t.valueUSD;
    });

    const chartData = Object.entries(counts).map(([ticker, val]) => ({
      ticker,
      volumeMillions: parseFloat((val / 1000000).toFixed(2))
    }));

    return {
      totalVolume,
      buyRatio,
      chartData
    };
  }, [blockTrades]);

  const handleSaveWorkspace = () => {
    const savedId = `darkpool-${blockTrades[0]?.ticker || 'main'}`;
    
    const item = {
      id: savedId,
      title: `Dark Pool Liquidity Scan`,
      summary: `Proprietary cross-desk private block trade scanner. Tracked $${(stats.totalVolume / 1000000).toFixed(1)}M in off-exchange volume. Buy-side pressure quotient is currently ${stats.buyRatio.toFixed(1)}%.`,
      fullContent: `=========================================================
SURVVI CLIENT PORTAL: OFF-EXCHANGE INSTITUTIONAL BLOCK MONITOR
=========================================================
Observation Scope: Sovereign private placements and off-market institutional crosses
Modeled Desk Concentration: Goldman Sachs Sigma X, BlackRock Aladdin Crossing, UBS ATS

MONITORED BLOCK METRICS:
- Cumulative Scanning Window Volume: $${(stats.totalVolume).toLocaleString()} USD
- Institutional Buy Accumulation Quotient: ${stats.buyRatio.toFixed(1)}%
- Sell-side Liquidation Pressure: ${(100 - stats.buyRatio).toFixed(1)}%

LATEST MONITORED MASSIVE CROSSINGS:
${blockTrades.slice(0, 5).map(t => `- [${t.timestamp}] Ticker: ${t.ticker} (${t.name}) | Size: ${t.size.toLocaleString()} shares @ $${t.price} | Value: $${(t.valueUSD / 1000000).toFixed(2)}M | Execution Condition: ${t.condition} | Bias: ${t.direction.toUpperCase()}`).join('\n')}

STRATEGIC DIRECTIVE:
Sovereign wealth desks indicate high accumulation levels in physical commods and logistics trusts. The buy accumulation quotient of ${stats.buyRatio.toFixed(1)}% suggests quiet, long-term asset positioning before public exchange indices register the volume trends. Buy-side spot positioning is highly recommended.
=========================================================
Archived on ${new Date().toLocaleString()} | Survvi Sovereign Analytics Suite`,
    };

    const event = new CustomEvent('ai_studio_add_workspace', {
      detail: { item, type: 'research' }
    });
    window.dispatchEvent(event);
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Tool Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-3">
            <Database className="w-3.5 h-3.5" />
            No. 11 - Off-Exchange Block Scanner
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Dark Pool & <span className="text-accent">Institutional Liquidity Flow Radar</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Intercept private block trades, ATS crossing networks, and major inter-dealer desk settlements to identify quiet sovereign accumulation patterns.
          </p>
        </div>

        {/* Play Pause and Save buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
              isPlaying 
                ? "bg-white/5 text-white border-white/10 hover:border-white/20" 
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-brand"
            )}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "Pause Stream" : "Resume Stream"}
          </button>

          <button
            onClick={handleSaveWorkspace}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all border",
              isSaved 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-brand"
            )}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {isSaved ? "Saved to Workspace" : "Save Liquidity Scan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Real-Time Flow Scans */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-brand/30 border border-white/5 rounded-3xl p-6 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Live Private ATS Crossing Stream</h4>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className={cn("absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75", isPlaying && "animate-ping")}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {isPlaying ? "Feed Online" : "Feed Paused"}
              </div>
            </div>

            {/* Block Trades List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 scrollbar-hide">
              <AnimatePresence initial={false}>
                {blockTrades.map((trade) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.35 }}
                    className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2.5 rounded-xl border shrink-0",
                        trade.direction === 'buy' 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}>
                        {trade.direction === 'buy' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-white">{trade.ticker}</span>
                          <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-white/40 font-mono tracking-widest uppercase">{trade.condition}</span>
                        </div>
                        <p className="text-[10px] text-white/40 mt-1">{trade.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-white">${trade.price.toFixed(2)}</div>
                      <div className="text-[10px] font-mono text-white/50 mt-1">
                        {(trade.size).toLocaleString()} shares | <span className="text-accent font-bold">${(trade.valueUSD / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right column: Indicators, Pie Chart / Concentration */}
        <div className="lg:col-span-5 space-y-6">
          {/* Institutional Bias scale */}
          <div className="bg-brand/30 border border-white/5 rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Sovereign Buying Pressure Quotient</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Buy Pressure ({stats.buyRatio.toFixed(1)}%)
                </span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  Sell Pressure ({(100 - stats.buyRatio).toFixed(1)}%) <ArrowDownLeft className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Progress bar scale */}
              <div className="w-full h-3 bg-rose-500/20 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${stats.buyRatio}%` }}
                />
              </div>

              <div className="text-[10px] text-white/40 leading-relaxed text-center mt-2">
                Accumulation signals derived from aggregate dark sweeps indicate <strong>strong physical commodities backing</strong> across global strategic sovereign desks.
              </div>
            </div>
          </div>

          {/* Concentration Chart (Recharts) */}
          <div className="bg-brand/30 border border-white/5 rounded-3xl p-6 h-[340px] flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Dark Pool Volume Concentration ($ Millions)</h4>
            
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="ticker" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                  />
                  <Bar dataKey="volumeMillions" name="Accumulated Volume ($M)" fill="#c5a059" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkPoolFlowTool;
