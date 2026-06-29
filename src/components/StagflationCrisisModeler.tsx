import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Sliders, Info, Bookmark, Landmark, HelpCircle, Activity, Play, Pause, RefreshCw, BarChart3, TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import { cn } from '../lib/utils';

const StagflationCrisisModeler: React.FC = () => {
  const [oilShock, setOilShock] = useState<number>(30); // oil supply cut %
  const [wageSpike, setWageSpike] = useState<number>(8); // wage index growth %
  const [tariffRate, setTariffRate] = useState<number>(15); // average import tariff %
  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `stagflation-${oilShock}-${wageSpike}-${tariffRate}`;
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
  }, [oilShock, wageSpike, tariffRate]);

  // Generate dynamic pricing outputs for 5 structural commodity clusters
  const metrics = useMemo(() => {
    const rawCrudePremium = oilShock * 1.6;
    const manufacturingLaborCost = wageSpike * 1.15;
    const steelCoilPremium = (oilShock * 0.45) + (wageSpike * 0.8) + (tariffRate * 1.1);
    const shippingFreightPremium = (oilShock * 0.9) + (tariffRate * 0.6);
    const overallSystemInflation = parseFloat(((oilShock * 0.22) + (wageSpike * 0.5) + (tariffRate * 0.3)).toFixed(1));

    const structuralSectors = [
      { name: 'Upstream Crude (WTI)', premium: rawCrudePremium, icon: '🔥', description: 'Immediate production and heating input fuel spike' },
      { name: 'Structural Blast-Furnace Steel', premium: steelCoilPremium, icon: '🏗️', description: 'Spurred by high energy input, wages, and raw import protection' },
      { name: 'G10 Dry Ocean Freight', premium: shippingFreightPremium, icon: '🚢', description: 'Surge in marine diesel bunkering costs and bypass route lengths' },
      { name: 'Industrial Labor Factor', premium: manufacturingLaborCost, icon: '👥', description: 'Sticky cost push spiral requiring higher base wages' }
    ];

    return {
      rawCrudePremium,
      manufacturingLaborCost,
      steelCoilPremium,
      shippingFreightPremium,
      overallSystemInflation,
      structuralSectors
    };
  }, [oilShock, wageSpike, tariffRate]);

  // Forecasted values across 10 years of simulated chronic stagflation
  const forecastData = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const year = 2026 + i;
      const baseOil = 75;
      const baseSteel = 620;

      // Compound oil based on severity
      const oilPrice = Math.round(baseOil * Math.pow(1.0 + (metrics.rawCrudePremium / 100), Math.min(1.0, i * 0.2)));
      const steelPrice = Math.round(baseSteel * Math.pow(1.0 + (metrics.steelCoilPremium / 100), Math.min(1.0, i * 0.15)));

      return {
        year: `${year}`,
        oilPrice,
        steelPrice
      };
    });
  }, [metrics]);

  const handleSaveWorkspace = () => {
    const savedId = `stagflation-${oilShock}-${wageSpike}-${tariffRate}`;
    
    const item = {
      id: savedId,
      title: `Stagflation Crisis Model`,
      summary: `Stress testing a 1970s-style chronic stagflation loop. Simulated a ${oilShock}% Oil supply cut and ${wageSpike}% wage index hike. System inflation projected at ${metrics.overallSystemInflation}%.`,
      fullContent: `=========================================================
SURVVI CLIENT PORTAL: CHRONIC STAGFLATION STRESS REPORT
=========================================================
Stress Parameters Modeled:
- OPEC Supply Chain Lock: -${oilShock}% aggregate physical availability
- Sticky Labor Wage Spiral: +${wageSpike}% annualized wage adjustments
- Protected Sovereign Tariffs: +${tariffRate}% cross-border tariff barriers

SYSTEM-WIDE SECTOR INFLATION IMPACTS:
- Systemic Structural CPI/Inflation: +${metrics.overallSystemInflation}%
- Upstream Crude Oil Premium: +${metrics.rawCrudePremium.toFixed(1)}%
- Blast-Furnace Steel Coils: +${metrics.steelCoilPremium.toFixed(1)}%
- Ocean Shipping Freight: +${metrics.shippingFreightPremium.toFixed(1)}%

DYNAMIC 10-YEAR STRATEGIC OUTLOOK:
${forecastData.map(d => `- Year ${d.year} | Oil: $${d.oilPrice}/bbl | Steel Coils: $${d.steelPrice}/ton`).join('\n')}

CRISIS ADVISORY DIRECTIVE:
Double-digit energy cuts combined with wage hikes create a powerful cost-push spiral. Traditional financial assets are heavily punished as real yields invert. Desks should pivot assets aggressively into physical, tangible raw stockpiles (copper, oil reserves, gold bullion) and re-engineer supply contracts with indexation caps to neutralize systemic inflationary propagation.
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
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            No. 12 - Stagflation Stress Sandbox
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Macro-Stagflation & <span className="text-accent">Sovereign Crisis Modeler</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Simulate the impact of high-energy shocks, protectionist tariffs, and sticky labor cost-push spirals on G10 manufacturing and industrial raw commodities.
          </p>
        </div>

        {/* Save button */}
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
          {isSaved ? "Saved to Workspace" : "Save Crisis Scenario"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Sliders & Variables */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-3xl p-6 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent border-b border-white/5 pb-2">Crisis Parameter Console</h4>

            {/* OPEC Oil Shock */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">OPEC Upstream Crude Shock</span>
                <span className="font-mono text-rose-400 font-bold">-{oilShock}% Supply Lock</span>
              </div>
              <input 
                type="range"
                min="0"
                max="60"
                step="5"
                value={oilShock}
                onChange={(e) => setOilShock(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                <span>0% (Equilibrium)</span>
                <span>30% (Moderate Squeeze)</span>
                <span>60% (1973 Embargo)</span>
              </div>
            </div>

            {/* Sticky Labor Wage Index */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Sticky Wage Cost Push Index</span>
                <span className="font-mono text-amber-400 font-bold">+{wageSpike}% Annual Growth</span>
              </div>
              <input 
                type="range"
                min="2"
                max="18"
                step="1"
                value={wageSpike}
                onChange={(e) => setWageSpike(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                <span>+2% (Target)</span>
                <span>+8% (Sticky Spiral)</span>
                <span>+18% (1979 Wage Spiral)</span>
              </div>
            </div>

            {/* Protected Trade Tariffs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Average G10 Import Tariffs</span>
                <span className="font-mono text-accent font-bold">+{tariffRate}% Tariff Rate</span>
              </div>
              <input 
                type="range"
                min="0"
                max="40"
                step="5"
                value={tariffRate}
                onChange={(e) => setTariffRate(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                <span>0% (Free Trade)</span>
                <span>+20% (Protectionist Guard)</span>
                <span>+40% (Smoot-Hawley Tariff)</span>
              </div>
            </div>

            {/* Total Systemic CPI Indicator */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Systemic CPI Inflation Velocity</div>
                <div className="text-xs text-white/40 mt-1">Projected annualized inflation rate</div>
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">+{metrics.overallSystemInflation}%</div>
            </div>
          </div>
        </div>

        {/* Right column: Impact Outputs & Line Charts */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Immediate Cluster Spikes</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.structuralSectors.map((sec, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg">{sec.icon}</span>
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      +{sec.premium.toFixed(0)}% Premium
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white mb-1">{sec.name}</h5>
                  <p className="text-[10px] text-white/40 leading-relaxed">{sec.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart showing compounded 10yr scenario */}
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 flex-1 flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Compounded Pricing Forecasts (10-Yr Chronic Horizon)</h4>
            
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  <Line type="monotone" dataKey="oilPrice" name="Crude Oil Price ($/bbl)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="steelPrice" name="Blast Furnace Steel Coils ($/ton)" stroke="#cbd5e1" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagflationCrisisModeler;
