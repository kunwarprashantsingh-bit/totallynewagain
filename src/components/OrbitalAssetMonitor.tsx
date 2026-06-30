import React from 'react';
import { motion } from 'motion/react';
import { Satellite, Navigation, Crosshair, Map } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { day: 'Mon', capacity: 45 },
  { day: 'Tue', capacity: 52 },
  { day: 'Wed', capacity: 58 },
  { day: 'Thu', capacity: 49 },
  { day: 'Fri', capacity: 65 },
  { day: 'Sat', capacity: 82 },
  { day: 'Sun', capacity: 78 },
];

export function OrbitalAssetMonitor() {
  return (
    <div className="w-full h-full bg-brand p-6 rounded-3xl border border-white/5 flex flex-col gap-6 text-white font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
            <Satellite className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight">Orbital SAR Monitor</h3>
            <p className="text-sm text-gray-400">Synthetic Aperture Radar & Optical Satellite Tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-xs font-medium uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Feed Active
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map UI Placeholder */}
        <div className="lg:col-span-2 bg-brand-light/20 rounded-2xl border border-white/5 p-1 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
          
          {/* Scanning animation overlay */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }} 
            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            className="absolute left-0 right-0 h-1 bg-accent/50 shadow-[0_0_20px_rgba(197,160,89,0.8)] z-10"
          />

          {/* Targets */}
          <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center animate-pulse">
              <Crosshair className="w-4 h-4 text-accent" />
            </div>
            <div className="mt-2 px-2 py-1 bg-brand/80 backdrop-blur-sm border border-white/10 rounded text-[10px] uppercase font-mono text-accent">
              Obj: Shanghai Port 4
            </div>
          </div>

          <div className="absolute bottom-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-8 h-8 rounded-full border border-red-500 flex items-center justify-center animate-pulse">
              <Crosshair className="w-4 h-4 text-red-500" />
            </div>
            <div className="mt-2 px-2 py-1 bg-brand/80 backdrop-blur-sm border border-white/10 rounded text-[10px] uppercase font-mono text-red-400">
              Anomaly: Copper Smelter 2
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 bg-brand/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
            <Map className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-300">Res: 0.5m / SAR Active / Cloud Cover: 0%</span>
          </div>
        </div>

        {/* Right: Analytics */}
        <div className="flex flex-col gap-4">
          <div className="bg-brand-light/20 p-5 rounded-2xl border border-white/5">
            <h4 className="text-sm font-medium text-gray-300 mb-1">Observed Inventory Estimate</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Target: Shanghai Port (TEU)</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="capacity" stroke="#C5A059" fillOpacity={1} fill="url(#colorCap)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex-1 bg-brand-light/20 p-5 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-accent" />
              Recent Intel Drops
            </h4>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {[
                { time: '10 mins ago', desc: 'Crude storage tank roofs lowered by 12% in Cushing, OK.', status: 'Bullish Oil' },
                { time: '1 hr ago', desc: 'Thermal signatures indicate blast furnaces offline at Facility C.', status: 'Bearish Steel' },
                { time: '3 hrs ago', desc: 'Parking lot density at TSMC fab increased 15% WoW.', status: 'Bullish Semi' }
              ].map((intel, idx) => (
                <div key={idx} className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-accent uppercase font-mono">{intel.time}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded", intel.status.includes('Bullish') ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>{intel.status}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{intel.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
