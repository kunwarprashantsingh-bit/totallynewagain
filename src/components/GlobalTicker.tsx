import React from 'react';
import { ResponsiveContainer, LineChart as ReLineChart, YAxis, Line } from 'recharts';
import { MarketData } from '../types';
import { cn } from '../lib/utils';

interface GlobalTickerProps {
  data: MarketData[];
  onAssetClick: (asset: MarketData) => void;
  loading?: boolean;
}

const GlobalTicker = ({ data, onAssetClick, loading }: GlobalTickerProps) => {
  if (loading) {
    return (
      <div className="bg-brand text-text py-2 overflow-hidden whitespace-nowrap border-y border-text/10 h-10 flex items-center">
        <div className="inline-block animate-pulse w-full px-8">
          <div className="h-4 bg-white/10 rounded w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-brand text-text py-2 overflow-hidden whitespace-nowrap border-y border-text/10">
      <div className="inline-block animate-marquee hover:pause">
        {data.concat(data).map((item, i) => (
          <span 
            key={i} 
            onClick={() => onAssetClick(item)}
            className="mx-8 inline-flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-white/5 py-1 px-2 rounded transition-colors"
          >
            <span className="hover:text-accent transition-colors">
              {item.symbol} <span className="text-accent">{item.price.toFixed(2)}</span>
              <span className={cn("ml-2", item.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
              </span>
            </span>
            <div className="w-12 h-6">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={item.trend.map((val, idx) => ({ val, idx }))}>
                  <YAxis hide domain={['auto', 'auto']} />
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke={item.change >= 0 ? "#10b981" : "#f87171"} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
};

export default GlobalTicker;
