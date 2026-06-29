import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Factor {
  name: string;
  weight: string;
  score: number;
  desc: string;
}

const OpulenceIndexWidget = () => {
  const [blockedCount, setBlockedCount] = useState(0);
  const [blockedList, setBlockedList] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  // Sync with Choke-Point Simulator via localStorage and custom event listener
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('ai_studio_blocked_chokes');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setBlockedCount(parsed.length);
            setBlockedList(parsed);
            return;
          }
        }
      } catch (e) {
        console.error('Error syncing index with simulator', e);
      }
      setBlockedCount(0);
      setBlockedList([]);
    };

    handleSync();

    // Listen for real-time custom event dispatches from SupplyChainMapTool
    window.addEventListener('ai_studio_chokes_changed', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('ai_studio_chokes_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Dynamic weights and scoring calculation
  const baseIndex = 138.4;
  const deductSuez = blockedList.includes('suez') ? 15.2 : 0;
  const deductPanama = blockedList.includes('panama') ? 12.4 : 0;
  const deductHormuz = blockedList.includes('hormuz') ? 22.8 : 0;
  const deductMalacca = blockedList.includes('malacca') ? 18.6 : 0;
  
  const totalDeduction = deductSuez + deductPanama + deductHormuz + deductMalacca;
  const currentIndex = Math.max(30, parseFloat((baseIndex - totalDeduction).toFixed(1)));

  // Determine market condition state
  let statusColor = "text-emerald-400";
  let statusBg = "bg-emerald-400/10";
  let borderClass = "border-emerald-500/20";
  let conditionLabel = "Robust Expansion";
  let summaryText = "Global industrial demand is highly resilient. Marine transport, basic raw metals flow, and trans-oceanic dry-bulk lines are functioning optimally.";

  if (currentIndex < 80) {
    statusColor = "text-red-400";
    statusBg = "bg-red-400/10";
    borderClass = "border-red-500/20";
    conditionLabel = "Critical Supply Shock";
    summaryText = "Systemic supply-chain gridlocks triggered. Strategic logistics routing is severely impaired. Urgent portfolio hedging and alternative offtake procurement recommended.";
  } else if (currentIndex < 120) {
    statusColor = "text-yellow-400";
    statusBg = "bg-yellow-400/10";
    borderClass = "border-yellow-500/20";
    conditionLabel = "Equilibrium Compression";
    summaryText = "Localized choke point friction detected. Freight rates are elevating. Bulk builders should exercise selective supplier stockpiling and pre-buffer fuel margins.";
  }

  // 5 Real-Time Composite Factors
  const factors: Factor[] = [
    { name: "Freight Dynamics", weight: "25%", score: Math.max(20, Math.round(88 - totalDeduction * 0.4)), desc: "Calculated from BDI bulk carrier spot rates and container logistics metrics." },
    { name: "Energy & Propulsion", weight: "20%", score: Math.max(30, Math.round(92 - (blockedList.includes('hormuz') ? 45 : 0))), desc: "Thermal coal inventory indexes and crude tanker bunkering overheads." },
    { name: "Raw Metals Flow", weight: "20%", score: 85, desc: "Global dry cargo throughput index for iron ore, nickel, and smelting clinkers." },
    { name: "NLP Media Sentiment", weight: "15%", score: Math.max(10, Math.round(79 - totalDeduction * 0.5)), desc: "Dynamic indexing of global financial headlines regarding industrial materials." },
    { name: "Logistics Delay Risk", weight: "20%", score: Math.max(10, Math.round(95 - totalDeduction * 2.0)), desc: "Real-time congestion score across major oceanic canals and straits." },
  ];

  const strokeDashoffset = 339.29 - (339.29 * (currentIndex / 200));

  return (
    <div className="bg-brand-light/10 border-b border-white/5 py-8 px-6 relative overflow-hidden">
      {/* Absolute grid decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.03),transparent_60%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Title and Composite Dial */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-widest mb-3">
            <Activity className="w-3.5 h-3.5" />
            Proprietary Index
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-2">
            The Survvi <span className="text-accent">Opulence Index™</span>
          </h3>
          <p className="text-xs text-white/40 max-w-sm leading-relaxed mb-6">
            Real-time composite metric tracking the comprehensive health of global building materials procurement, freight logistics, and industrial energy corridors.
          </p>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            {showGuide ? "Hide Weight Guide" : "View Weight Guide"}
          </button>
        </div>

        {/* Center Column: स्पीड Dial Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center py-4">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG circular track */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                className="stroke-white/5"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                className={cn("transition-all duration-700", 
                  currentIndex < 80 ? "stroke-red-400" : currentIndex < 120 ? "stroke-yellow-400" : "stroke-accent"
                )}
                strokeWidth="6"
                fill="none"
                strokeDasharray="339.29"
                initial={{ strokeDashoffset: 339.29 }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            
            {/* Core Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.span 
                key={currentIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-extrabold tracking-tight text-white"
              >
                {currentIndex}
              </motion.span>
              <span className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-1">Global Health Index</span>
              <span className={cn("text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5", statusBg, statusColor)}>
                {conditionLabel}
              </span>
            </div>
          </div>
          
          {blockedCount > 0 && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-red-400 tracking-widest mt-2 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{blockedCount} Active Logistics Blockages Affected</span>
            </div>
          )}
        </div>

        {/* Right Column: Key Sub-components or Weight breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">
              Composite Risk Parameters
            </h4>
            
            <div className="space-y-3">
              {factors.map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/60 font-medium">{factor.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-[8px] font-mono">({factor.weight})</span>
                      <span className={cn("font-bold font-mono", 
                        factor.score < 50 ? "text-red-400" : factor.score < 80 ? "text-yellow-400" : "text-accent"
                      )}>
                        {factor.score}/100
                      </span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-700", 
                        factor.score < 50 ? "bg-red-400" : factor.score < 80 ? "bg-yellow-400" : "bg-accent"
                      )}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Slide-out Weights Guide Section */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/5 overflow-hidden"
          >
            <div className="grid md:grid-cols-5 gap-4">
              {factors.map((factor, idx) => (
                <div key={idx} className="p-3.5 bg-brand-light/20 border border-white/5 rounded-xl text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-white tracking-wider">{factor.name}</span>
                    <span className="text-[10px] font-extrabold text-accent">{factor.weight}</span>
                  </div>
                  <p className="text-[9px] text-white/40 leading-relaxed">{factor.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpulenceIndexWidget;
