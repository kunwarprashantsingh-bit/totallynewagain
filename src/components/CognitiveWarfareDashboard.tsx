import React from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Radio, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const timelineData = [
  { time: '08:00', deepfakes: 120, sentiment: 45, narrative: 'Neutral' },
  { time: '10:00', deepfakes: 450, sentiment: 30, narrative: 'Doubt' },
  { time: '12:00', deepfakes: 1200, sentiment: -15, narrative: 'Panic' },
  { time: '14:00', deepfakes: 300, sentiment: 10, narrative: 'Recovery' },
  { time: '16:00', deepfakes: 150, sentiment: 35, narrative: 'Stabilized' },
];

export function CognitiveWarfareDashboard() {
  return (
    <div className="w-full h-full bg-brand p-6 rounded-3xl border border-white/5 flex flex-col gap-6 text-white font-sans">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <BrainCircuit className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-medium tracking-tight">Cognitive Warfare & Synthetic Media</h3>
          <p className="text-sm text-gray-400">Real-time narrative engineering and deepfake detection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Disinformation Campaigns', value: '14', alert: true },
          { label: 'Synthetic Media Detections', value: '842', trend: '+12% /hr' },
          { label: 'Narrative Velocity Score', value: '9.4', sub: 'High risk' }
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-brand-light/20 rounded-2xl border border-white/5 relative overflow-hidden">
            {stat.alert && (
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-red-500/10"
              />
            )}
            <div className="relative z-10">
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="flex items-end gap-2">
                <span className={cn("text-3xl font-light", stat.alert ? "text-red-400" : "text-white")}>{stat.value}</span>
                {(stat.trend || stat.sub) && (
                  <span className="text-sm text-gray-500 mb-1">{stat.trend || stat.sub}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[300px]">
        <div className="flex-1 bg-brand-light/20 rounded-2xl border border-white/5 p-4 flex flex-col">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-accent" />
            Social Narrative & Media Integrity Index
          </h4>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={12} tickLine={false} />
                <YAxis yAxisId="left" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Bar yAxisId="left" dataKey="deepfakes" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" radius={[4, 4, 0, 0]} name="Deepfake Media Detected" />
                <Line yAxisId="right" type="monotone" dataKey="sentiment" stroke="#C5A059" strokeWidth={2} dot={{ r: 4, fill: '#111315', stroke: '#C5A059' }} name="Market Sentiment Index" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="flex-1 bg-brand-light/20 rounded-2xl border border-white/5 p-4">
             <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-400" />
              Threat Vectors
            </h4>
            <div className="space-y-3">
              {[
                { title: 'CEO Audio Clone', target: 'M&A Deal Rumor', confidence: '99.8%', severity: 'High' },
                { title: 'Synthetic Protest Video', target: 'Supply Chain Hub', confidence: '94.2%', severity: 'Medium' },
                { title: 'Bot Swarm Injection', target: 'Earnings Report', confidence: '88.5%', severity: 'Critical' }
              ].map((threat, i) => (
                <div key={i} className="p-3 bg-brand/50 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-200">{threat.title}</span>
                    <ShieldAlert className={cn("w-4 h-4", threat.severity === 'Critical' ? "text-red-500" : "text-amber-500")} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Target: {threat.target}</span>
                    <span>AI Confidence: {threat.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
