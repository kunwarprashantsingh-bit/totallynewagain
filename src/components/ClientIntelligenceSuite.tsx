import React, { useState, Suspense } from 'react';
import { Cpu, Sliders, Navigation, MessageSquare, ShieldCheck, BarChart3, Activity, LineChart, ArrowRightLeft, Leaf, ShieldAlert, Radio, Target, Wallet, Landmark, Database, Scale, Coins } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Language } from '../types';
import { translations } from '../translations';

const PredictiveModelerTool = React.lazy(() => import('./PredictiveModelerTool'));
const SupplyChainMapTool = React.lazy(() => import('./SupplyChainMapTool'));
const VirtualConsultantTool = React.lazy(() => import('./VirtualConsultantTool'));
const ComplianceTrackerTool = React.lazy(() => import('./ComplianceTrackerTool'));
const PeerBenchmarkingTool = React.lazy(() => import('./PeerBenchmarkingTool'));
const SentimentDashboardTool = React.lazy(() => import('./SentimentDashboardTool'));
const VolatilityPropagationTool = React.lazy(() => import('./VolatilityPropagationTool'));

// New requested improvements
const ArbitrageSpotterTool = React.lazy(() => import('./ArbitrageSpotterTool'));
const DecarbonizationRoadmapTool = React.lazy(() => import('./DecarbonizationRoadmapTool'));
const PortfolioHedgingTool = React.lazy(() => import('./PortfolioHedgingTool'));
const TechInflectionTool = React.lazy(() => import('./TechInflectionTool'));
const AltDataMonitorTool = React.lazy(() => import('./AltDataMonitorTool'));
const GeopoliticalRiskSimulator = React.lazy(() => import('./GeopoliticalRiskSimulator'));
const InstitutionalFlowTracker = React.lazy(() => import('./InstitutionalFlowTracker'));
const GlobalThreatAlertFeed = React.lazy(() => import('./GlobalThreatAlertFeed'));
const CrossAssetCorrelationMatrix = React.lazy(() => import('./CrossAssetCorrelationMatrix'));

// Sequential Global Leadership Additions
const SovereignAllocatorTool = React.lazy(() => import('./SovereignAllocatorTool'));
const DarkPoolFlowTool = React.lazy(() => import('./DarkPoolFlowTool'));
const StagflationCrisisModeler = React.lazy(() => import('./StagflationCrisisModeler'));
const TradeBarrierOptimizer = React.lazy(() => import('./TradeBarrierOptimizer'));

const ToolSkeleton = () => (
  <div className="w-full h-[600px] bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest text-white/20">Loading Strategic Tool...</span>
    </div>
  </div>
);

const ClientIntelligenceSuite: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language].intelligence;
  const [activeTool, setActiveTool] = useState<'arbitrage' | 'decarbonization' | 'hedging' | 'inflection' | 'altdata' | 'geopolitics' | 'flows' | 'threats' | 'correlation' | 'modeler' | 'volatility' | 'supply-chain' | 'consultant' | 'compliance' | 'benchmarking' | 'sentiment' | 'allocator' | 'darkpool' | 'stagflation' | 'cbam'>('arbitrage');

  const tools = [
    { id: 'allocator', name: 'Sovereign SAA Allocator (No. 10)', icon: Landmark },
    { id: 'darkpool', name: 'Dark Pool Flows (No. 11)', icon: Database },
    { id: 'stagflation', name: 'Stagflation Sandbox (No. 12)', icon: ShieldAlert },
    { id: 'cbam', name: 'CBAM Tariff Compliance (No. 13)', icon: Scale },
    { id: 'arbitrage', name: 'Arbitrage Spotter (No. 2)', icon: ArrowRightLeft },
    { id: 'decarbonization', name: 'Decarbonization Roadmap (No. 3)', icon: Leaf },
    { id: 'hedging', name: 'Portfolio Risk Hedging (No. 1)', icon: ShieldAlert },
    { id: 'inflection', name: 'Substitution Inflection (No. 4)', icon: Cpu },
    { id: 'altdata', name: 'Alt Data & Satellites (No. 5)', icon: Radio },
    { id: 'geopolitics', name: 'Geopolitical War-gaming (No. 6)', icon: Target },
    { id: 'flows', name: 'Institutional Flows (No. 7)', icon: Wallet },
    { id: 'threats', name: 'Global Threat Alerts (No. 8)', icon: ShieldAlert },
    { id: 'correlation', name: 'Asset Correlation Matrix (No. 9)', icon: BarChart3 },
    { id: 'modeler', name: 'Predictive Modeler', icon: Sliders },
    { id: 'volatility', name: 'Volatility Propagation', icon: LineChart },
    { id: 'supply-chain', name: 'Supply Chain Map', icon: Navigation },
    { id: 'consultant', name: 'Virtual Consultant', icon: MessageSquare },
    { id: 'compliance', name: 'Compliance Tracker', icon: ShieldCheck },
    { id: 'benchmarking', name: 'Peer Benchmarking', icon: BarChart3 },
    { id: 'sentiment', name: 'Sentiment Dashboard', icon: Activity },
  ];

  return (
    <section id="intelligence-suite" className="py-24 bg-brand-light/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Cpu className="w-3 h-3" />
            {t.title}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">{t.subtitle}</h2>
          <p className="text-white/40 max-w-2xl mx-auto text-lg">
            {t.description}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                activeTool === tool.id
                  ? "bg-accent text-brand border-accent shadow-lg shadow-accent/20"
                  : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
              )}
            >
              <tool.icon className="w-4 h-4" />
              {tool.name}
            </button>
          ))}
        </div>

        <div className="bg-brand-light/20 border border-white/5 rounded-[40px] p-8 lg:p-12 min-h-[600px]">
          <AnimatePresence mode="wait">
            <Suspense fallback={<ToolSkeleton />}>
              {activeTool === 'allocator' && <SovereignAllocatorTool key="allocator" />}
              {activeTool === 'darkpool' && <DarkPoolFlowTool key="darkpool" />}
              {activeTool === 'stagflation' && <StagflationCrisisModeler key="stagflation" />}
              {activeTool === 'cbam' && <TradeBarrierOptimizer key="cbam" />}
              {activeTool === 'arbitrage' && <ArbitrageSpotterTool key="arbitrage" />}
              {activeTool === 'decarbonization' && <DecarbonizationRoadmapTool key="decarbonization" />}
              {activeTool === 'hedging' && <PortfolioHedgingTool key="hedging" />}
              {activeTool === 'inflection' && <TechInflectionTool key="inflection" />}
              {activeTool === 'altdata' && <AltDataMonitorTool key="altdata" />}
              {activeTool === 'geopolitics' && <GeopoliticalRiskSimulator key="geopolitics" />}
              {activeTool === 'flows' && <InstitutionalFlowTracker key="flows" />}
              {activeTool === 'threats' && <GlobalThreatAlertFeed key="threats" />}
              {activeTool === 'correlation' && <CrossAssetCorrelationMatrix key="correlation" />}
              {activeTool === 'modeler' && <PredictiveModelerTool key="modeler" />}
              {activeTool === 'volatility' && <VolatilityPropagationTool key="volatility" />}
              {activeTool === 'supply-chain' && <SupplyChainMapTool key="supply-chain" />}
              {activeTool === 'consultant' && <VirtualConsultantTool key="consultant" />}
              {activeTool === 'compliance' && <ComplianceTrackerTool key="compliance" />}
              {activeTool === 'benchmarking' && <PeerBenchmarkingTool key="benchmarking" />}
              {activeTool === 'sentiment' && <SentimentDashboardTool key="sentiment" language={language} />}
            </Suspense>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ClientIntelligenceSuite;
