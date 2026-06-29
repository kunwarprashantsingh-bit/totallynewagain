import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, BarChart3, Radio, RefreshCw, Layers, ShieldAlert,
  ArrowRight, ShieldCheck, Zap, Activity, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line, ReferenceLine 
} from 'recharts';
import { cn } from '../lib/utils';

// Matrix Assets
const ASSETS = [
  { code: 'WTI', name: 'WTI Crude Oil', category: 'Energy' },
  { code: 'BRENT', name: 'Brent Crude', category: 'Energy' },
  { code: 'BDI', name: 'Baltic Dry Index', category: 'Shipping' },
  { code: 'COPPER', name: 'Copper Grade A', category: 'Metals' },
  { code: 'STEEL', name: 'Steel ETF (SLX)', category: 'Metals' },
  { code: 'LUMBER', name: 'Lumber Futures', category: 'Materials' },
  { code: 'SPY', name: 'S&P 500 ETF', category: 'Equity' },
  { code: 'LOGI', name: 'Logistics Index (IYT)', category: 'Shipping' }
];

interface MacroShock {
  id: string;
  name: string;
  description: string;
  coefficientMultiplier: number;
  energyVolMultiplier: number;
}

const MACRO_SHOCKS: MacroShock[] = [
  {
    id: 'baseline',
    name: 'Standard Baseline Market',
    description: 'Historical multi-year cyclical correlation levels under structural global growth assumptions.',
    coefficientMultiplier: 1.0,
    energyVolMultiplier: 1.0
  },
  {
    id: 'suez-closure',
    name: 'Suez Channel Redirection',
    description: 'Maritime congestion spikes freight indices while causing regional energy supply disruption spikes.',
    coefficientMultiplier: 1.35,
    energyVolMultiplier: 1.4
  },
  {
    id: 'opec-cut',
    name: 'OPEC Sovereign Oil Block',
    description: 'Severe structural energy supply crunch. Energy gains extreme positive linkage; general indices decoupling negative.',
    coefficientMultiplier: -0.6,
    energyVolMultiplier: 1.85
  },
  {
    id: 'monetary-shock',
    name: 'Sovereign Rate Spike (+150bps)',
    description: 'Severe collateral credit liquidation. Cross-asset correlations unify positively during general market drops.',
    coefficientMultiplier: 1.6,
    energyVolMultiplier: 0.9
  }
];

// Baseline correlations between assets (0.0 to 1.0)
const BASELINE_CORRELATIONS: Record<string, Record<string, number>> = {
  WTI: { WTI: 1.00, BRENT: 0.94, BDI: 0.32, COPPER: 0.45, STEEL: 0.38, LUMBER: 0.22, SPY: 0.28, LOGI: 0.15 },
  BRENT: { WTI: 0.94, BRENT: 1.00, BDI: 0.36, COPPER: 0.48, STEEL: 0.41, LUMBER: 0.20, SPY: 0.30, LOGI: 0.18 },
  BDI: { WTI: 0.32, BRENT: 0.36, BDI: 1.00, COPPER: 0.62, STEEL: 0.58, LUMBER: 0.45, SPY: 0.25, LOGI: 0.74 },
  COPPER: { WTI: 0.45, BRENT: 0.48, BDI: 0.62, COPPER: 1.00, STEEL: 0.72, LUMBER: 0.52, SPY: 0.55, LOGI: 0.48 },
  STEEL: { WTI: 0.38, BRENT: 0.41, BDI: 0.58, COPPER: 0.72, STEEL: 1.00, LUMBER: 0.49, SPY: 0.60, LOGI: 0.51 },
  LUMBER: { WTI: 0.22, BRENT: 0.20, BDI: 0.45, COPPER: 0.52, STEEL: 0.49, LUMBER: 1.00, SPY: 0.42, LOGI: 0.38 },
  SPY: { WTI: 0.28, BRENT: 0.30, BDI: 0.25, COPPER: 0.55, STEEL: 0.60, LUMBER: 0.42, SPY: 1.00, LOGI: 0.65 },
  LOGI: { WTI: 0.15, BRENT: 0.18, BDI: 0.74, COPPER: 0.48, STEEL: 0.51, LUMBER: 0.38, SPY: 0.65, LOGI: 1.00 }
};

const CrossAssetCorrelationMatrix: React.FC = () => {
  const [activeShockId, setActiveShockId] = useState<string>('baseline');
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: string; col: string }>({ row: 'WTI', col: 'BRENT' });

  const activeShock = useMemo(() => {
    return MACRO_SHOCKS.find(s => s.id === activeShockId) || MACRO_SHOCKS[0];
  }, [activeShockId]);

  // Compute live matrix under stress coefficients
  const liveMatrix = useMemo(() => {
    const mult = activeShock.coefficientMultiplier;
    const matrix: Record<string, Record<string, number>> = {};
    
    ASSETS.forEach(rowAsset => {
      matrix[rowAsset.code] = {};
      ASSETS.forEach(colAsset => {
        if (rowAsset.code === colAsset.code) {
          matrix[rowAsset.code][colAsset.code] = 1.00;
          return;
        }

        const base = BASELINE_CORRELATIONS[rowAsset.code][colAsset.code];
        let calculated = base * mult;

        // Apply custom constraints for specific scenarios to maintain professional fidelity
        if (activeShockId === 'opec-cut') {
          // OPEC cuts spike energy linkages, but disconnect other assets negatively due to cost pressures
          if (rowAsset.category === 'Energy' && colAsset.category === 'Energy') {
            calculated = Math.min(0.98, base * 1.08);
          } else if (rowAsset.category === 'Energy' || colAsset.category === 'Energy') {
            calculated = base - 0.55; // strong decoupling drag
          }
        } else if (activeShockId === 'suez-closure') {
          if (rowAsset.code === 'BDI' || colAsset.code === 'BDI') {
            calculated = Math.min(0.95, base + 0.25);
          }
        } else if (activeShockId === 'monetary-shock') {
          // Rate shock locks everything down positively in forced liquidation deleveraging
          calculated = Math.min(0.92, base + 0.35);
        }

        // Clamp to valid correlation range [-1, 1]
        calculated = Math.max(-1.0, Math.min(1.0, calculated));
        matrix[rowAsset.code][colAsset.code] = parseFloat(calculated.toFixed(2));
      });
    });

    return matrix;
  }, [activeShock, activeShockId]);

  // Generate synthetic regression scatter plot data for the active pair
  const scatterPlotData = useMemo(() => {
    const coefficient = liveMatrix[selectedCell.row][selectedCell.col];
    const dataPoints = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
      // Linear model: y = r * x + sqrt(1 - r^2) * error
      const xVal = -2.5 + (i * 5.0) / (count - 1) + (Math.random() * 0.4 - 0.2);
      const error = (Math.random() * 2.0 - 1.0) * Math.sqrt(1 - coefficient * coefficient);
      const yVal = (coefficient * xVal) + error;
      
      dataPoints.push({
        x: parseFloat(xVal.toFixed(2)),
        y: parseFloat(yVal.toFixed(2))
      });
    }
    return dataPoints;
  }, [selectedCell, liveMatrix]);

  const getHeatmapColor = (value: number) => {
    if (value === 1.0) return 'bg-white/10 text-white';
    
    // Positive Correlation (Emerald hues)
    if (value > 0) {
      if (value >= 0.75) return 'bg-emerald-600/80 text-white';
      if (value >= 0.50) return 'bg-emerald-500/50 text-white/80';
      if (value >= 0.25) return 'bg-emerald-500/25 text-white/70';
      return 'bg-emerald-500/10 text-white/50';
    }
    
    // Negative Correlation (Red/Crimson hues)
    if (value < 0) {
      if (value <= -0.50) return 'bg-red-600/70 text-white';
      if (value <= -0.25) return 'bg-red-500/40 text-white/80';
      return 'bg-red-500/15 text-white/50';
    }

    return 'bg-white/5 text-white/20';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            No. 9 - Cross-Asset Correlation Terminal
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Cross-Asset Correlation <span className="text-emerald-400">Stress Matrix</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Analyze shifts in co-movements across energy products, metals, shipping indices, and global equities under critical macro stress test events.
          </p>
        </div>
      </div>

      {/* Macro Stress Selectors */}
      <div className="bg-brand-light/30 border border-white/10 rounded-2xl p-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
          Select Macro Stress Shock Scenario
        </h4>
        <div className="grid md:grid-cols-4 gap-4">
          {MACRO_SHOCKS.map(shock => (
            <button
              key={shock.id}
              onClick={() => {
                setActiveShockId(shock.id);
                // reset select to make sure it exists
              }}
              className={cn(
                "p-4 rounded-xl text-left border transition-all flex flex-col justify-between gap-3 group",
                activeShockId === shock.id
                  ? "bg-emerald-500/10 border-emerald-500/50 text-white"
                  : "bg-white/5 border-white/5 hover:border-white/20 text-white/60"
              )}
            >
              <div>
                <h5 className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-colors",
                  activeShockId === shock.id ? "text-emerald-400" : "text-white/80"
                )}>
                  {shock.name}
                </h5>
                <p className="text-[10px] text-white/40 leading-relaxed mt-2 line-clamp-2">
                  {shock.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-mono text-white/30 pt-2 border-t border-white/5 w-full">
                <span>Energy Vol:</span>
                <span className={cn(
                  "font-bold",
                  shock.energyVolMultiplier > 1.2 ? "text-red-400" : "text-white/60"
                )}>{shock.energyVolMultiplier}x</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Correlation Layout */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Heatmap Grid (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">Correlation Heatmap Matrix</span>
            <div className="flex gap-4 text-[9px] uppercase font-bold tracking-widest text-white/40">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600/80" /> Highly Positive (&gt;0.7)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-red-600/70" /> Highly Negative (&lt;-0.5)
              </span>
            </div>
          </div>

          <div className="bg-brand-light/20 border border-white/5 rounded-2xl p-4 overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-[10px] font-bold text-white/30 uppercase tracking-widest text-left">Asset</th>
                  {ASSETS.map(asset => (
                    <th key={asset.code} className="p-2 text-[10px] font-mono font-bold text-white/40 uppercase">
                      {asset.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ASSETS.map(rowAsset => (
                  <tr key={rowAsset.code} className="border-t border-white/5">
                    <td className="p-2 text-xs font-bold text-white/70 uppercase tracking-wide text-left flex items-center gap-2">
                      <span className="w-1 h-3 rounded-full bg-accent/40" />
                      <div>
                        <span className="font-mono text-[10px] text-white/80 block">{rowAsset.code}</span>
                        <span className="text-[8px] text-white/30 font-sans block truncate max-w-[80px]">{rowAsset.name}</span>
                      </div>
                    </td>
                    {ASSETS.map(colAsset => {
                      const val = liveMatrix[rowAsset.code]?.[colAsset.code] ?? 0;
                      const isSelected = selectedCell.row === rowAsset.code && selectedCell.col === colAsset.code;
                      return (
                        <td key={colAsset.code} className="p-1">
                          <button
                            onMouseEnter={() => setHoveredCell({ row: rowAsset.code, col: colAsset.code })}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => setSelectedCell({ row: rowAsset.code, col: colAsset.code })}
                            className={cn(
                              "w-11 h-11 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center border",
                              getHeatmapColor(val),
                              isSelected 
                                ? "border-yellow-400 scale-105 shadow-md shadow-yellow-400/20 z-10" 
                                : hoveredCell?.row === rowAsset.code || hoveredCell?.col === colAsset.code
                                ? "border-white/20" 
                                : "border-transparent"
                            )}
                          >
                            {val.toFixed(2)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="text-[10px] text-white/20 tracking-wider uppercase font-bold text-center mt-2">
            Click any matrix coefficient cell to load dynamic pairwise regression scattering.
          </span>
        </div>

        {/* Dynamic Scatter Regression Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-brand-light/30 border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-4">
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Selected Pair Regression</span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {selectedCell.row} vs {selectedCell.col}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Coefficient</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {liveMatrix[selectedCell.row]?.[selectedCell.col] ?? '0.00'}
                  </span>
                </div>
              </div>

              <div className="h-60 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={selectedCell.row} 
                      stroke="#888" 
                      fontSize={9}
                      tickLine={false}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={selectedCell.col} 
                      stroke="#888" 
                      fontSize={9}
                      tickLine={false}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter 
                      name="Observed Returns" 
                      data={scatterPlotData} 
                      fill="#10b981" 
                      fillOpacity={0.6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                Expert Analyst Synthesis
              </h5>
              <p className="text-[11px] text-white/60 leading-relaxed">
                The current stress factor changes the pairwise correlation coefficient to <span className="text-emerald-400 font-mono font-bold">{liveMatrix[selectedCell.row]?.[selectedCell.col] ?? '0.00'}</span>. 
                {parseFloat(liveMatrix[selectedCell.row]?.[selectedCell.col]?.toString() || '0') > 0.6 ? 
                  " These assets are showing high direct volatility locking. Portfolio hedges should spread beyond these categories." :
                  parseFloat(liveMatrix[selectedCell.row]?.[selectedCell.col]?.toString() || '0') < -0.2 ?
                  " These assets act as elegant structural hedges under this stress vector. Allocations can mitigate systemic risk spikes." :
                  " Modest directional independence detected. Standard portfolio risk buffers remain resilient under this stress level."
                }
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CrossAssetCorrelationMatrix;
