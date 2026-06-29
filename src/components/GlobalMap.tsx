import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Globe, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { geoEquirectangular, geoPath } from 'd3';
import { feature } from 'topojson-client';

interface GlobalMapProps {
  nodes?: any[];
  selectedNodeId?: string;
  onNodeClick?: (node: any) => void;
}

const GlobalMap: React.FC<GlobalMapProps> = ({ nodes, selectedNodeId, onNodeClick }) => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [mapMode, setMapMode] = useState<'satellite' | 'night' | 'tactical'>('satellite');
  const [mapOpacity, setMapOpacity] = useState<number>(0.55);
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showSonar, setShowSonar] = useState(true);

  useEffect(() => {
    let active = true;
    // Load the pre-downloaded offline world atlas TopoJSON served locally from our dev server
    fetch("/world-110m.json")
      .then((res) => {
        if (!res.ok) throw new Error("Local map asset could not be loaded");
        return res.json();
      })
      .then((data) => {
        if (active) {
          const countries = feature(data, data.objects.countries) as any;
          setGeoData(countries);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading local map topojson:", err);
        if (active) {
          setLoadError("Using localized offline fallback projection.");
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const d3Projection = geoEquirectangular()
    .scale(800 / (2 * Math.PI)) // Perfect 2:1 fit for 800x400 viewbox
    .translate([400, 200]);

  const pathGenerator = geoPath().projection(d3Projection);

  const projection = (coords: number[]) => {
    const projected = d3Projection([coords[0], coords[1]]);
    return projected || [0, 0];
  };

  const activeNodeProjectedCoords = React.useMemo(() => {
    if (!selectedNodeId || !nodes) return null;
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return null;
    return projection([node.lng, node.lat]);
  }, [selectedNodeId, nodes, d3Projection]);

  const getLaneStatusStyle = (fromId: string, toId: string) => {
    if (!nodes) return { color: "rgba(255,255,255,0.15)", duration: 5, width: 0.75, glowColor: "rgba(255,255,255,0.3)", dash: "4 10" };
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    
    const fromStatus = fromNode?.status || 'optimal';
    const toStatus = toNode?.status || 'optimal';
    
    if (fromStatus === 'critical' || toStatus === 'critical') {
      return { 
        color: "rgba(239, 68, 68, 0.45)", 
        duration: 1.5, 
        width: 1.5, 
        glowColor: "rgba(239, 68, 68, 0.7)",
        dash: "2 6"
      };
    }
    if (fromStatus === 'congested' || toStatus === 'congested') {
      return { 
        color: "rgba(245, 158, 11, 0.35)", 
        duration: 8, 
        width: 1.1, 
        glowColor: "rgba(245, 158, 11, 0.5)",
        dash: "6 12"
      };
    }
    return { 
      color: "rgba(255,255,255,0.15)", 
      duration: 4.5, 
      width: 0.75, 
      glowColor: "rgba(255,255,255,0.35)",
      dash: "4 10"
    };
  };

  const mapBackgrounds = {
    tactical: {
      filter: "invert(1) brightness(0.65) sepia(0.8) hue-rotate(180deg) saturate(1.8)",
    },
    satellite: {
      filter: "brightness(0.65) contrast(1.1) saturate(0.85)",
    },
    night: {
      filter: "brightness(0.8) contrast(1.25)",
    }
  };
  
  const cities = [
    { name: "New York", coords: [-74.006, 40.7128], color: "#c5a059" }, // luxury gold accent
    { name: "London", coords: [-0.1276, 51.5074], color: "#c5a059" },
    { name: "Mumbai", coords: [72.8777, 19.0760], color: "#c5a059" }, // strategic hub in India
    { name: "Tokyo", coords: [139.6917, 35.6895], color: "#c5a059" },
    { name: "São Paulo", coords: [-46.6333, -23.5505], color: "#c5a059" },
    { name: "Dubai", coords: [55.2708, 25.2048], color: "#c5a059" },
    { name: "Sydney", coords: [151.2093, -33.8688], color: "#c5a059" },
    { name: "Beijing", coords: [116.4074, 39.9042], color: "#c5a059" },
    { name: "San Francisco", coords: [-122.4194, 37.7749], color: "#c5a059" },
  ];

  const connections = [
    { from: "New York", to: "London" },
    { from: "London", to: "Dubai" },
    { from: "Dubai", to: "Mumbai" },
    { from: "Mumbai", to: "Tokyo" },
    { from: "Tokyo", to: "San Francisco" },
    { from: "San Francisco", to: "New York" },
    { from: "New York", to: "São Paulo" },
    { from: "Dubai", to: "Sydney" },
  ];

  const getCityCoords = (name: string) => {
    const city = cities.find(c => c.name === name);
    return city ? city.coords : [0, 0];
  };

  // Dedicated maritime shipping lane connections for physical nodes
  const nodeConnections = [
    { from: "sha-01", to: "la-04" }, // Shanghai -> LA
    { from: "sha-01", to: "sin-02" }, // Shanghai -> Singapore
    { from: "sin-02", to: "bom-11" }, // Singapore -> Mumbai
    { from: "bom-11", to: "dxb-08" }, // Mumbai -> Dubai (Jebel Ali)
    { from: "dxb-08", to: "rot-03" }, // Jebel Ali -> Rotterdam
    { from: "rot-03", to: "ant-09" }, // Rotterdam -> Antwerp
    { from: "la-04", to: "hou-05" }, // LA -> Houston
    { from: "tok-06", to: "sha-01" }, // Tokyo -> Shanghai
    { from: "kao-10", to: "la-04" }, // Kaohsiung -> LA
    { from: "fra-07", to: "rot-03" }, // Frankfurt -> Rotterdam
  ];

  const getNodeCoords = (nodeId: string) => {
    if (!nodes) return [0, 0];
    const node = nodes.find(n => n.id === nodeId);
    return node ? [node.lng, node.lat] : [0, 0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return '#10b981'; // emerald
      case 'congested': return '#f59e0b'; // yellow/amber
      case 'critical': return '#ef4444'; // red
      default: return '#c5a059';
    }
  };

  const isUsingProps = nodes && nodes.length > 0;

  return (
    <div className="relative w-full h-full min-h-[400px] bg-brand-dark/50 rounded-3xl overflow-hidden border border-white/5">
      {/* Real Map Layer Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3 bg-brand-dark/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent mr-1">
          <Layers className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span>Real World Map</span>
        </div>
        
        {/* Toggle Buttons */}
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/5">
          {(['satellite', 'night', 'tactical'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setMapMode(mode);
                if (mode === 'tactical') setMapOpacity(0.15);
                else if (mode === 'satellite') setMapOpacity(0.55);
                else setMapOpacity(0.65);
              }}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all ${
                mapMode === mode 
                  ? 'bg-accent text-brand shadow-md shadow-accent/10' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode === 'tactical' ? 'Vector' : mode === 'satellite' ? 'Physical' : 'Night'}
            </button>
          ))}
        </div>

        {/* Opacity slider */}
        <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-3">
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Dim</span>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.05"
            value={mapOpacity}
            onChange={(e) => setMapOpacity(parseFloat(e.target.value))}
            className="w-16 accent-accent bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Bright</span>
        </div>

        {/* Technical Toggles */}
        <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest transition-all border ${
              showGrid 
                ? 'bg-accent/15 border-accent/40 text-accent font-black' 
                : 'bg-transparent border-white/5 text-white/40 hover:text-white/60 hover:border-white/10'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setShowSonar(!showSonar)}
            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest transition-all border ${
              showSonar 
                ? 'bg-accent/15 border-accent/40 text-accent font-black' 
                : 'bg-transparent border-white/5 text-white/40 hover:text-white/60 hover:border-white/10'
            }`}
          >
            Sonar
          </button>
        </div>
      </div>

      {/* Loading state overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 bg-brand-dark/90 px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Compiling Earth Geography...</span>
          </div>
        </div>
      )}

      {/* Error / Fallback state banner */}
      {loadError && (
        <div className="absolute top-16 left-4 z-20 flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg text-[9px] font-bold text-yellow-500/90 shadow-lg">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
          <span>{loadError}</span>
        </div>
      )}

      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* Ocean Background / Grid */}
        <rect width="800" height="400" fill="transparent" />
        
        {/* Graticule/Grid Lines (Technical navigation mesh) */}
        {showGrid && (
          <>
            <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" fill="none">
              {Array.from({ length: 13 }).map((_, i) => {
                const lon = -180 + i * 30;
                const x = projection([lon, 0])[0];
                return <line key={`lon-${i}`} x1={x} y1="0" x2={x} y2="400" />;
              })}
              {Array.from({ length: 7 }).map((_, i) => {
                const lat = -90 + i * 30;
                const y = projection([0, lat])[1];
                return <line key={`lat-${i}`} x1="0" y1={y} x2="800" y2={y} />;
              })}
            </g>
            {/* Real GIS Degrees Label overlays */}
            <g fill="rgba(255,255,255,0.18)" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
              {Array.from({ length: 7 }).map((_, i) => {
                const lon = -180 + i * 60;
                const x = projection([lon, 0])[0];
                if (x <= 15 || x >= 785) return null;
                return (
                  <text key={`lon-lbl-${i}`} x={x} y="392">
                    {lon === 0 ? "0°" : lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`}
                  </text>
                );
              })}
              {Array.from({ length: 5 }).map((_, i) => {
                const lat = -60 + i * 30;
                const y = projection([0, lat])[1];
                if (y <= 15 || y >= 385) return null;
                return (
                  <text key={`lat-lbl-${i}`} x="8" y={y} dy="2" textAnchor="start">
                    {lat === 0 ? "EQ" : lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`}
                  </text>
                );
              })}
            </g>
          </>
        )}

        {/* Dynamic Country Paths from TopoJSON */}
        <g className="countries-layer transition-opacity duration-500">
          {geoData && geoData.features ? (
            geoData.features.map((featureObj: any, idx: number) => {
              const d = pathGenerator(featureObj);
              if (!d) return null;
              
              // Custom class names for each mode
              let fillClass = "fill-white/[0.03] stroke-white/5 hover:fill-accent/10 hover:stroke-accent/30";
              if (mapMode === 'satellite') {
                fillClass = "fill-[#1e293b]/25 stroke-white/10 hover:fill-accent/5 hover:stroke-accent/20";
              } else if (mapMode === 'night') {
                fillClass = "fill-[#050b15]/90 stroke-white/[0.04] hover:fill-[#c5a059]/5 hover:stroke-[#c5a059]/20";
              } else if (mapMode === 'tactical') {
                fillClass = "fill-transparent stroke-accent/10 hover:fill-accent/5 hover:stroke-accent/40";
              }

              return (
                <path
                  key={`country-${featureObj.id || idx}`}
                  d={d}
                  className={`transition-colors duration-300 ${fillClass}`}
                  style={{
                    opacity: mapOpacity
                  }}
                />
              );
            })
          ) : (
            // Fallback flat outlines if CDN is slow or fails
            <path
              d="M 50 150 Q 150 100 250 150 T 450 150 T 650 150 Z"
              className="fill-white/[0.02] stroke-white/5 stroke-dasharray-[2,4]"
              style={{ opacity: 0.5 }}
            />
          )}
        </g>

        {/* Connections/Arcs */}
        <g className="pointer-events-none">
          {!isUsingProps ? (
            connections.map((conn, idx) => {
              const fromC = getCityCoords(conn.from);
              const toC = getCityCoords(conn.to);
              const [x1, y1] = projection(fromC);
              const [x2, y2] = projection(toC);
              const midX = (x1 + x2) / 2;
              const midY = Math.min(y1, y2) - 40; // Arc upwards

              return (
                <g key={`conn-${idx}`}>
                  <path
                    d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                    fill="none"
                    stroke="#c5a059"
                    strokeWidth="1"
                    className="opacity-10"
                  />
                  <motion.path
                    d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                    fill="none"
                    stroke="#c5a059"
                    strokeWidth="1.5"
                    strokeDasharray="4 8"
                    className="opacity-40"
                    animate={{ strokeDashoffset: [-20, 20] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </g>
              );
            })
          ) : (
            nodeConnections.map((conn, idx) => {
              const fromC = getNodeCoords(conn.from);
              const toC = getNodeCoords(conn.to);
              if ((fromC[0] === 0 && fromC[1] === 0) || (toC[0] === 0 && toC[1] === 0)) return null;
              
              const [x1, y1] = projection(fromC);
              const [x2, y2] = projection(toC);
              const midX = (x1 + x2) / 2;
              const midY = Math.min(y1, y2) - 30; // gentler arc for trade lanes

              // Highlight if selected
              const isSelectedLane = selectedNodeId && (selectedNodeId === conn.from || selectedNodeId === conn.to);
              const laneStyle = getLaneStatusStyle(conn.from, conn.to);

              return (
                <g key={`node-conn-${idx}`}>
                  <path
                    d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                    fill="none"
                    stroke={isSelectedLane ? "#c5a059" : laneStyle.color}
                    strokeWidth={isSelectedLane ? 1.75 : laneStyle.width}
                    className="transition-all duration-300"
                  />
                  <motion.path
                    d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                    fill="none"
                    stroke={isSelectedLane ? "#c5a059" : laneStyle.glowColor}
                    strokeWidth={isSelectedLane ? 2.5 : laneStyle.width + 0.5}
                    strokeDasharray={laneStyle.dash}
                    animate={{ strokeDashoffset: [-35, 35] }}
                    transition={{
                      duration: isSelectedLane ? 2.2 : laneStyle.duration,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </g>
              );
            })
          )}
        </g>

        {/* Active Strategic Hubs / Supply Chain Terminals */}
        <g>
          {!isUsingProps ? (
            cities.map((city, i) => {
              const [x, y] = projection(city.coords) || [0, 0];
              return (
                <g key={`city-${i}`} onMouseEnter={() => setHoveredCity(city.name)} onMouseLeave={() => setHoveredCity(null)} className="cursor-pointer">
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill={city.color}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <circle cx={x} cy={y} r={3} fill={city.color} className="stroke-brand stroke-2" />
                </g>
              );
            })
          ) : (
            nodes.map((node, i) => {
              const [x, y] = projection([node.lng, node.lat]) || [0, 0];
              const isSelected = selectedNodeId === node.id;
              const color = getStatusColor(node.status);
              
              return (
                <g 
                  key={`node-${node.id}`} 
                  onClick={() => onNodeClick && onNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node)} 
                  onMouseLeave={() => setHoveredNode(null)} 
                  className="cursor-pointer group"
                >
                  {/* Ping effect based on severity */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 10 : 7}
                    fill={color}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ 
                      scale: node.status === 'critical' ? [1, 2.5, 1] : [1, 1.8, 1], 
                      opacity: node.status === 'critical' ? [0.6, 0.1, 0.6] : [0.4, 0.1, 0.4] 
                    }}
                    transition={{ 
                      duration: node.status === 'critical' ? 1.5 : 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                  {/* Outer ring */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? 6 : 4.5} 
                    fill={color} 
                    className="stroke-brand stroke-[1.5]" 
                  />
                  {/* Inner dot */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? 2.5 : 1.5} 
                    fill="#ffffff" 
                  />
                </g>
              );
            })
          )}
        </g>

        {/* Radiating Sonar Pulse around active node */}
        {showSonar && activeNodeProjectedCoords && (
          <g className="pointer-events-none">
            {Array.from({ length: 3 }).map((_, idx) => {
              const node = nodes?.find(n => n.id === selectedNodeId);
              const color = node ? getStatusColor(node.status) : '#c5a059';
              return (
                <motion.circle
                  key={`sonar-pulse-${idx}`}
                  cx={activeNodeProjectedCoords[0]}
                  cy={activeNodeProjectedCoords[1]}
                  r={10}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.75"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: [1, 4.5 + idx * 2], opacity: [0.8, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: idx * 0.8,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </g>
        )}

        {/* Compass Rose (Vector aesthetic widget) */}
        <g transform="translate(745, 305)" className="pointer-events-none opacity-45">
          <circle r="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" />
          <circle r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2 4" />
          
          <motion.circle 
            r="18" 
            fill="none" 
            stroke="#c5a059" 
            strokeWidth="1" 
            strokeDasharray="4 20" 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />

          <path d="M 0 -13 L 3 0 L 0 3 L -3 0 Z" fill="rgba(197, 160, 89, 0.7)" />
          <path d="M 0 13 L 3 0 L 0 3 L -3 0 Z" fill="rgba(255,255,255,0.25)" />
          
          <text y="-21" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="5" fontFamily="monospace" fontWeight="bold">N</text>
          <text y="25" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="5" fontFamily="monospace">S</text>
          <text x="21" dy="1.5" textAnchor="start" fill="rgba(255,255,255,0.2)" fontSize="5" fontFamily="monospace">E</text>
          <text x="-21" dy="1.5" textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="5" fontFamily="monospace">W</text>
        </g>

        {/* Map Scale Indicator */}
        <g transform="translate(635, 375)" className="pointer-events-none opacity-45">
          <line x1="0" y1="0" x2="80" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="40" y1="-2" x2="40" y2="2" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
          <line x1="80" y1="-3" x2="80" y2="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="40" y="-6" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6" fontFamily="monospace">5,000 NM</text>
        </g>
      </svg>
      
      <AnimatePresence>
        {hoveredCity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 right-4 px-4 py-2 bg-brand/90 backdrop-blur-md border border-accent/20 rounded-xl shadow-2xl z-10"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">{hoveredCity}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <img src="/logo.svg" alt="Survvi Opulence Insights" className="h-3 w-auto object-contain opacity-40" />
              <p className="text-[10px] text-white/40">Strategic Hub</p>
            </div>
          </motion.div>
        )}

        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 right-4 px-4 py-3 bg-brand/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-10 w-64 pointer-events-none"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white line-clamp-1">{hoveredNode.name}</span>
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded" style={{
                backgroundColor: `${getStatusColor(hoveredNode.status)}20`,
                color: getStatusColor(hoveredNode.status)
              }}>
                {hoveredNode.status}
              </span>
            </div>
            <p className="text-[10px] text-white/50 mt-1.5 leading-relaxed line-clamp-2">
              {hoveredNode.description}
            </p>
            <div className="flex items-center justify-between text-[8px] font-bold uppercase text-accent/80 tracking-widest mt-2 border-t border-white/5 pt-1.5">
              <span>LAT: {hoveredNode.lat.toFixed(2)}</span>
              <span>LNG: {hoveredNode.lng.toFixed(2)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-brand/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
            {isUsingProps ? "Live Logistics Nodes" : "Active Projects"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3 h-3 text-white/20" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
            {isUsingProps ? "Global Sea Lanes" : "Global Network"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalMap;
