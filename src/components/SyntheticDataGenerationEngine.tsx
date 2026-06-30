import React from 'react';
import { motion } from 'motion/react';
import { Database, Workflow, ShieldCheck, Download, Code2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Feature A', real: 80, synthetic: 78 },
  { name: 'Feature B', real: 45, synthetic: 48 },
  { name: 'Feature C', real: 90, synthetic: 88 },
  { name: 'Feature D', real: 30, synthetic: 32 },
  { name: 'Feature E', real: 60, synthetic: 62 },
];

export function SyntheticDataGenerationEngine() {
  return (
    <div className="w-full h-full bg-brand p-6 rounded-3xl border border-white/5 flex flex-col gap-6 text-white font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Database className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight">Synthetic Data Generation</h3>
            <p className="text-sm text-gray-400">Privacy-preserving quantitative modeling</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-brand rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
          <Download className="w-4 h-4" />
          Export Dataset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Differential Privacy', val: 'ε = 0.01' },
          { label: 'Dataset Similarity', val: '98.4%' },
          { label: 'Records Generated', val: '1.2M' },
          { label: 'K-Anonymity', val: 'k = 5' }
        ].map((s, i) => (
          <div key={i} className="p-4 bg-brand-light/20 rounded-xl border border-white/5">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{s.label}</div>
            <div className="text-xl font-light text-white">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-light/20 p-5 rounded-2xl border border-white/5 flex flex-col">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-400" />
            Statistical Fidelity Validation
          </h4>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#4b5563" fontSize={12} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.1)' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                <Bar dataKey="real" name="Original Dataset" fill="#4b5563" radius={[0, 4, 4, 0]} />
                <Bar dataKey="synthetic" name="Synthetic Output" fill="#818cf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-brand-light/20 p-5 rounded-2xl border border-white/5">
            <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Generation Parameters
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Generative Adversarial Network (GAN) Epochs</span>
                  <span>5,000 / 5,000</span>
                </div>
                <div className="h-1.5 w-full bg-brand rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Marginal Distribution Preservation</span>
                  <span>99.1%</span>
                </div>
                <div className="h-1.5 w-full bg-brand rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[99.1%]"></div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-brand/50 rounded-xl border border-emerald-500/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-emerald-400">GDPR / CCPA Compliant</h5>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Dataset mathematically proven to prevent reverse engineering of PII. Safe for cross-border quantitative analysis and backtesting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
