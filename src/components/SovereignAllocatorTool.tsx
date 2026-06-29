import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, Wallet, Globe, TrendingUp, HelpCircle, 
  ChevronRight, Bookmark, ArrowRight, ShieldCheck, Landmark, DollarSign, Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { cn } from '../lib/utils';

interface AssetClass {
  id: string;
  name: string;
  color: string;
  baseWeight: number;
  description: string;
}

const ASSET_CLASSES: AssetClass[] = [
  { id: 'treasuries', name: 'G10 Sovereign Bonds', color: '#3b82f6', baseWeight: 45, description: 'High-liquidity reserve assets and US Treasuries.' },
  { id: 'gold', name: 'Physical Gold Reserves', color: '#c5a059', baseWeight: 15, description: 'Non-fiat monetary defense and systemic hedge.' },
  { id: 'infrastructure', name: 'Critical Infrastructure & Real Estate', color: '#10b981', baseWeight: 18, description: 'Ports, power grids, logistics, and real assets.' },
  { id: 'tech', name: 'Sovereign Tech Venture Fund', color: '#a855f7', baseWeight: 12, description: 'Semiconductors, defensive AI, and quantum research.' },
  { id: 'commodities', name: 'Strategic Commodity Stockpiles', color: '#f59e0b', baseWeight: 10, description: 'Oil, copper, lithium, and agricultural storage.' }
];

const REGIMES = [
  { id: 'equilibrium', name: 'Global Equilibrium', inflationFactor: 0, polarizationFactor: 0, growthFactor: 0 },
  { id: 'inflation_spiral', name: 'Stagflationary Spiral', inflationFactor: 1.8, polarizationFactor: 1.2, growthFactor: -0.5 },
  { id: 'de_dollarization', name: 'Polarized De-Dollarization', inflationFactor: 1.1, polarizationFactor: 2.2, growthFactor: -0.2 },
  { id: 'tech_cold_war', name: 'Defensive Tech Hegemony', inflationFactor: 0.5, polarizationFactor: 1.8, growthFactor: 1.4 }
];

const SovereignAllocatorTool: React.FC = () => {
  const [selectedRegimeId, setSelectedRegimeId] = useState('equilibrium');
  const [sovereignFundSize, setSovereignFundSize] = useState<number>(150); // in Billions USD
  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `allocator-${selectedRegimeId}-${sovereignFundSize}`;
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
  }, [selectedRegimeId, sovereignFundSize]);

  const regime = useMemo(() => {
    return REGIMES.find(r => r.id === selectedRegimeId) || REGIMES[0];
  }, [selectedRegimeId]);

  // Dynamically calculate weight adjustments based on selected macroeconomic/geopolitical regime
  const allocatedWeights = useMemo(() => {
    let totalWeight = 100;
    const adjustedWeights = ASSET_CLASSES.map(asset => {
      let weight = asset.baseWeight;

      if (selectedRegimeId === 'inflation_spiral') {
        if (asset.id === 'gold') weight += 15;
        if (asset.id === 'commodities') weight += 12;
        if (asset.id === 'treasuries') weight -= 20;
        if (asset.id === 'tech') weight -= 5;
        if (asset.id === 'infrastructure') weight -= 2;
      } else if (selectedRegimeId === 'de_dollarization') {
        if (asset.id === 'gold') weight += 20;
        if (asset.id === 'commodities') weight += 8;
        if (asset.id === 'treasuries') weight -= 28;
        } else if (selectedRegimeId === 'tech_cold_war') {
        if (asset.id === 'tech') weight += 18;
        if (asset.id === 'infrastructure') weight += 6;
        if (asset.id === 'treasuries') weight -= 14;
        if (asset.id === 'gold') weight -= 5;
        if (asset.id === 'commodities') weight -= 5;
      }

      return { ...asset, weight: Math.max(5, weight) };
    });

    const sum = adjustedWeights.reduce((acc, curr) => acc + curr.weight, 0);
    // Normalize back to 100%
    return adjustedWeights.map(w => ({
      ...w,
      percentage: parseFloat(((w.weight / sum) * 100).toFixed(1)),
      valueUSD: parseFloat((((w.weight / sum) * sovereignFundSize)).toFixed(2))
    }));
  }, [selectedRegimeId, sovereignFundSize]);

  const handleSaveWorkspace = () => {
    const savedId = `allocator-${selectedRegimeId}-${sovereignFundSize}`;
    
    const item = {
      id: savedId,
      title: `Sovereign Allocation Strategy: ${regime.name}`,
      summary: `Macro reserve rebalancing simulator under ${regime.name} paradigm. Modeling a $${sovereignFundSize}B reserve mandate. Physical gold allocations adjusted to ${allocatedWeights.find(w => w.id === 'gold')?.percentage}%.`,
      fullContent: `=========================================================
SURVVI CLIENT INTELLIGENCE: SOVEREIGN ASSET ALLOCATION REPORT
=========================================================
Reserve Scenario: ${regime.name}
Sovereign Fund Mandate Capital: $${sovereignFundSize}B USD

ALLOCATED RESERVE TARGETS:
${allocatedWeights.map(w => `- ${w.name}: ${w.percentage}% ($${w.valueUSD}B USD) | ${w.description}`).join('\n')}

SCENARIO INFLUENCES:
- Projected Commodity Inflation Factor: +${regime.inflationFactor * 10}%
- Geopolitical Fragmentation/Bipolarization: +${regime.polarizationFactor * 15}%
- Structural G10 Real Yield Impact: ${regime.growthFactor >= 0 ? `+${regime.growthFactor * 8}%` : `-${Math.abs(regime.growthFactor) * 8}%`}

EXECUTIVE BRIEF:
Based on proprietary capital flows, the optimum sovereign strategic asset allocation (SAA) under a ${regime.name} regime requires aggressive diversification out of fixed-coupon paper to avoid real yield destruction. Physical gold and sovereign strategic tech private equity are vital hedging mechanisms to counteract structural currency devaluations.
=========================================================
Archived on ${new Date().toLocaleString()} | Survvi Sovereign Analytics Suite`,
    };

    const event = new CustomEvent('ai_studio_add_workspace', {
      detail: { item, type: 'research' }
    });
    window.dispatchEvent(event);
    setIsSaved(true);
  };

  // Historic simulation chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const year = 2026 + i;
      let multiplier = 1.0;
      
      if (selectedRegimeId === 'inflation_spiral') {
        multiplier = 1.0 + (i * 0.04);
      } else if (selectedRegimeId === 'de_dollarization') {
        multiplier = 1.0 + (i * 0.02);
      } else if (selectedRegimeId === 'tech_cold_war') {
        multiplier = 1.0 + (i * 0.07);
      } else {
        multiplier = 1.0 + (i * 0.05);
      }

      return {
        year: `${year}`,
        capital: parseFloat((sovereignFundSize * multiplier).toFixed(1)),
        purchasingPower: parseFloat((sovereignFundSize * multiplier * (selectedRegimeId === 'inflation_spiral' ? Math.pow(0.92, i) : 1)).toFixed(1))
      };
    });
  }, [selectedRegimeId, sovereignFundSize]);

  return (
    <div className="flex flex-col gap-8">
      {/* Tool Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-3">
            <Landmark className="w-3.5 h-3.5" />
            No. 10 - Sovereign Reserve Allocator
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Sovereign Wealth & <span className="text-accent">Strategic Capital Flows</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Simulate dynamic central bank reserves, sovereign wealth allocations, and strategic state pension capital deployment under multi-polar macroeconomic regimes.
          </p>
        </div>

        {/* Regime Switcher and Save */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {REGIMES.map(reg => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegimeId(reg.id)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
                  selectedRegimeId === reg.id
                    ? "bg-accent text-brand border-accent font-extrabold"
                    : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
                )}
              >
                {reg.name}
              </button>
            ))}
          </div>

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
            {isSaved ? "Saved to Workspace" : "Save SAA Scenario"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input sliders and Allocations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-3xl p-6 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-accent border-b border-white/5 pb-2">Mandate Capital Parameter</h4>
            
            {/* Sovereign Fund Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Total Reserve Assets (USD)</span>
                <span className="font-mono text-accent font-bold">${sovereignFundSize} Billion</span>
              </div>
              <input 
                type="range"
                min="10"
                max="1000"
                step="10"
                value={sovereignFundSize}
                onChange={(e) => setSovereignFundSize(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                <span>$10B</span>
                <span>$500B</span>
                <span>$1 Trillion</span>
              </div>
            </div>

            {/* Regime Indicators */}
            <div className="bg-[#090b0e] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">Macro System Vectors</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <div className="text-[8px] uppercase tracking-wider text-white/40 mb-1">Commodity Inflation</div>
                  <div className="text-xs font-bold text-amber-400">+{regime.inflationFactor * 10}%</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <div className="text-[8px] uppercase tracking-wider text-white/40 mb-1">Polarization Score</div>
                  <div className="text-xs font-bold text-red-400">+{regime.polarizationFactor * 15}%</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <div className="text-[8px] uppercase tracking-wider text-white/40 mb-1">G10 Real Yields</div>
                  <div className={cn("text-xs font-bold", regime.growthFactor >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {regime.growthFactor >= 0 ? `+${regime.growthFactor * 8}%` : `-${Math.abs(regime.growthFactor) * 8}%`}
                  </div>
                </div>
              </div>
            </div>

            {/* Static breakdown lines */}
            <div className="space-y-3.5">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Allocated SAA Portfolio</h5>
              <div className="space-y-2">
                {allocatedWeights.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                      <div>
                        <div className="text-xs font-bold text-white leading-none">{asset.name}</div>
                        <div className="text-[9px] text-white/40 mt-1">{asset.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-white">{asset.percentage}%</div>
                      <div className="text-[9px] font-mono text-accent mt-0.5">${asset.valueUSD}B</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right: Asset Allocation Pie & Value Forecasting Area */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-brand/20 border border-white/5 rounded-3xl p-6">
            
            {/* Pie Chart Representation */}
            <div className="flex flex-col items-center justify-center">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 text-center">Allocated Asset Weights</h5>
              <div className="w-52 h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocatedWeights}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="percentage"
                    >
                      {allocatedWeights.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Total Capital</span>
                  <span className="text-lg font-black text-white">${sovereignFundSize}B</span>
                </div>
              </div>
            </div>

            {/* Strategic SAA Recommendations */}
            <div className="flex flex-col justify-center space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Sovereign Directives</h5>
              <div className="bg-[#090b0e] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  Regime Allocation Mandate
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {selectedRegimeId === 'inflation_spiral' ? (
                    "Gold and commodity stockpiles are adjusted to historical maximums to combat paper currency real yield destruction. G10 bond exposures should be systematically liquidated to prevent margin erosion."
                  ) : selectedRegimeId === 'de_dollarization' ? (
                    "Cross-border fragmentation requires a critical diversification out of G10 bonds into physical gold reserves and commodities. Allocations to non-fiat, un-sanctionable assets should exceed 35% of total liquidity."
                  ) : selectedRegimeId === 'tech_cold_war' ? (
                    "Direct state private equity injection is recommended. Under diplomatic tech fragmentation, funding local foundries, logic defense protocols, and sovereign quantum hubs offers the highest risk-adjusted growth vectors."
                  ) : (
                    "Maintain standard G10 Sovereign bond base weights. System inflation pressures remain structural but comfortable. Utilize passive real-estate and tech PE indices to capture market beta."
                  )}
                </p>
              </div>
            </div>

          </div>

          {/* SAA Valuation Forecasting Area chart */}
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 flex-1 flex flex-col">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">SAA Capital Real purchasing power Forecast (10-Yr Horizon)</h5>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c5a059" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#c5a059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  <Area type="monotone" dataKey="capital" name="Nominal Reserve Value (Billions USD)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCap)" />
                  <Area type="monotone" dataKey="purchasingPower" name="Real Purchasing Power (Adjusted for Inflation)" stroke="#c5a059" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPP)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SovereignAllocatorTool;
