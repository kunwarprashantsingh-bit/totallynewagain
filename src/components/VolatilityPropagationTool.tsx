import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Zap, Ship, BarChart3, Activity, 
  ShieldAlert, Play, Pause, RefreshCw, Sliders, Info, LineChart
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, 
  ZAxis, CartesianGrid, Tooltip, LineChart as RechartsLineChart, 
  Line, Legend, ReferenceLine 
} from 'recharts';
import { cn } from '../lib/utils';

// Define assets involved in the correlation and volatility analysis
interface AssetInfo {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: any;
}

const ASSETS: AssetInfo[] = [
  { id: 'OIL', name: 'Crude Oil (WTI)', category: 'Energy', color: '#f59e0b', icon: Zap },
  { id: 'BDI', name: 'Baltic Dry Index', category: 'Shipping', color: '#38bdf8', icon: Ship },
  { id: 'STEEL', name: 'Structural Steel', category: 'Materials', color: '#94a3b8', icon: Sliders },
  { id: 'CEMENT', name: 'Portland Cement', category: 'Materials', color: '#cbd5e1', icon: TrendingUp },
  { id: 'COPPER', name: 'LME Copper', category: 'Metals', color: '#ea580c', icon: Activity },
  { id: 'LITHIUM', name: 'Lithium Carbonate', category: 'Battery', color: '#10b981', icon: Zap },
  { id: 'RARE_EARTH', name: 'Neodymium Oxide', category: 'Tech Metals', color: '#a855f7', icon: BarChart3 }
];

// Baseline Correlation Matrix (symmetric, diagonal = 1.0)
const BASE_CORRELATIONS: Record<string, Record<string, number>> = {
  OIL:        { OIL: 1.00, BDI: 0.74, STEEL: 0.45, CEMENT: 0.38, COPPER: 0.52, LITHIUM: 0.18, RARE_EARTH: 0.22 },
  BDI:        { OIL: 0.74, BDI: 1.00, STEEL: 0.58, CEMENT: 0.42, COPPER: 0.61, LITHIUM: 0.25, RARE_EARTH: 0.28 },
  STEEL:      { OIL: 0.45, BDI: 0.58, STEEL: 1.00, CEMENT: 0.71, COPPER: 0.68, LITHIUM: 0.32, RARE_EARTH: 0.35 },
  CEMENT:     { OIL: 0.38, BDI: 0.42, STEEL: 0.71, CEMENT: 1.00, COPPER: 0.49, LITHIUM: 0.15, RARE_EARTH: 0.18 },
  COPPER:     { OIL: 0.52, BDI: 0.61, STEEL: 0.68, CEMENT: 0.49, COPPER: 1.00, LITHIUM: 0.64, RARE_EARTH: 0.59 },
  LITHIUM:    { OIL: 0.18, BDI: 0.25, STEEL: 0.32, CEMENT: 0.15, COPPER: 0.64, LITHIUM: 1.00, RARE_EARTH: 0.76 },
  RARE_EARTH: { OIL: 0.22, BDI: 0.28, STEEL: 0.35, CEMENT: 0.18, COPPER: 0.59, LITHIUM: 0.76, RARE_EARTH: 1.00 }
};

interface ShockEvent {
  id: string;
  name: string;
  description: string;
  severity: 'high' | 'critical' | 'moderate';
  primaryAsset: string;
  multipliers: Record<string, number>; // price percent change factor
  delayMonths: Record<string, number>; // lag before peak impact in months
}

const SHOCK_EVENTS: ShockEvent[] = [
  {
    id: 'suez',
    name: 'Red Sea & Suez Transit Blockade',
    description: 'Chokepoint bypass forces cape route container rerouting. Instantly multiplies Baltic Dry freight costs and drives speculative oil hedging.',
    severity: 'critical',
    primaryAsset: 'BDI',
    multipliers: { OIL: 28, BDI: 165, STEEL: 18, CEMENT: 12, COPPER: 22, LITHIUM: 10, RARE_EARTH: 15 },
    delayMonths: { OIL: 1, BDI: 0, STEEL: 3, CEMENT: 4, COPPER: 2, LITHIUM: 3, RARE_EARTH: 3 }
  },
  {
    id: 'opec',
    name: 'OPEC Sovereign Production Lock',
    description: 'Coordinated aggregate supply tightening by global producers. Sparks immediate upstream energy spikes that propagate downstream to energy-heavy cement and steel foundries.',
    severity: 'high',
    primaryAsset: 'OIL',
    multipliers: { OIL: 55, BDI: 32, STEEL: 22, CEMENT: 28, COPPER: 14, LITHIUM: 6, RARE_EARTH: 8 },
    delayMonths: { OIL: 0, BDI: 1, STEEL: 2, CEMENT: 3, COPPER: 2, LITHIUM: 4, RARE_EARTH: 3 }
  },
  {
    id: 'battery_boom',
    name: 'Critical Mineral Supply Squeeze',
    description: 'Unprecedented grid-storage and EV battery gigafactory acceleration. Drives immediate shortages in Lithium Carbonate and copper conduit channels.',
    severity: 'high',
    primaryAsset: 'LITHIUM',
    multipliers: { OIL: -5, BDI: 15, STEEL: 12, CEMENT: 4, COPPER: 48, LITHIUM: 120, RARE_EARTH: 65 },
    delayMonths: { OIL: 4, BDI: 2, STEEL: 3, CEMENT: 5, COPPER: 1, LITHIUM: 0, RARE_EARTH: 1 }
  },
  {
    id: 'carbon_tax',
    name: 'Cross-Border Carbon Tariff (CBAM)',
    description: 'Enforcement of high-regulatory carbon import adjustments. Punishes non-decarbonized Portland cement and blast-furnace steel mills.',
    severity: 'moderate',
    primaryAsset: 'CEMENT',
    multipliers: { OIL: -12, BDI: -8, STEEL: 35, CEMENT: 42, COPPER: 18, LITHIUM: 15, RARE_EARTH: 12 },
    delayMonths: { OIL: 3, BDI: 2, STEEL: 1, CEMENT: 0, COPPER: 2, LITHIUM: 3, RARE_EARTH: 2 }
  }
];

const VolatilityPropagationTool: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<[string, string]>(['OIL', 'BDI']);
  const [activeShock, setActiveShock] = useState<string>('suez');
  const [simulationMonth, setSimulationMonth] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Play simulation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setSimulationMonth((prev) => (prev >= 12 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const shock = useMemo(() => {
    return SHOCK_EVENTS.find(s => s.id === activeShock) || SHOCK_EVENTS[0];
  }, [activeShock]);

  // Handle cell click in correlation matrix
  const handleCellClick = (assetA: string, assetB: string) => {
    setSelectedPair([assetA, assetB]);
  };

  // Generate dynamic correlations under active shock
  const dynamicCorrelations = useMemo(() => {
    const matrix = JSON.parse(JSON.stringify(BASE_CORRELATIONS));
    // A systemic shock temporarily aligns asset moves, increasing their correlations
    const alignmentFactor = shock.severity === 'critical' ? 0.22 : shock.severity === 'high' ? 0.15 : 0.08;
    
    for (const keyA in matrix) {
      for (const keyB in matrix[keyA]) {
        if (keyA !== keyB) {
          let corr = matrix[keyA][keyB];
          // Shocks involving primary assets lift correlation with related assets
          if (keyA === shock.primaryAsset || keyB === shock.primaryAsset) {
            corr = Math.min(0.98, corr + alignmentFactor);
          } else {
            corr = Math.min(0.95, corr + (alignmentFactor * 0.5));
          }
          matrix[keyA][keyB] = parseFloat(corr.toFixed(2));
        }
      }
    }
    return matrix;
  }, [shock]);

  // Generate Scatter / Regression data for selected pair
  const scatterData = useMemo(() => {
    const [assetA, assetB] = selectedPair;
    const baseCorr = BASE_CORRELATIONS[assetA][assetB];
    const currentCorr = dynamicCorrelations[assetA][assetB];

    // Synthesize 40 historic points matching selected correlation
    return Array.from({ length: 40 }).map((_, i) => {
      // Generate correlated random variables
      const x = (Math.sin(i * 0.4) * 15 + Math.cos(i * 0.1) * 5 + 100);
      const randomNoise = (Math.sin(i * 1.7) * 8 * (1 - Math.abs(currentCorr)));
      const y = 100 + (x - 100) * currentCorr * 1.1 + randomNoise;
      return {
        x: parseFloat(x.toFixed(1)),
        y: parseFloat(y.toFixed(1)),
        index: i
      };
    });
  }, [selectedPair, dynamicCorrelations]);

  // Generate 12-Month Propagation Time-series Data
  const propagationData = useMemo(() => {
    return Array.from({ length: 13 }).map((_, m) => {
      const dataPoint: Record<string, any> = { month: `M+${m}` };
      
      ASSETS.forEach(asset => {
        const maxImpact = shock.multipliers[asset.id] || 0;
        const peakMonth = shock.delayMonths[asset.id] || 0;
        
        let value = 0;
        if (m < peakMonth) {
          // Linear buildup to peak
          value = peakMonth === 0 ? maxImpact : (m / peakMonth) * maxImpact;
        } else {
          // Exponential decay back to baseline
          const decayMonths = m - peakMonth;
          value = maxImpact * Math.exp(-decayMonths * 0.18);
        }
        dataPoint[asset.id] = parseFloat(value.toFixed(1));
      });
      
      return dataPoint;
    });
  }, [shock]);

  // Get active cell correlation coefficient
  const activeCoefficient = dynamicCorrelations[selectedPair[0]][selectedPair[1]];
  const assetInfoA = ASSETS.find(a => a.id === selectedPair[0])!;
  const assetInfoB = ASSETS.find(a => a.id === selectedPair[1])!;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col gap-10"
    >
      {/* Title & Introduction */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <LineChart className="w-3 h-3" />
            Systemic Risk Forecaster
          </div>
          <h3 className="text-3xl font-bold tracking-tight">
            Cross-Asset Correlation & <span className="text-accent">Volatility Propagation</span>
          </h3>
          <p className="text-white/40 text-sm mt-1 max-w-3xl">
            Simulate how localized supply chain and commodity shocks propagate across energy, metallurgy, and industrial materials. Adjust events to analyze lag-phases, dynamic correlation shifts, and contagion vectors.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[280px]">
          <span className={cn(
            "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold",
            shock.severity === 'critical' ? "bg-red-500 text-white animate-pulse" :
            shock.severity === 'high' ? "bg-amber-500 text-brand" : "bg-blue-500 text-white"
          )}>
            !
          </span>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 block">Active Threat Horizon</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">{shock.name}</span>
          </div>
        </div>
      </div>

      {/* Grid Layout of the Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Correlation Matrix Heatmap */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Dynamic Correlation Heatmap</h4>
                <p className="text-xs text-white/40 mt-1">Click a cell to plot historical scatter alignment & linear regressions.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-2 py-1 rounded text-[9px] font-bold text-accent uppercase">
                <Activity className="w-3 h-3" /> Live Shrunk Estimates
              </div>
            </div>

            {/* Matrix Container */}
            <div className="overflow-x-auto">
              <div className="min-w-[480px]">
                {/* Header Row */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="text-[9px] font-bold uppercase text-white/30 flex items-center justify-center">ASSET</div>
                  {ASSETS.map(asset => (
                    <div 
                      key={asset.id} 
                      className="text-[9px] font-bold text-center uppercase tracking-wider text-white/60 truncate px-1"
                      title={asset.name}
                    >
                      {asset.id}
                    </div>
                  ))}
                </div>

                {/* Matrix Rows */}
                {ASSETS.map(assetRow => (
                  <div key={assetRow.id} className="grid grid-cols-8 gap-1 mb-1 items-center">
                    {/* Row Label */}
                    <div 
                      className="text-[9px] font-bold uppercase text-white/60 flex items-center gap-1.5 truncate pr-2"
                      title={assetRow.name}
                    >
                      <assetRow.icon className="w-3 h-3 flex-shrink-0" style={{ color: assetRow.color }} />
                      <span className="truncate">{assetRow.id}</span>
                    </div>

                    {/* Cells */}
                    {ASSETS.map(assetCol => {
                      const corr = dynamicCorrelations[assetRow.id][assetCol.id];
                      const isSelected = (selectedPair[0] === assetRow.id && selectedPair[1] === assetCol.id) || 
                                         (selectedPair[1] === assetRow.id && selectedPair[0] === assetCol.id);
                      
                      // Calculate custom heat color based on correlation coefficient
                      let bgClass = "bg-white/5 text-white/50";
                      let style: React.CSSProperties = {};
                      
                      if (assetRow.id === assetCol.id) {
                        bgClass = "bg-accent/20 text-accent font-extrabold border border-accent/30";
                      } else if (corr >= 0.70) {
                        style = { backgroundColor: 'rgba(0, 212, 255, 0.45)', color: '#fff' };
                      } else if (corr >= 0.50) {
                        style = { backgroundColor: 'rgba(0, 212, 255, 0.28)', color: 'rgba(255,255,255,0.9)' };
                      } else if (corr >= 0.30) {
                        style = { backgroundColor: 'rgba(0, 212, 255, 0.15)', color: 'rgba(255,255,255,0.7)' };
                      } else if (corr <= -0.1) {
                        style = { backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#fff' };
                      }

                      return (
                        <button
                          key={assetCol.id}
                          onClick={() => handleCellClick(assetRow.id, assetCol.id)}
                          style={style}
                          className={cn(
                            "h-10 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all border border-transparent hover:scale-105 hover:z-10 cursor-pointer",
                            isSelected && "border-accent ring-2 ring-accent/30 scale-105",
                            bgClass
                          )}
                          title={`${assetRow.name} vs ${assetCol.name}: ${corr}`}
                        >
                          {corr.toFixed(2)}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient scale guide */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] uppercase tracking-wider text-white/40">
              <span>Inverse (-1.00)</span>
              <div className="flex gap-1 items-center">
                <span className="w-3 h-3 rounded bg-red-500/20" />
                <span className="w-3 h-3 rounded bg-white/5" />
                <span className="w-3 h-3 rounded bg-[#00d4ff]/15" />
                <span className="w-3 h-3 rounded bg-[#00d4ff]/30" />
                <span className="w-3 h-3 rounded bg-[#00d4ff]/50" />
              </div>
              <span>Perfect (+1.00)</span>
            </div>
          </div>

          {/* Core Interactive Scatter Plot of Selected Pair */}
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Scatter Regression Alignment</h4>
                <p className="text-xs text-white/40 mt-1">
                  Plotting standard deviation returns for <span className="text-accent font-bold">{assetInfoA.name}</span> versus <span className="text-[#a855f7] font-bold">{assetInfoB.name}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 block">Beta Sync</span>
                <span className="text-lg font-bold text-accent">{activeCoefficient > 0 ? '+' : ''}{activeCoefficient}</span>
              </div>
            </div>

            {/* Scatter Plot Stage */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name={assetInfoA.name} 
                    unit="%" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }}
                    domain={['auto', 'auto']}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name={assetInfoB.name} 
                    unit="%" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Scatter name="Asset Pair Deviation" data={scatterData} fill="#00d4ff" fillOpacity={0.65} line={{ stroke: '#a855f7', strokeWidth: 1.5 }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40 italic bg-white/5 p-2 rounded-lg">
              <Info className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>A coefficient of {activeCoefficient} indicates {Math.abs(activeCoefficient) >= 0.6 ? 'strong co-movement' : 'moderate coupling'} triggered during our simulated macroeconomic shocks.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Shock Simulator and Volatility Propagation Forecaster */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 space-y-6">
            
            {/* Shock Selection Section */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Choose Macroeconomic Shock Event</h4>
              <div className="grid grid-cols-2 gap-3">
                {SHOCK_EVENTS.map(ev => {
                  const isActive = ev.id === activeShock;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => {
                        setActiveShock(ev.id);
                        setSimulationMonth(0);
                      }}
                      className={cn(
                        "p-4 rounded-2xl text-left border transition-all relative overflow-hidden",
                        isActive 
                          ? "bg-accent/10 border-accent text-white shadow-lg" 
                          : "bg-white/5 border-white/5 text-white/50 hover:border-white/15 hover:bg-white/10"
                      )}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-accent/20 rounded-bl-2xl flex items-center justify-center">
                          <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                        </div>
                      )}
                      <span className={cn(
                        "text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded inline-block mb-2",
                        ev.severity === 'critical' ? "bg-red-500/20 text-red-400" :
                        ev.severity === 'high' ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                      )}>
                        {ev.severity}
                      </span>
                      <h5 className="text-xs font-bold block leading-snug">{ev.name}</h5>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shock Details */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <p className="text-xs text-white/70 leading-relaxed">
                {shock.description}
              </p>
              <div className="flex gap-4 pt-2 border-t border-white/5 text-[9px] uppercase tracking-wider text-white/40">
                <div>
                  Primary Contagion Entry: <span className="text-accent font-bold">{ASSETS.find(a => a.id === shock.primaryAsset)?.name}</span>
                </div>
                <div>
                  Shock Volatility Index: <span className="text-red-400 font-bold">{shock.severity === 'critical' ? '92%' : shock.severity === 'high' ? '74%' : '51%'}</span>
                </div>
              </div>
            </div>

            {/* Volatility Propagation Timeline Forecaster */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">12-Month Propagation Propagation Forecast</h4>
                  <p className="text-xs text-white/60 mt-1">Impact build-up & lag phases across sectors</p>
                </div>

                {/* Simulation Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={cn(
                      "p-2 rounded-xl border transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider",
                      isPlaying 
                        ? "bg-red-500/20 border-red-500/30 text-red-400" 
                        : "bg-accent/10 border-accent/20 text-accent hover:bg-accent/20"
                    )}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? 'Pause' : 'Animate'}
                  </button>
                  <button
                    onClick={() => {
                      setSimulationMonth(0);
                      setIsPlaying(false);
                    }}
                    className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white"
                    title="Reset Simulation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Line Chart of Propagation Wave */}
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={propagationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    
                    {/* Active Time Indicator line during animation */}
                    <ReferenceLine x={`M+${simulationMonth}`} stroke="rgba(0, 212, 255, 0.4)" strokeDasharray="3 3" strokeWidth={2} />

                    {/* Plot Line for each asset */}
                    {ASSETS.map(asset => (
                      <Line 
                        key={asset.id}
                        type="monotone"
                        dataKey={asset.id}
                        stroke={asset.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        name={asset.name}
                      />
                    ))}
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              {/* Slider for Manual Timeline scrubbing */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/40">
                  <span>Timeline Playback</span>
                  <span className="text-accent font-mono text-xs">Peak Month +{simulationMonth} Out</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="12" 
                  value={simulationMonth}
                  onChange={(e) => {
                    setSimulationMonth(parseInt(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full accent-accent bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Animated propagation values listing */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {ASSETS.slice(0, 4).map(asset => {
                  const val = propagationData[simulationMonth]?.[asset.id] || 0;
                  return (
                    <div key={asset.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/30 block truncate">{asset.name}</span>
                      <span className={cn(
                        "text-xs font-bold block mt-1",
                        val > 0 ? "text-red-400" : val < 0 ? "text-emerald-400" : "text-white/40"
                      )}>
                        {val > 0 ? '+' : ''}{val}%
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default VolatilityPropagationTool;
