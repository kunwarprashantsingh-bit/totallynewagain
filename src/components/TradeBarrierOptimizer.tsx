import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, Scale, AlertTriangle, Bookmark, HelpCircle, Activity, Play, Pause, RefreshCw, BarChart3, TrendingUp, DollarSign, Globe, Percent
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { cn } from '../lib/utils';

interface MaterialCBAM {
  id: string;
  name: string;
  category: string;
  baseEmissions: number; // tons CO2 per ton of material
  recycledCap: number; // maximum recycled/scrap offset %
}

const CBAM_MATERIALS: MaterialCBAM[] = [
  { id: 'steel', name: 'Blast Furnace Structural Steel', category: 'Metals', baseEmissions: 1.85, recycledCap: 80 },
  { id: 'cement', name: 'Portland Building Cement', category: 'Materials', baseEmissions: 0.82, recycledCap: 30 },
  { id: 'aluminum', name: 'Smelted Aluminum Ingots', category: 'Metals', baseEmissions: 11.40, recycledCap: 90 },
  { id: 'fertilizer', name: 'Nitric Acid & Urea Fertilizers', category: 'Chemicals', baseEmissions: 2.10, recycledCap: 15 }
];

const TradeBarrierOptimizer: React.FC = () => {
  const [selectedMaterialId, setSelectedMaterialId] = useState('steel');
  const [carbonPrice, setCarbonPrice] = useState<number>(95); // USD per ton of CO2 (e.g. EU ETS)
  const [scrapRatio, setScrapRatio] = useState<number>(20); // Recycled scrap content %
  const [shippingVolume, setShippingVolume] = useState<number>(45000); // Metric tons imported annually
  const [isSaved, setIsSaved] = useState(false);

  // Check if item is saved
  const checkIfSaved = () => {
    try {
      const saved = localStorage.getItem('ai_studio_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedId = `cbam-${selectedMaterialId}-${carbonPrice}-${scrapRatio}-${shippingVolume}`;
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
  }, [selectedMaterialId, carbonPrice, scrapRatio, shippingVolume]);

  const material = useMemo(() => {
    return CBAM_MATERIALS.find(m => m.id === selectedMaterialId) || CBAM_MATERIALS[0];
  }, [selectedMaterialId]);

  // Dynamically calculate actual CBAM liabilities based on parameters
  const metrics = useMemo(() => {
    // Emissions offset based on scrap/recycled inputs (capped per material capability)
    const effectiveScrap = Math.min(material.recycledCap, scrapRatio);
    const adjustedEmissionsFactor = material.baseEmissions * (1.0 - (effectiveScrap / 100));
    
    const totalEmissionsTons = adjustedEmissionsFactor * shippingVolume;
    const baseLiability = totalEmissionsTons * carbonPrice;
    
    // Regional CBAM adjustments
    const regionalLiabilities = [
      { region: 'European Union (CBAM)', rate: 1.0, liability: baseLiability, compliance: 'Critical watch / High risk' },
      { region: 'United States (CCA)', rate: 0.72, liability: baseLiability * 0.72, compliance: 'Moderate / Legislation pending' },
      { region: 'China (ETS Integration)', rate: 0.28, liability: baseLiability * 0.28, compliance: 'Low / Domestic offsets allowed' },
      { region: 'United Kingdom (UK-CBAM)', rate: 0.95, liability: baseLiability * 0.95, compliance: 'Critical watch' }
    ];

    return {
      adjustedEmissionsFactor,
      totalEmissionsTons,
      baseLiability,
      regionalLiabilities
    };
  }, [material, carbonPrice, scrapRatio, shippingVolume]);

  const handleSaveWorkspace = () => {
    const savedId = `cbam-${selectedMaterialId}-${carbonPrice}-${scrapRatio}-${shippingVolume}`;
    
    const item = {
      id: savedId,
      title: `Carbon Tariff (CBAM) Optimizer: ${material.name}`,
      summary: `Trade compliance and carbon border tax modeling. Carbon Price: $${carbonPrice}/ton. Total compliance exposure for ${shippingVolume.toLocaleString()} tons is $${(metrics.baseLiability / 1000000).toFixed(1)}M.`,
      fullContent: `=========================================================
SURVVI CLIENT PORTAL: CARBON TARIFF (CBAM) EXPOSURE REPORT
=========================================================
Target Cargo: ${material.name} (${material.category})
Annual Cargo Volume: ${shippingVolume.toLocaleString()} Metric Tons
Engineered Parameter: ${scrapRatio}% scrap recycled content injection

TARRIF & ETS SIMULATION METRICS:
- Base Environmental Emissions Factor: ${material.baseEmissions} t CO2/t
- Post-Engineering Emissions Factor: ${metrics.adjustedEmissionsFactor.toFixed(2)} t CO2/t
- Global Carbon Valuation mechanism: $${carbonPrice} / Ton CO2
- Cumulative CO2 Footprint: ${Math.round(metrics.totalEmissionsTons).toLocaleString()} Tons

REGIONAL LIABILITIES:
${metrics.regionalLiabilities.map(r => `- ${r.region}: $${(r.liability).toLocaleString()} | Risk Status: ${r.compliance}`).join('\n')}

COMPLIANCE DIRECTIVE:
As Carbon Border Adjustment Mechanisms (CBAM) transition into physical tariff enforcement, high-emission material flows face substantial margin pressure. Implementing a ${scrapRatio}% circular steel/scrap injection mitigates carbon exposure, resulting in savings of $${((material.baseEmissions - metrics.adjustedEmissionsFactor) * shippingVolume * carbonPrice).toLocaleString()} annually.
=========================================================
Archived on ${new Date().toLocaleString()} | Survvi Sovereign Analytics Suite`,
    };

    const event = new CustomEvent('ai_studio_add_workspace', {
      detail: { item, type: 'research' }
    });
    window.dispatchEvent(event);
    setIsSaved(true);
  };

  const chartData = useMemo(() => {
    return metrics.regionalLiabilities.map(r => ({
      region: r.region.split(' ')[0],
      liabilityMillions: parseFloat((r.liability / 1000000).toFixed(2))
    }));
  }, [metrics]);

  return (
    <div className="flex flex-col gap-8">
      {/* Tool Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-3">
            <Scale className="w-3.5 h-3.5" />
            No. 13 - Carbon Border Tariff Compliance
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            CBAM & <span className="text-accent">Border Tariff Compliance Optimizer</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Analyze Carbon Border Adjustment Mechanism (CBAM) tariff liabilities, carbon offsets, and scrap circularity factors on global commodity supply transits.
          </p>
        </div>

        {/* Material Switcher and Save */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {CBAM_MATERIALS.map(mat => (
              <button
                key={mat.id}
                onClick={() => setSelectedMaterialId(mat.id)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border",
                  selectedMaterialId === mat.id
                    ? "bg-accent text-brand border-accent font-extrabold"
                    : "bg-white/5 text-white/50 border-white/5 hover:border-white/20"
                )}
              >
                {mat.name.split(' ')[0]}
              </button>
            ))}
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
            {isSaved ? "Saved to Workspace" : "Save CBAM Analysis"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Parameters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand/30 border border-white/5 rounded-3xl p-6 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent border-b border-white/5 pb-2">Material Compliance Console</h4>

            {/* Material Specific Profile */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Material Emission Profile</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white font-bold">{material.name}</span>
                <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  {material.baseEmissions} t CO2/t
                </span>
              </div>
            </div>

            {/* Global Carbon Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Global Carbon Price Index (EU ETS)</span>
                <span className="font-mono text-accent font-bold">${carbonPrice}/ton CO2</span>
              </div>
              <input 
                type="range"
                min="40"
                max="180"
                step="5"
                value={carbonPrice}
                onChange={(e) => setCarbonPrice(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                <span>$40</span>
                <span>$110</span>
                <span>$180 (Extreme Penalty)</span>
              </div>
            </div>

            {/* Scrap Injection Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Scrap/Recycled Content Injection</span>
                <span className="font-mono text-emerald-400 font-bold">{scrapRatio}% Scrap</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                step="5"
                value={scrapRatio}
                onChange={(e) => setScrapRatio(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                <span>0% (Virgin Ore)</span>
                <span>Capped at {material.recycledCap}%</span>
                <span>100% (Full Circular)</span>
              </div>
            </div>

            {/* Shipping Volume Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Annual Sourcing Volume</span>
                <span className="font-mono text-white font-bold">{shippingVolume.toLocaleString()} Tons</span>
              </div>
              <input 
                type="range"
                min="5000"
                max="150000"
                step="5000"
                value={shippingVolume}
                onChange={(e) => setShippingVolume(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                <span>5k Tons</span>
                <span>75k Tons</span>
                <span>150k Tons</span>
              </div>
            </div>

            {/* Total Annual Compliance Exposure */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">EU Carbon Tax Liability</div>
                <div className="text-xs text-white/40 mt-1">Direct regulatory barrier liability</div>
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">${(metrics.baseLiability / 1000000).toFixed(2)}M</div>
            </div>
          </div>
        </div>

        {/* Right column: Results & Bar Chart */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Regional Tariff Exposure & Compliance Status</h4>
            
            <div className="space-y-3.5">
              {metrics.regionalLiabilities.map((reg, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/20 text-accent">
                      <Globe className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white leading-none">{reg.region}</h5>
                      <p className="text-[10px] text-white/40 mt-1.5 font-medium tracking-wide uppercase">{reg.compliance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-400 font-mono">${(reg.liability / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart comparing regional exposures */}
          <div className="bg-brand/20 border border-white/5 rounded-3xl p-6 flex-1 flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Regional Carbon Tariff Exposure ($ Millions)</h4>
            
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                  />
                  <Bar dataKey="liabilityMillions" name="Border Liability ($M)" fill="#c5a059" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeBarrierOptimizer;
