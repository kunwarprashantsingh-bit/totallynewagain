import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, Check, X, Activity, ArrowUpRight, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as ReLineChart, Line, Legend } from 'recharts';
import { cn } from '../lib/utils';
import { getSentimentAnalysis } from '../services/api';
import { SentimentData, Language } from '../types';
import { COMMODITIES } from '../constants';
import { translations } from '../translations';

const CHART_COLORS = [
  '#C5A059', // Accent Gold
  '#34d399', // Emerald
  '#f87171', // Red
  '#60a5fa', // Blue
  '#a78bfa', // Purple
  '#fbbf24', // Amber
  '#f472b6', // Pink
  '#2dd4bf', // Teal
];

const SentimentDashboardTool: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language].sentiment;
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>(COMMODITIES.slice(0, 5));
  const [dateRange, setDateRange] = useState<string>('7d');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [commoditySearch, setCommoditySearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ALL_COMMODITIES = [...COMMODITIES];
  const DATE_OPTIONS = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: 'Last Qtr', value: 'Last Quarter' },
    { label: 'YTD', value: 'Year-to-Date' },
    { label: 'Custom', value: 'custom' },
  ];

  const filteredCommodities = ALL_COMMODITIES.filter(c => 
    c.toLowerCase().includes(commoditySearch.toLowerCase())
  );

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true);
      const range = dateRange === 'custom' 
        ? `from ${customDates.start} to ${customDates.end}` 
        : dateRange;
      const result = await getSentimentAnalysis(selectedCommodities, range);
      setData(result);
      setLoading(false);
    };
    if (dateRange !== 'custom' || (customDates.start && customDates.end)) {
      fetchSentiment();
    }
  }, [selectedCommodities, dateRange, customDates]);

  const maxAbsSentiment = useMemo(() => {
    if (data.length === 0) return 1;
    const absScores = data.map(d => Math.abs(d.sentiment));
    return Math.max(...absScores, 0.1);
  }, [data]);

  const getSentimentBg = (score: number) => {
    const intensity = Math.abs(score) / maxAbsSentiment;
    const alpha = 0.1 + (intensity * 0.4);
    if (score > 0) return `rgba(52, 211, 153, ${alpha})`;
    return `rgba(248, 113, 113, ${alpha})`;
  };

  const toggleCommodity = (commodity: string) => {
    setSelectedCommodities(prev => 
      prev.includes(commodity) 
        ? prev.filter(c => c !== commodity) 
        : [...prev, commodity]
    );
  };

  const latestData = useMemo(() => {
    const latest: Record<string, SentimentData> = {};
    data.forEach(item => {
      if (!latest[item.commodity] || new Date(item.date) > new Date(latest[item.commodity].date)) {
        latest[item.commodity] = item;
      }
    });
    return Object.values(latest);
  }, [data]);

  const chartData = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    data.forEach(item => {
      if (!grouped[item.commodity]) grouped[item.commodity] = [];
      grouped[item.commodity].push({
        date: new Date(item.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' }),
        sentiment: item.sentiment,
      });
    });
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return grouped;
  }, [data, language]);

  const multiLineChartData = useMemo(() => {
    const dateMap: Record<string, any> = {};
    data.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { 
          dateKey,
          displayDate: new Date(item.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })
        };
      }
      dateMap[dateKey][item.commodity] = item.sentiment;
    });
    return Object.values(dateMap).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [data, language]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Survvi Opulence Insights" className="h-10 w-auto object-contain opacity-80" />
          <div className="h-10 w-px bg-white/10 mx-2" />
          <div>
            <h3 className="text-2xl font-bold">{t.title}</h3>
            <p className="text-sm text-white/40 mt-1">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {DATE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDateRange(opt.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    dateRange === opt.value ? "bg-accent text-brand" : "text-white/40 hover:text-white/60"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            
            <AnimatePresence>
              {dateRange === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <input
                    type="date"
                    value={customDates.start}
                    onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent/50"
                  />
                  <span className="text-[10px] text-white/40">{t.filters.start}</span>
                  <input
                    type="date"
                    value={customDates.end}
                    onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-sm shadow-[0_0_10px_rgba(248,113,113,0.4)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Bearish</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Select Commodities</span>
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedCommodities(ALL_COMMODITIES)}
                className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline transition-all"
              >
                Select All
              </button>
              <button 
                onClick={() => setSelectedCommodities([])}
                className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white/70 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span className="truncate">
                  {selectedCommodities.length === 0 
                    ? "Select commodities..." 
                    : `${selectedCommodities.length} selected`}
                </span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-64 overflow-hidden flex flex-col"
                >
                  <div className="p-3 border-bottom border-white/5">
                    <input
                      type="text"
                      placeholder="Search commodities..."
                      value={commoditySearch}
                      onChange={(e) => setCommoditySearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50"
                      autoFocus
                    />
                  </div>
                  <div className="flex-grow overflow-y-auto p-2 space-y-1">
                    {filteredCommodities.map(commodity => (
                      <button
                        key={commodity}
                        onClick={() => toggleCommodity(commodity)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all",
                          selectedCommodities.includes(commodity) 
                            ? "bg-accent/10 text-accent" 
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span>{commodity}</span>
                        {selectedCommodities.includes(commodity) && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                    {filteredCommodities.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-text/20 italic">
                        No commodities found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text/40 block">Active Selections</span>
          <div className="flex flex-wrap gap-2">
            {selectedCommodities.map(commodity => (
              <button
                key={commodity}
                onClick={() => toggleCommodity(commodity)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl text-xs text-accent hover:bg-accent/20 transition-all"
              >
                {commodity}
                <X className="w-3 h-3 text-accent/40 group-hover:text-accent transition-colors" />
              </button>
            ))}
            {selectedCommodities.length === 0 && (
              <span className="text-xs text-text/20 italic py-1.5">No commodities selected</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 bg-brand-light/5 border border-white/10 rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-accent/10 transition-colors" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h4 className="text-xl font-bold">Sentiment Trend Analysis</h4>
            <p className="text-xs text-white/40 mt-1">Comparative sentiment tracking across selected commodities</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live Pulse</span>
          </div>
        </div>
        
        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={multiLineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                domain={[-1, 1]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{value}</span>}
              />
              {selectedCommodities.map((commodity, index) => (
                <Line 
                  key={commodity}
                  type="monotone" 
                  dataKey={commodity} 
                  stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, stroke: '#1a1a1a' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              ))}
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: selectedCommodities.length || 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-brand-light/20 rounded-2xl animate-pulse border border-white/10" />
          ))
        ) : (
          latestData.map((item, i) => (
            <motion.div
              key={item.commodity}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{ backgroundColor: getSentimentBg(item.sentiment) }}
              className="h-32 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-4 group cursor-pointer hover:border-white/30 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1 z-10">{item.commodity}</span>
              <div className="flex items-center gap-2 z-10">
                <span className={cn(
                  "text-2xl font-bold",
                  item.sentiment > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {item.sentiment > 0 ? '+' : ''}{Math.round(item.sentiment * 100)}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  item.trend === 'up' ? "text-emerald-400" : item.trend === 'down' ? "text-red-400" : "text-gray-400"
                )}>
                  {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '-'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-brand-light/20 rounded-3xl animate-pulse border border-white/10" />
          ))
        ) : (
          latestData.map((item, i) => (
            <motion.div
              key={item.commodity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 bg-brand-light/10 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    item.sentiment > 0 ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                  )} />
                  <h4 className="text-xl font-bold text-white">{item.commodity}</h4>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                  item.sentiment > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  {item.sentiment > 0 ? 'Bullish' : 'Bearish'}
                </div>
              </div>

              <div className="h-32 w-full mb-6 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData[item.commodity]}>
                    <defs>
                      <linearGradient id={`color-${item.commodity}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={item.sentiment > 0 ? "#34d399" : "#f87171"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={item.sentiment > 0 ? "#34d399" : "#f87171"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sentiment" 
                      stroke={item.sentiment > 0 ? "#34d399" : "#f87171"} 
                      fillOpacity={1} 
                      fill={`url(#color-${item.commodity})`} 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mb-6 relative z-10">
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Latest Intensity</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold",
                      item.sentiment > 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {Math.abs(Math.round(item.sentiment * 100))}%
                    </span>
                    <span className={cn(
                      "text-sm font-bold",
                      item.trend === 'up' ? "text-emerald-400" : item.trend === 'down' ? "text-red-400" : "text-gray-400"
                    )}>
                      {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '-'}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.abs(item.sentiment * 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={cn(
                      "h-full rounded-full",
                      item.sentiment > 0 ? "bg-emerald-400" : "bg-red-400"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 relative z-10 flex-grow">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Market Keywords</span>
                <div className="flex flex-wrap gap-2">
                  {item.topKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Trend</span>
                  <div className="flex items-center gap-1">
                    {item.trend === 'up' ? (
                      <>
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Improving</span>
                      </>
                    ) : item.trend === 'down' ? (
                      <>
                        <ArrowRight className="w-3 h-3 text-red-400 rotate-45" />
                        <span className="text-[10px] font-bold text-red-400 uppercase">Declining</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-white/40 uppercase">Stable</span>
                    )}
                  </div>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors">
                  View Analysis
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(SentimentDashboardTool);
