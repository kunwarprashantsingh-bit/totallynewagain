import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Satellite, Ship, Sprout, AlertTriangle, 
  Eye, BarChart3, Radio, Database, MapPin, 
  TrendingUp, TrendingDown, Activity, Bookmark
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ComposedChart, Line, Bar
} from 'recharts';
import { cn } from '../lib/utils';

// Simulated Alternative Data Feeds
const ALT_DATA_FEEDS = [
  {
    id: 'cushing-oil',
    name: 'Cushing Oil Storage',
    category: 'Energy',
    methodology: 'SAR Satellite Floating Roof Shadow Analysis',
    signal: 'Bullish',
    confidence: 94,
    discrepancy: '-12.5%',
    description: 'Synthetic Aperture Radar (SAR) imagery of floating roof oil tanks at Cushing, OK indicates inventory drawdowns are significantly outpacing official EIA reports, suggesting unpriced physical market tightness.',
    icon: Satellite,
    chartData: Array.from({ length: 30 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      official: 35.2 - (i * 0.1) + (Math.sin(i) * 0.5),
      satellite: 35.0 - (i * 0.15) + (Math.sin(i) * 0.6) - (i > 15 ? 1.5 : 0),
    }))
  },
  {
    id: 'shanghai-port',
    name: 'Global Port Congestion Index',
    category: 'Supply Chain',
    methodology: 'AIS Transponder & Maritime IoT Tracking',
    signal: 'Bearish (Macro)',
    confidence: 88,
    discrepancy: '+22.4%',
    description: 'Maritime AIS vessel tracking reveals a 22% spike in average anchorage wait times outside major Chinese ports, contradicting localized PMI optimism and pointing to impending supply chain bottlenecks.',
    icon: Ship,
    chartData: Array.from({ length: 30 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      historicalAvg: 48,
      currentWait: 45 + (i * 0.8) + (Math.random() * 5),
    }))
  },
  {
    id: 'brazil-soybeans',
    name: 'Mato Grosso Crop Health',
    category: 'Agriculture',
    methodology: 'Multispectral NDVI (Normalized Difference Vegetation Index)',
    signal: 'Neutral/Watch',
    confidence: 91,
    discrepancy: '-4.2%',
    description: 'Infrared satellite reflectance data across Brazilian soybean producing regions shows early signs of moisture stress. NDVI deviation from the 10-year mean is currently -4.2%, placing slight upward pressure on CBOT futures.',
    icon: Sprout,
    chartData: Array.from({ length: 30 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      baselineNDVI: 0.75 + (Math.sin(i / 5) * 0.05),
      currentNDVI: 0.75 + (Math.sin(i / 5) * 0.05) - (i > 10 ? (i - 10) * 0.005 : 0),
    }))
  }
];

const AltDataMonitorTool: React.FC = () => {
  const [activeFeedId, setActiveFeedId] = useState<string>('cushing-oil');
  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `altdata-${activeFeedId}`;
        setIsSaved(parsed.some((i: any) => i.id === savedId));
      } else {
        setIsSaved(false);
      }
    } catch (e) {
      setIsSaved(false);
    }
  };

  useEffect(() => {
    checkIfSaved();
  }, [activeFeedId]);

  const activeFeed = useMemo(() => {
    return ALT_DATA_FEEDS.find(f => f.id === activeFeedId) || ALT_DATA_FEEDS[0];
  }, [activeFeedId]);

  const handleSaveWorkspace = () => {
    const savedId = `altdata-${activeFeedId}`;
    const feed = activeFeed;
    
    const item = {
      id: savedId,
      title: `Alternative Satellite Intel: ${feed.name}`,
      summary: `Proprietary physical-world telemetry monitoring of ${feed.name} (${feed.category}). Signal: ${feed.signal} with discrepancy of ${feed.discrepancy} vs official data.`,
      fullContent: `=========================================================
SURVVI CLIENT INTELLIGENCE: ALTERNATIVE DATA INSIGHT REPORT
=========================================================
Dataset Name: ${feed.name}
Sector Category: ${feed.category}
Methodology: ${feed.methodology}

REAL-TIME OBSERVATIONAL METRICS:
- Signal Directionality Bias: ${feed.signal}
- Predictive Confidence Coefficient: ${feed.confidence}/100
- Deviation / Discrepancy Margin vs. Official Consensus: ${feed.discrepancy}

SUMMARY OF OBSERVATION:
${feed.description}

RECOMMENDED ACTION & INTERPRETATION:
${feed.signal.includes('Bullish') 
  ? `CRITICAL INVENTORY DRAWDOWN: Synthetic Aperture Radar (SAR) indicates that stockpiles are depleting far faster than official data suggest. Buy-side spot exposure should be front-loaded ahead of public consensus corrections.` 
  : feed.signal.includes('Bearish')
  ? `MACRO SUPPLY CHAIN CHOKE: AIS transponder densities indicate severe localized delays. Expect downstream production drag. We recommend initiating strategic hedging on secondary substitute sourcing partners to preserve margin resilience.`
  : `The vegetation and crop-health reflection spectra remain highly stable. Sourcing flows are executing normally within standard operational boundaries. Maintain neutral-to-watch market strategies.`}
=========================================================
Archived on ${new Date().toLocaleString()} | Survvi Sovereign Analytics Suite`,
    };

    const event = new CustomEvent('ai_studio_add_workspace', {
      detail: { item, type: 'research' }
    });
    window.dispatchEvent(event);
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Tool Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-3">
            <Radio className="w-3.5 h-3.5" />
            No. 5 - Alternative Data
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Alternative Data & <span className="text-accent">Satellite Intelligence</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Access proprietary signal generation derived from raw, unstructured physical-world data including satellite imagery, IoT sensors, and maritime tracking, providing edge over traditional financial reporting.
          </p>
        </div>

        {/* Feed Switcher and Save to Workspace */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {ALT_DATA_FEEDS.map(feed => {
              const Icon = feed.icon;
              return (
                <button
                  key={feed.id}
                  onClick={() => setActiveFeedId(feed.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                    activeFeedId === feed.id
                      ? "bg-accent text-brand border-accent font-extrabold"
                      : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {feed.category}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSaveWorkspace}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all border",
              isSaved 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-brand"
            )}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {isSaved ? "Saved to Workspace" : "Save to Workspace"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Metadata & Signal */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            {/* Background Map Decoration */}
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] pointer-events-none">
              <GlobeWireframe />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-accent/10 rounded-xl border border-accent/20 text-accent">
                <activeFeed.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold">{activeFeed.name}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-widest mt-1">
                  <Eye className="w-3 h-3" /> {activeFeed.methodology}
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Signal Bias</div>
                  <div className={cn(
                    "text-lg font-bold flex items-center gap-2",
                    activeFeed.signal.includes('Bullish') ? "text-emerald-400" :
                    activeFeed.signal.includes('Bearish') ? "text-red-400" : "text-amber-400"
                  )}>
                    {activeFeed.signal.includes('Bullish') && <TrendingUp className="w-4 h-4" />}
                    {activeFeed.signal.includes('Bearish') && <TrendingDown className="w-4 h-4" />}
                    {activeFeed.signal.includes('Neutral') && <Activity className="w-4 h-4" />}
                    {activeFeed.signal}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Confidence Score</div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-accent" />
                    {activeFeed.confidence}/100
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] uppercase tracking-widest text-white/40">Vs. Official Consensus</div>
                  <div className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {activeFeed.discrepancy}
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {activeFeed.description}
                </p>
              </div>

              <button className="w-full py-3 rounded-xl bg-accent text-brand font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" /> Load Raw Dataset
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Charts */}
        <div className="lg:col-span-8">
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Real-Time Data Discrepancy Observation</h4>
                <p className="text-[10px] text-white/40 mt-1">Comparing high-frequency alternative signals against lagged official benchmark reporting.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Feed Active
              </div>
            </div>

            <div className="flex-1 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeedId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {activeFeedId === 'cushing-oil' ? (
                      <ComposedChart data={activeFeed.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c5a059" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#c5a059" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                          labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                        <Line type="monotone" dataKey="official" name="EIA Official (Mbbls)" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Area type="monotone" dataKey="satellite" name="SAR Estimated (Mbbls)" stroke="#c5a059" strokeWidth={3} fillOpacity={1} fill="url(#colorSat)" />
                      </ComposedChart>
                    ) : activeFeedId === 'shanghai-port' ? (
                      <ComposedChart data={activeFeed.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={[30, 80]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                        <Line type="stepAfter" dataKey="historicalAvg" name="5-Yr Historical Avg (Hours)" stroke="#4b5563" strokeWidth={2} dot={false} />
                        <Bar dataKey="currentWait" name="Current Wait Time (Hours)" fill="#c5a059" radius={[4, 4, 0, 0]} barSize={12} />
                      </ComposedChart>
                    ) : (
                      <ComposedChart data={activeFeed.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={[0.65, 0.85]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                        <Line type="monotone" dataKey="baselineNDVI" name="10-Yr Mean NDVI" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="currentNDVI" name="Current Reflectance NDVI" stroke="#c5a059" strokeWidth={3} dot={false} />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Cautionary Text */}
            <div className="mt-4 flex items-start gap-2 bg-white/5 border border-white/10 p-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/50 leading-relaxed">
                <strong>Raw Sensor Artifacts:</strong> Alternative data feeds are subject to sensor occlusion (e.g., cloud cover disrupting optical satellites) and algorithmic interpretation latency. Always triangulate alt-data signals with foundational fundamental models before deploying capital.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Abstract wireframe background
const GlobeWireframe = () => (
  <svg width="240" height="240" viewBox="0 0 240 240" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white">
    <circle cx="120" cy="120" r="100" />
    <ellipse cx="120" cy="120" rx="100" ry="40" />
    <ellipse cx="120" cy="120" rx="40" ry="100" />
    <line x1="20" y1="120" x2="220" y2="120" />
    <line x1="120" y1="20" x2="120" y2="220" />
    <path d="M 49.2893 49.2893 C 88.3418 10.2369 151.658 10.2369 190.711 49.2893 C 229.763 88.3418 229.763 151.658 190.711 190.711 C 151.658 229.763 88.3418 229.763 49.2893 190.711 C 10.2369 151.658 10.2369 88.3418 49.2893 49.2893 Z" />
  </svg>
);

export default AltDataMonitorTool;
