import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { BenchmarkMetric } from '../types';

const PeerBenchmarkingTool = () => {
  const metrics: BenchmarkMetric[] = [
    { label: 'Energy Intensity', clientValue: 450, globalAverage: 520, unit: 'kWh/t' },
    { label: 'Carbon Footprint', clientValue: 0.85, globalAverage: 1.12, unit: 'tCO2/t' },
    { label: 'Water Usage', clientValue: 2.4, globalAverage: 3.1, unit: 'm3/t' },
    { label: 'Digital Maturity', clientValue: 68, globalAverage: 45, unit: '%' },
    { label: 'Supply Chain Risk', clientValue: 22, globalAverage: 35, unit: 'score' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="grid lg:grid-cols-2 gap-12"
    >
      <div className="space-y-8">
        <h3 className="text-2xl font-bold">Industry Peer <span className="text-accent">Benchmarking</span></h3>
        <p className="text-white/40 text-sm leading-relaxed">
          Compare your operational metrics against global industrial averages. Our benchmarking tool uses anonymized data from 500+ firms to show you exactly where you lead and where you lag.
        </p>
        <div className="space-y-8 mt-12">
          {metrics.map((m, i) => (
            <div key={i}>
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">{m.label}</span>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-accent">You: {m.clientValue}{m.unit}</span>
                  <span className="text-white/20">Global: {m.globalAverage}{m.unit}</span>
                </div>
              </div>
              <div className="relative h-2 bg-white/5 rounded-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.clientValue / Math.max(m.clientValue, m.globalAverage)) * 100}%` }}
                  className="absolute h-full bg-accent rounded-full z-10"
                />
                <div 
                  className="absolute h-full bg-white/20 rounded-full" 
                  style={{ width: `${(m.globalAverage / Math.max(m.clientValue, m.globalAverage)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand/40 rounded-3xl p-8 border border-white/5 flex flex-col justify-center">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/20">
            <TrendingUp className="w-10 h-10 text-accent" />
          </div>
          <h4 className="text-2xl font-bold mb-2">Operational Alpha</h4>
          <p className="text-white/40 text-sm">You are outperforming the global average in <span className="text-emerald-400 font-bold">4 out of 5</span> key metrics.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Efficiency Lead</p>
            <p className="text-2xl font-bold text-emerald-400">+15.4%</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Cost Advantage</p>
            <p className="text-2xl font-bold text-accent">$2.4M</p>
          </div>
        </div>
        <button className="w-full mt-8 py-4 bg-accent text-brand font-bold rounded-xl hover:scale-105 transition-all">
          Generate Full Competitive Audit
        </button>
      </div>
    </motion.div>
  );
};

export default PeerBenchmarkingTool;
