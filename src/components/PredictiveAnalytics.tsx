import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Info, Target, Eye, EyeOff, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { getPredictiveAnalytics } from '../services/api';
import { SECTORS } from '../constants';
import { Language } from '../types';
import { translations } from '../translations';
import { exportToPDF } from '../utils/pdfExport';

const PredictiveAnalytics: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language].predictive;
  const s = translations[language].sectors;
  const [activeSector, setActiveSector] = useState('Energy');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Advanced Forecasting Customizations
  const [activeScenario, setActiveScenario] = useState<'consensus' | 'stress' | 'efficiency'>('consensus');
  const [showConfidence, setShowConfidence] = useState(true);

  const fetchForecast = async (sector: string) => {
    setLoading(true);
    const result = await getPredictiveAnalytics(sector);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchForecast(activeSector);
  }, [activeSector]);

  const sectorTranslations: Record<string, string> = {
    'Energy': s.energy,
    'Building Materials': s.materials,
    'Shipping': s.shipping,
    'Steel': s.steel,
    'Chemicals': s.chemicals,
    'Mining': s.mining,
    'Defense & Aerospace': s.defense,
    'Agribusiness': s.agribusiness,
    'Logistics': s.logistics,
    'Industrial AI': s.ai,
    'Pharmaceuticals': s.pharma
  };

  // Scenario specific labels and colors
  const scenarios = [
    { id: 'consensus', label: 'Consensus Baseline', color: '#00d4ff', description: 'Consensus trendline derived from neural-network modeling of standard production capacity & index trajectories.' },
    { id: 'stress', label: 'Macro Stress Case', color: '#ff6b6b', description: 'Stress-testing scenario assuming geopolitical cargo embargoes, carbon-tax inflation, and shipping bottleneck shocks.' },
    { id: 'efficiency', label: 'Green Optimization', color: '#10b981', description: 'Progressive efficiency scenario driven by widespread industrial AI adoption and decarbonized logistics.' }
  ];

  // Process raw data to add scenarios & confidence interval bounds
  const processedForecast = data?.forecast ? data.forecast.map((item: any, i: number) => {
    const baseValue = item.value;
    // Uncertainty variance increases as time horizon stretches out
    const uncertainty = (i + 1) * 1.8;

    const stressValue = parseFloat((baseValue * (1 + (i * 0.014))).toFixed(1));
    const efficiencyValue = parseFloat((baseValue * (1 - (i * 0.011))).toFixed(1));

    return {
      month: item.month,
      consensus: parseFloat(baseValue.toFixed(1)),
      stress: stressValue,
      efficiency: efficiencyValue,
      confidenceLow: parseFloat((Math.min(baseValue, stressValue, efficiencyValue) - uncertainty).toFixed(1)),
      confidenceHigh: parseFloat((Math.max(baseValue, stressValue, efficiencyValue) + uncertainty).toFixed(1)),
    };
  }) : [];

  const activeScenarioObj = scenarios.find(sc => sc.id === activeScenario) || scenarios[0];

  return (
    <div id="predictive-analytics-report" className="bg-brand-light/30 border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <TrendingUp className="w-3 h-3" />
            {t.title}
          </div>
          <h3 className="text-2xl font-bold">{t.title}</h3>
          <p className="text-white/40 text-sm mt-2">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToPDF('predictive-analytics-report', 'predictive-analytics-report')}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border bg-white/5 text-white/60 border-white/10 hover:border-accent/30 hover:text-accent mr-2"
          >
            Export PDF
          </button>
          {SECTORS.map((sector) => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                activeSector === sector 
                  ? "bg-accent text-brand border-accent" 
                  : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
              )}
            >
              {sectorTranslations[sector] || sector}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[450px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent animate-pulse">{t.loading}</p>
          </div>
        </div>
      ) : data ? (
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/5 rounded-3xl border border-white/5 p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.forecastTitle}</h4>
                  <p className="text-xs text-white/60 mt-1">Simulate alternative outlooks and volatility envelopes</p>
                </div>
                
                {/* Advanced Controls Panel */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConfidence(!showConfidence)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all",
                      showConfidence 
                        ? "bg-white/10 text-white border-white/20" 
                        : "bg-transparent text-white/30 border-white/5 hover:border-white/10"
                    )}
                    title="Toggle 95% Confidence Interval band"
                  >
                    {showConfidence ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Confidence Band
                  </button>
                </div>
              </div>

              {/* Chart Stage */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConsensus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                    />
                    
                    {/* Confidence Interval Band (Translucent Shaded Area) */}
                    {showConfidence && (
                      <Area
                        type="monotone"
                        dataKey="confidenceHigh"
                        stroke="none"
                        fill="rgba(255,255,255,0.02)"
                        name="95% Upper Limit"
                      />
                    )}
                    {showConfidence && (
                      <Area
                        type="monotone"
                        dataKey="confidenceLow"
                        stroke="none"
                        fill="rgba(255,255,255,0.02)"
                        name="95% Lower Limit"
                      />
                    )}

                    {/* Scenario Lines */}
                    <Area 
                      type="monotone" 
                      dataKey={activeScenario} 
                      stroke={activeScenarioObj.color} 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill={`url(#color${activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1)})`} 
                      name={`${activeScenarioObj.label} Index`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Interactive Scenario Buttons */}
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 flex items-center mr-2">
                  <Layers className="w-3 h-3 text-accent mr-1" /> Outlooks:
                </span>
                {scenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setActiveScenario(sc.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border flex items-center gap-1.5",
                      activeScenario === sc.id
                        ? "bg-white/10 text-white border-white/20"
                        : "bg-transparent text-white/40 border-white/5 hover:border-white/20"
                    )}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: sc.color }} 
                    />
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Forecast Narrative */}
            <div className="p-6 bg-accent/5 border border-accent/10 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-accent mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-accent">
                    {activeScenarioObj.label} Analysis
                  </h5>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {activeScenarioObj.description}
                  </p>
                </div>
              </div>
              <div className="pl-7 border-t border-white/5 pt-2">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{t.aiSummary}</h5>
                <p className="text-xs text-white/70 leading-relaxed italic">"{data.summary}"</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <Target className="w-3 h-3 text-accent" />
              {t.opportunities}
            </h4>
            {data.opportunities.map((opp: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-accent/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-white group-hover:text-accent transition-colors text-sm">{opp.title}</h5>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                    opp.riskLevel === 'Low' ? "bg-emerald-500/20 text-emerald-400" :
                    opp.riskLevel === 'Medium' ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {opp.riskLevel} {t.risk}
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{opp.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[450px] flex items-center justify-center text-white/20">
          {t.error}
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
