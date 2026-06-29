import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, ShieldCheck, HelpCircle, Activity, 
  ShieldAlert, Sparkles, DollarSign, Percent, BarChart3, Sliders, Play, Bookmark
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ReferenceLine 
} from 'recharts';
import { cn } from '../lib/utils';

interface CommodityAsset {
  id: string;
  name: string;
  color: string;
  baselinePrice: string;
  shockMultipliers: { // Percentage price changes under scenarios
    crisis2008: number; // demand crash
    lockdown2020: number; // volatility/bottleneck
    energy2022: number; // energy spike
  };
}

const COMMODITIES: CommodityAsset[] = [
  { id: 'OIL', name: 'Crude Oil', color: '#f59e0b', baselinePrice: '$80/bbl', shockMultipliers: { crisis2008: -55, lockdown2020: -40, energy2022: 45 } },
  { id: 'STEEL', name: 'Hot-Rolled Steel', color: '#94a3b8', baselinePrice: '$650/ton', shockMultipliers: { crisis2008: -45, lockdown2020: 35, energy2022: 60 } },
  { id: 'COPPER', name: 'LME Copper', color: '#ea580c', baselinePrice: '$9,200/ton', shockMultipliers: { crisis2008: -50, lockdown2020: 25, energy2022: 30 } },
  { id: 'LITHIUM', name: 'Lithium Carbonate', color: '#10b981', baselinePrice: '$14,000/ton', shockMultipliers: { crisis2008: -20, lockdown2020: 15, energy2022: 125 } }
];

interface StressScenario {
  id: 'crisis2008' | 'lockdown2020' | 'energy2022';
  name: string;
  description: string;
  riskFactor: number;
}

const SCENARIOS: StressScenario[] = [
  {
    id: 'crisis2008',
    name: '2008 Financial Liquidity Collapse',
    description: 'Systemic financial liquidity freeze triggers deep industrial demand destruction and severe deflationary drops in raw asset pricing.',
    riskFactor: 0.85
  },
  {
    id: 'lockdown2020',
    name: '2020 Pandemic & Supply-Chain Bottleneck',
    description: 'Localized borders closures, port quarantine delays, and immediate logistical disruption trigger extreme regional shipping and metal cost swings.',
    riskFactor: 0.65
  },
  {
    id: 'energy2022',
    name: '2022 European Energy & Smelter Peak',
    description: 'Geopolitical gas supplies pipeline cutoff sparks power spikes, forcing extensive aluminum and steel refinery smelter curtailments.',
    riskFactor: 0.95
  }
];

const PortfolioHedgingTool: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<'crisis2008' | 'lockdown2020' | 'energy2022'>('energy2022');
  
  // Weights (normalized to 100%)
  const [weights, setWeights] = useState<Record<string, number>>({
    OIL: 30,
    STEEL: 40,
    COPPER: 20,
    LITHIUM: 10
  });

  const [annualSpend, setAnnualSpend] = useState<number>(20); // In Millions of USD
  const [hedgeRatio, setHedgeRatio] = useState<number>(60); // 0% to 100% hedged using futures

  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `hedging-${selectedScenarioId}-${annualSpend}-${hedgeRatio}-${Object.values(weights).join('-')}`;
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
  }, [selectedScenarioId, annualSpend, hedgeRatio, weights]);

  const activeScenario = useMemo(() => {
    return SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[2];
  }, [selectedScenarioId]);

  // Adjust sliders
  const handleWeightChange = (id: string, val: number) => {
    // Keep total weight balanced or just set directly and we normalize
    const updated: Record<string, number> = { ...weights, [id]: val };
    
    // Normalize weights so they sum to 100%
    const total = Object.keys(updated).reduce((sum, key) => sum + (updated[key] || 0), 0);
    const normalized: Record<string, number> = {};
    COMMODITIES.forEach(c => {
      const originalValue = updated[c.id] !== undefined ? updated[c.id] : 0;
      normalized[c.id] = total > 0 ? parseFloat(((originalValue / total) * 100).toFixed(0)) : 0;
    });
    setWeights(normalized);
  };

  // Calculations
  const calculations = useMemo(() => {
    // Calculate portfolio weighted multiplier under active scenario
    let weightedShockPercent = 0;
    COMMODITIES.forEach(c => {
      const w = weights[c.id] || 0;
      const mult = c.shockMultipliers[selectedScenarioId];
      weightedShockPercent += (w / 100) * mult;
    });

    const baselineMonthlySpend = annualSpend / 12; // In Millions USD
    
    // Futures premium cost: typically 1.5% premium of the hedged volume
    const derivativeHedgePremium = parseFloat((annualSpend * (hedgeRatio / 100) * 0.015).toFixed(3));

    // Value at Risk (VaR) of portfolio: unhedged peak volatility potential (95% confidence)
    const portfolioVaR = parseFloat((annualSpend * (Math.abs(weightedShockPercent) / 100) * activeScenario.riskFactor).toFixed(2));

    // Simulated actual crisis unhedged overrun/savings
    const totalUnhedgedImpact = parseFloat((annualSpend * (weightedShockPercent / 100)).toFixed(2));
    
    // Hedging caps the price movement on the hedged portion of spend
    const protectedVolume = annualSpend * (hedgeRatio / 100);
    const unhedgedVolume = annualSpend * (1 - (hedgeRatio / 100));

    const totalHedgedImpact = parseFloat(((unhedgedVolume * (weightedShockPercent / 100)) + derivativeHedgePremium).toFixed(2));

    // Total final spend in crisis
    const finalSpendUnhedged = parseFloat((annualSpend + totalUnhedgedImpact).toFixed(2));
    const finalSpendHedged = parseFloat((annualSpend + totalHedgedImpact).toFixed(2));
    
    // If the shock is inflationary (price increase), hedging saves money. 
    // If deflationary (price drop), unhedged actually spent less, but hedge protected against upside.
    const netHedgeSavings = parseFloat((finalSpendUnhedged - finalSpendHedged).toFixed(2));

    return {
      weightedShockPercent: parseFloat(weightedShockPercent.toFixed(1)),
      baselineMonthlySpend,
      derivativeHedgePremium,
      portfolioVaR,
      totalUnhedgedImpact,
      totalHedgedImpact,
      finalSpendUnhedged,
      finalSpendHedged,
      netHedgeSavings
    };
  }, [weights, selectedScenarioId, annualSpend, hedgeRatio, activeScenario]);

  const handleSaveWorkspace = () => {
    const savedId = `hedging-${selectedScenarioId}-${annualSpend}-${hedgeRatio}-${Object.values(weights).join('-')}`;
    
    const formattedWeights = Object.entries(weights)
      .map(([id, weight]) => `${id}: ${weight}% (Baseline Price Benchmark: ${COMMODITIES.find(c => c.id === id)?.baselinePrice})`)
      .join('\n');

    const item = {
      id: savedId,
      title: `Hedged Risk Analysis: ${activeScenario.name}`,
      summary: `Hedged risk assessment for spend of $${annualSpend}M under ${activeScenario.name} scenario at ${hedgeRatio}% hedge protection ratio. Expected savings of $${calculations.netHedgeSavings}M.`,
      fullContent: `=========================================================
SURVVI CLIENT INTELLIGENCE: PORTFOLIO HEDGING REPORT
=========================================================
Scenario: ${activeScenario.name}
Description: ${activeScenario.description}
Risk factor: ${activeScenario.riskFactor}x

PORTFOLIO CONFIGURATION:
- Annual Procurement Spend Volume: $${annualSpend}M/yr
- Derivative Hedging Protection Ratio: ${hedgeRatio}%
- Custom Allocated Weights:
${formattedWeights}

SCENARIO DYNAMICS & STRESS METRICS:
- Portfolio Weighted Shock Intensity: ${calculations.weightedShockPercent}%
- Portfolio Value-at-Risk under Stress: $${calculations.portfolioVaR}M
- Derivative Hedging Option Premium: $${(calculations.derivativeHedgePremium * 1000).toLocaleString()}k

STRESS TEST OUTCOMES:
- Projected Unhedged Spend Overrun in Crisis: $${calculations.totalUnhedgedImpact > 0 ? '+' : ''}${calculations.totalUnhedgedImpact}M
- Projected Hedged Spend Trajectory in Crisis: $${calculations.totalHedgedImpact > 0 ? '+' : ''}${calculations.totalHedgedImpact}M
- Net Strategic Protection Savings: $${calculations.netHedgeSavings > 0 ? '+' : ''}${calculations.netHedgeSavings}M

STRATEGIC DIRECTIVE:
${calculations.netHedgeSavings > 0 
  ? `Under active stress-testing, locking a ${hedgeRatio}% hedge ratio via derivative options successfully mitigates $${calculations.portfolioVaR}M in Value-at-Risk, returning an estimated net strategic protection benefit of $${calculations.netHedgeSavings}M.` 
  : `The simulated scenario represents a deflationary or demand-destruction event. While the hedge premium costs $${(calculations.derivativeHedgePremium * 1000).toLocaleString()}k, it establishes an absolute ceiling protection of your exposure, ensuring your baseline procurement remains resilient against high-volatility spikes.`}
=========================================================
Archived on ${new Date().toLocaleString()} | Survvi Sovereign Analytics Suite`,
    };

    const event = new CustomEvent('ai_studio_add_workspace', {
      detail: { item, type: 'research' }
    });
    window.dispatchEvent(event);
    setIsSaved(true);
  };

  // Generate 12-Month Cumulative Procurement Spend Data under different states
  const chartData = useMemo(() => {
    const calc = calculations;
    const monthlyBaseline = calc.baselineMonthlySpend;
    
    let cumulativeBaseline = 0;
    let cumulativeUnhedged = 0;
    let cumulativeHedged = 0;

    // Simulate shock unfolding dynamically over 12 months
    return Array.from({ length: 12 }).map((_, i) => {
      const monthLabel = `Month ${i + 1}`;
      
      // Shock builds up peaking at month 8, then plateaus
      const monthProgress = i < 8 ? (i + 1) / 8 : 1.0;
      const currentUnhedgedFactor = 1 + ((calc.weightedShockPercent / 100) * monthProgress);
      
      // Hedged factor incorporates hedge cap + premium amortization
      const currentHedgedFactor = 1 + ((calc.weightedShockPercent / 100) * (1 - (hedgeRatio / 100)) * monthProgress) + (calc.derivativeHedgePremium / 12 / monthlyBaseline);

      cumulativeBaseline += monthlyBaseline;
      cumulativeUnhedged += (monthlyBaseline * currentUnhedgedFactor);
      cumulativeHedged += (monthlyBaseline * currentHedgedFactor);

      return {
        month: monthLabel,
        'Planned Spend': parseFloat(cumulativeBaseline.toFixed(2)),
        'Unhedged Spend': parseFloat(cumulativeUnhedged.toFixed(2)),
        'Hedged Spend': parseFloat(cumulativeHedged.toFixed(2))
      };
    });
  }, [calculations, hedgeRatio]);

  return (
    <div className="flex flex-col gap-8">
      {/* Tool Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            No. 1 - Portfolio Risk Hedging
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Cross-Commodity <span className="text-accent">Risk Hedging</span> & Portfolio Stress Tester
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Construct a custom industrial procurement spend portfolio. Stress test your portfolio against historical macro shocks and simulate derivative-hedging contract protective thresholds.
          </p>
        </div>

        {/* Scenario Select and Save to Workspace */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
                  selectedScenarioId === sc.id
                    ? "bg-accent text-brand border-accent font-extrabold"
                    : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
                )}
              >
                {sc.name.split(' ')[0]} {sc.name.split(' ')[1] || ''}
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
            {isSaved ? "Saved to Workspace" : "Save to Workspace"}
          </button>
        </div>
      </div>

      {/* Main Interactive Modeler UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Portfolio Allocator Sliders */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-2xl p-6 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center justify-between">
              <span className="flex items-center gap-2"><Sliders className="w-4 h-4 text-accent" /> Portfolio Spend Weight</span>
              <span className="text-xs font-bold text-accent">Total Spend: ${annualSpend}M/yr</span>
            </h4>

            {/* Procurement Spend volume slider */}
            <div className="space-y-2 pb-4 border-b border-white/5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span>Annual Procurement Budget</span>
                <span className="text-white font-mono">${annualSpend}M</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                step="5"
                value={annualSpend}
                onChange={(e) => setAnnualSpend(parseInt(e.target.value))}
                className="w-full accent-accent bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Individual Commodity allocation sliders */}
            <div className="space-y-4">
              {COMMODITIES.map(comm => {
                const currentWeight = weights[comm.id] || 0;
                return (
                  <div key={comm.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: comm.color }} />
                        {comm.name} <span className="text-white/20 text-[9px]">({comm.baselinePrice})</span>
                      </span>
                      <span className="font-mono text-white">{currentWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={currentWeight}
                      onChange={(e) => handleWeightChange(comm.id, parseInt(e.target.value))}
                      className="w-full bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: comm.color }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hedging Ratio Selection Slider */}
          <div className="bg-brand/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center justify-between">
              <span>Hedging Ratio Protection</span>
              <span className="text-sm font-extrabold text-[#00d4ff] font-mono">{hedgeRatio}% Hedged</span>
            </h4>
            
            <div className="space-y-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={hedgeRatio}
                onChange={(e) => setHedgeRatio(parseInt(e.target.value))}
                className="w-full accent-[#00d4ff] bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-[9px] text-white/30 italic">Models hedging through forward/futures derivative swaps contracts.</p>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs border-t border-white/5 text-white/50">
              <div>
                Hedged Premium: <span className="text-white font-bold font-mono">${(calculations.derivativeHedgePremium * 1000).toLocaleString()}k</span>
              </div>
              <div>
                Hedge Status: <span className={cn(
                  "font-bold uppercase text-[10px]",
                  hedgeRatio >= 75 ? "text-emerald-400" : hedgeRatio >= 35 ? "text-accent" : "text-amber-400"
                )}>
                  {hedgeRatio >= 75 ? 'Shielded' : hedgeRatio >= 35 ? 'Optimized' : 'High Exposure'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Stress test results and chart */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Stress result banner */}
          <div className={cn(
            "p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all",
            calculations.netHedgeSavings > 0 
              ? "bg-emerald-500/10 border-emerald-500/20 text-white" 
              : calculations.netHedgeSavings < 0
              ? "bg-amber-500/10 border-amber-500/20 text-white"
              : "bg-red-500/10 border-red-500/20 text-white"
          )}>
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h5 className="font-bold uppercase tracking-wide text-xs">
                  Portfolio Value-at-Risk under Stress: ${calculations.portfolioVaR}M
                </h5>
                <p className="text-white/50 text-xs mt-1 leading-relaxed">
                  The {activeScenario.name} triggers a weighted net price change of <strong>{calculations.weightedShockPercent}%</strong> across your portfolio. 
                  {calculations.netHedgeSavings > 0 ? (
                    <span> Capping costs with a {hedgeRatio}% hedge ratio abated inflation spikes, yielding savings of <strong>${calculations.netHedgeSavings}M</strong>.</span>
                  ) : (
                    <span> During deep deflationary cycles, locking contracts incurs hedging premium overhead, but successfully limits upside price breakout risk.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right flex-shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Net Hedged Savings</span>
              <span className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                calculations.netHedgeSavings > 0 ? "text-emerald-400" : calculations.netHedgeSavings < 0 ? "text-amber-400" : "text-white"
              )}>
                {calculations.netHedgeSavings > 0 ? '+' : ''}${calculations.netHedgeSavings}M
              </span>
            </div>
          </div>

          {/* Portfolio Spend curves area chart */}
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">12-Month Cumulative Procurement Spend Protection</h4>
                <p className="text-xs text-white/60 mt-1">Overlaying unhedged cost breakout against derivative-shielded spend trajectory</p>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-accent uppercase bg-accent/15 border border-accent/20 px-2 py-0.5 rounded">
                <Activity className="w-3 h-3" /> Stress Curve
              </div>
            </div>

            {/* Area Chart Stage */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBaselineSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUnhedgedSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHedgedSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                    unit="M"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  
                  {/* Planned Spend (Gray baseline) */}
                  <Area 
                    type="monotone" 
                    dataKey="Planned Spend" 
                    stroke="#94a3b8" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                    fillOpacity={1} 
                    fill="url(#colorBaselineSpend)" 
                    name="Planned Budget Spend" 
                  />
                  
                  {/* Unhedged Spend (Red crisis curve) */}
                  <Area 
                    type="monotone" 
                    dataKey="Unhedged Spend" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorUnhedgedSpend)" 
                    name="Unhedged Spend in Crisis" 
                  />

                  {/* Hedged Spend (Green/Accent protected curve) */}
                  <Area 
                    type="monotone" 
                    dataKey="Hedged Spend" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorHedgedSpend)" 
                    name="Hedged Spend in Crisis" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30 leading-relaxed justify-center text-center">
              <span>* Futures swaps and forward physical locks stabilize procurement predictability despite heavy market turbulence.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PortfolioHedgingTool;
