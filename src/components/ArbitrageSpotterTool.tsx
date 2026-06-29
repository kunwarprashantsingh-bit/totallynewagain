import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Ship, ArrowRightLeft, DollarSign, 
  Percent, Globe, AlertTriangle, CheckCircle, Info, BarChart3, ChevronRight, Bookmark 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { cn } from '../lib/utils';

interface ExchangeData {
  name: string;
  code: string;
  price: number;
  currency: string;
}

interface CommodityArbitrage {
  id: string;
  name: string;
  unit: string;
  exchanges: {
    source: ExchangeData;
    target: ExchangeData;
  };
  baseFreightPerUnit: number;
  baseTariffPercent: number;
}

const ARBITRAGE_COMMODITIES: CommodityArbitrage[] = [
  {
    id: 'copper',
    name: 'LME vs COMEX Copper',
    unit: 'Metric Ton',
    exchanges: {
      source: { name: 'London Metal Exchange', code: 'LME', price: 9240, currency: 'USD' },
      target: { name: 'Commodity Exchange (NY)', code: 'COMEX', price: 9580, currency: 'USD' }
    },
    baseFreightPerUnit: 140,
    baseTariffPercent: 1.5
  },
  {
    id: 'steel',
    name: 'SHFE vs CME Hot-Rolled Coil',
    unit: 'Metric Ton',
    exchanges: {
      source: { name: 'Shanghai Futures Exchange', code: 'SHFE', price: 540, currency: 'USD' },
      target: { name: 'Chicago Mercantile Exchange', code: 'CME', price: 680, currency: 'USD' }
    },
    baseFreightPerUnit: 65,
    baseTariffPercent: 4.0
  },
  {
    id: 'lithium',
    name: 'Wuxi Spot vs Fastmarkets Lithium Carbonate',
    unit: 'Metric Ton',
    exchanges: {
      source: { name: 'Wuxi Stainless Steel Exchange', code: 'WUXI', price: 13200, currency: 'USD' },
      target: { name: 'Fastmarkets Europe Spot', code: 'EURO_SPOT', price: 14850, currency: 'USD' }
    },
    baseFreightPerUnit: 220,
    baseTariffPercent: 2.5
  },
  {
    id: 'crude',
    name: 'Brent vs WTI Crude Spread',
    unit: 'Barrel',
    exchanges: {
      source: { name: 'West Texas Intermediate', code: 'WTI', price: 78.4, currency: 'USD' },
      target: { name: 'Brent Crude (ICE)', code: 'BRENT', price: 83.2, currency: 'USD' }
    },
    baseFreightPerUnit: 1.80,
    baseTariffPercent: 0.5
  }
];

const ArbitrageSpotterTool: React.FC = () => {
  const [selectedCommId, setSelectedCommId] = useState<string>('copper');
  
  // Interactive parameters
  const [bdiMultiplier, setBdiMultiplier] = useState<number>(100); // 100% means base freight
  const [customTariff, setCustomTariff] = useState<number>(-1); // -1 means use base
  const [cargoVolume, setCargoVolume] = useState<number>(5000); // Metric tons or barrels

  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `arbitrage-${selectedCommId}-${bdiMultiplier}-${customTariff}-${cargoVolume}`;
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
  }, [selectedCommId, bdiMultiplier, customTariff, cargoVolume]);

  const selectedCommodity = useMemo(() => {
    return ARBITRAGE_COMMODITIES.find(c => c.id === selectedCommId) || ARBITRAGE_COMMODITIES[0];
  }, [selectedCommId]);

  // Calculations
  const calculatedMetrics = useMemo(() => {
    const c = selectedCommodity;
    const sourcePrice = c.exchanges.source.price;
    const targetPrice = c.exchanges.target.price;
    const spread = targetPrice - sourcePrice;

    // Freight adjusted by BDI multiplier
    const adjustedFreight = parseFloat((c.baseFreightPerUnit * (bdiMultiplier / 100)).toFixed(2));
    
    // Tariff calculation
    const tariffRate = customTariff >= 0 ? customTariff : c.baseTariffPercent;
    const tariffCost = parseFloat((sourcePrice * (tariffRate / 100)).toFixed(2));
    
    // Total logistics overhead (Freight + Tariffs + 0.5% default transit insurance/handling)
    const insuranceCost = parseFloat((sourcePrice * 0.005).toFixed(2));
    const totalLogisticsCost = parseFloat((adjustedFreight + tariffCost + insuranceCost).toFixed(2));
    
    // Net Arbitrage Margin
    const netMarginPerUnit = parseFloat((spread - totalLogisticsCost).toFixed(2));
    const netMarginPercent = parseFloat(((netMarginPerUnit / sourcePrice) * 100).toFixed(2));
    
    // Total Cargo Value and Net Profit
    const totalRevenue = parseFloat((targetPrice * cargoVolume).toFixed(0));
    const totalInvestment = parseFloat((sourcePrice * cargoVolume).toFixed(0));
    const totalOverhead = parseFloat((totalLogisticsCost * cargoVolume).toFixed(0));
    const netProfit = parseFloat((netMarginPerUnit * cargoVolume).toFixed(0));

    // Feasibility assessment
    let status: 'highly_feasible' | 'marginal' | 'unfeasible' = 'unfeasible';
    if (netMarginPerUnit > 0 && netMarginPercent >= 4.0) {
      status = 'highly_feasible';
    } else if (netMarginPerUnit > 0) {
      status = 'marginal';
    }

    return {
      spread,
      adjustedFreight,
      tariffRate,
      tariffCost,
      insuranceCost,
      totalLogisticsCost,
      netMarginPerUnit,
      netMarginPercent,
      totalRevenue,
      totalInvestment,
      totalOverhead,
      netProfit,
      status
    };
  }, [selectedCommodity, bdiMultiplier, customTariff, cargoVolume]);

  const handleSaveWorkspace = () => {
    const savedId = `arbitrage-${selectedCommId}-${bdiMultiplier}-${customTariff}-${cargoVolume}`;
    const c = selectedCommodity;
    
    const item = {
      id: savedId,
      title: `Arbitrage Spotter: ${c.name}`,
      summary: `Arbitrage analysis for ${c.name} with cargo volume of ${cargoVolume.toLocaleString()} ${c.unit}s. Net Profit of $${calculatedMetrics.netProfit.toLocaleString()} (${calculatedMetrics.netMarginPercent}% margin).`,
      fullContent: `=========================================================
SURVVI CLIENT INTELLIGENCE: COMMODITY ARBITRAGE REPORT
=========================================================
Commodity Pair: ${c.name}
Unit of Measure: ${c.unit}

EXCHANGE BENCHMARKS:
- Source Exchange: ${c.exchanges.source.name} (${c.exchanges.source.code}) | Price: $${c.exchanges.source.price.toLocaleString()}/unit
- Target Exchange: ${c.exchanges.target.name} (${c.exchanges.target.code}) | Price: $${c.exchanges.target.price.toLocaleString()}/unit
- Absolute Price Spread: $${calculatedMetrics.spread.toLocaleString()}/unit

LOGISTICS & TARIFFS PARAMETERS:
- Baltic Dry Index Multiplier: ${bdiMultiplier}%
- Adjusted Ocean Freight Surcharge: $${calculatedMetrics.adjustedFreight.toLocaleString()}/unit
- Import Tariff Rate: ${calculatedMetrics.tariffRate}% ($${calculatedMetrics.tariffCost.toLocaleString()}/unit)
- Transit Insurance & Handling: $${calculatedMetrics.insuranceCost.toLocaleString()}/unit
- Total Landed Logistics Overhead: $${calculatedMetrics.totalLogisticsCost.toLocaleString()}/unit

FINANCIAL ARBITRAGE METRICS:
- Net Arbitrage Margin Per Unit: $${calculatedMetrics.netMarginPerUnit.toLocaleString()}/unit
- Net Arbitrage Margin Percent: ${calculatedMetrics.netMarginPercent}%
- Target Cargo Volume: ${cargoVolume.toLocaleString()} units
- Total Procurement Capital Requirement: $${parseFloat(calculatedMetrics.totalInvestment.toString()).toLocaleString()}
- Total Landed Revenue Potential: $${parseFloat(calculatedMetrics.totalRevenue.toString()).toLocaleString()}
- Cumulative Logistics Overhead: $${parseFloat(calculatedMetrics.totalOverhead.toString()).toLocaleString()}
- Net Arbitrage Profit: $${parseFloat(calculatedMetrics.netProfit.toString()).toLocaleString()}

FEASIBILITY CLASSIFICATION:
Status: ${calculatedMetrics.status === 'highly_feasible' ? 'HIGHLY FEASIBLE (Robust spread margin)' : calculatedMetrics.status === 'marginal' ? 'MARGINAL (High exposure, thin margins)' : 'UNFEASIBLE (Negative margin after overhead)'}

RECOMMENDATION:
${calculatedMetrics.status === 'highly_feasible' 
  ? `This commodity pair represents an active, highly profitable arbitrage window. The net margin of ${calculatedMetrics.netMarginPercent}% successfully offsets transit risk and handling overhead. Executing cargo routing is highly recommended.` 
  : calculatedMetrics.status === 'marginal'
  ? `The price spread exists but is heavily compressed by ocean freight and custom tariffs. Sourcing represents high risk; execution is recommended only under long-term contractual logistics discounts.`
  : `The current spread fails to cover ocean freight and tariff overhead, resulting in negative margins. Routing cargo is unfeasible under current Baltic Dry and trade barrier conditions.`}
=========================================================
Archived on ${new Date().toLocaleString()} | Survvi Sovereign Analytics Suite`,
    };

    const event = new CustomEvent('ai_studio_add_workspace', {
      detail: { item, type: 'research' }
    });
    window.dispatchEvent(event);
    setIsSaved(true);
  };

  // Reset custom tariff slider when commodity changes
  const handleCommodityChange = (id: string) => {
    setSelectedCommId(id);
    setCustomTariff(-1);
  };

  // Dynamic 12-month arbitrage forecast data generator
  const forecastData = useMemo(() => {
    const c = selectedCommodity;
    const metrics = calculatedMetrics;
    const sourceBase = c.exchanges.source.price;
    const targetBase = c.exchanges.target.price;

    return Array.from({ length: 12 }).map((_, i) => {
      const monthLabel = `M+${i + 1}`;
      
      // Simulate cyclical fluctuation & convergence/divergence
      // Spread converges or diverges slowly over months based on freight conditions
      const cycleFactor = Math.sin(i * 0.5) * (sourceBase * 0.015);
      const convergenceTrend = (i * (metrics.totalLogisticsCost * 0.02)); // Market arbitrage closing loop
      
      const simulatedSource = parseFloat((sourceBase * (1 + (i * 0.004)) + cycleFactor).toFixed(1));
      const simulatedTarget = parseFloat((targetBase * (1 + (i * 0.002)) - convergenceTrend).toFixed(1));
      const simulatedSpread = parseFloat((simulatedTarget - simulatedSource).toFixed(1));
      const simulatedOverhead = parseFloat((metrics.totalLogisticsCost * (1 + (Math.sin(i * 0.3) * 0.05))).toFixed(1));
      const simulatedNetMargin = parseFloat((simulatedSpread - simulatedOverhead).toFixed(1));

      return {
        month: monthLabel,
        [c.exchanges.source.code]: simulatedSource,
        [c.exchanges.target.code]: simulatedTarget,
        Overhead: simulatedOverhead,
        'Net Margin': simulatedNetMargin > 0 ? simulatedNetMargin : 0
      };
    });
  }, [selectedCommodity, calculatedMetrics]);

  return (
    <div className="flex flex-col gap-8">
      {/* Tool Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-3">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            No. 2 - Arbitrage Spotter
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Global Commodity <span className="text-accent">Arbitrage Spotter</span> & Trade Modeler
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Detect regional price discrepancies between international futures exchanges. Calculate logistical friction, freight, and customs tariffs to execute profitable commodity physical arbitrage.
          </p>
        </div>

        {/* Commodity Switcher and Save to Workspace */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {ARBITRAGE_COMMODITIES.map(comm => (
              <button
                key={comm.id}
                onClick={() => handleCommodityChange(comm.id)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
                  selectedCommId === comm.id
                    ? "bg-accent text-brand border-accent font-extrabold"
                    : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
                )}
              >
                {comm.name.split(' vs ')[0]} / {comm.name.split(' vs ')[1]}
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
        
        {/* Left Side: Parameters & Trade Pipeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-2xl p-6 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" /> Arbitrage Parameters
            </h4>

            {/* Slider 1: Baltic Dry Index Freight Multiplier */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span className="flex items-center gap-1"><Ship className="w-3.5 h-3.5 text-sky-400" /> Ocean Freight Surcharge</span>
                <span className="text-sky-400 font-mono">{bdiMultiplier}% of Base BDI</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="250" 
                value={bdiMultiplier}
                onChange={(e) => setBdiMultiplier(parseInt(e.target.value))}
                className="w-full accent-sky-400 bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-[9px] text-white/30 italic">Simulates high/low spot chartering rates based on maritime congestion indices.</p>
            </div>

            {/* Slider 2: Custom Tariff Override */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-amber-400" /> Trade Tariff Rate</span>
                <span className="text-amber-400 font-mono">
                  {customTariff >= 0 ? `${customTariff.toFixed(1)}%` : `Default (${selectedCommodity.baseTariffPercent.toFixed(1)}%)`}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="15" 
                step="0.5"
                value={customTariff >= 0 ? customTariff : selectedCommodity.baseTariffPercent}
                onChange={(e) => setCustomTariff(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-[9px] text-white/30 italic">Adjust to test trade policies, regional carbon tariffs (CBAM), or customs duty waivers.</p>
            </div>

            {/* Input 3: Cargo Cargo Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                <span>Cargo Volume ({selectedCommodity.unit}s)</span>
                <span className="text-accent font-mono">{cargoVolume.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                {[1000, 5000, 10000, 25000].map(vol => (
                  <button
                    key={vol}
                    onClick={() => setCargoVolume(vol)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border",
                      cargoVolume === vol
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

          {/* Arbitrage Profitability Visual Funnel */}
          <div className="bg-brand/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Logistics & Tariff Funnel</h4>
            
            <div className="space-y-3">
              {/* Gross Spread Row */}
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <span className="text-white/60">Target Exchange price discrepancy (Spread)</span>
                <span className="font-bold text-white font-mono">+${calculatedMetrics.spread.toLocaleString()}</span>
              </div>

              {/* Ocean Freight */}
              <div className="flex justify-between items-center text-xs pl-2 text-white/40">
                <span>- Adjusted Maritime Freight</span>
                <span className="font-mono text-red-400">-${calculatedMetrics.adjustedFreight.toLocaleString()}</span>
              </div>

              {/* Trade Tariff */}
              <div className="flex justify-between items-center text-xs pl-2 text-white/40">
                <span>- Border Tariff ({calculatedMetrics.tariffRate.toFixed(1)}%)</span>
                <span className="font-mono text-red-400">-${calculatedMetrics.tariffCost.toLocaleString()}</span>
              </div>

              {/* Transit Insurance */}
              <div className="flex justify-between items-center text-xs pl-2 text-white/40">
                <span>- Marine Transit Insurance & handling (0.5%)</span>
                <span className="font-mono text-red-400">-${calculatedMetrics.insuranceCost.toLocaleString()}</span>
              </div>

              {/* Net Margin Unit Row */}
              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                <span className="font-bold text-white">Net Arbitrage Margin / {selectedCommodity.unit}</span>
                <span className={cn(
                  "font-bold font-mono text-sm",
                  calculatedMetrics.netMarginPerUnit > 0 ? "text-accent" : "text-red-400"
                )}>
                  ${calculatedMetrics.netMarginPerUnit.toLocaleString()} ({calculatedMetrics.netMarginPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Forecast Charts & Feasibility summary */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Feasibility Assessment Display Card */}
          <div className={cn(
            "p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all",
            calculatedMetrics.status === 'highly_feasible' 
              ? "bg-emerald-500/10 border-emerald-500/20 text-white" 
              : calculatedMetrics.status === 'marginal'
              ? "bg-amber-500/10 border-amber-500/20 text-white"
              : "bg-red-500/10 border-red-500/20 text-white"
          )}>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {calculatedMetrics.status === 'highly_feasible' ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : calculatedMetrics.status === 'marginal' ? (
                  <Info className="w-8 h-8 text-amber-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                )}
              </div>
              <div>
                <h5 className="font-bold tracking-wide uppercase text-xs">
                  {calculatedMetrics.status === 'highly_feasible' ? 'Arbitrage Opportunity Highly Feasible' : 
                   calculatedMetrics.status === 'marginal' ? 'Marginal Opportunity (Tight spreads)' : 'Arbitrage Spread Locked (Negative Margin)'}
                </h5>
                <p className="text-white/50 text-xs mt-1 leading-relaxed">
                  {calculatedMetrics.status === 'highly_feasible' 
                    ? `Physical freight shipment yields ${calculatedMetrics.netMarginPercent}% net returns after shipping and customs overhead.`
                    : calculatedMetrics.status === 'marginal'
                    ? 'Caution: Price divergence is barely covering logistics overhead. Slight maritime delays or fuel surges will wipe out profitability.'
                    : 'Unfeasible: Price gap between exchanges is narrower than freight cost + tariffs. Physical transport will results in severe net losses.'}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right flex-shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Net Cargo Profit</span>
              <span className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                calculatedMetrics.netProfit > 0 ? "text-accent" : "text-red-400"
              )}>
                {calculatedMetrics.netProfit > 0 ? '+' : ''}${calculatedMetrics.netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Arbitrage Divergence Line Chart */}
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">12-Month Arbitrage Profitability Forecast</h4>
                <p className="text-xs text-white/60 mt-1">Convergence modeling over standard seasonal shipping cycles</p>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-accent uppercase bg-accent/15 border border-accent/20 px-2 py-0.5 rounded">
                <BarChart3 className="w-3 h-3" /> Predictive Curve
              </div>
            </div>

            {/* Forecast Area Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNetMargin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
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
                    unit="$"
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
                  
                  {/* Exchange Source price area */}
                  <Area 
                    type="monotone" 
                    dataKey={selectedCommodity.exchanges.source.code} 
                    stroke="#a855f7" 
                    strokeWidth={2} 
                    fill="none" 
                  />
                  
                  {/* Exchange Target price area */}
                  <Area 
                    type="monotone" 
                    dataKey={selectedCommodity.exchanges.target.code} 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    fill="none" 
                  />

                  {/* Net Margin Area */}
                  <Area 
                    type="monotone" 
                    dataKey="Net Margin" 
                    stroke="#00d4ff" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorNetMargin)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30 leading-relaxed justify-center text-center">
              <span>* Convergence trend assumes market operators exploit and narrow regional spreads by month M+8.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArbitrageSpotterTool;
