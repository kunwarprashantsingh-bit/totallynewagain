import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, ArrowRightLeft, Sparkles, Scale, AlertCircle, 
  HelpCircle, BarChart3, TrendingUp, RefreshCw, Zap, DollarSign, Percent, Bookmark 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ReferenceLine 
} from 'recharts';
import { cn } from '../lib/utils';

interface SubstitutionScenario {
  id: string;
  name: string;
  description: string;
  primaryCommodity: {
    name: string;
    unit: string;
    basePrice: number; // current market price
    priceRange: [number, number]; // slider bounds
    conductivityOrEfficiencyFactor: number; // e.g., electrical conductivity ratio or density
  };
  secondaryCommodity: {
    name: string;
    unit: string;
    basePrice: number;
    priceRange: [number, number];
    conductivityOrEfficiencyFactor: number;
  };
  inflectionRatio: number; // The price ratio (Primary/Secondary) where substitution begins
  retoolingCapEx: number; // Millions USD for factory conversion
  timelineMonths: number; // Months to complete engineering override
}

const SUBSTITUTION_SCENARIOS: SubstitutionScenario[] = [
  {
    id: 'grid-cabling',
    name: 'Electrical Grid: Copper vs Aluminum',
    description: 'Utility transmission lines face a critical choice. Copper is a superior conductor, but when Copper-to-Aluminum price ratio rises beyond 3.0, grid operators re-engineer high-voltage power lines to use thicker, lightweight aluminum cables.',
    primaryCommodity: {
      name: 'LME Copper',
      unit: 'Metric Ton',
      basePrice: 9240,
      priceRange: [5000, 15000],
      conductivityOrEfficiencyFactor: 1.0 // 100% standard
    },
    secondaryCommodity: {
      name: 'Primary Aluminum',
      unit: 'Metric Ton',
      basePrice: 2450,
      priceRange: [1500, 4500],
      conductivityOrEfficiencyFactor: 0.61 // Requires 1.6x cross-sectional area
    },
    inflectionRatio: 3.2,
    retoolingCapEx: 15.0, // $15M
    timelineMonths: 18
  },
  {
    id: 'ev-battery',
    name: 'EV Battery Pack: NMC vs LFP Chemistries',
    description: 'High-energy Nickel-Manganese-Cobalt (NMC) batteries offer long range, but spike in cost when Nickel/Cobalt surge. Lower-cost Lithium Iron Phosphate (LFP) serves as a robust substitute once NMC premium exceeds 45%.',
    primaryCommodity: {
      name: 'NMC Cathode Minerals (Ni/Co/Li)',
      unit: 'kWh Equivalent',
      basePrice: 82,
      priceRange: [40, 160],
      conductivityOrEfficiencyFactor: 1.0 // standard range
    },
    secondaryCommodity: {
      name: 'LFP Cathode Minerals (Fe/P/Li)',
      unit: 'kWh Equivalent',
      basePrice: 48,
      priceRange: [25, 90],
      conductivityOrEfficiencyFactor: 0.72 // 72% energy density of NMC
    },
    inflectionRatio: 1.55,
    retoolingCapEx: 45.0, // $45M
    timelineMonths: 24
  },
  {
    id: 'auto-lightweighting',
    name: 'Automotive Frames: Steel vs Aluminum',
    description: 'Automakers weigh body lightweighting (Aluminum) to meet fleet emission regulations against low-cost Structural Steel. The threshold depends on structural tensile strength requirements and raw casting costs.',
    primaryCommodity: {
      name: 'Structural Steel',
      unit: 'Metric Ton',
      basePrice: 680,
      priceRange: [400, 1200],
      conductivityOrEfficiencyFactor: 1.0
    },
    secondaryCommodity: {
      name: 'High-Grade Aluminum Sheet',
      unit: 'Metric Ton',
      basePrice: 2850,
      priceRange: [1800, 5000],
      conductivityOrEfficiencyFactor: 0.33 // 1/3 weight saving benefit
    },
    inflectionRatio: 0.22, // Steel-to-Aluminum ratio threshold
    retoolingCapEx: 120.0, // Large assembly presses
    timelineMonths: 36
  }
];

const TechInflectionTool: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('grid-cabling');
  const [primaryPrice, setPrimaryPrice] = useState<number>(-1);
  const [secondaryPrice, setSecondaryPrice] = useState<number>(-1);
  const [volumeSpend, setVolumeSpend] = useState<number>(50000); // Metric tons or packs/yr

  const scenario = useMemo(() => {
    return SUBSTITUTION_SCENARIOS.find(s => s.id === selectedScenarioId) || SUBSTITUTION_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Reset prices when scenario changes
  const activePrices = useMemo(() => {
    const pPrice = primaryPrice >= 0 ? primaryPrice : scenario.primaryCommodity.basePrice;
    const sPrice = secondaryPrice >= 0 ? secondaryPrice : scenario.secondaryCommodity.basePrice;
    return { primary: pPrice, secondary: sPrice };
  }, [scenario, primaryPrice, secondaryPrice]);

  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `inflection-${selectedScenarioId}-${activePrices.primary}-${activePrices.secondary}-${volumeSpend}`;
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
  }, [selectedScenarioId, activePrices.primary, activePrices.secondary, volumeSpend]);

  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id);
    setPrimaryPrice(-1);
    setSecondaryPrice(-1);
  };

  // Inflection analysis
  const metrics = useMemo(() => {
    const ratio = parseFloat((activePrices.primary / activePrices.secondary).toFixed(3));
    const normalizedInflection = scenario.inflectionRatio;
    
    // Proximity to Inflection point
    const diffPercent = ((ratio / normalizedInflection) * 100) - 100;
    const isSubstituted = ratio >= normalizedInflection;

    // Economic Impact calculations
    // Base cost using primary
    const baseAnnualPrimaryCost = activePrices.primary * volumeSpend;
    
    // Cost using substitute (accounting for efficiency degradation, e.g. needing more aluminum/LFP for same capacity)
    const efficiencyFactor = 1 / scenario.secondaryCommodity.conductivityOrEfficiencyFactor;
    const baseAnnualSecondaryCost = activePrices.secondary * volumeSpend * efficiencyFactor;
    
    const grossAnnualSavings = baseAnnualPrimaryCost - baseAnnualSecondaryCost;
    const netSavingsOverRetooling = grossAnnualSavings - (scenario.retoolingCapEx * 1000000 / (scenario.timelineMonths / 12));
    
    return {
      ratio,
      diffPercent: parseFloat(diffPercent.toFixed(1)),
      isSubstituted,
      baseAnnualPrimaryCost,
      baseAnnualSecondaryCost,
      grossAnnualSavings,
      netSavingsOverRetooling,
      efficiencyFactor
    };
  }, [scenario, activePrices, volumeSpend]);

  const handleSaveWorkspace = () => {
    const savedId = `inflection-${selectedScenarioId}-${activePrices.primary}-${activePrices.secondary}-${volumeSpend}`;
    const s = scenario;
    
    const item = {
      id: savedId,
      title: `Sourcing Pivot Analysis: ${s.name}`,
      summary: `Pivot & inflection study of ${s.name}. Price ratio is ${metrics.ratio}x vs tipping ratio of ${s.inflectionRatio}x. Sourcing status: ${metrics.isSubstituted ? 'Pivoted' : 'Stable'}.`,
      fullContent: `=========================================================
SURVVI CLIENT INTELLIGENCE: TECHNOLOGY INFLECTION REPORT
=========================================================
Scenario Target: ${s.name}
Description: ${s.description}

PRICING ENGINE OUTPUTS:
- Primary Sourcing Commodity (${s.primaryCommodity.name}): $${activePrices.primary.toLocaleString()} / ${s.primaryCommodity.unit}
- Secondary/Substitute Commodity (${s.secondaryCommodity.name}): $${activePrices.secondary.toLocaleString()} / ${s.secondaryCommodity.unit}
- Modeled Annual Manufacturing Requirement: ${volumeSpend.toLocaleString()} units

TIFF PIVOT COMPARISONS & RE-ENGINEERING COSTS:
- Sourcing Price Ratio (Primary/Secondary): ${metrics.ratio}x
- Technological Retooling Inflection Boundary: ${s.inflectionRatio}x
- Substitute Efficiency Penalty Factor: +${((metrics.efficiencyFactor - 1) * 100).toFixed(0)}% additional volume required
- Re-engineering CapEx Needed: $${s.retoolingCapEx}M
- Conversion Engineering Timeline: ${s.timelineMonths} Months

FINANCIAL IMPACT ANALYSIS:
- Base Annual Spend (Primary Sourcing): $${(metrics.baseAnnualPrimaryCost / 1000000).toFixed(1)}M/yr
- Simulated Annual Spend (Substitute Sourcing): $${(metrics.baseAnnualSecondaryCost / 1000000).toFixed(1)}M/yr
- Gross Annual Commodity Cost Savings: $${(metrics.grossAnnualSavings / 1000000).toFixed(1)}M/yr
- Amortized Net Sourcing Pivot Benefit: ${metrics.netSavingsOverRetooling > 0 ? `+$${(metrics.netSavingsOverRetooling / 1000000).toFixed(1)}M/yr` : `Negative Net Benefit (-$${Math.abs(metrics.netSavingsOverRetooling / 1000000).toFixed(1)}M/yr)`}

STRATEGIC DIRECTIVE:
${metrics.isSubstituted 
  ? `CRITICAL INFLECTION MET: The current price ratio of ${metrics.ratio}x has exceeded the retooling threshold of ${s.inflectionRatio}x. Initiating retooling conversion processes immediately is highly strategic. Redesigning materials returns $${(metrics.grossAnnualSavings / 1000000).toFixed(1)}M in raw annual cost savings, fully amortizing the $${s.retoolingCapEx}M CapEx conversion within ${(s.retoolingCapEx / (metrics.grossAnnualSavings / 1000000)).toFixed(1)} years.` 
  : metrics.diffPercent >= -15
  ? `ALERT - BORDER APPROXIMATION: Sourcing price ratio is ${metrics.ratio}x, sitting within ${Math.abs(metrics.diffPercent)}% of the retooling threshold. Technical procurement teams should construct contingency bills-of-materials and pre-approve substitute tooling lines to prevent rapid margin blowout should primary commodity costs rise further.`
  : `EQUILIBRIUM COMFORTABLE: Current raw materials sourcing remains highly optimal. Sourcing price ratio is Comfortably below the inflection boundary. Maintain current sourcing configurations while continuously monitoring price index tickers.`}
=========================================================
Archived on ${new Date().toLocaleString()} | Survvi Sovereign Analytics Suite`,
    };

    const event = new CustomEvent('ai_studio_add_workspace', {
      detail: { item, type: 'research' }
    });
    window.dispatchEvent(event);
    setIsSaved(true);
  };

  // Chart data: substitution tipping curve
  const tippingData = useMemo(() => {
    const s = scenario;
    const secPrice = activePrices.secondary;
    const startRange = s.primaryCommodity.priceRange[0];
    const endRange = s.primaryCommodity.priceRange[1];
    const steps = 15;
    const stepSize = (endRange - startRange) / steps;

    return Array.from({ length: steps + 1 }).map((_, i) => {
      const simPrimaryPrice = Math.round(startRange + (i * stepSize));
      const simRatio = parseFloat((simPrimaryPrice / secPrice).toFixed(3));
      
      // Calculate substitution speed / adoption probability based on sigmoid centered around the inflection ratio
      const k = 10; // sigmoid steepness
      const adoptionProbability = 1 / (1 + Math.exp(-k * (simRatio - s.inflectionRatio)));
      
      return {
        primaryPrice: simPrimaryPrice,
        'Price Ratio': simRatio,
        'Retooling Threshold': s.inflectionRatio,
        'Substitution Adoption %': parseFloat((adoptionProbability * 100).toFixed(1))
      };
    });
  }, [scenario, activePrices]);

  return (
    <div className="flex flex-col gap-8">
      {/* Tool Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-3">
            <Cpu className="w-3.5 h-3.5" />
            No. 4 - Substitution & Inflection
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Commodity Substitution <span className="text-accent">& Tech Inflection</span> Modeler
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Simulate manufacturing tipping points where soaring commodity prices trigger immediate technological pivot shifts, re-engineering timelines, and massive capital reallocation curves.
          </p>
        </div>

        {/* Scenario Switcher and Save to Workspace */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {SUBSTITUTION_SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => handleScenarioChange(s.id)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
                  selectedScenarioId === s.id
                    ? "bg-accent text-brand border-accent font-extrabold"
                    : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
                )}
              >
                {s.name.split(':')[0]}
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters & Inflection Index */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-2xl p-6 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center justify-between">
              <span className="flex items-center gap-2"><Scale className="w-4 h-4 text-accent" /> Price Modeling Engine</span>
              <span className="text-[10px] font-mono text-white/40">Adjustable Tipping Parameters</span>
            </h4>

            {/* Slider 1: Primary Commodity Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span>{scenario.primaryCommodity.name} Price</span>
                <span className="text-accent font-mono">
                  ${activePrices.primary.toLocaleString()} / {scenario.primaryCommodity.unit}
                </span>
              </div>
              <input 
                type="range" 
                min={scenario.primaryCommodity.priceRange[0]} 
                max={scenario.primaryCommodity.priceRange[1]} 
                step={scenario.primaryCommodity.basePrice > 1000 ? 100 : 5}
                value={activePrices.primary}
                onChange={(e) => setPrimaryPrice(parseInt(e.target.value))}
                className="w-full accent-accent bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 2: Secondary/Substitute Commodity Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span>{scenario.secondaryCommodity.name} Price</span>
                <span className="text-sky-400 font-mono">
                  ${activePrices.secondary.toLocaleString()} / {scenario.secondaryCommodity.unit}
                </span>
              </div>
              <input 
                type="range" 
                min={scenario.secondaryCommodity.priceRange[0]} 
                max={scenario.secondaryCommodity.priceRange[1]} 
                step={scenario.secondaryCommodity.basePrice > 1000 ? 50 : 2}
                value={activePrices.secondary}
                onChange={(e) => setSecondaryPrice(parseInt(e.target.value))}
                className="w-full accent-sky-400 bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Input 3: Industry Demand Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span>Annual Manufacturing Requirement ({scenario.primaryCommodity.unit} Equivalent)</span>
                <span className="text-white font-mono">{volumeSpend.toLocaleString()} units</span>
              </div>
              <div className="flex gap-2">
                {[10000, 50000, 100000, 250000].map(vol => (
                  <button
                    key={vol}
                    onClick={() => setVolumeSpend(vol)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border",
                      volumeSpend === vol
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-white/5 border-white/5 text-white/40 hover:border-white/10"
                    )}
                  >
                    {vol.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Inflection Dynamics Table */}
          <div className="bg-brand/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center justify-between">
              <span>Financial Pivot Cost Analysis</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 rounded">
                Retooling CapEx: ${scenario.retoolingCapEx}M
              </span>
            </h4>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-white/60 pb-2 border-b border-white/5">
                <span>Current Price Ratio (Primary/Secondary)</span>
                <span className="font-bold text-white font-mono">{metrics.ratio}x</span>
              </div>
              <div className="flex justify-between items-center text-white/60 pb-2 border-b border-white/5">
                <span>Retooling Inflection Threshold</span>
                <span className="font-bold text-accent font-mono">{scenario.inflectionRatio}x</span>
              </div>
              <div className="flex justify-between items-center text-white/60 pb-2 border-b border-white/5">
                <span>Substitute Requirement Penalty</span>
                <span className="font-bold text-amber-400 font-mono">+{((metrics.efficiencyFactor - 1) * 100).toFixed(0)}% Vol. needed</span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>Amortized Annual Retooling Drag</span>
                <span className="font-bold text-red-400 font-mono">
                  -${((scenario.retoolingCapEx / (scenario.timelineMonths / 12))).toFixed(1)}M/yr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Tipping Curve & Assessment */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tipping assessment alert box */}
          <div className={cn(
            "p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all",
            metrics.isSubstituted 
              ? "bg-red-500/10 border-red-500/20 text-white" 
              : metrics.diffPercent >= -15
              ? "bg-amber-500/10 border-amber-500/20 text-white"
              : "bg-emerald-500/10 border-emerald-500/20 text-white"
          )}>
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h5 className="font-bold uppercase tracking-wide text-xs">
                  {metrics.isSubstituted ? 'Tipping Point Exceeded - Substitution In Progress' : 
                   metrics.diffPercent >= -15 ? 'Alert: Approaching Tipping Boundary' : 'Stable Sourcing Equilibrium'}
                </h5>
                <p className="text-white/50 text-xs mt-1 leading-relaxed">
                  {metrics.isSubstituted 
                    ? `The primary-to-secondary price ratio is at ${metrics.ratio}x (inflection is ${scenario.inflectionRatio}x). Redesigning raw materials will save $${(metrics.grossAnnualSavings / 1000000).toFixed(1)}M annually, paying off conversion in ${(scenario.retoolingCapEx / (metrics.grossAnnualSavings / 1000000)).toFixed(1)} years.`
                    : metrics.diffPercent >= -15
                    ? `Price ratio is ${metrics.ratio}x, only ${Math.abs(metrics.diffPercent)}% below tipping threshold. Engineering teams should initiate feasibility reviews to prevent structural cost blowout.`
                    : `Sourcing is optimized. The current raw materials cost is stable, with price ratio sitting comfortable at ${metrics.ratio}x, well below the switching tipping ratio.`}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right flex-shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Net Pivot Benefit</span>
              <span className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                metrics.netSavingsOverRetooling > 0 ? "text-emerald-400" : "text-white/40"
              )}>
                {metrics.netSavingsOverRetooling > 0 ? `+$${(metrics.netSavingsOverRetooling / 1000000).toFixed(1)}M/yr` : 'Negative Net'}
              </span>
            </div>
          </div>

          {/* S-Curve Chart Area */}
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Market S-Curve Sourcing Pivot Tracker</h4>
                <p className="text-xs text-white/60 mt-1">Sigmoid model showing industry adoption probability against raw metal price levels</p>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-accent uppercase bg-accent/15 border border-accent/20 px-2 py-0.5 rounded">
                <BarChart3 className="w-3 h-3" /> Pivot Dynamics
              </div>
            </div>

            {/* Recharts chart stage */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tippingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="primaryPrice" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} 
                    label={{ value: `Price of ${scenario.primaryCommodity.name} ($)`, position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.3)', fontSize: 8 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                    unit="%"
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
                  
                  {/* Sigmoid adoption line */}
                  <Line 
                    type="monotone" 
                    dataKey="Substitution Adoption %" 
                    stroke="#c5a059" 
                    strokeWidth={2.5} 
                    dot={{ fill: '#c5a059', strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    name="Market Substitution Probability" 
                  />

                  {/* Reference line for the current primary price setting */}
                  <ReferenceLine 
                    x={activePrices.primary} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3"
                    label={{ value: 'Current Price', fill: '#ef4444', fontSize: 8, position: 'top' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30 leading-relaxed justify-center text-center">
              <span>* Substitution adoption models macro supply-chain lags and contractual purchase locks before technical pivot completion.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TechInflectionTool;
