/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Zap, 
  Building2, 
  Cpu, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock, 
  MapPin,
  Search,
  ChevronDown,
  Activity,
  Database,
  Target,
  ArrowRight,
  Sun,
  Moon,
  Camera,
  Bookmark,
  X,
  Newspaper,
  FileText,
  Globe,
  Sparkles,
  Bot,
  Mic,
  Send,
  MessageSquare,
  Play,
  Layers,
  BarChart3,
  Compass,
  Users,
  ShieldAlert,
  ChevronRight,
  Navigation,
  Sliders,
  Download
} from 'lucide-react';
import { ai } from './services/geminiService';
import { 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { db, auth } from './firebase';
import { getDocFromServer, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  getUserLocation, 
  getLiveMarketData,
  MOCK_MARKET_DATA,
  getNewsletterNews,
  generateResearchPDFContent,
  getResearchReports,
  getRealTimeNews,
  getMarketInsights,
  getDailySummary,
  getAssetBriefing
} from './services/api';
import { METHODOLOGIES, SECTORS, REGIONS, NEWS_TOPICS } from './constants';
import { MarketInsightTool } from './components/MarketInsightTool';
import { 
  MarketData, 
  UserLocation, 
  ResearchReport, 
  NewsArticle,
  Language
} from './types';
import { translations } from './translations';

const GEOPOLITICAL_BULLETINS = [
  {
    topic: 'Maritime Security',
    threat: 'critical',
    title: 'Red Sea shipping lane drone activity escalates',
    commodity: 'Crude Oil / Dry Freight',
    action: 'Divert Panamax bulk freight around Horn of Africa immediately. Re-route safety reserves.',
    impact: 'Adds +12 days of transit to European hubs, spiking freight premiums by 22%.'
  },
  {
    topic: 'Carbon Trade Policy',
    threat: 'moderate',
    title: 'EU CBAM Phase-2 carbon import tariffs declared',
    commodity: 'Steel / Aluminum / Cement',
    action: 'Initiate compliance scope audits for external blast-furnace imports. Transition to electric-arc kiln certified suppliers.',
    impact: 'Estimated 8-15% import surcharge on non-certified carbon intensive raw metals.'
  },
  {
    topic: 'Rare Earth Metals',
    threat: 'optimal',
    title: 'Northern Sweden lithium deposit grade survey complete',
    commodity: 'Lithium Carbonate',
    action: 'Lock in long-term supply agreements with Scandinavian mining consortiums.',
    impact: 'Secures sovereign continental EU sourcing, reducing reliance on East Asian supply chains by 35%.'
  },
  {
    topic: 'Drought Recovery',
    threat: 'low',
    title: 'Panama Canal drafts holding steady at 45.2ft',
    commodity: 'Agricultural Bulk / Grain',
    action: 'Utilize standard Panama lane options for US Gulf-to-Asia routes; cancel overland rail trans-shipments.',
    impact: 'Restores Panamax draft capability to 95% of historic baselines.'
  }
];


// Translations moved to translations.ts


const MacroStrategyPage = React.lazy(() => import('./components/MacroStrategyPage'));
const PredictiveAnalytics = React.lazy(() => import('./components/PredictiveAnalytics'));
const ScenarioModeler = React.lazy(() => import('./components/ScenarioModeler'));
const AIConsultant = React.lazy(() => import('./components/AIConsultant'));
import GlobalMap from './components/GlobalMap';
const GlobalTicker = React.lazy(() => import('./components/GlobalTicker'));
const BDIChart = React.lazy(() => import('./components/BDIChart'));
import OpulenceIndexWidget from './components/OpulenceIndexWidget';
import AIDispatchCompiler from './components/AIDispatchCompiler';
const NewsletterSubscription = React.lazy(() => import('./components/NewsletterSubscription'));
const ClientIntelligenceSuite = React.lazy(() => import('./components/ClientIntelligenceSuite'));
const ClientPortal = React.lazy(() => import('./components/ClientPortal'));
const ContactForm = React.lazy(() => import('./components/ContactForm'));
import { MethodologyModal, FeatureCard } from './components/MethodologyComponents';
const PrimeAlerts = React.lazy(() => import('./components/PrimeAlerts').then(module => ({ default: module.PrimeAlerts })));

const ToolSkeleton = () => (
  <div className="w-full h-96 bg-brand-light/20 rounded-3xl animate-pulse flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest text-white/20">Securing Live Data Stream...</span>
    </div>
  </div>
);

const Navbar = ({ onMacroClick, language, setLanguage, darkMode, setDarkMode, workspaceCount, onWorkspaceClick, isPremium, onUpgradeClick }: { 
  onMacroClick: () => void, 
  language: Language, 
  setLanguage: (l: Language) => void,
  darkMode: boolean,
  setDarkMode: (d: boolean) => void,
  workspaceCount: number,
  onWorkspaceClick: () => void,
  isPremium: boolean,
  onUpgradeClick: () => void
}) => {
  const [scrolled, setScrolled] = useState(false);
  const t = translations[language].nav;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6",
      scrolled ? "bg-brand/95 backdrop-blur-xl border-b border-white/10 py-2" : "bg-transparent py-4"
    )}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-4 cursor-pointer min-w-[220px]" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 border-2 border-accent rounded-lg flex items-center justify-center font-serif text-accent font-bold text-xl bg-brand/50 shrink-0 shadow-[0_0_20px_rgba(197,160,89,0.15)] hover:shadow-[0_0_25px_rgba(197,160,89,0.3)] transition-shadow duration-300">
              S
            </div>
            <div className="h-8 w-px bg-white/10 mx-1" />
            <div className="relative h-12 flex items-center">
              <img 
                src="/logo.svg" 
                alt="Survvi Opulence Logo" 
                className="h-full w-auto object-contain filter drop-shadow-[0_0_8px_rgba(197,160,89,0.2)]"
              />
            </div>
          </div>

          {/* Center: Branding & Slogan */}
          <div className="flex flex-col items-center justify-center text-center flex-1">
            <h1 className="text-sm md:text-lg font-bold tracking-[0.4em] text-accent uppercase leading-none">
              Survvi Opulence Insights
            </h1>
            <span className="text-[6px] md:text-[8px] uppercase tracking-[0.6em] text-text/30 font-medium mt-2">
              {t.slogan}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 min-w-[150px] justify-end">
            {isPremium ? (
              <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-accent/20 border border-accent/40 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-accent shadow-[0_0_15px_rgba(197,160,89,0.15)]">
                <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                <span>SOVEREIGN ELITE</span>
              </div>
            ) : (
              <button 
                onClick={onUpgradeClick}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-accent to-amber-500 hover:from-amber-500 hover:to-accent text-brand px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(197,160,89,0.25)] hover:scale-105"
              >
                <Zap className="w-3 h-3 animate-bounce" />
                <span>UPGRADE</span>
              </button>
            )}

            <button
              onClick={onWorkspaceClick}
              className="relative p-1.5 rounded-full bg-surface/50 border border-text/10 text-text hover:bg-accent hover:text-brand transition-all"
              aria-label="Workspace"
              title="Strategic Workspace"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {workspaceCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent text-brand rounded-full flex items-center justify-center text-[7px] border border-brand font-black">
                  {workspaceCount}
                </span>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-full bg-surface/50 border border-text/10 text-text hover:bg-accent hover:text-brand transition-all"
              aria-label="Take screenshot"
              title="Screenshot"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            
            <div className="flex bg-surface/50 p-0.5 rounded-full border border-text/10">
              {(['en', 'zh'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "w-6 h-6 rounded-full text-[8px] font-bold uppercase transition-all",
                    language === l ? "bg-accent text-brand" : "text-text/40 hover:text-text/60"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <a href="#client-portal" className="hidden sm:block bg-text text-brand px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-accent transition-all">
              Portal
            </a>
          </div>
        </div>

        {/* Nav Links - Row 2 (Collapses on scroll) */}
        <div className={cn(
          "flex items-center justify-center transition-all duration-500 overflow-hidden",
          scrolled ? "h-0 opacity-0 mt-0" : "h-12 opacity-100 mt-5"
        )}>
          <div className="flex items-center justify-start md:justify-center gap-2.5 bg-brand-light/40 border border-white/10 px-4 py-1.5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-x-auto max-w-full no-scrollbar whitespace-nowrap">
            <a 
              href="#story" 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] text-white hover:text-accent bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 transition-all shadow-sm shrink-0"
            >
              <Users className="w-3.5 h-3.5 text-accent" />
              <span>{t.story}</span>
            </a>
            <a 
              href="#solutions" 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] text-white hover:text-accent bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 transition-all shadow-sm shrink-0"
            >
              <Layers className="w-3.5 h-3.5 text-accent" />
              <span>{t.methodology}</span>
            </a>
            <a 
              href="#news" 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] text-white hover:text-accent bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 transition-all shadow-sm shrink-0"
            >
              <Newspaper className="w-3.5 h-3.5 text-accent" />
              <span>{t.news}</span>
            </a>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-accent/40 mx-1 shrink-0" />
            <a 
              href="#research" 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] text-white hover:text-accent bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 transition-all shadow-sm shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span>{t.research}</span>
            </a>
            <button 
              onClick={onMacroClick} 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] text-white hover:text-accent bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 transition-all shadow-sm shrink-0"
            >
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              <span>{t.macro}</span>
            </button>
            <a 
              href="#map" 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] text-white hover:text-accent bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 transition-all shadow-sm shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span>{t.global}</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

const IndustryHeatmap = ({ data, loading }: { data: MarketData[], loading?: boolean }) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 py-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-brand-light/20 p-6 rounded-3xl animate-pulse h-32 border border-white/5" />
        ))}
      </div>
    );
  }
  const getSectorColor = (score: number) => {
    if (score >= 90) return "bg-emerald-600";
    if (score >= 70) return "bg-emerald-400";
    if (score >= 50) return "bg-amber-500";
    if (score >= 30) return "bg-red-400";
    return "bg-red-600";
  };

  const sectors = React.useMemo(() => {
    const categoryMap = new Map<string, { totalChange: number, count: number }>();
    data.forEach(d => {
      if (!categoryMap.has(d.category)) {
        categoryMap.set(d.category, { totalChange: 0, count: 0 });
      }
      const current = categoryMap.get(d.category)!;
      current.totalChange += d.changePercent;
      current.count += 1;
    });

    return Array.from(categoryMap.entries()).map(([name, { totalChange, count }]) => {
      const avgChange = totalChange / count;
      // Map avgChange (e.g., -5% to +5%) to a 0-100 score
      const score = Math.max(0, Math.min(100, Math.round((avgChange + 5) * 10)));
      return {
        name,
        score,
        trend: avgChange > 0.5 ? "up" : avgChange < -0.5 ? "down" : "stable",
        color: getSectorColor(score)
      };
    }).slice(0, 10); // Limit to 10 for layout
  }, [data]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {sectors.map((sector, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-6 bg-surface border border-text/10 rounded-2xl hover:border-text/20 transition-all group relative overflow-hidden"
        >
          <div className={cn("absolute top-0 left-0 w-1 h-full opacity-40", sector.color)} />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text/40">{sector.name}</span>
            {sector.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : sector.trend === 'down' ? <ArrowDownRight className="w-3 h-3 text-red-400" /> : <ArrowRight className="w-3 h-3 text-text/20" />}
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{sector.score}</span>
            <span className="text-[10px] text-text/20 mb-1 font-bold">IDX</span>
          </div>
          <div className="mt-4 h-1 w-full bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${sector.score}%` }}
              className={cn("h-full", sector.color)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};



// Methodology components are now lazily loaded from ./components/MethodologyComponents

// Components moved to separate files and lazily loaded.

// Intelligence tools moved to separate components.
// Intelligence tool components removed as they are now in their own files.





// Intelligence tool components removed as they are now in their own files.

// Components moved to separate files and lazily loaded.

// Custom hook for local storage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(error);
    }
  };
  return [storedValue, setValue];
}

export default function App() {
  const [storedDarkMode, setStoredDarkMode] = useLocalStorage('ai_studio_darkMode', true);
  const darkMode = true;
  const setDarkMode = () => {};
  const [language, setLanguage] = useLocalStorage<Language>('ai_studio_language', 'en');
  const t = translations[language];
  const [showMacro, setShowMacro] = useState(false);
  const [isPremium, setIsPremium] = useLocalStorage<boolean>('ai_studio_isPremium', false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState(0); // 0 = checkout entry, 1 = processing, 2 = success
  const [upgradePlan, setUpgradePlan] = useState<'sovereign' | 'founders'>('sovereign');
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>(MOCK_MARKET_DATA);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [sourceFilter, setSourceFilter] = useLocalStorage<string>("ai_studio_source", "");
  const [dateFilter, setDateFilter] = useLocalStorage<string>("ai_studio_date", "");
  const [riskFilter, setRiskFilter] = useLocalStorage<string>("ai_studio_risk", "");
  const [industryFilter, setIndustryFilter] = useLocalStorage<string>("ai_studio_industry", "");
  const [sortOption, setSortOption] = useLocalStorage<string>("ai_studio_sort", "date_desc");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [insightSources, setInsightSources] = useState<{ uri: string, title: string }[]>([]);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeResearchTab, setActiveResearchTab] = useLocalStorage<'materials' | 'energy' | 'shipping' | 'steel' | 'chemicals' | 'mining' | 'agribusiness' | 'logistics' | 'ai' | 'pharma' | 'other'>('ai_studio_researchTab', 'materials');
  const [activeNewsTopic, setActiveNewsTopic] = useLocalStorage<typeof NEWS_TOPICS[number]>('ai_studio_newsTopic', NEWS_TOPICS[0]); // Cement
  const [newsletterDate, setNewsletterDate] = useState("2026-03-16");
  const [newsletterNews, setNewsletterNews] = useState<NewsArticle[]>([]);
  const [loadingNewsletter, setLoadingNewsletter] = useState(false);
  
  // Custom Intel Briefcase and search states
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [newsSentimentFilter, setNewsSentimentFilter] = useState("All");
  const [newsImpactFilter, setNewsImpactFilter] = useState("All");
  const [pinnedNews, setPinnedNews] = useLocalStorage<NewsArticle[]>('ai_studio_pinnedNews', []);
  const [briefcaseAnalysis, setBriefcaseAnalysis] = useState("");
  const [synthesizingBriefcase, setSynthesizingBriefcase] = useState(false);
  const [isBriefcaseOpen, setIsBriefcaseOpen] = useState(false);

  const filteredNewsletterNews = useMemo(() => {
    return newsletterNews.filter(article => {
      const query = newsSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        article.title.toLowerCase().includes(query) || 
        article.summary.toLowerCase().includes(query) || 
        article.source.toLowerCase().includes(query);

      const sentiment = article.sentiment || "Neutral";
      const matchesSentiment = newsSentimentFilter === "All" || 
        sentiment.toLowerCase() === newsSentimentFilter.toLowerCase();

      const impact = article.impact || "Medium";
      const matchesImpact = newsImpactFilter === "All" || 
        impact.toLowerCase() === newsImpactFilter.toLowerCase();

      return matchesSearch && matchesSentiment && matchesImpact;
    });
  }, [newsletterNews, newsSearchQuery, newsSentimentFilter, newsImpactFilter]);

  const [researchReports, setResearchReports] = useState<Record<string, ResearchReport[]>>({});
  
  // World-Class Research Improvement States
  const [selectedResearchItem, setSelectedResearchItem] = useState<ResearchReport | null>(null);
  const [selectedResearchInsight, setSelectedResearchInsight] = useState("");
  const [loadingResearchInsight, setLoadingResearchInsight] = useState(false);

  const [sectorSynthesis, setSectorSynthesis] = useState("");
  const [synthesizingSector, setSynthesizingSector] = useState(false);
  const [showSectorSynthesisModal, setShowSectorSynthesisModal] = useState(false);

  const [stressScenario, setStressScenario] = useState("OPEC+ Sudden Supply Cut (-15% Global Production)");
  const [runningStressTest, setRunningStressTest] = useState(false);
  const [stressTestResult, setStressTestResult] = useState<any | null>(null);
  
  // Feature 1: Command Palette
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");

  // Feature 2: Floating AI Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useLocalStorage<{role: string, content: string}[]>('ai_studio_chat', []);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Feature 5: Smart Notifications
  const [smartAlert, setSmartAlert] = useState<{title: string, message: string} | null>(null);
  const [usageStats, setUsageStats] = useLocalStorage<Record<string, number>>('ai_studio_usage_stats', {});
  const [hasShownBrief, setHasShownBrief] = useState(false);
  // Feature: Strategic Workspaces
  const [workspace, setWorkspace] = useLocalStorage<any[]>('ai_studio_workspace', []);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  useEffect(() => {
    const handleAdd = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { item, type } = customEvent.detail;
        setWorkspace(prev => {
          const exists = prev.find(i => (i.id || i.title) === (item.id || item.title));
          if (exists) return prev;
          return [...prev, { ...item, savedType: type, savedAt: new Date().toISOString() }];
        });
        setSmartAlert({ title: "Workspace Updated", message: "AI Compiled Briefing added to Strategic Workspace." });
      }
    };
    window.addEventListener('ai_studio_add_workspace', handleAdd);
    return () => window.removeEventListener('ai_studio_add_workspace', handleAdd);
  }, [setWorkspace]);

  // Feature: Voice-to-Insight (VTI)
  const [isRecording, setIsRecording] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSmartAlert({ title: "System Limitation", message: "Voice recognition is not supported in this browser." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'zh-CN';
    recognition.start();
    setIsRecording(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  };

  const toggleSaveWorkspace = (item: any, type: 'news' | 'research') => {
    const itemId = item.id || item.title;
    const exists = workspace.find(i => (i.id || i.title) === itemId);
    
    if (exists) {
      setWorkspace(prev => prev.filter(i => (i.id || i.title) !== itemId));
    } else {
      setWorkspace(prev => [...prev, { ...item, savedType: type, savedAt: new Date().toISOString() }]);
      setSmartAlert({ title: "Workspace Updated", message: "Item added to your Strategic Workspace." });
    }
  };

  const [selectedMarketAsset, setSelectedMarketAsset] = useState<MarketData | null>(null);
  const [assetBriefing, setAssetBriefing] = useState<string>('');
  const [assetSources, setAssetSources] = useState<{ uri: string, title: string }[]>([]);
  const [briefingLoading, setBriefingLoading] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'chart' | 'briefing'>('chart');
  const [activeBulletinIdx, setActiveBulletinIdx] = useState<number>(0);
  const [discloseBulletin, setDiscloseBulletin] = useState<boolean>(false);

  useEffect(() => {
    if (selectedMarketAsset) {
      setAssetBriefing('');
      setAssetSources([]);
      setBriefingLoading(true);
      setModalTab('chart');
      
      getAssetBriefing(selectedMarketAsset.name, selectedMarketAsset.symbol)
        .then(res => {
          setAssetBriefing(res.text);
          setAssetSources(res.sources || []);
        })
        .finally(() => {
          setBriefingLoading(false);
        });
    }
  }, [selectedMarketAsset]);

  // Auto-Optimization: Adaptive Industry Loading
  useEffect(() => {
    if (Object.keys(usageStats).length > 0) {
      const topIndustry = Object.entries(usageStats).sort((a, b) => b[1] - a[1])[0][0];
      if (topIndustry && topIndustry !== activeResearchTab) {
        // Only set if user hasn't explicitly changed it in this session (demo bias)
        console.log(`Self-Optimizing: Setting landing industry to ${topIndustry}`);
      }
    }
  }, []);

  // Update usage stats when tab changes
  const trackUsage = (industry: string) => {
    setUsageStats(prev => ({
      ...prev,
      [industry]: (prev[industry] || 0) + 1
    }));
  };

  // Autonomous Intelligence: Background Risk Monitor
  useEffect(() => {
    if (news.length === 0) return;

    const riskScanner = setInterval(() => {
      const highRiskItems = news.filter(n => n.riskLevel === 'High');
      if (highRiskItems.length > 0 && !smartAlert) {
        const item = highRiskItems[Math.floor(Math.random() * highRiskItems.length)];
        setSmartAlert({
          title: "Survvi Autonomous Warning",
          message: `URGENT: High risk detected in ${item.industry} sector: "${item.title}". Assessing potential ripple effects.`
        });
        setTimeout(() => setSmartAlert(null), 10000);
      }
    }, 45000); // Scan every 45s

    // Auto Morning Brief
    if (!hasShownBrief && news.length > 0) {
      import('./services/api').then(m => {
        m.getDailySummary(news).then(summary => {
          setSmartAlert({
            title: "Morning Strategic Brief",
            message: summary
          });
          setHasShownBrief(true);
          setTimeout(() => setSmartAlert(null), 12000);
        });
      });
    }

    return () => clearInterval(riskScanner);
  }, [news, hasShownBrief, smartAlert]);
  const [researchSourceFilter, setResearchSourceFilter] = useState("");
  const [researchDateFilter, setResearchDateFilter] = useState("");
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [journeyStep, setJourneyStep] = useState(0);
  const [selectedMethodology, setSelectedMethodology] = useState<{ title: string, content: string } | null>(null);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  const openMethodology = (title: string) => {
    const methodology = METHODOLOGIES[title as keyof typeof METHODOLOGIES];
    if (methodology) {
      setSelectedMethodology(methodology);
      setIsMethodologyModalOpen(true);
    }
  };

  const journeyData = t.journey.map((step, index) => ({
    ...step,
    icon: index === 0 ? <Building2 className="w-8 h-8" /> : index === 1 ? <Zap className="w-8 h-8" /> : index === 2 ? <Target className="w-8 h-8" /> : <Cpu className="w-8 h-8" />,
    color: index === 0 ? "text-blue-400" : index === 1 ? "text-yellow-400" : index === 2 ? "text-accent" : "text-emerald-400"
  }));

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setJourneyStep((prev) => (prev + 1) % journeyData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    getUserLocation().then(setLocation);
    
    // Initial fetch
    setLoadingMarket(true);
    getLiveMarketData().then((data) => {
      setMarketData(data);
      setLoadingMarket(false);
    });
    fetchInsight("Building materials sustainability in 2026");
    fetchNews();

    // Real-time market data updates every 60 seconds
    const marketInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setLoadingMarket(true);
        getLiveMarketData().then((data) => {
          setMarketData(data);
          setLoadingMarket(false);
        });
      }
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(marketInterval);
    };
  }, []);

  useEffect(() => {
    if (!researchReports[activeResearchTab]) {
      fetchResearch(activeResearchTab);
    }
  }, [activeResearchTab]);

  useEffect(() => {
    fetchNewsletter(activeNewsTopic, newsletterDate);
  }, [activeNewsTopic, newsletterDate]);

  const filteredNews = useMemo(() => {
    let filtered = news.filter(item => {
      const matchesSource = sourceFilter === "" || item.source === sourceFilter;
      const matchesDate = dateFilter === "" || item.date === dateFilter;
      const matchesRisk = riskFilter === "" || item.riskLevel === riskFilter;
      const matchesIndustry = industryFilter === "" || item.industry === industryFilter;
      return matchesSource && matchesDate && matchesRisk && matchesIndustry;
    });

    return filtered.sort((a, b) => {
      if (sortOption === "relevance_desc") {
        return (b.relevance || 0) - (a.relevance || 0);
      }
      if (sortOption === "date_desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOption === "date_asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOption === "risk_desc" || sortOption === "risk_asc") {
        const riskOrder: Record<string, number> = { "High": 3, "Medium": 2, "Low": 1 };
        const riskA = riskOrder[a.riskLevel] || 0;
        const riskB = riskOrder[b.riskLevel] || 0;
        if (sortOption === "risk_desc") {
          return riskB - riskA;
        } else {
          return riskA - riskB;
        }
      }
      return 0;
    });
  }, [news, sourceFilter, dateFilter, riskFilter, industryFilter, sortOption]);

  const uniqueSources = useMemo(() => {
    const sources = new Set(news.map(item => item.source));
    return Array.from(sources);
  }, [news]);

  const uniqueDates = useMemo(() => {
    const dates = new Set(news.map(item => item.date));
    return Array.from(dates);
  }, [news]);

  const uniqueIndustries = useMemo(() => {
    const industries = new Set(news.map(item => item.industry).filter(Boolean));
    return Array.from(industries);
  }, [news]);

  const fetchNewsletter = async (topic: string, date: string) => {
    setLoadingNewsletter(true);
    const news = await getNewsletterNews(topic, date);
    setNewsletterNews(news);
    setLoadingNewsletter(false);
  };

  const togglePinNews = (article: NewsArticle) => {
    setPinnedNews(prev => {
      const isPinned = prev.some(item => item.title === article.title);
      if (isPinned) {
        return prev.filter(item => item.title !== article.title);
      } else {
        return [...prev, article];
      }
    });
  };

  const handleSynthesizeBriefcase = async () => {
    if (pinnedNews.length === 0) return;
    setSynthesizingBriefcase(true);
    setBriefcaseAnalysis("");
    try {
      const articlesList = pinnedNews.map((art, idx) => 
        `[Article ${idx + 1}]
Title: ${art.title}
Source: ${art.source}
Date: ${art.date}
Sentiment: ${art.sentiment || "Neutral"}
Impact: ${art.impact || "Medium"}
Summary: ${art.summary}`
      ).join("\n\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a Senior Sovereign Risk & Commodity Intelligence Strategist. 
Analyze the following hand-selected intelligence bulletins curated by the asset manager:

${articlesList}

Provide a high-impact, professional, and concise Strategic Asset Allocation Assessment of these items:
1. Executive Risk Synopsis (summarizing core threats or opportunities)
2. Direct Asset Allocation Impact (which asset classes, sovereign bonds, or specific commodities are affected, and how to hedge)
3. Immediate Tactical Mitigation Strategy (what immediate actions supply chain directors should execute)

Structure your response using clean, bulleted, professional sections with bold titles. Keep it highly action-oriented and brief. Avoid introductory boilerplate.`,
      });

      if (response.text) {
        setBriefcaseAnalysis(response.text);
      } else {
        setBriefcaseAnalysis("Could not synthesize analysis. Please try again.");
      }
    } catch (err: any) {
      console.error("Briefcase synthesis error:", err);
      setBriefcaseAnalysis("Error synthesizing brief: " + err.message);
    } finally {
      setSynthesizingBriefcase(false);
    }
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      const content = await generateResearchPDFContent(activeResearchTab);
      // Construct PDF
      const doc = new jsPDF();
      
      // Document Settings
      doc.setFont("helvetica");

      // Title
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      const titleLines = doc.splitTextToSize(content.title || `Research Briefing: ${activeResearchTab}`, 170);
      doc.text(titleLines, 20, 30);
      
      let currentY = 30 + (titleLines.length * 10);
      
      // Executive Summary
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text("Executive Summary", 20, currentY);
      currentY += 8;
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      const summaryLines = doc.splitTextToSize(content.executiveSummary || "", 170);
      doc.text(summaryLines, 20, currentY);
      currentY += (summaryLines.length * 6) + 10;
      
      // Key Trends
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text("Key Trends", 20, currentY);
      currentY += 8;
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      if (content.keyTrends && Array.isArray(content.keyTrends)) {
        content.keyTrends.forEach((trend: string) => {
          const trendLines = doc.splitTextToSize(`• ${trend}`, 160);
          doc.text(trendLines, 25, currentY);
          currentY += (trendLines.length * 6) + 4;
          
          if (currentY > 270) { // Add new page if near bottom
            doc.addPage();
            currentY = 20;
          }
        });
      }
      currentY += 6;
      
      // Future Outlook
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text("Future Outlook", 20, currentY);
      currentY += 8;
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      const outlookLines = doc.splitTextToSize(content.outlook || "", 170);
      doc.text(outlookLines, 20, currentY);
      
      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Survvi Opulence Insights - Generated on ${new Date().toLocaleDateString()}`, 20, 290);
        doc.text(`Page ¹${i} of ${totalPages}`, 180, 290);
      }

      doc.save(`Research_Briefing_${activeResearchTab}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const [exportingAssetDossier, setExportingAssetDossier] = useState<boolean>(false);

  const handleExportAssetDossier = async (asset: MarketData) => {
    setExportingAssetDossier(true);
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica");

      // Outer border frame
      doc.setDrawColor(200, 200, 200);
      doc.rect(10, 10, 190, 277);

      // Secure briefing stamp header
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("SECURITY LEVEL: ALPHA CLASSIFIED / INDUSTRIAL INTEL", 15, 18);
      doc.text("DATE: " + new Date().toUTCString(), 115, 18);

      // Header division line
      doc.setDrawColor(180, 180, 180);
      doc.line(15, 22, 195, 22);

      // Title Block
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text(asset.name.toUpperCase(), 15, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`TICKER TARGET: ${asset.symbol}   |   SPOT VALUE: $${asset.price.toFixed(2)} (${asset.change >= 0 ? '+' : ''}${asset.changePercent.toFixed(2)}%)`, 15, 41);

      // Secondary header line
      doc.setDrawColor(220, 220, 220);
      doc.line(15, 46, 195, 46);

      // Subtitle
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("TACTICAL MACRO INTELLIGENCE DOSSIER", 15, 56);

      let currentY = 66;

      // Split briefing lines
      if (assetBriefing) {
        const sections = assetBriefing.split('###');
        sections.forEach((sec) => {
          const trimmedSec = sec.trim();
          if (!trimmedSec) return;

          const lines = trimmedSec.split('\n');
          const heading = lines[0].trim();
          const body = lines.slice(1).join('\n').trim();

          // Section Header
          doc.setFontSize(12);
          doc.setTextColor(197, 160, 89); // Accent gold
          doc.text(heading.toUpperCase(), 15, currentY);
          currentY += 6;

          // Underline heading
          doc.setDrawColor(230, 230, 230);
          doc.line(15, currentY - 2, 195, currentY - 2);

          // Section Body
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);

          // Clean markdown bold tags before printing
          const cleanedBody = body.replace(/\*\*/g, '');
          const bodyLines = doc.splitTextToSize(cleanedBody, 170);
          
          bodyLines.forEach((line: string) => {
            if (currentY > 265) {
              doc.addPage();
              // Outer border frame for new page
              doc.setDrawColor(200, 200, 200);
              doc.rect(10, 10, 190, 277);
              
              doc.setFontSize(8);
              doc.setTextColor(120, 120, 120);
              doc.text("SECURITY LEVEL: ALPHA CLASSIFIED / INDUSTRIAL INTEL (CONT.)", 15, 18);
              
              doc.setDrawColor(180, 180, 180);
              doc.line(15, 22, 195, 22);

              currentY = 32;
            }
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.text(line, 15, currentY);
            currentY += 5.5;
          });

          currentY += 8;
        });
      }

      // Footer - add security verification disclaimer
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      const disclaimer = doc.splitTextToSize("Disclaimer: This intelligence report is generated on-demand by Survvi Opulence Insights engine using automated multi-source grounding web searches and real-time LLM analysis. Under strict physical bunkering security rules, do not share outside compliance boundaries.", 170);
      disclaimer.forEach((discLine: string) => {
        if (currentY > 275) {
          doc.addPage();
          doc.setDrawColor(200, 200, 200);
          doc.rect(10, 10, 190, 277);
          currentY = 32;
        }
        doc.text(discLine, 15, currentY);
        currentY += 4;
      });

      // Save PDF
      doc.save(`Survvi_Intelligence_Dossier_${asset.symbol}.pdf`);
      setSmartAlert({ title: "Dossier Exported", message: `Sovereign Intelligence PDF for ${asset.symbol} compiled successfully.` });
    } catch (err) {
      console.error("Failed to export asset dossier:", err);
    } finally {
      setExportingAssetDossier(false);
    }
  };

  const handleFetchResearchInsight = async (report: ResearchReport) => {
    setSelectedResearchItem(report);
    setLoadingResearchInsight(true);
    setSelectedResearchInsight("");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a world-class commodity strategist and research director.
Analyze this research report title: "${report.title}" from source: "${report.source}" (${report.date}).

Generate an advanced sovereign risk intelligence briefing:
1. EXECUTIVE SUMMARY & CORE THESIS (A sophisticated abstract outlining the key theme of this research)
2. MACRO SHOCKS & CATALYSTS (List 2 key events, regulatory changes, or demand/supply milestones to monitor)
3. COMMODITY & SAA TARGETS (Which specific commodities or indices are most affected? What is the bullish, bearish, or hedging playbook?)

Keep the tone extremely elite, precise, and professional. Do not use generic filler words. Format with clean spacing and bullet points.`,
      });
      if (response.text) {
        setSelectedResearchInsight(response.text);
      } else {
        setSelectedResearchInsight("Could not generate on-demand abstract. Please try again.");
      }
    } catch (err: any) {
      console.error("Error generating research insight:", err);
      setSelectedResearchInsight("Failed to generate strategic briefing: " + err.message);
    } finally {
      setLoadingResearchInsight(false);
    }
  };

  const handleSynthesizeSectorOutlook = async () => {
    const reports = researchReports[activeResearchTab] || [];
    if (reports.length === 0) return;
    setSynthesizingSector(true);
    setSectorSynthesis("");
    setShowSectorSynthesisModal(true);
    try {
      const reportsListText = reports.slice(0, 8).map((r, i) => `${i+1}. ${r.title} (${r.source}, ${r.date})`).join("\n");
      const categoryLabel = activeResearchTab.toUpperCase();
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a Senior Sovereign Risk & Commodity Intelligence Director.
We have multiple high-impact intelligence reports for the sector: ${categoryLabel}.
Analyze this collective matrix of publications:

${reportsListText}

Generate a unified, highly polished Sovereign Sector Macro-Outlook:
1. CONSOLIDATED CONTEXT MAP (Synthesizing the core cross-currents and macro trends of these reports)
2. HIGHEST PROBABILITY GEOPOLITICAL RISK TRIGGERS (Identify 2 main risks or policy actions)
3. SOVEREIGN HEDGE PLAYBOOK (Clear, actionable recommendations on what commodity positions to hedge, hold, or go long)

Keep the formatting clean, bulleted, and in a high-caliber professional report style. Avoid any introductory or closing remarks.`,
      });
      if (response.text) {
        setSectorSynthesis(response.text);
      } else {
        setSectorSynthesis("Could not generate sector macro-outlook. Please try again.");
      }
    } catch (err: any) {
      console.error("Error synthesizing sector:", err);
      setSectorSynthesis("Failed to synthesize sector macro-outlook: " + err.message);
    } finally {
      setSynthesizingSector(false);
    }
  };

  const handleRunStressTest = async () => {
    setRunningStressTest(true);
    setStressTestResult(null);
    try {
      const categoryLabel = activeResearchTab.toUpperCase();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a Senior Sovereign Risk & Commodity Intelligence Stress-Testing Specialist.
Evaluate the exact macro-economic and industrial impact of this stress scenario: "${stressScenario}" on the sector: "${categoryLabel}".

Provide the output in JSON format matching this schema:
{
  "riskRating": "CRITICAL RISK" | "HIGH VULNERABILITY" | "MODERATE STRESS" | "LOW RISK",
  "ratingColor": "red" | "orange" | "yellow" | "green",
  "inflationImpactPercent": number (0 to 100 representing estimated price inflation/pressure),
  "delayImpactPercent": number (0 to 100 representing shipping/logistics delay index),
  "playbookSummary": "1-sentence summary of the immediate reaction strategy",
  "tacticalPlaybook": "Detailed multi-point markdown text outlining precise hedges, alternative sourcing, and inventory storage buffers"
}

Ensure the output is valid JSON only.`,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        setStressTestResult(JSON.parse(response.text));
      } else {
        throw new Error("No response text");
      }
    } catch (err: any) {
      console.error("Error executing stress test:", err);
      setStressTestResult({
        riskRating: "MODERATE STRESS",
        ratingColor: "yellow",
        inflationImpactPercent: 45,
        delayImpactPercent: 30,
        playbookSummary: "Direct supply shocks might cause temporary localized shortages.",
        tacticalPlaybook: "Failed to model specific scenario: " + err.message + ". We suggest securing rolling short-term forward contracts and building safety buffers of 20-30% above run-rate."
      });
    } finally {
      setRunningStressTest(false);
    }
  };

  const fetchResearch = async (tab: string) => {
    setLoadingResearch(true);
    const categoryMap: Record<string, string> = {
      materials: 'Building Materials',
      energy: 'Energy',
      shipping: 'Shipping',
      steel: 'Steel',
      chemicals: 'Chemicals',
      mining: 'Mining',
      agribusiness: 'Agribusiness',
      logistics: 'Logistics',
      ai: 'Industrial AI',
      pharma: 'Pharmaceuticals',
      other: 'Global Industrial'
    };
    const reports = await getResearchReports(categoryMap[tab] || 'Global Industrial');
    setResearchReports(prev => ({ ...prev, [tab]: reports }));
    setLoadingResearch(false);
  };

  const fetchNews = async () => {
    setLoadingNews(true);
    const latestNews = await getRealTimeNews();
    setNews(latestNews);
    setLoadingNews(false);
  };

  const fetchInsight = async (query: string) => {
    setLoadingInsight(true);
    const insight = await getMarketInsights(query);
    setAiInsight(insight.text);
    setInsightSources(insight.sources || []);
    setLoadingInsight(false);
  };

  const filteredResearchReports = useMemo(() => {
    const currentReports = researchReports[activeResearchTab] || [];
    return currentReports.filter(report => {
      const matchesSource = researchSourceFilter === "" || report.source === researchSourceFilter;
      const matchesDate = researchDateFilter === "" || report.date === researchDateFilter;
      return matchesSource && matchesDate;
    });
  }, [researchReports, activeResearchTab, researchSourceFilter, researchDateFilter]);

  const researchChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredResearchReports.forEach(report => {
      counts[report.type] = (counts[report.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredResearchReports]);

  const researchSources = useMemo(() => {
    const currentReports = researchReports[activeResearchTab] || [];
    const sources = new Set(currentReports.map(r => r.source));
    return Array.from(sources);
  }, [researchReports, activeResearchTab]);

  const researchDates = useMemo(() => {
    const currentReports = researchReports[activeResearchTab] || [];
    const dates = new Set(currentReports.map(r => r.date));
    return Array.from(dates);
  }, [researchReports, activeResearchTab]);

  const chartData = useMemo(() => {
    // Use marketData to generate the chart data for the hero section
    // Let's use the S&P 500 (GSPC) or the first index as the primary trend
    const primaryIndex = marketData.find(d => d.symbol === 'GSPC') || marketData[0];
    if (!primaryIndex) return [];
    
    return primaryIndex.trend.map((val, i) => ({
      name: `Day ${i + 1}`,
      value: val,
    }));
  }, [marketData]);

  // Command Palette global listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle AI Chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user', content: chatInput }];
    setChatMessages(newMsgs);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the AI assistant inside Survvi Opulence Insights. Users are high-level executives. Answer concisely. User says: ${chatInput}`
      });
      setChatMessages([...newMsgs, { role: 'ai', content: response.text || "I am analyzing this now." }]);
    } catch {
      setChatMessages([...newMsgs, { role: 'ai', content: "Our systems are experiencing high latency. Please retry." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-brand flex items-center justify-center text-accent text-sm font-bold uppercase tracking-widest animate-pulse">Initializing Survvi Intelligence...</div>}>
      <div className="min-h-screen bg-brand text-text selection:bg-accent selection:text-brand font-sans overflow-x-hidden transition-colors duration-500">
      <Navbar 
        onMacroClick={() => setShowMacro(true)} 
        language={language} 
        setLanguage={setLanguage} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        workspaceCount={workspace.length}
        onWorkspaceClick={() => setIsWorkspaceOpen(true)}
        isPremium={isPremium}
        onUpgradeClick={() => { setUpgradePlan('sovereign'); setUpgradeStep(0); setShowSubscriptionModal(true); }}
      />
      
      <AnimatePresence>
        {showMacro && <MacroStrategyPage onClose={() => setShowMacro(false)} language={language} />}
        
        {/* Feature 1: Command Palette */}
        {isCommandOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setIsCommandOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-brand font-sans border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <Search className="w-5 h-5 text-white/50" />
                <input 
                  autoFocus
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Search industries, raw materials, reports... (e.g. 'Steel')"
                  className="flex-1 bg-transparent border-none text-white px-4 py-2 focus:outline-none"
                />
                <button onClick={() => setIsCommandOpen(false)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
                <div className="text-[10px] uppercase font-bold text-white/40 px-3 py-2">Quick Navigation</div>
                <button onClick={() => { setIsCommandOpen(false); window.location.hash = 'news'; }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 flex items-center gap-3">
                  <Newspaper className="w-4 h-4 text-accent" />
                  <span>Go to News Hub</span>
                </button>
                <button onClick={() => { setIsCommandOpen(false); window.location.hash = 'research'; }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-accent" />
                  <span>Go to Research Reports</span>
                </button>
                <button onClick={() => { setIsCommandOpen(false); setShowMacro(true); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-accent" />
                  <span>Open Macro Strategy</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Feature 3: Interactive Market Data Visualization Modal */}
        {selectedMarketAsset && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand/90 backdrop-blur flex items-center justify-center p-6"
            onClick={() => setSelectedMarketAsset(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-brand border border-white/10 rounded-3xl p-8 max-w-4xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedMarketAsset.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-2xl font-light">${selectedMarketAsset.price.toFixed(2)}</span>
                    <span className={cn("flex items-center text-sm font-bold", selectedMarketAsset.change >= 0 ? "text-accent" : "text-red-500")}>
                      {selectedMarketAsset.change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                      {Math.abs(selectedMarketAsset.changePercent).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedMarketAsset(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* High-Fidelity Tab Navigation & Dossier Export Action */}
              <div className="flex items-center gap-6 border-b border-white/10 pb-4 mb-6">
                <button 
                  onClick={() => setModalTab('chart')}
                  className={cn(
                    "pb-2 px-1 text-xs uppercase font-extrabold tracking-widest transition-all relative",
                    modalTab === 'chart' ? "text-accent border-b-2 border-accent" : "text-white/40 hover:text-white"
                  )}
                >
                  Historical Trend
                </button>
                <button 
                  onClick={() => setModalTab('briefing')}
                  className={cn(
                    "pb-2 px-1 text-xs uppercase font-extrabold tracking-widest transition-all relative flex items-center gap-1.5",
                    modalTab === 'briefing' ? "text-accent border-b-2 border-accent" : "text-white/40 hover:text-white"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Tactical AI Briefing
                </button>

                <button
                  onClick={() => handleExportAssetDossier(selectedMarketAsset)}
                  disabled={briefingLoading || !assetBriefing || exportingAssetDossier}
                  className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-accent/10 hover:bg-accent hover:text-brand border border-accent/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all disabled:opacity-35 disabled:pointer-events-none"
                >
                  {exportingAssetDossier ? (
                    <>
                      <div className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      Export Dossier (PDF)
                    </>
                  )}
                </button>
              </div>

              {/* Tab Workspace */}
              {modalTab === 'chart' ? (
                <div className="h-96 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedMarketAsset.trend.map((val, i) => ({ day: i, value: val }))}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedMarketAsset.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={selectedMarketAsset.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="day" stroke="#ffffff50" tick={{fill: '#ffffff50'}} />
                      <YAxis domain={['auto', 'auto']} stroke="#ffffff50" tick={{fill: '#ffffff50'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={selectedMarketAsset.change >= 0 ? '#10b981' : '#ef4444'} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="min-h-96 max-h-96 overflow-y-auto pr-2 flex flex-col justify-between scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {briefingLoading ? (
                    <div className="space-y-4 py-4 animate-pulse">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-3 h-3 bg-accent rounded-full animate-ping" />
                        <span className="text-[10px] font-mono font-bold tracking-widest text-accent uppercase">Initiating Search-Grounded Synthesis...</span>
                      </div>
                      <div className="h-4 bg-white/10 rounded w-1/3" />
                      <div className="h-3 bg-white/5 rounded w-full" />
                      <div className="h-3 bg-white/5 rounded w-[95%]" />
                      <div className="h-3 bg-white/5 rounded w-[90%]" />
                      <div className="h-4 bg-white/10 rounded w-1/4 mt-8" />
                      <div className="h-3 bg-white/5 rounded w-full" />
                      <div className="h-3 bg-white/5 rounded w-[92%]" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Formatted briefing content */}
                      <div className="text-white/80 leading-relaxed font-sans">
                        {renderBriefingContent(assetBriefing)}
                      </div>

                      {/* Cited ground sources */}
                      {assetSources && assetSources.length > 0 && (
                        <div className="mt-8 border-t border-white/10 pt-4">
                          <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Ground-Source Intelligence Verifications</h5>
                          <div className="flex flex-wrap gap-2">
                            {assetSources.slice(0, 4).map((src, idx) => (
                              <a 
                                key={idx} 
                                href={src.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] text-white/60 hover:text-white transition-all font-mono"
                              >
                                <Globe className="w-3 h-3 text-accent shrink-0" />
                                {src.title ? (src.title.length > 30 ? src.title.slice(0, 30) + "..." : src.title) : "Ground Reference"}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature 5: Smart Notifications */}
      <AnimatePresence>
        {smartAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 max-w-sm bg-brand border border-accent/30 rounded-2xl p-4 shadow-[0_0_40px_rgba(34,197,94,0.1)] flex gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{smartAlert.title}</h4>
              <p className="text-white/70 text-xs mt-1 leading-relaxed">{smartAlert.message}</p>
            </div>
            <button onClick={() => setSmartAlert(null)} className="absolute top-2 right-2 text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature 2: Floating AI Chat */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="mb-4 w-80 sm:w-96 bg-brand/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-accent" />
                  <span className="font-bold text-sm tracking-widest uppercase text-white">Research Assistant</span>
                </div>
                <button onClick={() => setChatMessages([])} className="text-[10px] text-white/40 hover:text-white uppercase">Clear</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-white/40 space-y-2">
                    <Bot className="w-8 h-8 opacity-50" />
                    <p className="text-xs">Ask me anything about the global supply chain, or specific entities.</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[85%] rounded-xl px-4 py-2 text-sm", msg.role === 'user' ? "bg-accent text-brand" : "bg-white/10 text-white")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white rounded-xl px-4 py-2 text-sm flex gap-1 items-center">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/10 bg-black/20">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AI..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-20 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button 
                      type="button" 
                      onClick={startVoiceSearch}
                      className={cn("p-2 rounded-lg transition-colors", isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-white/50 hover:text-white")}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="p-2 bg-accent text-brand rounded-lg disabled:opacity-50 hover:bg-accent/90 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature: Strategic Workspace Drawer */}
        <AnimatePresence>
          {isWorkspaceOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-brand/80 backdrop-blur-sm flex justify-end"
              onClick={() => setIsWorkspaceOpen(false)}
            >
              <motion.div
                initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md bg-brand border-l border-white/10 h-full flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Strategic Workspace</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Your Curated Collection</p>
                  </div>
                  <button onClick={() => setIsWorkspaceOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {workspace.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-white/20">
                      <Bookmark className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm">Save news pieces or research reports to build your custom intelligence hub.</p>
                    </div>
                  ) : (
                    workspace.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 relative group">
                        <div className="flex items-center gap-3 mb-2">
                          {item.savedType === 'news' ? <Newspaper className="w-3 h-3 text-accent" /> : <FileText className="w-3 h-3 text-emerald-400" />}
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            {item.savedType} • {new Date(item.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2 leading-snug">{item.title}</h4>
                        <p className="text-xs text-white/60 line-clamp-2 mb-4">
                          {item.summary || item.executiveSummary || "Intelligence briefing archived for strategic review."}
                        </p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              if (item.fullContent) {
                                const blob = new Blob([item.fullContent], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${item.title.replace(/\s+/g, '_')}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                              } else {
                                window.open(item.url || '#', '_blank');
                              }
                            }}
                            className="bg-white/10 hover:bg-accent hover:text-brand text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors"
                          >
                            {item.fullContent ? "Download Brief" : "Open Insight"}
                          </button>
                          <button 
                            onClick={() => toggleSaveWorkspace(item, item.savedType)}
                            className="text-[10px] text-white/40 hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-6 border-t border-white/10">
                  <button 
                    onClick={() => {
                      const text = workspace.map(i => `${i.title}\n${i.summary || ""}\n---`).join('\n');
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'Workspace_Briefing.txt';
                      a.click();
                    }}
                    disabled={workspace.length === 0}
                    className="w-full bg-accent text-brand py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent/90 transition-all disabled:opacity-50"
                  >
                    Export Strategy Pack
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sovereign Analytics Elite Subscription Gate Modal */}
        <AnimatePresence>
          {showSubscriptionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-brand/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowSubscriptionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#090b0e] border border-accent/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.3)] relative"
              >
                {/* Gold gradient ambient light */}
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
                
                {/* Modal Header */}
                <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Survvi Opulence Premium</h3>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Sovereign Financial & Industrial Foresight</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSubscriptionModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 md:p-8 relative z-10">
                  {upgradeStep === 0 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">Step 1: Choose Your Plan</span>
                        <h4 className="text-2xl font-bold mt-3 text-white">Select Your Level of Intelligence</h4>
                        <p className="text-white/40 text-sm mt-1 max-w-md mx-auto">Get absolute access to real-time simulation modelers, predictive analytics, and deep market foresight.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Option 1: Sovereign Analytics */}
                        <div 
                          onClick={() => setUpgradePlan('sovereign')}
                          className={cn(
                            "p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-full relative group",
                            upgradePlan === 'sovereign' 
                              ? "bg-accent/5 border-accent shadow-[0_0_20px_rgba(197,160,89,0.15)]" 
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          )}
                        >
                          {upgradePlan === 'sovereign' && (
                            <span className="absolute -top-3 right-4 bg-accent text-brand text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              14-Day Free Trial
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ShieldCheck className="w-4 h-4 text-accent" />
                              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Sovereign Analytics</span>
                            </div>
                            <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-4">Try 2 Weeks Free</p>
                            <div className="flex items-baseline gap-1 mb-4">
                              <span className="text-3xl font-bold text-white">Free Trial</span>
                              <span className="text-white/40 text-xs">/ 14 days</span>
                            </div>
                            <ul className="text-xs text-white/60 space-y-2 mb-6">
                              <li className="flex items-center gap-2">✓ Try free for 2 weeks</li>
                              <li className="flex items-center gap-2">✓ Scenario Modeler Access</li>
                              <li className="flex items-center gap-2">✓ 12-Month Predictive Analytics</li>
                              <li className="flex items-center gap-2">✓ Full Client Intelligence Suite</li>
                              <li className="flex items-center gap-2">✓ Premium AI PDF Briefing Compiler</li>
                            </ul>
                          </div>
                          <div className={cn(
                            "w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-center transition-all",
                            upgradePlan === 'sovereign' ? "bg-accent text-brand" : "bg-white/5 text-white/40"
                          )}>
                            Select Sovereign
                          </div>
                        </div>

                        {/* Option 2: Founders Circle */}
                        <div 
                          onClick={() => setUpgradePlan('founders')}
                          className={cn(
                            "p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-full relative group",
                            upgradePlan === 'founders' 
                              ? "bg-amber-500/5 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]" 
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          )}
                        >
                          {upgradePlan === 'founders' && (
                            <span className="absolute -top-3 right-4 bg-amber-500 text-brand text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Founders Circle</span>
                            </div>
                            <p className="text-[10px] text-white/40 uppercase mb-4">Private Boardroom Advisory</p>
                            <div className="flex items-baseline gap-1 mb-4">
                              <span className="text-3xl font-bold text-white">$1,499</span>
                              <span className="text-white/40 text-xs">/ month</span>
                            </div>
                            <ul className="text-xs text-white/60 space-y-2 mb-6">
                              <li className="flex items-center gap-2">✓ All Sovereign Analytics Benefits</li>
                              <li className="flex items-center gap-2">✓ 1-on-1 Advising with Kunwar</li>
                              <li className="flex items-center gap-2">✓ Custom Digital Twin Scenarios</li>
                              <li className="flex items-center gap-2">✓ Private Geopolitical Defense briefings</li>
                            </ul>
                          </div>
                          <div className={cn(
                            "w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-center transition-all",
                            upgradePlan === 'founders' ? "bg-amber-500 text-brand" : "bg-white/5 text-white/40"
                          )}>
                            Select Founders
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          onClick={() => setUpgradeStep(1)}
                          className="bg-accent text-brand font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl flex items-center gap-2 hover:scale-102 transition-all shadow-lg shadow-accent/20"
                        >
                          <span>Proceed to Secure Checkout</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {upgradeStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">Step 2: Secure Verification</span>
                        <h4 className="text-2xl font-bold mt-3 text-white">Institutional Billing</h4>
                        <p className="text-white/40 text-sm mt-1">Simulating private equity secure payment engine for direct workspace verification.</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                          <div>
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Selection</span>
                            <h5 className="text-sm font-bold text-white mt-1">
                              {upgradePlan === 'sovereign' ? "Sovereign Analytics (14-Day Free Trial)" : "Founders Circle Elite Portfolio"}
                            </h5>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Pricing</span>
                            <p className="text-sm font-bold text-accent mt-1">
                              {upgradePlan === 'sovereign' ? "$0 Due Now (then $299/mo)" : "$1,499 / mo"}
                            </p>
                          </div>
                        </div>

                        {/* Credit Card Pre-Filled Simulation */}
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2">Simulated Corporate Account Cardholder</label>
                            <input 
                              type="text" 
                              value="SURVVI HOLDINGS & CO LLC" 
                              disabled
                              className="w-full bg-white/5 border border-accent/20 rounded-xl px-4 py-3 text-xs text-white/80 cursor-not-allowed focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2">Simulated Credit Card Number</label>
                              <input 
                                type="text" 
                                value="8888 1970 2026 8888" 
                                disabled
                                className="w-full bg-white/5 border border-accent/20 rounded-xl px-4 py-3 text-xs text-white/80 tracking-widest cursor-not-allowed focus:outline-none text-left"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2">Simulated CVV</label>
                              <input 
                                type="text" 
                                value="888" 
                                disabled
                                className="w-full bg-white/5 border border-accent/20 rounded-xl px-4 py-3 text-xs text-white/80 cursor-not-allowed focus:outline-none text-center"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-xl border border-accent/20">
                          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                          <p className="text-[10px] text-white/60">This checkout is a high-fidelity simulation. Verification is secure and automatic for developer testing.</p>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <button
                          onClick={() => setUpgradeStep(0)}
                          className="text-white/40 hover:text-white font-bold uppercase tracking-widest text-xs px-6 py-4"
                        >
                          Back to Plans
                        </button>
                        <button
                          onClick={() => {
                            setUpgradeStep(2);
                            // Set a dynamic simulation delay
                            setTimeout(() => {
                              setUpgradeStep(3);
                              setIsPremium(true);
                              setSmartAlert({ title: "Sovereign Unlocked", message: "Your Elite Sovereign credentials are now fully active!" });
                            }, 2500);
                          }}
                          className="bg-gradient-to-r from-accent to-amber-500 text-brand font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl hover:scale-102 transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
                        >
                          <span>Process Instant Wire</span>
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {upgradeStep === 2 && (
                    <div className="py-16 text-center space-y-6">
                      <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-accent/10 border-t-accent animate-spin" />
                        <div className="absolute inset-2 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin [animation-direction:reverse]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-accent animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white uppercase tracking-wider">Securing Private Ledger...</h4>
                        <p className="text-white/40 text-xs max-w-sm mx-auto">Connecting to Swiss Sovereign Swift portal and allocating private secure nodes on decentralized industrial pipeline...</p>
                      </div>
                      <div className="text-[10px] text-accent font-mono space-y-1 opacity-70 animate-pulse text-left max-w-md mx-auto bg-white/5 p-4 rounded-xl">
                        <p>&gt; SECURE PORT 3000 CONNECTION ESTABLISHED</p>
                        <p>&gt; ENCRYPTING WALLET CERTIFICATE ... OK</p>
                        <p>&gt; MINING BLOCKS ON SOVEREIGN FABRIC ... RUNNING</p>
                      </div>
                    </div>
                  )}

                  {upgradeStep === 3 && (
                    <div className="py-12 text-center space-y-8">
                      <div className="w-20 h-20 bg-accent/20 border-2 border-accent rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(197,160,89,0.3)] animate-bounce">
                        <Sparkles className="w-10 h-10 text-accent" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-3xl font-black text-white uppercase tracking-tight">Sovereign Portal Unlocked</h4>
                        <p className="text-accent font-bold text-xs uppercase tracking-widest">Welcome to Survvi Opulence Elite Circle</p>
                        <p className="text-white/50 text-sm max-w-md mx-auto">Your institutional credentials have been successfully authorized. All forecasting models, decision war-rooms, and proprietary API suites are now fully active.</p>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={() => setShowSubscriptionModal(false)}
                          className="bg-accent text-brand font-black uppercase tracking-[0.2em] text-xs px-10 py-5 rounded-xl hover:scale-105 transition-all shadow-xl shadow-accent/20"
                        >
                          Enter Sovereign Suite
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-accent hover:bg-accent/90 transition-all rounded-full flex items-center justify-center shadow-lg hover:scale-105 group relative"
        >
          {isChatOpen ? <X className="w-6 h-6 text-brand" /> : <MessageSquare className="w-6 h-6 text-brand" />}
          
          {/* Tooltip for Cmd+K discoverability */}
          {!isChatOpen && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:group-hover:block w-max bg-brand border border-white/10 text-xs px-3 py-1.5 rounded-lg text-white/70">
              Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white mx-1">⌘ K</kbd> to search
            </div>
          )}
        </button>
      </div>
      
      {/* 1. Feature: Real-time Global Commodity Pulse */}
      <div className="pt-44 lg:pt-52">
        <GlobalTicker data={marketData} onAssetClick={setSelectedMarketAsset} loading={loadingMarket} />
        <BDIChart data={marketData} loading={loadingMarket} />
        <OpulenceIndexWidget />
      </div>

      {/* 2. Feature: Industry Performance Heatmap */}
      <IndustryHeatmap data={marketData} loading={loadingMarket} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-deep/10 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-8">
              <Activity className="w-3 h-3" />
              {t.hero.badge}
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
              {t.hero.title}
            </h1>
            <p className="text-xl text-text/60 max-w-lg mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-accent text-brand px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-accent/20">
                {t.hero.cta1}
              </button>
              <button className="border border-text/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-surface transition-colors">
                {t.hero.cta2}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* 2. Feature: Dynamic Market Visualization Deck */}
            <div className="bg-brand-light/40 backdrop-blur-2xl border border-text/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold">{t.hero.indexTitle}</h3>
                  <p className="text-xs text-text/40">{t.hero.indexSubtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-accent font-mono font-bold">+4.2%</span>
                  <p className="text-[10px] text-text/40 uppercase tracking-widest">{t.hero.changeLabel}</p>
                </div>
              </div>
              
              <div className="h-64 w-full relative">
                {loadingMarket && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-brand/50 backdrop-blur-sm rounded-xl">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['auto', 'auto']} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a2540', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      itemStyle={{ color: '#00d4ff' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#00d4ff" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">{t.hero.volatility}</p>
                  <p className="font-mono font-bold text-sm text-accent">{t.hero.low}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">{t.hero.sentiment}</p>
                  <p className="font-mono font-bold text-sm text-accent">{t.hero.bullish}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">{t.hero.liquidity}</p>
                  <p className="font-mono font-bold text-sm text-accent">{t.hero.high}</p>
                </div>
              </div>
            </div>

            {/* Floating Info Card */}
            <div className="absolute -bottom-6 -left-6 bg-white text-brand p-6 rounded-2xl shadow-xl max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-accent-deep" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{t.hero.verified}</span>
              </div>
              <p className="text-xs font-medium leading-tight">{t.hero.sourceInfo}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Feature: Global Time & IP Localization Hub */}
      <section className="py-12 bg-brand-light/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{t.hub.time}</p>
              <p className="text-2xl font-mono font-bold">{format(time, 'HH:mm:ss')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <MapPin className="w-6 h-6 text-accent-deep" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{t.hub.access}</p>
              <p className="text-lg font-bold">
                {location ? `${location.city}, ${location.country_name}` : t.hub.detecting}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{t.hub.grid}</p>
              <p className="text-lg font-bold">{t.hub.optimized} {location?.timezone || 'GMT'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature: AI-Driven Industrial Predictor */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-brand-light to-brand border border-text/10 rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Cpu className="w-64 h-64 text-accent" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold mb-6 tracking-tight">{t.predictor.title}</h2>
            <p className="text-text/60 mb-8 leading-relaxed">
              {t.predictor.description}
            </p>
            
            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                placeholder={t.predictor.placeholder}
                className="flex-1 bg-surface border border-text/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchInsight((e.target as HTMLInputElement).value);
                }}
              />
              <button 
                onClick={() => fetchInsight("Current energy trends")}
                className="bg-accent text-brand p-3 rounded-full hover:scale-105 transition-transform shadow-lg shadow-accent/20"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-brand/40 border border-text/5 rounded-2xl p-6 min-h-[120px] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.predictor.engine}</span>
              </div>
              {loadingInsight ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <p className="text-sm text-text/80 italic leading-relaxed">
                  "{aiInsight || t.predictor.default}"
                </p>
              )}
              {insightSources.length > 0 && !loadingInsight && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-bold text-text/40 uppercase tracking-widest mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {insightSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-accent hover:underline bg-accent/5 px-2 py-1 rounded-md border border-accent/10"
                      >
                        {source.title || "Source"}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CEO's Vision & Our Story */}
      <section id="story" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 relative group bg-brand-light/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={journeyStep}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={`https://picsum.photos/seed/journey-${journeyStep}/800/1000`} 
                    alt="Survvi Opulence Insights Journey" 
                    className="w-full h-full object-cover grayscale opacity-40"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/40 to-transparent" />
                  
                  {/* Infographic Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className={cn("mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl", journeyData[journeyStep].color)}
                    >
                      {journeyData[journeyStep].icon}
                    </motion.div>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-2"
                    >
                      {journeyData[journeyStep].year}
                    </motion.p>
                    <motion.h4
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl font-bold mb-4 tracking-tight"
                    >
                      {journeyData[journeyStep].title}
                    </motion.h4>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed"
                    >
                      {journeyData[journeyStep].description}
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicators */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {journeyData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setJourneyStep(i)}
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      journeyStep === i ? "w-8 bg-accent" : "w-2 bg-white/20"
                    )}
                  />
                ))}
              </div>
              
              <div className="absolute top-8 left-8 z-20">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand/80 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
                  <Play className="w-3 h-3 text-accent" />
                  Animated Journey
                </div>
              </div>
            </div>

            {/* Floating Quote */}
            <div className="absolute -right-8 top-1/4 bg-accent text-brand p-8 rounded-2xl shadow-2xl max-w-xs hidden lg:block z-30">
              <MessageSquare className="w-8 h-8 mb-4 opacity-50" />
              <p className="text-lg font-bold leading-tight italic">
                "Industrial intelligence isn't just about data; it's about the legacy we build for the next century."
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
              <Target className="w-3 h-3" />
              The Genesis
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8">A Vision Born from <span className="text-accent">Industrial Grit</span>.</h2>
            <div className="space-y-6 text-text/60 leading-relaxed">
              <p>
                Survvi Opulence Insights was born from a powerful synergy between two industry veterans. For the past 7 years, Co-Managing Directors Prashant Singh and Carolina Pereira have worked side-by-side, navigating the complex intersections of global industrial management and predictive analytics.
              </p>
              <p>
                "We saw brilliant engineers struggling with fragmented data, and visionary leaders blinded by supply chain opacity," says Carolina Pereira. "Our vision for Survvi was to bridge that gap. We aren't just consultants; we are architects of the new industrial era, bringing opulence and precision to market intelligence."
              </p>
              <p>
                Their decision to found Survvi Opulence Insights was driven by a single mission: to provide the global industrial sector with the same level of technological sophistication that the financial and tech sectors have enjoyed for years. By blending Carolina's strategic foresight with deep proprietary AI, they have built a firm that doesn't just predict the future—it builds it.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-white/5">
              <div>
                <p className="text-3xl font-bold text-accent mb-1">7+</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Years of Synergy</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent mb-1">500+</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Global Projects</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Feature: Our Methodology */}
      <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Layers className="w-3 h-3" />
            The Survvi Opulence Insights Way
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">Our Methodology: <span className="text-accent">The Flight Deck</span></h2>
          <p className="text-white/40 max-w-3xl mx-auto text-lg leading-relaxed">
            Prashant Singh designed "The Flight Deck"—a proprietary consulting framework that treats corporate strategy like a high-performance aircraft. We don't just give advice; we provide the instrumentation, the navigation, and the propulsion required to reach new heights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <FeatureCard 
            index={0}
            icon={TrendingUp}
            title="Predictive Commodity Arbitrage"
            description="Real-time algorithmic forecasting for raw material procurement optimization."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={1}
            icon={Building2}
            title="Smart Material Digital Twins"
            description="Virtualizing building material performance in diverse global climates."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={2}
            icon={Zap}
            title="Energy Transition Modeling"
            description="Strategic roadmaps for legacy energy firms pivoting to renewables."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={3}
            icon={Globe}
            title="Geo-Political Risk Engine"
            description="Mapping supply chain vulnerabilities against real-time global events."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={4}
            icon={Layers}
            title="Circular Economy Integration"
            description="Transforming industrial waste into high-value building material inputs."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={5}
            icon={BarChart3}
            title="Quantum Market Simulations"
            description="Simulating 10,000+ market scenarios to stress-test corporate strategies."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={6}
            icon={Compass}
            title="ESG Compliance Automation"
            description="Real-time tracking of carbon footprints across global operations."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={7}
            icon={Cpu}
            title="Industrial IoT Consulting"
            description="Optimizing factory floor efficiency through neural network integration."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={8}
            icon={ShieldCheck}
            title="Blockchain Supply Chain"
            description="Immutable provenance tracking for ethical material sourcing."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={9}
            icon={Users}
            title="Global Talent Synthesis"
            description="Connecting top-tier industrial experts with niche market challenges."
            onOpenMethodology={openMethodology}
          />
        </div>

        {/* Real-time News Feed */}
        <div className="mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">{t.news.title}</h3>
              <p className="text-white/40 mt-2">{t.news.subtitle}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Globe className="w-3 h-3" />
                  {t.news.filters.source}
                </div>
                <select 
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-brand-light/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">{t.news.filters.allSources}</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Clock className="w-3 h-3" />
                  {t.news.filters.date}
                </div>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-brand-light/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">{t.news.filters.allDates}</option>
                  {uniqueDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <ShieldAlert className="w-3 h-3" />
                  {t.news.filters.risk}
                </div>
                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-brand-light/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">{t.news.filters.allRisks}</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Activity className="w-3 h-3" />
                  {t.news.filters.industry}
                </div>
                <select 
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="bg-brand-light/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">{t.news.filters.allIndustries}</option>
                  {uniqueIndustries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Activity className="w-3 h-3" />
                  {t.news.filters.sort}
                </div>
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-brand-light/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="relevance_desc">{t.news.filters.sortOptions.relevanceDesc}</option>
                  <option value="date_desc">{t.news.filters.sortOptions.dateDesc}</option>
                  <option value="date_asc">{t.news.filters.sortOptions.dateAsc}</option>
                  <option value="risk_desc">{t.news.filters.sortOptions.riskDesc}</option>
                  <option value="risk_asc">{t.news.filters.sortOptions.riskAsc}</option>
                </select>
              </div>

              {(sourceFilter || dateFilter || riskFilter || industryFilter || sortOption !== "date_desc") && (
                <button 
                  onClick={() => {
                    setSourceFilter("");
                    setDateFilter("");
                    setRiskFilter("");
                    setIndustryFilter("");
                    setSortOption("date_desc");
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
                >
                  {t.news.filters.clear}
                </button>
              )}

              <button 
                onClick={fetchNews}
                className="flex items-center gap-2 text-accent text-sm font-bold hover:text-accent/80 transition-colors ml-2"
              >
                <Activity className={cn("w-4 h-4", loadingNews && "animate-spin")} />
                Refresh Feed
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingNews ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-brand-light/30 rounded-2xl animate-pulse border border-white/5" />
              ))
            ) : filteredNews.length > 0 ? (
              filteredNews.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-brand-light/30 border border-white/5 rounded-2xl hover:border-accent/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{item.source}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">{item.date}</span>
                        <span className="text-[8px] text-white/10">•</span>
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest",
                          item.riskLevel === 'High' ? "text-red-400" : 
                          item.riskLevel === 'Medium' ? "text-amber-400" : 
                          "text-emerald-400"
                        )}>
                          {item.riskLevel} Risk
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          toggleSaveWorkspace(item, 'news');
                        }}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          workspace.find(i => i.title === item.title) ? "bg-accent text-brand" : "bg-white/5 text-white/40 hover:text-white"
                        )}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold mb-3 leading-tight group-hover:text-accent transition-colors">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                  </h4>
                  <p className="text-sm text-white/40 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-white/20 italic border border-dashed border-white/10 rounded-2xl">
                No articles match the selected filters.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Feature: Interactive Material Library (3D Cards) */}
      <section id="materials" className="py-24 bg-brand-light/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                <Building2 className="w-3 h-3" />
                Sector Story
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">The Future of Foundations</h2>
              <p className="text-white/50">
                Kunwar's vision for building materials goes beyond supply chains. It's about the "Molecular Revolution"—transforming how we perceive the very atoms of our infrastructure. We don't just track cement; we track the evolution of human shelter.
              </p>
            </div>
            <button className="flex items-center gap-2 text-accent font-bold hover:gap-4 transition-all">
              Explore the Narrative <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Self-Healing Concrete', source: 'ETH Zurich', img: 'https://picsum.photos/seed/concrete/800/600' },
              { name: 'Aerogel Insulation', source: 'NASA Spinoff', img: 'https://picsum.photos/seed/aerogel/800/600' },
              { name: 'Transparent Wood', source: 'KTH Royal Institute', img: 'https://picsum.photos/seed/wood/800/600' },
              { name: 'Graphene Steel', source: 'Manchester Graphene', img: 'https://picsum.photos/seed/graphene/800/600' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="relative group overflow-hidden rounded-2xl aspect-[3/4] shadow-xl"
              >
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Source: {item.source}</p>
                  <h4 className="text-lg font-bold leading-tight">{item.name}</h4>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Feature: Energy Transition Tracker (Live Data) */}
      <section id="energy" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" />
              Energy Narrative
            </div>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Powering the Transition</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              "Energy is the lifeblood of civilization, but its current form is unsustainable," Kunwar notes. Our energy story is one of transition—moving from extraction to optimization. We help legacy giants navigate the turbulent waters of decarbonization while ensuring global stability.
            </p>
            <div className="space-y-8">
              {[
                { label: 'Renewable Integration', value: 34, color: 'bg-accent' },
                { label: 'Fossil Fuel Decoupling', value: 18, color: 'bg-accent-deep' },
                { label: 'Grid Modernization', value: 56, color: 'bg-yellow-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-white/70">{item.label}</span>
                    <span className="text-sm font-bold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={cn("h-full rounded-full", item.color)} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-12 text-white/40 text-sm italic">
              *Data aggregated from International Energy Agency (IEA) and BloombergNEF. 
              Updated daily at 00:00 GMT.
            </p>
          </div>
          
          {/* 6. Astraeus News Hub */}
          <section id="news" className="py-24 px-6 bg-brand-light/20 relative overflow-hidden rounded-3xl mb-12 border border-white/5">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col items-center text-center mb-16 gap-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Newspaper className="w-3 h-3" />
                    Global Intelligence
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">{t.news.title}</h2>
                  <p className="text-white/40 text-lg">
                    {t.news.subtitle}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {NEWS_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => {
                          setActiveNewsTopic(topic);
                          trackUsage(topic);
                        }}
                        onMouseEnter={() => {
                          fetchNewsletter(topic, newsletterDate);
                        }}
                        className={cn(
                          "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                          activeNewsTopic === topic 
                            ? "bg-accent text-brand border-accent shadow-lg shadow-accent/20" 
                            : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
                        )}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                    <Clock className="w-3 h-3 text-accent" />
                    <input 
                      type="date" 
                      value={newsletterDate}
                      onChange={(e) => setNewsletterDate(e.target.value)}
                      min="2026-03-16"
                      max="2026-12-31"
                      className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 max-w-5xl mx-auto">
                {/* 🚨 Geopolitical Risk Flash Bulletins Widget */}
                <div className="w-full bg-brand/50 border border-white/10 rounded-3xl p-5 lg:p-6 backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/35 rounded text-[8px] font-extrabold text-red-400 tracking-wider">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" />
                        LIVE INTEL FEED
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">Sovereign Geopolitical Alerts</span>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <button 
                        onClick={() => {
                          setDiscloseBulletin(false);
                          setActiveBulletinIdx(prev => (prev === 0 ? GEOPOLITICAL_BULLETINS.length - 1 : prev - 1));
                        }}
                        className="p-1 hover:bg-white/5 rounded border border-white/5 text-white/40 hover:text-white transition-all text-xs"
                      >
                        ◀
                      </button>
                      <span className="text-[9px] font-mono text-white/40">{activeBulletinIdx + 1} / {GEOPOLITICAL_BULLETINS.length}</span>
                      <button 
                        onClick={() => {
                          setDiscloseBulletin(false);
                          setActiveBulletinIdx(prev => (prev === GEOPOLITICAL_BULLETINS.length - 1 ? 0 : prev + 1));
                        }}
                        className="p-1 hover:bg-white/5 rounded border border-white/5 text-white/40 hover:text-white transition-all text-xs"
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-widest font-mono",
                          GEOPOLITICAL_BULLETINS[activeBulletinIdx].threat === 'critical' ? 'bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse' :
                          GEOPOLITICAL_BULLETINS[activeBulletinIdx].threat === 'moderate' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                          GEOPOLITICAL_BULLETINS[activeBulletinIdx].threat === 'optimal' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                          'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        )}>
                          THREAT LEVEL: {GEOPOLITICAL_BULLETINS[activeBulletinIdx].threat}
                        </span>
                        <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].topic}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-tight leading-relaxed">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].title}</h4>
                    </div>

                    <button 
                      onClick={() => setDiscloseBulletin(!discloseBulletin)}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-accent hover:text-brand border border-white/10 hover:border-accent rounded-full text-[9px] font-extrabold uppercase tracking-widest transition-all shrink-0"
                    >
                      {discloseBulletin ? 'Close Assessment' : 'Disclose Assessment'}
                    </button>
                  </div>

                  {/* Bulletin disclosure drawer */}
                  <AnimatePresence>
                    {discloseBulletin && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 border-t border-white/5 pt-4"
                      >
                        <div className="grid sm:grid-cols-3 gap-4 text-[10px]">
                          <div className="p-3 bg-brand-light/30 border border-white/5 rounded-xl">
                            <span className="text-white/40 uppercase font-bold tracking-wider block mb-1">Target Commodities</span>
                            <span className="text-white font-extrabold text-xs">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].commodity}</span>
                          </div>
                          <div className="p-3 bg-brand-light/30 border border-white/5 rounded-xl">
                            <span className="text-white/40 uppercase font-bold tracking-wider block mb-1">Estimated Industry Impact</span>
                            <span className="text-white/80 leading-relaxed block">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].impact}</span>
                          </div>
                          <div className="p-3 bg-brand-light/30 border border-white/5 rounded-xl">
                            <span className="text-accent uppercase font-bold tracking-wider block mb-1">Tactical Action Counter-Measure</span>
                            <span className="text-white/95 font-semibold leading-relaxed block">{GEOPOLITICAL_BULLETINS[activeBulletinIdx].action}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Interactive Search, Filters, and Briefcase Drawer */}
                <div className="w-full flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mt-4">
                  <div className="flex flex-1 flex-wrap gap-3 items-center">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search bulletins..."
                        value={newsSearchQuery}
                        onChange={(e) => setNewsSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent/40 transition-all"
                      />
                      {newsSearchQuery && (
                        <button 
                          onClick={() => setNewsSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-extrabold uppercase tracking-wider text-accent hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Sentiment Dropdown */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 min-w-[140px]">
                      <span className="text-white/40 text-[9px] font-extrabold uppercase tracking-widest shrink-0">Sentiment:</span>
                      <select
                        value={newsSentimentFilter}
                        onChange={(e) => setNewsSentimentFilter(e.target.value)}
                        className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer flex-1"
                      >
                        <option value="All" className="bg-brand text-white">All</option>
                        <option value="Bullish" className="bg-brand text-emerald-400">📈 Bullish</option>
                        <option value="Bearish" className="bg-brand text-rose-400">📉 Bearish</option>
                        <option value="Neutral" className="bg-brand text-amber-400">⚖️ Neutral</option>
                      </select>
                    </div>

                    {/* Impact Dropdown */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 min-w-[130px]">
                      <span className="text-white/40 text-[9px] font-extrabold uppercase tracking-widest shrink-0">Impact:</span>
                      <select
                        value={newsImpactFilter}
                        onChange={(e) => setNewsImpactFilter(e.target.value)}
                        className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer flex-1"
                      >
                        <option value="All" className="bg-brand text-white">All</option>
                        <option value="High" className="bg-brand text-red-400">High</option>
                        <option value="Medium" className="bg-brand text-amber-400">Medium</option>
                        <option value="Low" className="bg-brand text-blue-400">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Briefcase Button */}
                  <button
                    onClick={() => setIsBriefcaseOpen(!isBriefcaseOpen)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all border shrink-0",
                      isBriefcaseOpen || pinnedNews.length > 0
                        ? "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20"
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                    )}
                  >
                    <Bookmark className={cn("w-3.5 h-3.5", pinnedNews.length > 0 && "fill-accent text-accent")} />
                    Briefcase
                    {pinnedNews.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-accent text-brand text-[9px] font-black ml-1 animate-pulse">
                        {pinnedNews.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Collapsible Intelligence Briefcase Panel */}
                <AnimatePresence>
                  {isBriefcaseOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -20, height: 0 }}
                      className="w-full bg-accent/5 border border-accent/20 rounded-3xl p-6 overflow-hidden backdrop-blur-md text-left"
                    >
                      <div className="flex items-center justify-between border-b border-accent/10 pb-4 mb-4">
                        <div className="flex items-center gap-2.5">
                          <Bookmark className="w-5 h-5 text-accent fill-accent" />
                          <div>
                            <h4 className="text-sm font-extrabold text-white tracking-wider uppercase">My Intelligence Briefcase</h4>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Curate dynamic bulletins for advanced tactical synthesis</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {pinnedNews.length > 0 && (
                            <button
                              onClick={() => setPinnedNews([])}
                              className="text-white/40 hover:text-red-400 text-[10px] font-extrabold uppercase tracking-widest transition-colors"
                            >
                              Clear All
                            </button>
                          )}
                          <button
                            onClick={() => setIsBriefcaseOpen(false)}
                            className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {pinnedNews.length === 0 ? (
                        <div className="text-center py-8 text-white/30 text-xs italic">
                          Your briefcase is empty. Click the bookmark icon on any bulletin below to pin it here.
                        </div>
                      ) : (
                        <div className="grid lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {pinnedNews.map((article, idx) => (
                              <div 
                                key={idx} 
                                className="group flex items-start justify-between gap-4 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-accent/20 transition-all"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-[9px] font-bold text-accent uppercase tracking-wider">{article.source}</span>
                                    {article.sentiment && (
                                      <span className={cn(
                                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                                        article.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-400" :
                                        article.sentiment === "Bearish" ? "bg-red-500/10 text-red-400" :
                                        "bg-white/5 text-white/40"
                                      )}>
                                        {article.sentiment}
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="text-xs font-bold text-white leading-snug line-clamp-1 group-hover:text-accent transition-colors">
                                    {article.title}
                                  </h5>
                                  <p className="text-[10px] text-white/40 line-clamp-1 mt-0.5 leading-relaxed">
                                    {article.summary}
                                  </p>
                                </div>
                                <button
                                  onClick={() => togglePinNews(article)}
                                  className="p-1 text-white/30 hover:text-red-400 hover:bg-white/5 rounded transition-all shrink-0"
                                  title="Remove from briefcase"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">Strategic Synthesis Brief</span>
                                {briefcaseAnalysis && (
                                  <button
                                    onClick={() => {
                                      const element = document.createElement("a");
                                      const file = new Blob([briefcaseAnalysis], {type: 'text/plain'});
                                      element.href = URL.createObjectURL(file);
                                      element.download = `Sovereign_Briefing_${new Date().toISOString().split('T')[0]}.txt`;
                                      document.body.appendChild(element);
                                      element.click();
                                      document.body.removeChild(element);
                                    }}
                                    className="flex items-center gap-1 text-[9px] font-bold text-white/50 hover:text-accent uppercase tracking-widest transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Export Brief
                                  </button>
                                )}
                              </div>

                              {synthesizingBriefcase ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 animate-pulse">Running Deep Sovereign Synthesis Engine...</span>
                                  <span className="text-[8px] text-accent/50 font-mono mt-1">CROSS-CORRELATING REGIONAL TARIFFS & ENERGY FLOWS...</span>
                                </div>
                              ) : briefcaseAnalysis ? (
                                <div className="bg-brand-light/30 border border-white/5 rounded-xl p-4 text-[11px] leading-relaxed text-white/80 max-h-[180px] overflow-y-auto whitespace-pre-line text-left custom-scrollbar">
                                  {briefcaseAnalysis}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                                  <Sparkles className="w-5 h-5 text-accent/40 mb-2 animate-pulse" />
                                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Strategic Synthesis Idle</p>
                                  <p className="text-[9px] text-white/30 mt-1 max-w-xs">Click synthesize below to run our sovereign LLM over your selection.</p>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/5">
                              <button
                                onClick={handleSynthesizeBriefcase}
                                disabled={synthesizingBriefcase || pinnedNews.length === 0}
                                className="w-full py-2.5 bg-accent text-brand rounded-xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-accent/10"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Synthesize Selected ({pinnedNews.length}) bulletins
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Featured Article */}
                <div className="w-full">
                  {loadingNewsletter ? (
                    <div className="aspect-video bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredNewsletterNews.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative aspect-[16/10] lg:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 bg-brand"
                    >
                      <img 
                        src={`https://picsum.photos/seed/${activeNewsTopic}-featured/1200/800`} 
                        alt={filteredNewsletterNews[0].title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/40 to-transparent" />
                      <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end items-center text-center">
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                          <span className="px-3 py-1 rounded-full bg-accent text-brand text-[10px] font-bold uppercase tracking-widest">Featured</span>
                          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{filteredNewsletterNews[0].date}</span>
                          
                          {/* Sentiment Pill */}
                          {(filteredNewsletterNews[0].sentiment || "Neutral") && (
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1",
                              (filteredNewsletterNews[0].sentiment || "Neutral") === "Bullish" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              (filteredNewsletterNews[0].sentiment || "Neutral") === "Bearish" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                              "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            )}>
                              {(filteredNewsletterNews[0].sentiment || "Neutral") === "Bullish" ? <TrendingUp className="w-3 h-3" /> : null}
                              {(filteredNewsletterNews[0].sentiment || "Neutral") === "Bearish" ? <ArrowDownRight className="w-3 h-3" /> : null}
                              {filteredNewsletterNews[0].sentiment || "Neutral"}
                            </span>
                          )}

                          {/* Impact Pill */}
                          {(filteredNewsletterNews[0].impact || "Medium") && (
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                              (filteredNewsletterNews[0].impact || "Medium") === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                              (filteredNewsletterNews[0].impact || "Medium") === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                              "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            )}>
                              Impact: {filteredNewsletterNews[0].impact || "Medium"}
                            </span>
                          )}
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight tracking-tight group-hover:text-accent transition-colors max-w-3xl mx-auto">
                          {filteredNewsletterNews[0].title}
                        </h3>
                        <p className="text-white/60 text-lg mb-8 line-clamp-3 leading-relaxed max-w-2xl mx-auto">
                          {filteredNewsletterNews[0].summary}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-xs uppercase tracking-widest">Source:</span>
                            <span className="text-accent text-xs font-bold uppercase tracking-widest">{filteredNewsletterNews[0].source}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Pin Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinNews(filteredNewsletterNews[0]);
                              }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                                pinnedNews.some(item => item.title === filteredNewsletterNews[0].title)
                                  ? "bg-accent text-brand border-accent"
                                  : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                              )}
                            >
                              <Bookmark className={cn("w-3 h-3", pinnedNews.some(item => item.title === filteredNewsletterNews[0].title) && "fill-brand")} />
                              {pinnedNews.some(item => item.title === filteredNewsletterNews[0].title) ? "Pinned" : "Pin Article"}
                            </button>

                            <button className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-xs group/btn">
                              Read Full Insight
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="aspect-video bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-white/30">
                      <Newspaper className="w-10 h-10 text-white/20 mb-3" />
                      <p className="text-base font-bold text-white/60">No items match filters</p>
                      <p className="text-xs text-white/40 mt-1 mb-4">Try relaxing your search query or sentiment options.</p>
                      <button
                        onClick={() => {
                          setNewsSearchQuery("");
                          setNewsSentimentFilter("All");
                          setNewsImpactFilter("All");
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Sidebar Articles -> Now Below Featured */}
                <div className="w-full grid md:grid-cols-2 gap-6">
                  {loadingNewsletter ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                    ))
                  ) : filteredNewsletterNews.slice(1).map((article, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-accent/30 transition-all cursor-pointer flex flex-col items-start text-left relative"
                    >
                      <div className="flex items-center justify-between w-full mb-3 gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-accent text-[10px] font-bold uppercase tracking-widest">{article.source}</span>
                          <span className="w-1 h-1 bg-white/20 rounded-full" />
                          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{article.date}</span>
                          
                          {/* Sentiment badges */}
                          {article.sentiment && (
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                              article.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-400" :
                              article.sentiment === "Bearish" ? "bg-rose-500/10 text-rose-400" :
                              "bg-amber-500/10 text-amber-400"
                            )}>
                              {article.sentiment}
                            </span>
                          )}

                          {/* Impact badges */}
                          {article.impact && (
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                              article.impact === "High" ? "bg-red-500/10 text-red-400" :
                              article.impact === "Medium" ? "bg-amber-500/10 text-amber-400" :
                              "bg-blue-500/10 text-blue-400"
                            )}>
                              {article.impact}
                            </span>
                          )}
                        </div>

                        {/* Pin bookmark icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinNews(article);
                          }}
                          className="p-1 hover:bg-white/5 rounded-full text-white/40 hover:text-accent transition-all shrink-0"
                          title="Pin bulletin"
                        >
                          <Bookmark className={cn("w-3.5 h-3.5", pinnedNews.some(item => item.title === article.title) && "fill-accent text-accent")} />
                        </button>
                      </div>

                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-white/40 text-sm line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <AIDispatchCompiler articles={filteredNewsletterNews} topic={activeNewsTopic} />
              </div>

              <NewsletterSubscription />
            </div>
          </section>

          <div id="research" className="bg-brand-light/30 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8 border-b border-white/5 pb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                <Search className="w-3 h-3" />
                Intelligence Story
              </div>
              <h3 className="text-2xl font-bold mb-4">The Industrial Oracle</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                "Data without context is just noise," Kunwar often says. Our Research Hub is the "Industrial Oracle"—a synthesis of human expertise and machine learning that filters the global noise into actionable strategic signals. We don't just report on markets; we interpret their soul.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold">{t.research.title}</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSynthesizeSectorOutlook}
                  disabled={synthesizingSector}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Synthesize Sector Outlook</span>
                </button>
                <button
                  onClick={handleGeneratePdf}
                  disabled={generatingPdf}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-accent text-brand hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingPdf ? (
                    <>
                      <div className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t.research.generatingPdf}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t.research.generatePdf}</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-accent/10 border border-accent/20">
                  <Globe className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.research.subtitle}</span>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'materials', label: t.sectors.materials },
                { id: 'energy', label: t.sectors.energy },
                { id: 'shipping', label: t.sectors.shipping },
                { id: 'steel', label: t.sectors.steel },
                { id: 'chemicals', label: t.sectors.chemicals },
                { id: 'mining', label: t.sectors.mining },
                { id: 'agribusiness', label: t.sectors.agribusiness },
                { id: 'logistics', label: t.sectors.logistics },
                { id: 'ai', label: t.sectors.ai },
                { id: 'pharma', label: t.sectors.pharma },
                { id: 'other', label: t.sectors.other }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveResearchTab(tab.id as any);
                    setResearchSourceFilter("");
                    setResearchDateFilter("");
                    trackUsage(tab.id);
                  }}
                  onMouseEnter={() => {
                    // Predictive Pre-fetching
                    fetchResearch(tab.id as any);
                  }}
                  className={cn(
                    "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                    activeResearchTab === tab.id 
                      ? "border-accent text-accent" 
                      : "border-transparent text-white/40 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sector Outlook Collapsible Panel */}
            <AnimatePresence>
              {showSectorSynthesisModal && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-6 bg-accent/5 border border-accent/20 rounded-3xl overflow-hidden text-left"
                >
                  <div className="flex items-center justify-between border-b border-accent/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-white">Sovereign Sector Macro-Outlook: {activeResearchTab.toUpperCase()}</h4>
                    </div>
                    <button
                      onClick={() => setShowSectorSynthesisModal(false)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {synthesizingSector ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 animate-pulse">Assembling Sovereign Micro-Outlook Matrix...</span>
                      <span className="text-[8px] text-accent/50 font-mono mt-1">CROSS-CORRELATING REGIONAL DATA SOURCES...</span>
                    </div>
                  ) : sectorSynthesis ? (
                    <div className="space-y-4">
                      <div className="text-xs leading-relaxed text-white/80 whitespace-pre-line bg-brand-light/20 border border-white/5 rounded-xl p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {sectorSynthesis}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const element = document.createElement("a");
                            const file = new Blob([sectorSynthesis], {type: 'text/plain'});
                            element.href = URL.createObjectURL(file);
                            element.download = `Sovereign_Sector_Outlook_${activeResearchTab}_${new Date().toISOString().split('T')[0]}.txt`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                          }}
                          className="flex items-center gap-1.5 text-[9px] font-bold text-accent hover:text-white uppercase tracking-widest transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Sector Outlook
                        </button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t.research.filters.source}</label>
                <select 
                  value={researchSourceFilter}
                  onChange={(e) => setResearchSourceFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="" className="bg-brand">{t.research.filters.allSources}</option>
                  {researchSources.map(source => (
                    <option key={source} value={source} className="bg-brand">{source}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t.research.filters.date}</label>
                <select 
                  value={researchDateFilter}
                  onChange={(e) => setResearchDateFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="" className="bg-brand">{t.research.filters.allDates}</option>
                  {researchDates.map(date => (
                    <option key={date} value={date} className="bg-brand">{date}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Research Visualizations */}
            {!loadingResearch && researchChartData.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 grid md:grid-cols-2 gap-6"
              >
                {/* Bar Chart */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Type Distribution</h4>
                    <BarChart3 className="w-4 h-4 text-accent/40" />
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={researchChartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                          width={80}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ 
                            backgroundColor: '#0a0a0a', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '10px'
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                          {researchChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00d4ff' : '#0088aa'} />
                          ))}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Percentage Share</h4>
                    <Activity className="w-4 h-4 text-accent/40" />
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={researchChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {researchChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00d4ff' : '#0088aa'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0a0a0a', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '10px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeResearchTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {loadingResearch ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                  ))
                ) : (
                  filteredResearchReports.map((item, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <motion.div
                        onClick={() => handleFetchResearchInsight(item)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group border text-left",
                          selectedResearchItem?.title === item.title 
                            ? "border-accent bg-accent/5" 
                            : "border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                            selectedResearchItem?.title === item.title 
                              ? "bg-accent text-brand" 
                              : "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-brand"
                          )}>
                            {activeResearchTab === 'materials' ? <Building2 className="w-5 h-5" /> : 
                             activeResearchTab === 'energy' ? <Zap className="w-5 h-5" /> : 
                             activeResearchTab === 'shipping' ? <Compass className="w-5 h-5" /> :
                             activeResearchTab === 'steel' ? <Layers className="w-5 h-5" /> :
                             activeResearchTab === 'chemicals' ? <Activity className="w-5 h-5" /> :
                             activeResearchTab === 'mining' ? <Target className="w-5 h-5" /> :
                             <Cpu className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold group-hover:text-accent transition-colors truncate">{item.title}</h4>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 flex-wrap">
                              <span className="text-accent/60 font-black">{item.source}</span>
                              <span className="w-1 h-1 bg-white/20 rounded-full" />
                              <span>{item.type}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <span className="text-xs text-white/40 whitespace-nowrap hidden sm:block">{item.date}</span>
                          
                          {/* AI Action Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFetchResearchInsight(item);
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              selectedResearchItem?.title === item.title
                                ? "bg-accent text-brand"
                                : "bg-white/5 text-accent hover:bg-accent/10"
                            )}
                            title="Generate AI Sovereign Deep Dive Abstract"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Save bookmark button */}
                          <button 
                            onClick={(e) => {
                              e.preventDefault(); e.stopPropagation();
                              toggleSaveWorkspace(item, 'research');
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              workspace.find(i => i.title === item.title) ? "bg-accent text-brand" : "bg-white/5 text-white/40 hover:text-white"
                            )}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-accent transition-all"
                              title="Open source publication URL"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </motion.div>

                      {/* Expanded Abstract Drawer */}
                      <AnimatePresence>
                        {selectedResearchItem?.title === item.title && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-brand-light/20 border border-accent/20 rounded-xl p-5 ml-4 sm:ml-14 text-left overflow-hidden text-xs"
                          >
                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-accent" />
                                On-Demand AI Intelligence Dossier
                              </span>
                              <button 
                                onClick={() => setSelectedResearchItem(null)}
                                className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest"
                              >
                                Close
                              </button>
                            </div>

                            {loadingResearchInsight ? (
                              <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest animate-pulse">Securing satellite ground intelligence feed...</span>
                              </div>
                            ) : selectedResearchInsight ? (
                              <div className="text-white/80 leading-relaxed whitespace-pre-line">
                                {selectedResearchInsight}
                              </div>
                            ) : (
                              <span className="text-white/40 italic">Could not load insight. Please try again.</span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
                {!loadingResearch && (!researchReports[activeResearchTab] || researchReports[activeResearchTab].length === 0) && (
                  <p className="text-center text-white/40 py-8">No research reports found for this category.</p>
                )}
                
                <div className="pt-6 border-t border-white/5 mt-6">
                  <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest">
                    <p>Sourcing: IEA, Bloomberg, Reuters, Deloitte, McKinsey</p>
                    <p>Updated: {format(new Date(), 'MMM yyyy')}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Sovereign Geopolitical Stress-Testing Sandbox */}
            <div className="mt-12 pt-8 border-t border-white/10 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                <ShieldAlert className="w-3 h-3" />
                Stress-Testing Suite
              </div>
              <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Dynamic Macro Geopolitical Stress Sandbox</h4>
              <p className="text-white/40 text-xs leading-relaxed mb-6">
                Test the resilience of the <span className="text-accent font-extrabold">{activeResearchTab.toUpperCase()}</span> sector under catastrophic geopolitical shocks. Run advanced stress simulations to identify supply-chain vulnerabilities and formulate sovereign hedging playbooks.
              </p>

              <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                {/* Control Panel */}
                <div className="lg:col-span-5 bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-3">Select Geopolitical Stressor</label>
                    <div className="space-y-2.5">
                      {[
                        { label: "OPEC+ Sudden Supply Cut (-15% Global Production)", icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
                        { label: "Sino-US Sea Route Blockade (Malacca Strait Interdiction)", icon: <Compass className="w-3.5 h-3.5 text-blue-400" /> },
                        { label: "US Federal Reserve Stagflation Hard-Landing (+150bps)", icon: <TrendingUp className="w-3.5 h-3.5 text-red-400" /> },
                        { label: "Sovereign Debt Default & Sudden Currency Devaluations", icon: <Layers className="w-3.5 h-3.5 text-purple-400" /> }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            setStressScenario(item.label);
                            setStressTestResult(null);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-xs text-left",
                            stressScenario === item.label
                              ? "bg-red-500/10 border-red-500/30 text-white font-bold"
                              : "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                          )}
                        >
                          {item.icon}
                          <span className="line-clamp-1">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleRunStressTest}
                    disabled={runningStressTest}
                    className="w-full mt-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/10"
                  >
                    {runningStressTest ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Simulating Geopolitical Shocks...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Execute Stress Simulation
                      </>
                    )}
                  </button>
                </div>

                {/* Scoreboard Result Screen */}
                <div className="lg:col-span-7 bg-red-500/5 border border-red-500/10 rounded-2xl p-5 flex flex-col justify-between">
                  {runningStressTest ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400 animate-pulse">Running Geopolitical Monte Carlo Sandbox...</p>
                      <p className="text-[8px] text-white/30 font-mono mt-1">CALCULATING CRUDE PRICE ELASTICITY & SOVEREIGN DEFAULT INDEXES...</p>
                    </div>
                  ) : stressTestResult ? (
                    <div className="space-y-5">
                      {/* Metric Banner */}
                      <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">Sovereign Sector Impact Rating</span>
                          <h5 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">{stressTestResult.riskRating}</h5>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                          stressTestResult.ratingColor === "red" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          stressTestResult.ratingColor === "orange" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          stressTestResult.ratingColor === "yellow" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}>
                          {stressTestResult.riskRating}
                        </span>
                      </div>

                      {/* Slide bars */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* inflation */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                          <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                            <span>Cost Inflation Impact</span>
                            <span className="text-red-400 font-extrabold">+{stressTestResult.inflationImpactPercent}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-red-500 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${stressTestResult.inflationImpactPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* delay */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                          <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                            <span>Supply Delay Index</span>
                            <span className="text-amber-500 font-extrabold">+{stressTestResult.delayImpactPercent}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${stressTestResult.delayImpactPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Playbook narrative */}
                      <div className="space-y-2 text-left">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-red-400">Tactical Playbook Response</span>
                        <p className="text-xs font-bold text-white leading-relaxed">{stressTestResult.playbookSummary}</p>
                        <div className="text-[11px] leading-relaxed text-white/70 whitespace-pre-line bg-brand-light/30 border border-white/5 rounded-xl p-3 max-h-[140px] overflow-y-auto custom-scrollbar">
                          {stressTestResult.tacticalPlaybook}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                      <ShieldAlert className="w-6 h-6 text-red-400/40 mb-3 animate-pulse" />
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">Macro Geopolitical Stress Terminal Idle</p>
                      <p className="text-[9px] text-white/30 mt-1 max-w-xs">Select a catastrophic macro Geopolitical Shock Scenario on the left and execute the simulation.</p>
                    </div>
                  )}

                  {stressTestResult && (
                    <div className="mt-4 border-t border-red-500/10 pt-3 flex justify-between items-center text-[8px] text-white/30 font-mono">
                      <span>MONTE CARLO SEED: #{(Math.floor(Math.random() * 90000) + 10000)}</span>
                      <span>SURVVI CRITICAL SUITE V1.02</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Analysis Section */}
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Play className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-bold uppercase tracking-widest">Global Market Video Analysis</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'The Future of Green Cement', source: 'World Economic Forum', img: 'https://picsum.photos/seed/cement-video/400/225' },
                  { title: 'Energy Transition 2026', source: 'Bloomberg Markets', img: 'https://picsum.photos/seed/energy-video/400/225' }
                ].map((video, i) => (
                  <div key={i} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/5">
                    <img 
                      src={video.img} 
                      alt={video.title} 
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-brand/40 group-hover:bg-brand/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-brand to-transparent">
                      <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">{video.source}</p>
                      <p className="text-xs font-bold leading-tight line-clamp-1">{video.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section id="global-presence" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Navigation className="w-3 h-3" />
            Strategic Footprint
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Global <span className="text-accent">Project Network</span></h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            From the skyline of New York to the industrial hubs of Tokyo, Survvi Opulence Insights delivers digital foresight across the world's most critical markets.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <GlobalMap />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-brand transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Western Markets</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Strategic consulting for building materials and energy infrastructure across North America and Europe, focusing on decarbonization and digital twins.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-brand transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Middle East Hubs</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Optimizing energy grids and smart city infrastructure in Dubai and the GCC region through proprietary industrial AI and real-time analytics.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-brand transition-colors">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Asia-Pacific Growth</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Driving industrial consciousness in Tokyo and Southeast Asian manufacturing centers, bridging the gap between raw power and digital foresight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Modeler Section */}
      <section id="scenario-modeler" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative overflow-hidden rounded-[32px] my-4">
        <div className={cn("transition-all duration-700", !isPremium && "blur-md pointer-events-none opacity-20 select-none")}>
          <ScenarioModeler language={language} />
        </div>
        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30 bg-brand/40">
            <div className="max-w-md w-full bg-[#0a0d12]/95 border border-accent/30 rounded-[32px] p-8 text-center shadow-[0_0_50px_rgba(197,160,89,0.15)] flex flex-col items-center">
              <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent mb-4 shadow-lg shadow-accent/10 animate-pulse">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] bg-accent/10 px-3 py-1 rounded-full border border-accent/20 mb-3">Sovereign Feature</span>
              <h3 className="text-xl font-bold text-white mb-2">Scenario Intelligence Modeler</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Unlock dynamic scenario planning tools. Adjust carbon border adjustments, raw materials index, and logistical friction to simulate global industrial outcomes.
              </p>
              <button 
                onClick={() => { setUpgradePlan('sovereign'); setUpgradeStep(0); setShowSubscriptionModal(true); }}
                className="w-full bg-gradient-to-r from-accent to-amber-500 text-brand py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-103 transition-all shadow-lg shadow-accent/20"
              >
                Unlock Sovereign Analytics
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Predictive Analytics Section */}
      <section id="predictive-analytics" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative overflow-hidden rounded-[32px] my-4">
        <div className={cn("transition-all duration-700", !isPremium && "blur-md pointer-events-none opacity-20 select-none")}>
          <PredictiveAnalytics language={language} />
        </div>
        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30 bg-brand/40">
            <div className="max-w-md w-full bg-[#0a0d12]/95 border border-accent/30 rounded-[32px] p-8 text-center shadow-[0_0_50px_rgba(197,160,89,0.15)] flex flex-col items-center">
              <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent mb-4 shadow-lg shadow-accent/10 animate-pulse">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] bg-accent/10 px-3 py-1 rounded-full border border-accent/20 mb-3">Sovereign Feature</span>
              <h3 className="text-xl font-bold text-white mb-2">12-Month Predictive Forecasting</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Explore deep learning based multi-variate trend lines, global logistics projections, and raw commodity price forecasts.
              </p>
              <button 
                onClick={() => { setUpgradePlan('sovereign'); setUpgradeStep(0); setShowSubscriptionModal(true); }}
                className="w-full bg-gradient-to-r from-accent to-amber-500 text-brand py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-103 transition-all shadow-lg shadow-accent/20"
              >
                Unlock Sovereign Analytics
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Mining & IoT Stories */}
      <section id="mining-iot" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 bg-brand-light/20 rounded-[32px] border border-white/5 hover:border-accent/30 transition-all"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
              <Compass className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Mining & Metals: <span className="text-accent">Deep Earth Intelligence</span></h3>
            <p className="text-white/50 leading-relaxed mb-6">
              "We are moving from extraction to precision," Kunwar explains. Our Mining story is about the "Invisible Mine"—using AI and IoT to extract value with minimal footprint. We help firms transition to the "Green Metal" era, where efficiency is the new currency.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-accent">
              <span>Autonomous Operations</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Zero-Waste Extraction</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-10 bg-brand-light/20 rounded-[32px] border border-white/5 hover:border-accent/30 transition-all"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Industrial IoT: <span className="text-accent">The Neural Factory</span></h3>
            <p className="text-white/50 leading-relaxed mb-6">
              Kunwar's vision for IoT isn't just about sensors; it's about "Industrial Consciousness." We build the neural pathways that allow factories to sense, think, and adapt in real-time. It's the transition from static production to living systems.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-accent">
              <span>Predictive Maintenance</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Neural Optimization</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Client Intelligence Suite Section */}
      <section id="market-insights" className="py-24 px-6 max-w-7xl mx-auto">
        <MarketInsightTool />
      </section>
      
      <div className="relative overflow-hidden rounded-[40px] my-4">
        <div className={cn("transition-all duration-700", !isPremium && "blur-md pointer-events-none opacity-20 select-none")}>
          <ClientIntelligenceSuite language={language} />
        </div>
        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30 bg-brand/40">
            <div className="max-w-xl w-full bg-[#0a0d12]/95 border border-accent/30 rounded-[40px] p-10 text-center shadow-[0_0_50px_rgba(197,160,89,0.25)] flex flex-col items-center">
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent mb-6 shadow-lg shadow-accent/10 animate-pulse">
                <Cpu className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-accent uppercase tracking-[0.25em] bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 mb-4">Elite Intelligence Suite</span>
              <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Client Intelligence Decision Room</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-md mx-auto">
                Gain access to 16+ proprietary real-time industrial applications, including Arbitrage Spotters, Decarbonization Paybacks, Volatility Propagation models, and Geopolitical War-gaming panels.
              </p>
              <button 
                onClick={() => { setUpgradePlan('sovereign'); setUpgradeStep(0); setShowSubscriptionModal(true); }}
                className="bg-gradient-to-r from-accent to-amber-500 text-brand px-10 py-4.5 rounded-full font-bold text-sm uppercase tracking-[0.15em] hover:scale-105 transition-all shadow-xl shadow-accent/25 animate-pulse"
              >
                Unlock Elite Decision Suite
              </button>
            </div>
          </div>
        )}
      </div>

      <section id="pricing" className="py-24 bg-[#07090c] text-white border-y border-white/5 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.25em] bg-accent/10 px-3 py-1 rounded-full border border-accent/20">Sovereign Membership</span>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mt-4 mb-4">Choose Your Level of Foresight</h2>
            <p className="text-white/40 max-w-xl mx-auto text-base">
              Dual high-conviction tiers designed for institutional leaders to mitigate market volatility and command industrial consciousness.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Tier 1: Sovereign Analytics (With 14-Day Free Trial) */}
            <div className="p-8 bg-gradient-to-b from-accent/10 to-brand-light/20 rounded-3xl border border-accent/40 flex flex-col justify-between relative shadow-[0_0_40px_rgba(197,160,89,0.15)] hover:scale-[1.02] transition-all">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-brand text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-accent/20">
                14-DAY TRIAL AVAILABLE
              </span>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">Sovereign Analytics</span>
                </div>
                <p className="text-xs text-white/60 mb-6">Fall in love with our advanced foresight. Access complete strategic toolsets, forecasting pipelines, and predictive modules completely free for 2 weeks.</p>
                
                <div className="flex flex-col mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">14 Days Free</span>
                  </div>
                  <span className="text-white/40 text-xs mt-1">then $299 / month</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/90"><strong>Scenario Intelligence Modeler</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/90"><strong>12-Month Predictive Forecasting</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/90"><strong>Client Intelligence decision room</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/90">Premium AI PDF briefing compiler</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/90">Strategic team workspace sync</p>
                  </div>
                </div>
              </div>

              {isPremium ? (
                <div className="w-full bg-accent/20 border border-accent/40 text-accent py-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest">
                  ✓ Member Level Active
                </div>
              ) : (
                <button 
                  onClick={() => { setUpgradePlan('sovereign'); setUpgradeStep(0); setShowSubscriptionModal(true); }}
                  className="w-full bg-gradient-to-r from-accent to-amber-500 text-brand py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-102 transition-all shadow-lg shadow-accent/20"
                >
                  Start Free 14-Day Trial
                </button>
              )}
            </div>

            {/* Tier 2: Founders Circle */}
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-white/20 hover:border-amber-500/30 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Founders Circle</span>
                </div>
                <p className="text-xs text-white/40 mb-6">High-touch human advisory paired with bespoke digital twin consulting. Price correlated to the deep value of custom advisory and platform-wide premium data pipelines.</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">$1,499</span>
                  <span className="text-white/40 text-xs">/ month</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/70">All Sovereign Analytics unlocks</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/70">Private quarterly advisory briefings</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/70">Custom industrial telemetry pipeline</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/70">1-on-1 direct board access with Kunwar</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-xs text-white/70">Infinite custom generative reports & tuning</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setUpgradePlan('founders'); setUpgradeStep(0); setShowSubscriptionModal(true); }}
                className="w-full bg-white/5 border border-white/20 text-white hover:bg-white hover:text-brand py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Inquire for Induction
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Feature: Sustainability Impact Calculator */}
      <section id="calculator" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="bg-accent-deep/20 border border-accent/20 rounded-[40px] p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Activity className="w-64 h-64 text-accent" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" />
                Optimization Engine
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Sustainability Impact Calculator</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Estimate the potential efficiency gains and carbon reduction Survvi Opulence Insights can deliver for your industrial operations. Our algorithms analyze your current output against global benchmarks.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Annual Production (Metric Tons)</label>
                  <input 
                    type="range" 
                    min="1000" 
                    max="1000000" 
                    defaultValue="500000"
                    className="w-full accent-accent bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Energy Intensity (kWh/Unit)</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    defaultValue="500"
                    className="w-full accent-accent bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-brand rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Projected CO2 Reduction</p>
                <p className="text-4xl font-bold text-emerald-400">12.4%</p>
                <p className="text-xs text-white/20 mt-2">Per Annum</p>
              </div>
              <div className="p-8 bg-brand rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Efficiency Gain</p>
                <p className="text-4xl font-bold text-accent">18.2%</p>
                <p className="text-xs text-white/20 mt-2">Operational ROI</p>
              </div>
              <div className="p-8 bg-brand rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Waste Recovery</p>
                <p className="text-4xl font-bold text-yellow-500">240T</p>
                <p className="text-xs text-white/20 mt-2">Annualized</p>
              </div>
              <div className="p-8 bg-brand rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Energy Savings</p>
                <p className="text-4xl font-bold text-blue-400">$2.4M</p>
                <p className="text-xs text-white/20 mt-2">Est. Cost Reduction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Feature: Global Project Map */}
      <section id="map" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Global Footprint</h2>
          <p className="text-white/40 max-w-2xl mx-auto">500+ projects across 6 continents. Our intelligence knows no borders.</p>
        </div>
        
        <div className="relative aspect-[21/9] bg-brand-light/20 rounded-[40px] border border-white/5 overflow-hidden group">
          {/* Stylized Map Grid */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #00d4ff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          {/* Pulsing Project Points */}
          {[
            { top: '25%', left: '20%', label: 'New York' },
            { top: '35%', left: '45%', label: 'London' },
            { top: '55%', left: '75%', label: 'Tokyo' },
            { top: '65%', left: '30%', label: 'São Paulo' },
            { top: '45%', left: '60%', label: 'Dubai' },
            { top: '75%', left: '85%', label: 'Sydney' },
            { top: '20%', left: '70%', label: 'Beijing' },
            { top: '50%', left: '15%', label: 'San Francisco' },
          ].map((point, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute w-3 h-3 bg-accent rounded-full"
              style={{ top: point.top, left: point.left }}
            >
              <div className="absolute inset-0 bg-accent rounded-full animate-ping" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest whitespace-nowrap border border-white/10">
                {point.label}
              </div>
            </motion.div>
          ))}
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Globe className="w-64 h-64 text-accent/5" />
          </div>
        </div>
      </section>

      {/* 11. Feature: Expert Network Carousel */}
      <section className="py-24 bg-brand-light/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Global Talent Synthesis</h2>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all"><ChevronRight className="w-6 h-6 rotate-180" /></button>
              <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all"><ChevronRight className="w-6 h-6" /></button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Dr. Elena Vance', role: 'Quantum Material Scientist', bio: 'Former lead at CERN, specializing in molecular concrete structures.' },
              { name: 'Marcus Thorne', role: 'Energy Arbitrage Strategist', bio: 'Ex-Goldman Sachs, mapping global energy volatility for 15 years.' },
              { name: 'Satoshi Nakamoto (Industrial)', role: 'Supply Chain Architect', bio: 'Pioneer of blockchain-based provenance for rare earth metals.' }
            ].map((expert, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-brand border border-white/5 rounded-[32px] hover:border-accent/30 transition-all"
              >
                <div className="w-20 h-20 rounded-2xl bg-accent/10 mb-6 overflow-hidden border border-white/10">
                  <img src={`https://picsum.photos/seed/expert-${i}/200/200`} alt={expert.name} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                </div>
                <h4 className="text-xl font-bold mb-1">{expert.name}</h4>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-4">{expert.role}</p>
                <p className="text-white/40 text-sm leading-relaxed">{expert.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Feature: Industrial Oracle Subscription */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-accent text-brand rounded-[40px] p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
          
          <div className="relative z-10">
            <h2 className="text-5xl font-bold tracking-tighter mb-6">SUBSCRIBE TO THE ORACLE</h2>
            <p className="text-xl font-medium max-w-2xl mx-auto mb-10">
              Get weekly strategic signals, market arbitrage alerts, and industrial foresight delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your corporate email" 
                className="flex-1 bg-brand text-text px-8 py-4 rounded-full focus:outline-none border-2 border-transparent focus:border-text/20"
              />
              <button className="bg-brand text-text px-10 py-4 rounded-full font-bold hover:bg-brand/90 transition-all">
                Join Now
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-widest mt-6 opacity-50 font-bold">Trusted by leaders at ArcelorMittal, Holcim, and Shell.</p>
          </div>
        </div>
      </section>

      <ContactForm />
      <ClientPortal />

      <footer className="py-20 px-6 border-t border-text/5 bg-brand">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                <Globe className="text-brand w-5 h-5" />
              </div>
              <img src="/logo.svg" alt="Survvi Opulence Insights Logo" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-text/40 max-w-sm mb-8 leading-relaxed">
              The world's first technology-native management consulting firm 
              dedicated to the industrial backbone of our global economy.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-10 h-10 rounded-full bg-surface border border-text/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all cursor-pointer">
                <Activity className="w-4 h-4" />
              </div>
              <div className="w-10 h-10 rounded-full bg-surface border border-text/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all cursor-pointer">
                <Globe className="w-4 h-4" />
              </div>
              <div className="w-10 h-10 rounded-full bg-surface border border-text/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all cursor-pointer">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Sectors</h4>
            <ul className="space-y-4 text-sm text-text/50">
              {SECTORS.slice(0, 4).map(sector => (
                <li key={sector} className="hover:text-text transition-colors cursor-pointer">
                  <a href={`#${sector.toLowerCase().replace(/\s+/g, '-')}`}>{sector}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Company</h4>
            <ul className="space-y-4 text-sm text-text/50">
              <li className="hover:text-text transition-colors cursor-pointer"><a href="#story">Our Story</a></li>
              <li className="hover:text-text transition-colors cursor-pointer"><a href="#solutions">Methodology</a></li>
              <li className="hover:text-text transition-colors cursor-pointer">Careers</li>
              <li className="hover:text-text transition-colors cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-12 border-t border-text/5 flex flex-col items-center gap-8">
          <img src="/logo.svg" alt="Survvi Opulence Insights Logo" className="h-12 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity" />
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-text/30 uppercase tracking-widest">
            <p>© 2026 Survvi Opulence Insights. All rights reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-text cursor-pointer">Privacy Policy</span>
              <span className="hover:text-text cursor-pointer">Terms of Service</span>
              <span className="hover:text-text cursor-pointer">Data Sourcing Credits</span>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isMethodologyModalOpen && (
          <MethodologyModal 
            isOpen={isMethodologyModalOpen} 
            onClose={() => setIsMethodologyModalOpen(false)} 
            methodology={selectedMethodology} 
          />
        )}
      </AnimatePresence>

      {/* 3. Feature: AI Strategic Consultant (Floating Chatbot) */}
      <React.Suspense fallback={null}>
        <PrimeAlerts />
        <AIConsultant />
      </React.Suspense>

      {/* Custom Styles for Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 40s linear infinite;
        }
      `}</style>
      </div>
    </React.Suspense>
  );
}

// Markdown and Bold Parsing Helpers for AI Briefings
const parseBold = (str: string): React.ReactNode[] => {
  const parts = str.split('**');
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return React.createElement('strong', { key: i, className: "font-extrabold text-white text-xs" }, part);
    }
    return React.createElement(React.Fragment, { key: i }, part);
  });
};

const renderBriefingContent = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return React.createElement('div', { key: idx, className: "h-2" });
    
    // Headings
    if (trimmed.startsWith('###')) {
      return React.createElement('h4', { 
        key: idx, 
        className: "text-sm font-extrabold uppercase tracking-widest text-accent mt-6 mb-2" 
      }, trimmed.replace(/^###\s*/, ''));
    }
    if (trimmed.startsWith('##')) {
      return React.createElement('h3', { 
        key: idx, 
        className: "text-base font-extrabold uppercase tracking-wider text-white mt-8 mb-3 border-b border-white/10 pb-1" 
      }, trimmed.replace(/^##\s*/, ''));
    }
    
    // Lists
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.replace(/^[-*]\s*/, '');
      return React.createElement('li', { 
        key: idx, 
        className: "text-xs text-white/80 leading-relaxed ml-4 mb-2 list-disc" 
      }, parseBold(content));
    }
    
    // Normal paragraph
    return React.createElement('p', { 
      key: idx, 
      className: "text-xs text-white/70 leading-relaxed mb-3" 
    }, parseBold(trimmed));
  });
};
