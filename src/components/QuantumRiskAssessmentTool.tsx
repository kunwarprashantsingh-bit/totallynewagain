import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Key, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const data = [
  { subject: 'RSA-2048', A: 120, B: 110, fullMark: 150 },
  { subject: 'ECC-256', A: 98, B: 130, fullMark: 150 },
  { subject: 'AES-256', A: 86, B: 130, fullMark: 150 },
  { subject: 'SHA-256', A: 99, B: 100, fullMark: 150 },
  { subject: 'Lattice-Based', A: 85, B: 90, fullMark: 150 },
  { subject: 'Hash-Based', A: 65, B: 85, fullMark: 150 },
];

export function QuantumRiskAssessmentTool() {
  const [activeTab, setActiveTab] = useState<'exposure' | 'migration'>('exposure');

  return (
    <div className="w-full h-full bg-brand p-6 rounded-3xl border border-white/5 flex flex-col gap-6 text-white font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Cpu className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight">Quantum Risk Assessment</h3>
            <p className="text-sm text-gray-400">Post-Quantum Cryptography (PQC) Readiness</p>
          </div>
        </div>
        <div className="flex bg-brand-light/50 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('exposure')}
            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", activeTab === 'exposure' ? "bg-accent text-brand shadow-sm" : "text-gray-400 hover:text-white")}
          >
            Exposure Radar
          </button>
          <button
            onClick={() => setActiveTab('migration')}
            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", activeTab === 'migration' ? "bg-accent text-brand shadow-sm" : "text-gray-400 hover:text-white")}
          >
            Migration Matrix
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        {/* Left Side: Chart */}
        <div className="bg-brand-light/20 rounded-2xl border border-white/5 p-4 flex flex-col">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            Algorithm Vulnerability Index
          </h4>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: 'transparent' }} axisLine={false} />
                <Radar name="Current Enterprise Standard" dataKey="A" stroke="#C5A059" fill="#C5A059" fillOpacity={0.3} />
                <Radar name="Q-Day Projected Threat" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Data points */}
        <div className="flex flex-col gap-4">
          <div className="bg-brand-light/20 p-5 rounded-2xl border border-white/5">
            <h4 className="text-sm font-medium text-gray-300 mb-4">Shor's Algorithm Threat Horizon</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-light text-white">4.8 <span className="text-lg text-gray-500">Years</span></div>
                  <div className="text-xs text-red-400 mt-1 uppercase tracking-wider font-bold">Estimated Q-Day</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-medium text-accent">87%</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Asset Exposure</div>
                </div>
              </div>
              <div className="w-full h-2 bg-brand rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-accent to-red-500 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-brand-light/20 p-5 rounded-2xl border border-white/5 flex-1">
            <h4 className="text-sm font-medium text-gray-300 mb-4">NIST Standardized PQC Migration</h4>
            <div className="space-y-3">
              {[
                { label: 'FIPS 203 (CRYSTALS-Kyber)', status: 'In Progress', icon: Key, color: 'text-amber-400' },
                { label: 'FIPS 204 (CRYSTALS-Dilithium)', status: 'Pending', icon: Lock, color: 'text-gray-400' },
                { label: 'FIPS 205 (SPHINCS+)', status: 'Deployed', icon: ShieldCheck, color: 'text-emerald-400' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-brand/50 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <span className="text-sm text-gray-200">{item.label}</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-gray-300">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
