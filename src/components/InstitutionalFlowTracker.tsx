import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, BarChart4, TrendingUp, TrendingDown, Layers, Activity } from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { cn } from '../lib/utils';

const ASSETS = [
  { id: 'copper', name: 'COMEX Copper', type: 'Base Metal' },
  { id: 'gold', name: 'COMEX Gold', type: 'Precious Metal' },
  { id: 'crude', name: 'WTI Crude', type: 'Energy' }
];

const generateFlowData = (volatility: number, base: number) => {
  let acc = base;
  return Array.from({ length: 24 }).map((_, i) => {
    const isDark = Math.random() > 0.5;
    const long = Math.random() * 15000 + 5000;
    const short = Math.random() * 12000 + 4000;
    const net = long - short;
    acc += (net / 100);
    
    return {
      week: `W-${24 - i}`,
      'Managed Money Long': long,
      'Managed Money Short': -short,
      'Net Positioning': net,
      'Price': acc + (Math.sin(i) * volatility),
      'Dark Pool Vol': Math.random() * 8000 + 2000
    };
  });
};

const InstitutionalFlowTracker: React.FC = () => {
  const [activeAssetId, setActiveAssetId] = useState<string>('copper');

  const chartData = React.useMemo(() => {
    if (activeAssetId === 'copper') return generateFlowData(0.1, 4.0);
    if (activeAssetId === 'gold') return generateFlowData(50, 2000);
    return generateFlowData(3, 80);
  }, [activeAssetId]);

  const latestData = chartData[chartData.length - 1];
  const netBias = latestData['Net Positioning'] > 0 ? 'Bullish' : 'Bearish';

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-[10px] font-bold uppercase tracking-widest mb-3">
            <Wallet className="w-3.5 h-3.5" />
            No. 7 - Institutional Flows
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Institutional Flow & <span className="text-[#00d4ff]">Dark Pool</span> Tracker
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Monitor "Smart Money" positioning via COT reports, uncover off-exchange (OTC) dark pool block trades, and analyze cumulative volume deltas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ASSETS.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveAssetId(a.id)}
              className={cn(
                "px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                activeAssetId === a.id
                  ? "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/30 font-extrabold"
                  : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
              )}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-3xl p-6">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Latest Report Summary</div>
            
            <div className="space-y-6">
              <div>
                <div className="text-xs text-white/60 mb-1">Managed Money Net Bias</div>
                <div className={cn(
                  "text-2xl font-bold font-mono flex items-center gap-2",
                  netBias === 'Bullish' ? "text-emerald-400" : "text-red-400"
                )}>
                  {netBias === 'Bullish' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {netBias}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/60 mb-1">Net Speculative Contracts</div>
                <div className="text-xl font-bold font-mono text-white">
                  {(latestData['Net Positioning'] > 0 ? '+' : '')}{Math.round(latestData['Net Positioning']).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/60 mb-1">Dark Pool Block Vol Estimate</div>
                <div className="text-xl font-bold font-mono text-amber-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {Math.round(latestData['Dark Pool Vol']).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 text-white/70">
                <BarChart4 className="w-4 h-4" /> Raw COT Data
              </button>
            </div>
          </div>
        </div>

        {/* Right Chart */}
        <div className="lg:col-span-9">
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 h-full min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Commitments of Traders & OTC Volume</h4>
                <p className="text-[10px] text-white/40 mt-1">Overlay of Hedge Fund Long/Short positioning against Spot Price action.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest">
                <Activity className="w-3 h-3" /> CFTC Sync Active
              </div>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} stackOffset="sign">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#00d4ff', fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  
                  <Bar yAxisId="left" dataKey="Managed Money Long" stackId="a" fill="#10b981" barSize={16} radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="left" dataKey="Managed Money Short" stackId="a" fill="#ef4444" barSize={16} radius={[0, 0, 2, 2]} />
                  
                  <Line yAxisId="right" type="monotone" dataKey="Price" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff', r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstitutionalFlowTracker;
