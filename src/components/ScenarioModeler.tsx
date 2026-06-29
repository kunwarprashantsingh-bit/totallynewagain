import React, { useState, useMemo } from 'react';
import { Activity, Zap, Building2, AlertTriangle, Sliders, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Language } from '../types';
import { translations } from '../translations';
import { exportToPDF } from '../utils/pdfExport';

const ScenarioModeler: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language].scenario;
  const [oilPrice, setOilPrice] = useState(78);
  const [steelPrice, setSteelPrice] = useState(845);
  const [geopoliticalRisk, setGeopoliticalRisk] = useState(3);
  const [supplyChainDisruption, setSupplyChainDisruption] = useState(2);

  const baselineData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      month: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i],
      value: 100 + i * 5,
    }));
  }, []);

  const scenarioData = useMemo(() => {
    const oilImpact = (oilPrice - 78) / 78 * 0.2;
    const steelImpact = (steelPrice - 845) / 845 * 0.15;
    const riskImpact = geopoliticalRisk * 0.02;
    const supplyImpact = supplyChainDisruption * 0.03;
    
    const totalImpact = 1 + oilImpact + steelImpact - riskImpact - supplyImpact;

    return baselineData.map(item => ({
      ...item,
      scenario: item.value * totalImpact
    }));
  }, [oilPrice, steelPrice, geopoliticalRisk, supplyChainDisruption, baselineData]);

  const growthForecast = ((scenarioData[5].scenario / scenarioData[0].scenario - 1) * 100).toFixed(1);

  return (
    <div id="scenario-modeler-report" className="bg-brand-light/30 border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Activity className="w-3 h-3" />
            {t.badge}
          </div>
          <h3 className="text-2xl font-bold">{t.title}</h3>
          <p className="text-white/40 text-sm mt-2">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => exportToPDF('scenario-modeler-report', 'scenario-modeler-report')}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border bg-white/5 text-white/60 border-white/10 hover:border-accent/30 hover:text-accent"
          >
            Export PDF
          </button>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[150px]">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{t.growth}</p>
            <p className={`text-2xl font-bold ${Number(growthForecast) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {growthForecast}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="group">
            <div className="flex justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Zap className="w-3 h-3 text-accent" />
                {t.oil} (WTI) - ${oilPrice}
              </label>
              <span className="text-[10px] text-accent font-bold">Base: $78</span>
            </div>
            <input 
              type="range" min="40" max="150" value={oilPrice} 
              onChange={(e) => setOilPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:bg-white/20 transition-all"
            />
          </div>

          <div className="group">
            <div className="flex justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Building2 className="w-3 h-3 text-accent" />
                {t.steel} (HRC) - ${steelPrice}
              </label>
              <span className="text-[10px] text-accent font-bold">Base: $845</span>
            </div>
            <input 
              type="range" min="400" max="1500" value={steelPrice} 
              onChange={(e) => setSteelPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:bg-white/20 transition-all"
            />
          </div>

          <div className="group">
            <div className="flex justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                {t.geoRisk} - {geopoliticalRisk}
              </label>
              <span className="text-[10px] text-accent font-bold">1-10 Scale</span>
            </div>
            <input 
              type="range" min="1" max="10" value={geopoliticalRisk} 
              onChange={(e) => setGeopoliticalRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:bg-white/20 transition-all"
            />
          </div>

          <div className="group">
            <div className="flex justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Sliders className="w-3 h-3 text-accent" />
                {t.supplyChain} - {supplyChainDisruption}
              </label>
              <span className="text-[10px] text-accent font-bold">1-10 Scale</span>
            </div>
            <input 
              type="range" min="1" max="10" value={supplyChainDisruption} 
              onChange={(e) => setSupplyChainDisruption(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:bg-white/20 transition-all"
            />
          </div>
        </div>

        <div className="h-80 bg-white/5 rounded-3xl border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Info className="w-4 h-4 text-white/20" />
          </div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-8">{t.impact} (6-Month)</h4>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scenarioData}>
                <defs>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fillOpacity={1} fill="url(#colorBaseline)" name={t.baseline} />
                <Area type="monotone" dataKey="scenario" stroke="#00d4ff" strokeWidth={3} fillOpacity={1} fill="url(#colorScenario)" name={t.scenario} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-white/20 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.baseline}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-accent rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.scenario}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ScenarioModeler);
