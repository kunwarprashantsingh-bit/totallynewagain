import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Globe, Activity, AlertTriangle, Zap, Ship, 
  MapPin, Clock, ArrowUpRight, TrendingDown, RefreshCw, Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ThreatIncident {
  id: string;
  title: string;
  location: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Maritime' | 'Geopolitical' | 'Cyber' | 'Energy Grid';
  impactPercent: number; // calculated impact on supply chain friction
  description: string;
  status: 'Active' | 'Resolving' | 'Monitored';
  timestamp: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

const INITIAL_INCIDENTS: ThreatIncident[] = [
  {
    id: 'TR-102',
    title: 'Suez Canal Convoy Delay Surge',
    location: 'Bab-el-Mandeb Strait',
    severity: 'Critical',
    category: 'Maritime',
    impactPercent: 82,
    description: 'Rerouting transit queue climbs to 34 bulk carriers due to high-risk marine advisory warnings. Spot freight rates rising +18% on Asia-EU legs.',
    status: 'Active',
    timestamp: 'Just Now',
    trend: 'increasing',
  },
  {
    id: 'TR-103',
    title: 'Rotterdam Port Terminal Congestion',
    location: 'Rotterdam, Netherlands',
    severity: 'High',
    category: 'Maritime',
    impactPercent: 64,
    description: 'Labor constraints coupled with unexpected digital port management upgrade delays lead to average truck wait times increasing by 4.2 hours.',
    status: 'Active',
    timestamp: '14m ago',
    trend: 'increasing',
  },
  {
    id: 'TR-104',
    title: 'Red Sea Cyber Intrusion Alert',
    location: 'Djibouti Cable Landing Station',
    severity: 'High',
    category: 'Cyber',
    impactPercent: 55,
    description: 'Telemetry signals minor localized routing disruption in regional maritime carrier systems. Backup satellite feeds initiated.',
    status: 'Monitored',
    timestamp: '42m ago',
    trend: 'stable',
  },
  {
    id: 'TR-105',
    title: 'Rhine River Water Levels Critical Drop',
    location: 'Kaub Bottleneck, Germany',
    severity: 'Medium',
    category: 'Geopolitical',
    impactPercent: 41,
    description: 'Draft clearance levels drop below 80cm, forcing chemical barge operators to run vessels at 35% cargo carrying capacities.',
    status: 'Active',
    timestamp: '2h ago',
    trend: 'increasing',
  },
  {
    id: 'TR-106',
    title: 'Gulf Coast LNG Export Interruption',
    location: 'Sabine Pass, Texas',
    severity: 'Low',
    category: 'Energy Grid',
    impactPercent: 19,
    description: 'Minor turbine compressor maintenance slows loading operations on 2 ultra-large LNG carriers. Normal cycles estimated in 36 hours.',
    status: 'Resolving',
    timestamp: '5h ago',
    trend: 'decreasing',
  }
];

const GlobalThreatAlertFeed: React.FC = () => {
  const [incidents, setIncidents] = useState<ThreatIncident[]>(INITIAL_INCIDENTS);
  const [filter, setFilter] = useState<'All' | 'Critical/High' | 'Maritime' | 'Energy Grid'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate supply chain friction index based on incidents weight
  const frictionIndex = Math.min(100, Math.round(
    incidents.reduce((acc, curr) => {
      let multiplier = 1;
      if (curr.severity === 'Critical') multiplier = 1.5;
      if (curr.severity === 'High') multiplier = 1.2;
      if (curr.severity === 'Medium') multiplier = 0.8;
      if (curr.severity === 'Low') multiplier = 0.4;
      return acc + (curr.impactPercent * multiplier);
    }, 0) / 4.8
  ));

  const simulateNewIncident = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const places = ['Strait of Malacca', 'Panama Canal Gatun Lake', 'Shanghai Outer Anchorages', 'Port of Long Beach', 'Singapore Fueling Terminal'];
      const categories: ('Maritime' | 'Geopolitical' | 'Cyber' | 'Energy Grid')[] = ['Maritime', 'Geopolitical', 'Cyber', 'Energy Grid'];
      const severities: ('Critical' | 'High' | 'Medium' | 'Low')[] = ['Critical', 'High', 'Medium', 'Low'];
      const titles = [
        'Malacca Strait Navy Escort Protocol Active',
        'Panama Canal Daily Transit Bookings Slashed',
        'Shanghai Terminal Heavy Fog Queueing',
        'Long Beach Port Automated Crane Glitch',
        'Singapore Bunker Fuel Marine Surcharge Spike'
      ];
      
      const randomIndex = Math.floor(Math.random() * titles.length);
      const randomSeverity = severities[Math.floor(Math.random() * 3)]; // limit new ones to Critical/High/Medium
      
      const newThreat: ThreatIncident = {
        id: `TR-${Math.floor(Math.random() * 900) + 200}`,
        title: titles[randomIndex],
        location: places[randomIndex],
        severity: randomSeverity,
        category: categories[randomIndex % categories.length],
        impactPercent: Math.floor(Math.random() * 50) + 40,
        description: 'Automated satellite signal feeds confirm anomalous shipping queues. Local freight forwarders reporting immediate price inquiries.',
        status: 'Active',
        timestamp: 'Just Now',
        trend: Math.random() > 0.5 ? 'increasing' : 'stable'
      };

      setIncidents(prev => [newThreat, ...prev.slice(0, 5)]);
      setIsRefreshing(false);
    }, 800);
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'All') return true;
    if (filter === 'Critical/High') return inc.severity === 'Critical' || inc.severity === 'High';
    if (filter === 'Maritime') return inc.category === 'Maritime';
    if (filter === 'Energy Grid') return inc.category === 'Energy Grid';
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            No. 8 - Global Security & Supply Chain Terminal
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Global Threat Alerts & <span className="text-yellow-400">Incident Ticker</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Real-time telemetry and risk assessment of high-probability maritime, cyber, and physical supply chain threats.
          </p>
        </div>

        <button 
          onClick={simulateNewIncident}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-[0.98] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-all text-white/80"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          Fetch Live Telemetry
        </button>
      </div>

      {/* Main Panel Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Metric Card Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-brand-light/30 border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Globe className="w-40 h-40" />
            </div>
            <div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-1">Global Friction Rating</span>
              <h4 className="text-6xl font-bold tracking-tight text-white mb-2">{frictionIndex}<span className="text-sm text-yellow-400 font-mono">/100</span></h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Aggregated maritime delay, corridor closures, and digital disruptions index.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className={cn(
                "w-2 h-2 rounded-full animate-ping",
                frictionIndex > 70 ? "bg-red-500" : frictionIndex > 40 ? "bg-yellow-500" : "bg-emerald-500"
              )} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">
                {frictionIndex > 70 ? "Critical Bottlenecks Detected" : frictionIndex > 40 ? "Elevated Supply Chain Friction" : "Corridors Operating Normally"}
              </span>
            </div>
          </div>

          <div className="bg-brand-light/20 border border-white/5 rounded-2xl p-6">
            <h5 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              Intelligence Vectors
            </h5>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Active Sat Telemetry Points</span>
                <span className="text-white font-mono font-bold">14,204</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Suez/Panama Transit Rate</span>
                <span className="text-white font-mono font-bold text-red-400">-12.4% MoM</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Friction Trend (7D)</span>
                <span className="text-yellow-400 font-mono font-bold">Upward Accelerating</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-white/40">Foresight Matrix Ver.</span>
                <span className="text-white font-mono font-bold">4.82 (Live)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Incidents Live Feed Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Critical/High', 'Maritime', 'Energy Grid'] as const).map((btn) => (
              <button
                key={btn}
                onClick={() => setFilter(btn)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                  filter === btn
                    ? "bg-yellow-500 border-yellow-500 text-brand font-bold"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                )}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div className="space-y-3 overflow-y-auto max-h-[420px] pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {filteredIncidents.map((inc) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl p-5 transition-all flex flex-col gap-3 relative group"
                >
                  {/* Category Border Decor */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
                    inc.severity === 'Critical' ? 'bg-red-500' :
                    inc.severity === 'High' ? 'bg-orange-500' :
                    inc.severity === 'Medium' ? 'bg-yellow-500' : 'bg-blue-400'
                  )} />

                  {/* Card Title Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 pl-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold text-white/30">{inc.id}</span>
                      <h4 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">
                        {inc.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                        inc.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        inc.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        inc.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      )}>
                        {inc.severity}
                      </span>
                    </div>
                  </div>

                  {/* Body description */}
                  <p className="text-white/60 text-xs leading-relaxed pl-2">
                    {inc.description}
                  </p>

                  {/* Meta / details footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-white/30 uppercase tracking-wider pl-2 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-white/40" />
                        <span className="text-white/60">{inc.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/40" />
                        <span>{inc.timestamp}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="text-white/20">Friction Impact:</span>
                        <span className="text-white font-mono font-bold">{inc.impactPercent}%</span>
                      </span>
                      <span className={cn(
                        "flex items-center gap-0.5",
                        inc.trend === 'increasing' ? "text-red-400" : inc.trend === 'decreasing' ? "text-emerald-400" : "text-white/40"
                      )}>
                        {inc.trend === 'increasing' ? <ArrowUpRight className="w-3 h-3" /> : inc.trend === 'decreasing' ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                        <span>{inc.trend}</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GlobalThreatAlertFeed;
