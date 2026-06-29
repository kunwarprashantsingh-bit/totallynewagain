import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, ShieldCheck, Zap, HelpCircle, 
  Leaf, AlertTriangle, ArrowRight, DollarSign, Percent, BarChart3, Clock, Bookmark 
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { cn } from '../lib/utils';

interface IndustrySector {
  id: string;
  name: string;
  baseEmissionsPerUnit: number; // Tons of CO2 per ton of product
  transitionCapExPerUnit: number; // USD needed to transition 1 ton of capacity to green
  unit: string;
}

const SECTORS: IndustrySector[] = [
  { id: 'steel', name: 'Structural Steel', baseEmissionsPerUnit: 1.85, transitionCapExPerUnit: 450, unit: 'Metric Ton' },
  { id: 'cement', name: 'Portland Cement', baseEmissionsPerUnit: 0.82, transitionCapExPerUnit: 180, unit: 'Metric Ton' },
  { id: 'aluminum', name: 'Primary Aluminum', baseEmissionsPerUnit: 11.5, transitionCapExPerUnit: 2200, unit: 'Metric Ton' },
  { id: 'fertilizer', name: 'Ammonia Fertilizer', baseEmissionsPerUnit: 2.10, transitionCapExPerUnit: 520, unit: 'Metric Ton' }
];

const DecarbonizationRoadmapTool: React.FC = () => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>('steel');
  
  // User adjustable variables
  const [carbonPrice, setCarbonPrice] = useState<number>(85); // USD/Ton of CO2 (default EU ETS level approx)
  const [adaptationSpeed, setAdaptationSpeed] = useState<number>(5); // years to fully transition (e.g. 3 to 15 years)
  const [annualCapacity, setAnnualCapacity] = useState<number>(200000); // metric tons of annual production

  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `decarbonization-${selectedSectorId}-${carbonPrice}-${adaptationSpeed}-${annualCapacity}`;
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
  }, [selectedSectorId, carbonPrice, adaptationSpeed, annualCapacity]);

  const selectedSector = useMemo(() => {
    return SECTORS.find(s => s.id === selectedSectorId) || SECTORS[0];
  }, [selectedSectorId]);

  // Generate 10-Year Decarbonization Transition Roadmap Data
  const roadmapData = useMemo(() => {
    const s = selectedSector;
    const years = Array.from({ length: 11 }).map((_, y) => y); // Year 0 to Year 10
    
    let cumulativeCapEx = 0;
    let cumulativeTaxSavings = 0;

    // Linear adaptation target profile
    // E.g., if adaptation speed is 5 years, emission efficiency reaches 90% reduction by Year 5
    return years.map(year => {
      // Calculate current emission intensity of production (from base to 90% green reduction)
      const maxGreenReduction = 0.88; // 88% decarbonization limit of green tech
      const adaptationProgress = year === 0 ? 0 : Math.min(1.0, year / adaptationSpeed);
      const emissionReductionMultiplier = 1.0 - (adaptationProgress * maxGreenReduction);
      
      const currentEmissionIntensity = s.baseEmissionsPerUnit * emissionReductionMultiplier;
      const annualEmissions = parseFloat((currentEmissionIntensity * annualCapacity).toFixed(0));
      
      // Calculate Carbon Tax Liability
      const taxLiability = parseFloat((annualEmissions * carbonPrice).toFixed(0));
      
      // Baseline emissions without any green adaptation
      const baselineEmissions = s.baseEmissionsPerUnit * annualCapacity;
      const baselineTaxLiability = baselineEmissions * carbonPrice;
      const annualTaxSaving = parseFloat((baselineTaxLiability - taxLiability).toFixed(0));
      
      // transition CapEx allocation
      // CapEx is spent evenly across the selected transition years (Year 1 to adaptationSpeed)
      let annualCapEx = 0;
      if (year > 0 && year <= adaptationSpeed) {
        const totalCapExNeeded = s.transitionCapExPerUnit * annualCapacity;
        annualCapEx = parseFloat((totalCapExNeeded / adaptationSpeed).toFixed(0));
      }
      
      cumulativeCapEx += annualCapEx;
      cumulativeTaxSavings += annualTaxSaving;
      
      const netBenefit = cumulativeTaxSavings - cumulativeCapEx;

      return {
        year: `Year ${year}`,
        'Carbon Tax ($k)': parseFloat((taxLiability / 1000).toFixed(1)),
        'CO2 Emissions (k Tons)': parseFloat((annualEmissions / 1000).toFixed(1)),
        'Cumulative CapEx ($k)': parseFloat((cumulativeCapEx / 1000).toFixed(1)),
        'Cumulative Tax Savings ($k)': parseFloat((cumulativeTaxSavings / 1000).toFixed(1)),
        'Net Financial Benefit ($k)': parseFloat((netBenefit / 1000).toFixed(1))
      };
    });
  }, [selectedSector, carbonPrice, adaptationSpeed, annualCapacity]);

  const finalMetrics = useMemo(() => {
    const lastYearData = roadmapData[roadmapData.length - 1];
    const totalTransitionCapEx = selectedSector.transitionCapExPerUnit * annualCapacity;
    
    // Find breakeven year (the first year where Cumulative Tax Savings > Cumulative CapEx)
    let breakevenYear = -1;
    for (let i = 1; i < roadmapData.length; i++) {
      if (roadmapData[i]['Net Financial Benefit ($k)'] > 0) {
        breakevenYear = i;
        break;
      }
    }

    const baselineEmissions = selectedSector.baseEmissionsPerUnit * annualCapacity;
    const finalEmissions = baselineEmissions * (1 - 0.88); // 88% reduction at final stage
    const emissionsAbated = parseFloat(((baselineEmissions - finalEmissions) * 10).toFixed(0)); // over 10 years

    return {
      totalTransitionCapEx,
      breakevenYear,
      emissionsAbated,
      finalNetSavings: lastYearData['Net Financial Benefit ($k)'] * 1000
    };
  }, [roadmapData, selectedSector, annualCapacity]);

  const handleSaveWorkspace = () => {
    const savedId = `decarbonization-${selectedSectorId}-${carbonPrice}-${adaptationSpeed}-${annualCapacity}`;
    const s = selectedSector;
    
    const item = {
      id: savedId,
      title: `Decarbonization Roadmap: ${s.name}`,
      summary: `Decarbonization model for ${s.name} at carbon price of $${carbonPrice}/ton. Payback period: ${finalMetrics.breakevenYear > 0 ? `${finalMetrics.breakevenYear} Years` : 'Over 10 Years'} with $${(finalMetrics.totalTransitionCapEx / 1000000).toFixed(1)}M transition CapEx.`,
      fullContent: `=========================================================
SURVVI CLIENT INTELLIGENCE: DECARBONIZATION ROADMAP REPORT
=========================================================
Sector Category: ${s.name}
Capacity Benchmark: ${annualCapacity.toLocaleString()} ${s.unit}s of annual production

MODEL FORECAST PARAMETERS:
- Global Carbon Price Mechanism (EU CBAM/ETS): $${carbonPrice}/ton CO2
- Green Transition Adaptation Timeframe: ${adaptationSpeed} Years
- Total Estimated Capital Expenditure (CapEx): $${(finalMetrics.totalTransitionCapEx).toLocaleString()}

ROADMAP METRICS (10-YEAR HORIZON):
- Baseline Emissions (Without Adaptation): ${(s.baseEmissionsPerUnit * annualCapacity * 10 / 1000).toFixed(1)}k Tons CO2
- Total Emissions Abated Over 10 Years: ${(finalMetrics.emissionsAbated / 1000).toFixed(1)}k Tons CO2
- Cumulative Tax/Liability Savings (Year 10): $${(finalMetrics.finalNetSavings / 1000000).toFixed(1)}M
- Breakeven Payback Timeline: ${finalMetrics.breakevenYear > 0 ? `${finalMetrics.breakevenYear} Years` : 'Exceeds 10 Years'}

RECOMMENDATION:
${finalMetrics.breakevenYear > 0 
  ? `Based on active forecasting, adopting a green adaptation program for ${s.name} under a carbon price of $${carbonPrice}/ton is highly strategic. The transition requires $${(finalMetrics.totalTransitionCapEx / 1000000).toFixed(1)}M in CapEx, breaking even in Year ${finalMetrics.breakevenYear}, and returning $${(finalMetrics.finalNetSavings / 1000000).toFixed(1)}M in cumulative tax savings by Year 10.` 
  : `The high transition CapEx of $${(finalMetrics.totalTransitionCapEx / 1000000).toFixed(1)}M exceeds cumulative tax savings within the 10-year model timeframe under a carbon price of $${carbonPrice}/ton. Re-engineering efficiency and seeking government CapEx subsidies are required before execution.`}
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
            <Leaf className="w-3.5 h-3.5" />
            No. 3 - Decarbonization Roadmap
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            ESG Decarbonization & <span className="text-accent">Carbon Tax Impact</span> Forecaster
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Evaluate the financial exposure of manufacturing operations under global carbon pricing mechanisms (like the EU's CBAM). Simulate capital investment payback curves for green furnace conversion.
          </p>
        </div>

        {/* Sector Switcher and Save to Workspace */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(sec => (
              <button
                key={sec.id}
                onClick={() => setSelectedSectorId(sec.id)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
                  selectedSectorId === sec.id
                    ? "bg-accent text-brand border-accent font-extrabold"
                    : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
                )}
              >
                {sec.name}
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
        
        {/* Left Side: Parameters & Transition Pipeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-2xl p-6 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Roadmap Simulator
            </h4>

            {/* Slider 1: Carbon Price per Metric Ton of CO2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span className="flex items-center gap-1">Regulatory Carbon Price</span>
                <span className="text-red-400 font-mono">${carbonPrice} / Ton CO₂</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="250" 
                value={carbonPrice}
                onChange={(e) => setCarbonPrice(parseInt(e.target.value))}
                className="w-full accent-red-400 bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-[9px] text-white/30 italic">Models compliance overhead under carbon trading markets (such as ETS regimes).</p>
            </div>

            {/* Slider 2: Technology Adaptation Speed */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Green Conversion Timeframe</span>
                <span className="text-emerald-400 font-mono">{adaptationSpeed} Years</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="10" 
                value={adaptationSpeed}
                onChange={(e) => setAdaptationSpeed(parseInt(e.target.value))}
                className="w-full accent-emerald-400 bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-[9px] text-white/30 italic">A shorter timeframe requires intensive, front-loaded CapEx but abates tax liability faster.</p>
            </div>

            {/* Input 3: Annual Capacity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span>Annual Output Capacity ({selectedSector.unit}s)</span>
                <span className="text-accent font-mono">{annualCapacity.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                {[50000, 200000, 500000, 1000000].map(cap => (
                  <button
                    key={cap}
                    onClick={() => setAnnualCapacity(cap)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border",
                      annualCapacity === cap
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-white/5 border-white/5 text-white/40 hover:border-white/10"
                    )}
                  >
                    {cap >= 1000000 ? `${cap/1000000}M` : `${cap/1000}k`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Abatement Summary */}
          <div className="bg-brand/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Transition Metrics (10-Year View)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">Cumulative CapEx</span>
                <span className="text-sm font-bold text-white font-mono">${(finalMetrics.totalTransitionCapEx / 1000000).toFixed(1)}M</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">CO2 Diverted</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{(finalMetrics.emissionsAbated / 1000000).toFixed(2)}M Tons</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">Payback Period</span>
                <span className="text-sm font-bold text-accent font-mono">
                  {finalMetrics.breakevenYear > 0 ? `${finalMetrics.breakevenYear} Years` : 'Over 10 Years'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">Net 10y Benefit</span>
                <span className={cn(
                  "text-sm font-bold font-mono",
                  finalMetrics.finalNetSavings > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  ${(finalMetrics.finalNetSavings / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Dual Axis Chart Visualization */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Payback timeline alert box */}
          <div className="p-6 bg-brand/20 border border-white/5 rounded-2xl flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold uppercase tracking-wide text-xs text-white">Strategic Climate Transition Payback Path</h5>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">
                By investing <span className="text-white font-bold">${(finalMetrics.totalTransitionCapEx/1000000).toFixed(1)}M</span> over <span className="text-white font-bold">{adaptationSpeed} years</span> to adopt low-emission technologies, you reduce emissions by <span className="text-emerald-400 font-bold">88%</span>. 
                {finalMetrics.breakevenYear > 0 ? (
                  <span> The cumulative savings in carbon tax penalties will exceed your total transition CapEx by <strong>{finalMetrics.breakevenYear} Years</strong>. Beyond that point, the emission savings add pure gross profitability to your bottom-line.</span>
                ) : (
                  <span> With your selected variables, carbon tax savings will pay off the transition CapEx outside our 10-year horizon. Consider accelerating adaptation speed or optimizing furnace efficiency.</span>
                )}
              </p>
            </div>
          </div>

          {/* Payback Curve Combined Chart */}
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">10-Year Payback & Emission Abatement Curves</h4>
                <p className="text-xs text-white/60 mt-1">Overlaying decreasing carbon tax liability against cumulative transition CapEx</p>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-accent uppercase bg-accent/15 border border-accent/20 px-2 py-0.5 rounded">
                <BarChart3 className="w-3 h-3" /> Transition Path
              </div>
            </div>

            {/* Combined Composed Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={roadmapData} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} 
                  />
                  {/* Left Y-axis: Dollar Values in Thousands */}
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                    unit="k"
                  />
                  {/* Right Y-axis: CO2 Emissions in Thousands of Tons */}
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                    unit="kT"
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
                  
                  {/* Carbon Tax liability as Bars */}
                  <Bar 
                    yAxisId="left"
                    dataKey="Carbon Tax ($k)" 
                    fill="rgba(239, 68, 68, 0.2)" 
                    stroke="rgba(239, 68, 68, 0.4)"
                    name="Carbon Tax penalty" 
                  />

                  {/* Cumulative CapEx as Line */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="Cumulative CapEx ($k)" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={false}
                    name="Cumulative CapEx spent" 
                  />

                  {/* Cumulative Tax savings as Line */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="Cumulative Tax Savings ($k)" 
                    stroke="#00d4ff" 
                    strokeWidth={2.5}
                    dot={false}
                    name="Cumulative Tax penalties abated" 
                  />

                  {/* CO2 Emissions Intensity as dashed line */}
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="CO2 Emissions (k Tons)" 
                    stroke="#10b981" 
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    name="CO2 Emissions" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30 leading-relaxed justify-center text-center">
              <span>* Transition CapEx can be amortized or offset via Green Bond yields & carbon credits under compliance rules.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DecarbonizationRoadmapTool;
