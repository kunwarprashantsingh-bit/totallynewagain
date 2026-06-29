import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { getComplianceRegulations } from '../services/api';
import { ComplianceRegulation } from '../types';

const ComplianceTrackerTool = () => {
  const [region, setRegion] = useState("Western Europe");
  const [regulations, setRegulations] = useState<ComplianceRegulation[]>([]);
  const [loading, setLoading] = useState(true);

  const regions = ["Western Europe", "North America", "China", "Middle East", "Southeast Asia"];

  useEffect(() => {
    const fetchRegs = async () => {
      setLoading(true);
      const result = await getComplianceRegulations(region);
      setRegulations(result);
      setLoading(false);
    };
    fetchRegs();
  }, [region]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">Regulatory & ESG <span className="text-accent">Compliance Tracker</span></h3>
          <p className="text-white/40 text-sm mt-2">Real-time monitoring of global industrial and environmental legislation.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap",
                region === r ? "bg-accent text-brand border-accent" : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />)
        ) : (
          regulations.map((reg, i) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  "px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest",
                  reg.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 
                  reg.status === 'upcoming' ? 'bg-yellow-400/10 text-yellow-400' : 
                  'bg-blue-400/10 text-blue-400'
                )}>
                  {reg.status}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Impact</span>
                  <span className="text-xs font-bold text-accent">{reg.impactScore}</span>
                </div>
              </div>
              <h4 className="text-lg font-bold text-white mb-3 group-hover:text-accent transition-colors">{reg.title}</h4>
              <p className="text-xs text-white/40 leading-relaxed line-clamp-3 mb-6">{reg.description}</p>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${reg.impactScore}%` }} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ComplianceTrackerTool;
