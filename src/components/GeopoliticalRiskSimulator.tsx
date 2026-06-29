import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, AlertTriangle, Shield, TrendingUp, MapPin, 
  Crosshair, Activity, Globe, Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';
import { cn } from '../lib/utils';

const SCENARIOS = [
  {
    id: 'hormuz-blockade',
    name: 'Strait of Hormuz Closure',
    category: 'Energy Security',
    probability: 12,
    severity: 'Critical',
    impactRadius: 'Global',
    description: 'A complete blockage of the Strait of Hormuz choking off 21 million barrels per day (mbpd) of global oil consumption and 20% of global LNG trade flows.',
    affectedCommodities: [
      { name: 'Brent Crude', shock: '+45%', duration: '90 Days' },
      { name: 'Asian LNG (JKM)', shock: '+60%', duration: '120 Days' },
      { name: 'Gold', shock: '+12%', duration: '45 Days' }
    ],
    chartData: Array.from({ length: 12 }).map((_, i) => ({
      week: `Week ${i}`,
      baseline: 80,
      shock: i === 0 ? 80 : 80 + (40 * Math.exp(-0.2 * (i - 1))) + (Math.random() * 5)
    }))
  },
  {
    id: 'taiwan-blockade',
    name: 'Taiwan Strait Disruption',
    category: 'Tech & Supply Chain',
    probability: 8,
    severity: 'Catastrophic',
    impactRadius: 'Global',
    description: 'A naval quarantine or blockade disrupting advanced semiconductor exports and severely constraining South China Sea maritime commercial shipping routes.',
    affectedCommodities: [
      { name: 'Semiconductors', shock: '+150%', duration: '24+ Months' },
      { name: 'Copper', shock: '-15%', duration: '60 Days (Demand Destruction)' },
      { name: 'Rare Earths', shock: '+85%', duration: '12 Months' }
    ],
    chartData: Array.from({ length: 12 }).map((_, i) => ({
      week: `Week ${i}`,
      baseline: 100,
      shock: i === 0 ? 100 : 100 + (120 * (1 - Math.exp(-0.5 * i))) + (Math.random() * 10)
    }))
  },
  {
    id: 'russian-metals-ban',
    name: 'Total LME Ban on Russian Metals',
    category: 'Sanctions',
    probability: 35,
    severity: 'High',
    impactRadius: 'Europe/US',
    description: 'Complete exclusion of Russian origin Aluminum, Nickel, and Copper from London Metal Exchange (LME) and Chicago Mercantile Exchange (CME) delivery networks.',
    affectedCommodities: [
      { name: 'LME Nickel', shock: '+25%', duration: '30 Days' },
      { name: 'LME Aluminum', shock: '+18%', duration: '45 Days' },
      { name: 'Palladium', shock: '+35%', duration: '90 Days' }
    ],
    chartData: Array.from({ length: 12 }).map((_, i) => ({
      week: `Week ${i}`,
      baseline: 18000,
      shock: i === 0 ? 18000 : 18000 + (4500 * Math.exp(-0.4 * (i - 1))) + (Math.random() * 200)
    }))
  }
];

const GeopoliticalRiskSimulator: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('hormuz-blockade');

  const scenario = useMemo(() => {
    return SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];
  }, [activeScenarioId]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest mb-3">
            <Target className="w-3.5 h-3.5" />
            No. 6 - Risk Simulator
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Geopolitical Risk <span className="text-red-400">War-Gaming Engine</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Simulate macro-economic shocks, price contagion, and supply chain ruptures triggered by black swan geopolitical events and sanctions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioId(s.id)}
              className={cn(
                "px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                activeScenarioId === s.id
                  ? "bg-red-500/10 text-red-400 border-red-500/30 font-extrabold"
                  : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-brand/30 border border-red-500/10 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-[0.02] pointer-events-none text-red-500">
              <Globe className="w-48 h-48" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-4">{scenario.name}</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Probability</div>
                  <div className="text-lg font-bold text-white">{scenario.probability}%</div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <div className="text-[9px] uppercase tracking-widest text-red-400/70 mb-1">Severity</div>
                  <div className="text-lg font-bold text-red-400">{scenario.severity}</div>
                </div>
              </div>

              <p className="text-xs text-white/60 leading-relaxed mb-6">
                {scenario.description}
              </p>

              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">
                  Immediate Contagion Radius
                </h5>
                {scenario.affectedCommodities.map((cmd, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg">
                    <span className="text-xs font-bold text-white/80">{cmd.name}</span>
                    <div className="text-right">
                      <span className={cn(
                        "text-xs font-bold font-mono block",
                        cmd.shock.startsWith('+') ? "text-red-400" : "text-emerald-400"
                      )}>
                        {cmd.shock} Shock
                      </span>
                      <span className="text-[9px] text-white/40 uppercase tracking-widest">
                        {cmd.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chart */}
        <div className="lg:col-span-8">
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Shock Wave Trajectory</h4>
                <p className="text-[10px] text-white/40 mt-1">Simulated price evolution over the first 12 weeks of the event.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest animate-pulse">
                <Flame className="w-3 h-3" /> Event Simulated
              </div>
            </div>

            <div className="flex-1 min-h-[350px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scenario.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="shockGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                      
                      <ReferenceLine x="Week 0" stroke="rgba(248,113,113,0.5)" strokeDasharray="3 3" label={{ value: 'Event Trigger', fill: '#f87171', fontSize: 9, position: 'insideTopLeft' }} />
                      
                      <Area type="step" dataKey="baseline" name="Pre-Event Baseline Price" stroke="#4b5563" strokeWidth={2} fill="none" strokeDasharray="5 5" />
                      <Area type="monotone" dataKey="shock" name="Simulated Price Trajectory" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#shockGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeopoliticalRiskSimulator;
