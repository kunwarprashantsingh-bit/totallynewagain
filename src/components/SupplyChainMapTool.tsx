import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'motion/react';
import { Navigation, AlertTriangle, ShieldCheck, Flame, RefreshCw, Globe, Coins, Hourglass } from 'lucide-react';
import { cn } from '../lib/utils';
import { getSupplyChainNodes } from '../services/api';
import { SupplyChainNode } from '../types';

import GlobalMap from './GlobalMap';
import { TacticalVideoFeed } from './TacticalVideoFeed';

const CHOKE_POINTS = [
  { id: 'suez', name: 'Suez Canal', location: 'Egypt', desc: 'Connects Mediterranean to Red Sea. Key flow for Europe-Asia trade.' },
  { id: 'panama', name: 'Panama Canal', location: 'Panama', desc: 'Freshwater locks affected by regional rainfall. Key for US East-West traffic.' },
  { id: 'hormuz', name: 'Strait of Hormuz', location: 'Middle East', desc: 'Key corridor for petroleum, LNG, and industrial commodities.' },
  { id: 'malacca', name: 'Strait of Malacca', location: 'Southeast Asia', desc: 'Busiest trade route connecting Indian and Pacific Oceans.' },
];

const SupplyChainMapTool = () => {
  const [nodes, setNodes] = useState<SupplyChainNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [blockedChokePoints, setBlockedChokePoints] = useState<string[]>([]);
  const [alternateRoute, setAlternateRoute] = useState<'cape' | 'arctic' | 'rail'>('cape');

  useEffect(() => {
    const fetchNodes = async () => {
      const result = await getSupplyChainNodes();
      setNodes(result);
      setLoading(false);
    };
    fetchNodes();
  }, []);

  // Sync blocked choke points with localStorage and notify other widgets
  useEffect(() => {
    localStorage.setItem('ai_studio_blocked_chokes', JSON.stringify(blockedChokePoints));
    window.dispatchEvent(new CustomEvent('ai_studio_chokes_changed'));
  }, [blockedChokePoints]);

  // Compute simulated node overrides on-the-fly based on active choke point blocks
  const simulatedNodes = useMemo(() => {
    return nodes.map(node => {
      let status = node.status;
      let description = node.description;

      if (blockedChokePoints.includes('suez') && (node.id === 'rot-03' || node.id === 'ant-09')) {
        status = 'critical';
        description = `[SUEZ CANAL BLOCKAGE ACTIVE] Container vessel rerouting via the Cape of Good Hope has increased standard transit times by 12-14 days. Spot dry-bulk cargo rates for European delivery have surged by 42%. Antwerp intake operating under extreme constraints.`;
      }
      if (blockedChokePoints.includes('panama') && (node.id === 'la-04' || node.id === 'hou-05')) {
        status = 'critical';
        description = `[PANAMA CANAL CAPACITY CAP ACTIVE] Draft levels capped at 44ft due to severe localized freshwater drought. Vessel transits limited. Grain and bulk carriers experiencing over 15 days of queue delays. Houston terminals severely backlog-constrained.`;
      }
      if (blockedChokePoints.includes('hormuz') && (node.id === 'dxb-08' || node.id === 'bom-11')) {
        status = 'critical';
        description = node.id === 'bom-11'
          ? `[STRAIT OF HORMUZ BLOCKAGE ACTIVE] Heavy crude feedstocks and petrochemical imports to Mumbai ports delayed. Tanker demurrage charges rising. Freight routing shifted around Arabian Sea.`
          : `[STRAIT OF HORMUZ BLOCKAGE ACTIVE] Complete tanker transit suspension triggered due to regional escalation. Marine insurance war risk premiums spiked 180%. Dubai bunkering and heavy freight terminals operating on extreme localized reserves.`;
      }
      if (blockedChokePoints.includes('malacca') && (node.id === 'sin-02' || node.id === 'sha-01' || node.id === 'kao-10' || node.id === 'tok-06')) {
        status = 'critical';
        description = `[STRAIT OF MALACCA OBSTRUCTED] Maritime collision has choked the main channel. Crude and iron ore bulk vessels bound for Shanghai and Kaohsiung rerouted via Sunda Strait (+4 days). Port of Singapore bunkering queues exceed 12 miles.`;
      }

      return { ...node, status, description };
    });
  }, [nodes, blockedChokePoints]);

  const selectedNode = useMemo(() => {
    return simulatedNodes.find(n => n.id === selectedNodeId) || null;
  }, [simulatedNodes, selectedNodeId]);

  // Compute Systemic Logistics Overrun Surcharges dynamically
  const routingImpactStats = useMemo(() => {
    let totalDivertedVessels = 0;
    let dailyCostSurcharge = 0;
    let averageDelayDays = 0;

    if (blockedChokePoints.includes('suez')) {
      totalDivertedVessels += 312;
      dailyCostSurcharge += 3240000;
      averageDelayDays += 14;
    }
    if (blockedChokePoints.includes('panama')) {
      totalDivertedVessels += 184;
      dailyCostSurcharge += 1950000;
      averageDelayDays += 15;
    }
    if (blockedChokePoints.includes('hormuz')) {
      totalDivertedVessels += 418;
      dailyCostSurcharge += 8150000;
      averageDelayDays += 18;
    }
    if (blockedChokePoints.includes('malacca')) {
      totalDivertedVessels += 520;
      dailyCostSurcharge += 5920000;
      averageDelayDays += 6;
    }

    return {
      diverted: totalDivertedVessels,
      cost: dailyCostSurcharge,
      delay: averageDelayDays === 0 ? 0 : Math.round(averageDelayDays / blockedChokePoints.length)
    };
  }, [blockedChokePoints]);

  const toggleChokePoint = (id: string) => {
    setBlockedChokePoints(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const resetSimulator = () => {
    setBlockedChokePoints([]);
    setSelectedNodeId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full flex flex-col"
    >
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold">Live Supply Chain <span className="text-accent">Resilience Map</span></h3>
          <p className="text-xs text-white/40 mt-1">Real-time global sea-lane traffic monitoring and maritime bottleneck simulation.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Optimal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Congested</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Critical</span>
            </div>
          </div>
          {blockedChokePoints.length > 0 && (
            <button 
              onClick={resetSimulator}
              className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent hover:bg-accent hover:text-brand text-[9px] font-bold uppercase tracking-widest transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Clear Simulation
            </button>
          )}
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid lg:grid-cols-12 gap-8 flex-1">
        {/* Left column: SVG Interactive Map */}
        <div className="lg:col-span-8 bg-brand/40 rounded-3xl border border-white/5 relative overflow-hidden min-h-[400px] flex flex-col">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0">
              <Suspense fallback={<div className="w-full h-full bg-brand/20 animate-pulse" />}>
                <GlobalMap 
                  nodes={simulatedNodes} 
                  selectedNodeId={selectedNodeId || undefined} 
                  onNodeClick={(node) => setSelectedNodeId(node.id)} 
                />
              </Suspense>
            </div>
          )}
        </div>

        {/* Right column: Details and Choke-point toggles */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Section 1: Selected Node Analysis */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex-1 flex flex-col justify-between">
            {selectedNode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedNode.id}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">{selectedNode.name}</h4>
                      <p className="text-[10px] text-white/40 font-mono mt-1">LAT: {selectedNode.lat.toFixed(4)} / LNG: {selectedNode.lng.toFixed(4)}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest",
                      selectedNode.status === 'optimal' ? 'bg-emerald-400/10 text-emerald-400' : 
                      selectedNode.status === 'congested' ? 'bg-yellow-400/10 text-yellow-400' : 
                      'bg-red-400/10 text-red-400'
                    )}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed mb-6">
                    {selectedNode.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <TacticalVideoFeed 
                    lat={selectedNode.lat} 
                    lng={selectedNode.lng} 
                    name={selectedNode.name} 
                    status={selectedNode.status} 
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-white/40">Resilience Index</span>
                      <span className={cn(
                        "font-bold",
                        selectedNode.status === 'optimal' ? 'text-emerald-400' :
                        selectedNode.status === 'congested' ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {selectedNode.status === 'optimal' ? '92/100' : selectedNode.status === 'congested' ? '64/100' : '28/100'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn(
                        "h-full transition-all duration-500",
                        selectedNode.status === 'optimal' ? 'bg-emerald-400 w-[92%]' :
                        selectedNode.status === 'congested' ? 'bg-yellow-400 w-[64%]' : 'bg-red-400 w-[28%]'
                      )} />
                    </div>
                  </div>

                  {/* Interactive Alternate Route Optimization Panel */}
                  <div className="p-3 bg-brand-light/35 border border-white/5 rounded-xl space-y-2.5">
                    <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-accent flex items-center justify-between">
                      <span>Alternate Routing Optimizer</span>
                      <span className="text-white/30 font-mono">SIMULATION LIVE</span>
                    </h5>
                    
                    {selectedNode.status === 'optimal' ? (
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        Routing operates on **optimal primary sea-lanes**. Alternative corridors are on standby to mitigate sudden logistical disruptions.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[8px] uppercase tracking-widest font-mono text-white/40 mb-1">
                          <span>Select Redirection Corridor:</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1 text-[8px]">
                          <button 
                            onClick={() => setAlternateRoute('cape')}
                            className={cn(
                              "p-1.5 rounded-lg flex flex-col justify-between text-left border transition-all",
                              alternateRoute === 'cape' ? "bg-accent/10 border-accent text-accent" : "bg-brand border-white/5 text-white/50"
                            )}
                          >
                            <span className="font-extrabold text-[7px] truncate">Cape Route</span>
                            <span className="mt-1 font-mono text-[6.5px]">+14 Days</span>
                          </button>
                          
                          <button 
                            onClick={() => setAlternateRoute('arctic')}
                            className={cn(
                              "p-1.5 rounded-lg flex flex-col justify-between text-left border transition-all",
                              alternateRoute === 'arctic' ? "bg-accent/10 border-accent text-accent" : "bg-brand border-white/5 text-white/50"
                            )}
                          >
                            <span className="font-extrabold text-[7px] truncate">Arctic NSR</span>
                            <span className="mt-1 font-mono text-[6.5px]">+6 Days</span>
                          </button>

                          <button 
                            onClick={() => setAlternateRoute('rail')}
                            className={cn(
                              "p-1.5 rounded-lg flex flex-col justify-between text-left border transition-all",
                              alternateRoute === 'rail' ? "bg-accent/10 border-accent text-accent" : "bg-brand border-white/5 text-white/50"
                            )}
                          >
                            <span className="font-extrabold text-[7px] truncate">Eurasian Rail</span>
                            <span className="mt-1 font-mono text-[6.5px]">+3 Days</span>
                          </button>
                        </div>

                        <div className="text-[9px] text-white/70 leading-relaxed bg-brand/40 p-2 rounded border border-white/5">
                          {alternateRoute === 'cape' && (
                            <span>🌍 **Good Hope Bypass**: Diverts standard Capesize bulk freight around Africa. Avoids choke points entirely, but adds **$310,000 USD** in fuel overheads per voyage.</span>
                          )}
                          {alternateRoute === 'arctic' && (
                            <span>🧊 **Northeast Passage**: Shorter route, but requires specialized icebreaker escorts, limited drafts, and incurs steep extreme-latitude insurance premiums.</span>
                          )}
                          {alternateRoute === 'rail' && (
                            <span>🚂 **Iron Silk Corridor**: High-speed dry-bulk train cargo. Drastically reduces ETA (+3 days), but limited container volume capacity. Max load 140 TEU.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-white/50 leading-relaxed">
                    {selectedNode.status === 'optimal' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Supply lines are healthy. Offtake and standard bunkering flows are processing within normal limits.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-accent shrink-0 animate-pulse" />
                        <span>Caution: Strategic delay metrics indicate increased bunkering queues. Secure alternative backup cargo transits.</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-white/20 py-12">
                <Navigation className="w-8 h-8 mb-3 opacity-20 animate-pulse" />
                <p className="text-xs font-medium uppercase tracking-wider">Strategic Terminal Detail</p>
                <p className="text-[10px] text-white/40 mt-1 max-w-[220px]">Select a port node on the map to inspect live delay metrics and routing vulnerability.</p>
              </div>
            )}
          </div>

          {/* Section 2: Choke Point Blockage Simulator */}
          <div className="p-5 bg-brand-light/30 border border-white/5 rounded-2xl flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-accent" />
                Maritime Choke-Point Simulator
              </h4>
              <p className="text-[10px] text-white/40 leading-relaxed mt-1">
                Manually trigger trade blockages to observe systemic shipping routing stress and harbor congestions globally.
              </p>
            </div>

            {/* Dynamic Systemic Cost Impact Banner */}
            {blockedChokePoints.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/35 rounded-xl space-y-2 text-[10px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase text-red-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    Systemic Blockage Warning
                  </span>
                  <span className="font-mono font-bold text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">CRITICAL</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/40 uppercase">Diverted</span>
                    <span className="text-white font-extrabold flex items-center justify-center gap-1 mt-0.5">
                      <Globe className="w-2.5 h-2.5 text-accent" />
                      {routingImpactStats.diverted}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/40 uppercase">Daily Surcharge</span>
                    <span className="text-red-400 font-extrabold flex items-center justify-center gap-1 mt-0.5">
                      <Coins className="w-2.5 h-2.5 text-red-400" />
                      ${(routingImpactStats.cost / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/40 uppercase">Avg Delay</span>
                    <span className="text-yellow-400 font-extrabold flex items-center justify-center gap-1 mt-0.5">
                      <Hourglass className="w-2.5 h-2.5 text-yellow-400" />
                      +{routingImpactStats.delay}d
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-2.5">
              {CHOKE_POINTS.map((cp) => {
                const isBlocked = blockedChokePoints.includes(cp.id);
                return (
                  <button
                    key={cp.id}
                    onClick={() => toggleChokePoint(cp.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all",
                      isBlocked
                        ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        : "bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    <div className="pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{cp.name}</span>
                        <span className="text-[7px] text-white/30 uppercase font-mono">({cp.location})</span>
                      </div>
                      <p className="text-[8px] text-white/40 mt-0.5 line-clamp-1">{cp.desc}</p>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-widest shrink-0 transition-all",
                      isBlocked ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white/40"
                    )}>
                      {isBlocked ? 'Blocked' : 'Clear'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(SupplyChainMapTool);
