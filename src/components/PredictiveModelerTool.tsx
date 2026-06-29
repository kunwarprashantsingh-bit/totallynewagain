import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { getPredictiveModel } from '../services/api';
import { PredictiveModelData } from '../types';

const PredictiveModelerTool = () => {
  const [variables, setVariables] = useState({
    oilPrice: 80,
    interestRate: 4.5,
    carbonTax: 50,
    shippingCost: 2500
  });
  const [impacts, setImpacts] = useState<PredictiveModelData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    const result = await getPredictiveModel(variables);
    setImpacts(result);
    setLoading(false);
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid lg:grid-cols-2 gap-12"
    >
      <div className="space-y-8">
        <h3 className="text-2xl font-bold mb-2">Market Variable <span className="text-accent">Simulation</span></h3>
        <p className="text-white/40 text-sm mb-6">Powered by Gemini 3.1 Pro for real-time industrial impact modeling.</p>
        <div className="space-y-6">
          {[
            { id: 'oilPrice', label: 'Oil Price (WTI $)', min: 40, max: 150, unit: '$/bbl' },
            { id: 'interestRate', label: 'Interest Rate (%)', min: 0, max: 15, unit: '%' },
            { id: 'carbonTax', label: 'Carbon Tax ($/ton)', min: 0, max: 200, unit: '$/t' },
            { id: 'shippingCost', label: 'Shipping Cost (BDI)', min: 500, max: 10000, unit: 'points' },
          ].map((v) => (
            <div key={v.id}>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/60">{v.label}</label>
                <span className="text-accent font-bold">{variables[v.id as keyof typeof variables]}{v.unit}</span>
              </div>
              <input 
                type="range" 
                min={v.min} 
                max={v.max} 
                step={v.id === 'interestRate' ? 0.1 : 1}
                value={variables[v.id as keyof typeof variables]}
                onChange={(e) => setVariables(prev => ({ ...prev, [v.id]: parseFloat(e.target.value) }))}
                onMouseUp={handleCalculate}
                className="w-full accent-accent bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
        <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl italic text-sm text-white/60">
          *Adjust the sliders to simulate real-time market shifts. Our AI recalculates the downstream impact on industrial material costs using proprietary 2026 foresight models.
        </div>
      </div>

      <div className="bg-brand/40 rounded-3xl p-8 border border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          Predicted Downstream Impacts
        </h4>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {impacts.map((impact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-accent/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{impact.variable}</span>
                  <span className={cn(
                    "text-lg font-bold",
                    impact.impact > 0 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {impact.impact > 0 ? '+' : ''}{impact.impact}%
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{impact.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PredictiveModelerTool;
