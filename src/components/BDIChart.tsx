import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from 'recharts';
import { MarketData } from '../types';
import { cn } from '../lib/utils';

interface BDIChartProps {
  data: MarketData[];
  loading?: boolean;
}

const BDIChart = ({ data, loading }: BDIChartProps) => {
  if (loading) {
    return (
      <div className="bg-brand-light/20 border-b border-white/10 py-4 px-6 h-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  const bdi = data.find(item => item.symbol === 'BDI');
  if (!bdi) return null;

  const chartData = bdi.trend.map((val, i) => ({
    name: `Day ${i + 1}`,
    value: val
  }));

  return (
    <div className="bg-brand-light/20 border-b border-white/10 py-4 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">{bdi.name}</h3>
              <a 
                href={bdi.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[8px] text-accent hover:underline uppercase tracking-widest"
              >
                Source
              </a>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{bdi.price.toLocaleString()}</span>
              <span className={cn("text-xs font-bold", bdi.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                {bdi.change >= 0 ? '+' : ''}{bdi.change.toFixed(2)} ({bdi.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 h-16 max-w-md w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBdi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis hide domain={['auto', 'auto']} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#F27D26" 
                fillOpacity={1} 
                fill="url(#colorBdi)" 
                strokeWidth={2}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-brand border border-white/10 p-2 rounded shadow-xl text-[10px] font-bold">
                        {payload[0].value}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="hidden lg:block text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Market Sentiment</p>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
            Bullish Expansion
          </span>
        </div>
      </div>
    </div>
  );
};

export default BDIChart;
