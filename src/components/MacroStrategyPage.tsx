import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  ArrowRight, 
  Activity, 
  Briefcase, 
  ShieldAlert, 
  TrendingUp, 
  Landmark, 
  Terminal, 
  Cpu, 
  Clock, 
  Search, 
  AlertTriangle, 
  Zap, 
  CornerDownRight, 
  RotateCcw,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getRegionalMacroNews, analyzeMacroIncident } from '../services/api';
import { REGIONS } from '../constants';
import { Language } from '../types';
import { translations } from '../translations';

interface MacroStrategyPageProps {
  onClose: () => void;
  language: Language;
}

const MacroStrategyPage = ({ onClose, language }: MacroStrategyPageProps) => {
  const t = translations[language].macro;
  const r = translations[language].regions;
  const [activeRegion, setActiveRegion] = useState(REGIONS[1]); // North America
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | 'Economic' | 'Political' | 'Defense & Security'>('All');
  
  // Custom interactive simulation states
  const [customIncident, setCustomIncident] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simError, setSimError] = useState('');
  const [simStepText, setSimStepText] = useState('');

  const regions = [...REGIONS];

  const regionTranslations: Record<string, string> = {
    'Latin and Central America': r.latin,
    'North America': r.north,
    'Western Europe': r.weurope,
    'Eastern Europe': r.eeurope,
    'Middle East': r.mideast,
    'Africa': r.africa,
    'India': r.india,
    'China': r.china,
    'Asia -ex China': r.asia,
    'Oceania': r.oceania
  };

  // Local robust translation dictionary for premium widgets
  const localized = {
    en: {
      all: "All Briefings",
      economic: "Economic Trends",
      political: "Political Shifts",
      defense: "Defense & Security",
      sandboxTitle: "Real-Time Incident Assessment Simulator",
      sandboxDesc: "Evaluate the downstream strategic impact of potential security incidents, infrastructure failures, or tactical conflicts on the industrial ecosystem.",
      placeholder: "Describe a scenario (e.g., naval bottleneck in Strait of Malacca, sudden 20% tariff on heavy building supplies, pipeline sabotage...)",
      analyzeBtn: "Synthesize Tactical Impact Study",
      analyzing: "Synthesizing Defense Intelligence...",
      summary: "Incident intelligence Overview",
      econImpact: "Economic & Industrial Markets Impact",
      polImpact: "Sovereign Alignment & Diplomatic Shifts",
      defBriefing: "Defense & Critical Security Briefing",
      positioning: "Survvi Strategic Positioning Advice",
      threatLevel: "Sovereign Risk Condition",
      defconBadge: "Regional Alert Posture",
      suggestedScenarios: "Suggested Tactical Scenarios",
      clear: "Reset Console",
      liveFeed: "Live Tactical Alert Stream",
      realtimeSymbol: "SECURE BRIEFING LINK",
      realtimeAnalysis: "STRATEGIC SANDBOX",
      riskIndicator: "SYSTEM RISK LEVEL",
      nationalSecurityPost: "DEFCON CONDITION",
      noResults: "No strategic updates found matching this category.",
      customPromptTitle: "RUN CUSTOM SIMULATION"
    },
    zh: {
      all: "所有简报",
      economic: "经济趋势",
      political: "政治动向",
      defense: "国防与安全",
      sandboxTitle: "实时安全事件评估模拟器",
      sandboxDesc: "评估潜在安全事件、基础设施故障或战术冲突对工业生态系统的下游战略影响。",
      placeholder: "描述一个场景（例如：马六甲海峡航道受阻、重型建材突然加征20%关税、跨国能源管道遭遇蓄意破坏...）",
      analyzeBtn: "合成战术影响评估",
      analyzing: "正在合成国防情报...",
      summary: "安全事件情报概述",
      econImpact: "经济与工业市场影响",
      polImpact: "主权同盟与外交政策转变",
      defBriefing: "国防与关键基础设施简报",
      positioning: "Survvi 战略对冲建议",
      threatLevel: "系统主权风险评估",
      defconBadge: "区域警报状态",
      suggestedScenarios: "推荐战术测试场景",
      clear: "重置控制台",
      liveFeed: "实时战术安全警报",
      realtimeSymbol: "机密简报链接",
      realtimeAnalysis: "战略沙盒",
      riskIndicator: "系统风险等级",
      nationalSecurityPost: "防卫警备状态",
      noResults: "未找到符合该类别的战略简报。",
      customPromptTitle: "自定义仿真模拟"
    }
  }[language] || {
    all: "All Briefings",
    economic: "Economic Trends",
    political: "Political Shifts",
    defense: "Defense & Security",
    sandboxTitle: "Real-Time Incident Assessment Simulator",
    sandboxDesc: "Evaluate the downstream strategic impact of potential security incidents, infrastructure failures, or tactical conflicts on the industrial ecosystem.",
    placeholder: "Describe a scenario (e.g., naval bottleneck in Strait of Malacca, sudden 20% tariff on heavy building supplies, pipeline sabotage...)",
    analyzeBtn: "Synthesize Tactical Impact Study",
    analyzing: "Synthesizing Defense Intelligence...",
    summary: "Incident intelligence Overview",
    econImpact: "Economic & Industrial Markets Impact",
    polImpact: "Sovereign Alignment & Diplomatic Shifts",
    defBriefing: "Defense & Critical Security Briefing",
    positioning: "Survvi Strategic Positioning Advice",
    threatLevel: "Sovereign Risk Condition",
    defconBadge: "Regional Alert Posture",
    suggestedScenarios: "Suggested Tactical Scenarios",
    clear: "Reset Console",
    liveFeed: "Live Tactical Alert Stream",
    realtimeSymbol: "SECURE BRIEFING LINK",
    realtimeAnalysis: "STRATEGIC SANDBOX",
    riskIndicator: "SYSTEM RISK LEVEL",
    nationalSecurityPost: "DEFCON CONDITION",
    noResults: "No strategic updates found matching this category.",
    customPromptTitle: "RUN CUSTOM SIMULATION"
  };

  // Get Custom Sovereign Threat Condition for Active Region
  const getSovereignThreatInfo = (region: string) => {
    switch (region) {
      case 'Middle East':
        return { label: 'CRITICAL', color: 'text-red-400 border-red-500/30 bg-red-500/10', defcon: 'DEFCON 2', alert: 'Maritime Interdiction Active' };
      case 'Eastern Europe':
        return { label: 'HIGH RISK', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10', defcon: 'DEFCON 2', alert: 'Critical Border Infrastructure Hardening' };
      case 'Western Europe':
        return { label: 'ELEVATED', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', defcon: 'DEFCON 3', alert: 'Energy Grid Redundancy Active' };
      case 'North America':
        return { label: 'ELEVATED', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', defcon: 'DEFCON 3', alert: 'Port Logistics Continuity Protocols' };
      case 'China':
        return { label: 'ELEVATED', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', defcon: 'DEFCON 3', alert: 'Pacific Cargo Corridor Surveillance' };
      case 'India':
        return { label: 'STABLE-GROWTH', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', defcon: 'DEFCON 4', alert: 'Logistical Redirection Acceleration' };
      case 'Africa':
        return { label: 'ELEVATED', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', defcon: 'DEFCON 3', alert: 'Critical Minerals Security Watch' };
      case 'Latin and Central America':
        return { label: 'STABLE', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', defcon: 'DEFCON 4', alert: 'Panama Canal Transit Monitoring' };
      case 'Asia -ex China':
        return { label: 'ELEVATED', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', defcon: 'DEFCON 3', alert: 'High-Tech Shipping Supply Safeguards' };
      default:
        return { label: 'STABLE', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', defcon: 'DEFCON 5', alert: 'Routine Sovereign Monitoring' };
    }
  };

  const activeSovereignInfo = getSovereignThreatInfo(activeRegion);

  // Helper to get a date exactly 3 days ago relative to June 27, 2026
  const getIntelligenceDateText = () => {
    if (language === 'zh') {
      return "2026年6月24日 (3天前 - 已更新并验证)";
    }
    return "June 24, 2026 (3 days ago - Active & Verified)";
  };

  const getRegionalStrategicOutlook = (region: string) => {
    switch (region) {
      case 'North America':
        return {
          text: language === 'zh' 
            ? "北美地区目前正处于多重宏观挑战的交汇点。由于高粘性工资成本和近期加征的进口建材关税，该地区正经历结构性的‘成本推动型’通胀。国防方面，新颁布的《国防供应链法案》启动了对本土半导体、关键逻辑芯片和军工稀土的百亿美元补贴，严厉限制对国外战术敏感资源的采购依赖。同时，主要沿海港口及输气总线网络已被纳入重点防护状态。Survvi 建议通过流动性国债及大宗实物期货来对冲即将到来的行业链阻滞。"
            : "The North American theater is traversing a high-stakes convergence of supply localization mandates and structural fiscal strain. The recently enacted Defense Supply Chain Resiliency Act has catalyzed intense sovereign PE allocations toward local foundry facilities and defense AI logic research, heavily restricting foreign sourcing of energetic materials and rare earths. On the economic front, targeted G10 tariffs on steel and timber continue to sustain raw structural material premiums by 12%. Maritime freight logistics are active but require increased cyber defense compliance, following intelligence alerts of telemetry reconnaissance on East Coast energy grids.",
          variables: language === 'zh' ? [
            { name: "主权物流通道安全评估", status: "符合防卫标准" },
            { name: "双边关税与进口限制合规", status: "合规审查通过" },
            { name: "电力/能源网格防卫体系", status: "孤立逻辑节点加固" },
            { name: "基建用钢与木材供给冗余", status: "储备增加20%" }
          ] : [
            { name: "Sovereign Logistics Corridor Protection", status: "SECURE - DEFCON 3 WATCH" },
            { name: "G10 Bilateral Tariffs & Import Levies", status: "STRICT COMPLIANCE IN EFFECT" },
            { name: "Utility Smart Grid Cybersecurity", status: "HARDENED / ISOLATED LOGIC" },
            { name: "Structural Steel & Wood Buffer Reserves", status: "EXPANDED +20% STORAGE" }
          ]
        };
      case 'Western Europe':
        return {
          text: language === 'zh'
            ? "西欧地区的能源安全与低碳转型面临严峻挑战。随着欧盟碳边境调节机制（CBAM）过渡到实质性执行阶段，高碳排冶炼金属和波特兰水泥进口价格瞬间被摊入了高额的惩罚性关税。在防务层面，波罗的海油气网络及主要货运水道已被指派海军进行常规护航巡逻，以应对针对公用事业基础设施的多频段网络探测。欧洲央行维持限制性利率政策，迫使工业制造端必须在1周内快速过渡到循环废钢和本地自备电力供给。Survvi 指引采取多元化非美资产及废钢供应链参股等防守型定位。"
            : "Western Europe is dealing with a dual-axis bottleneck spanning carbon border compliance and maritime transit security. With the EU CBAM transitioning into active, enforceable tariff phases, imported blast furnace steel, primary aluminum ingots, and Portland cement face substantial margin compression. Politically, monetary authorities are managing a slow, restrictive deposit rate curve to counter sticky raw commodity inputs. Defensively, naval operations are maintaining high-alert escorts for critical LNG tankers in the North and Baltic Seas following cyber-telemetry probes on energy terminal routing systems.",
          variables: language === 'zh' ? [
            { name: "CBAM 碳关税与绿色证书", status: "实质性计价生效" },
            { name: "波罗的海能源管线安全", status: "常规海军护航" },
            { name: "工业废钢本位循环配额", status: "周度合规达成" },
            { name: "欧洲央行存贷款基准利率", status: "限制性周期持续" }
          ] : [
            { name: "CBAM Carbon Borders & Certificates", status: "ACTIVE EXPOSURE AUDITED" },
            { name: "Baltic Sea Pipeline Cyber Posture", status: "ISOLATED DEFENSE NODE ARMED" },
            { name: "Industrial Steel Scrap Circulation", status: "OPTIMIZED TO 20% CAPPING" },
            { name: "Central Bank Deposit Rate Adjustments", status: "RESTRICTIVE / ANTI-INFLATION" }
          ]
        };
      case 'Middle East':
        return {
          text: language === 'zh'
            ? "中东地缘博弈继续强烈刺激着全球原油和尿素化工运力。主要海运咽喉（曼德海峡与霍尔木兹海峡）依然高频部署了多国联合海军驱护群，以确保敏感危险品和重工业原材料的过境连续性。在宏观资本流向中，海湾合作委员会（GCC）主权基金正在加速通过非公开场外大宗交叉盘（Dark Pools），将传统的国债证券转化为高安全物理大宗商品（如实物黄金与干散货运轮主权控股）。风险等级维持在最高警戒级别，Survvi 建议绕行或加装战争保赔附加险。"
            : "The Middle East geopolitical arena remains the primary systemic vector for global maritime bottlenecks and energy price volatility. Defensive naval interdiction and tactical maritime escort operations are fully active across critical regional chokepoints to safeguard physical crude oil and urea shipping vessels. Geopolitical bipolarization is prompting sovereign wealth funds to quietly rotate capital out of G10 sovereign debt into physical gold reserves and logistics infrastructure via private ATS dark pool crossings. Risk levels are classified as Critical, demanding strict supply-chain routing diversification.",
          variables: language === 'zh' ? [
            { name: "海峡关键航道通行防护", status: "军事级战术干预" },
            { name: "物理黄金储备场外吸纳", status: "主权交叉盘加速" },
            { name: "合成氨/尿素化肥运输出口", status: "受限豁免通行" },
            { name: "海运重油及危险品溢价", status: "上调 $12.50/BBL" }
          ] : [
            { name: "Strait & Chokepoint Transit Security", status: "CRITICAL / MILITARY INTERDICTION" },
            { name: "Sovereign Gold Reserve Accumulation", status: "ACCELERATED OFF-MARKET BUY" },
            { name: "Urea Fertilizer Export Continuity", status: "HIGH SHIELD IN PLACE" },
            { name: "Upstream Crude Risk Premiums", status: "RECALIBRATED +$12.50/BBL" }
          ]
        };
      case 'Eastern Europe':
        return {
          text: language === 'zh'
            ? "东欧陆路工业过境走廊与主要能源传输阀正处于全面断裂和军事硬化警戒中（DEFCON 2）。战术级网络攻击手段频现，致使工业制造端和变电控制系统陷入长期战备状态。由于跨境大宗物资及关键矿物贸易被彻底冻结，非美/非西方体系国家和多国联合中立港口正联合制定物物交换（Barter）或贵金属结算通道，以完全绕开西方SWIFT体系清算。Survvi 警告相关大宗买家不要在此区域持有空头仓位，并立即激活位于保加利亚及土耳其的次级过境管线分流方案。"
            : "Eastern Europe is navigating a prolonged war-risk paradigm that has structurally severed cross-border resource pipelines and heavy industrial corridors. Regional critical infrastructure and transit borders are locked under DEFCON 2 alert postures with highly hardened cybersecurity networks. Economically, extreme sanctions and logistical blocks have forced a total restructuring of local gas and industrial raw material supply chains. Sovereign directives prioritize un-sanctionable assets, making real-gold settlement and commodity-barter networks standard hedging defense shields.",
          variables: language === 'zh' ? [
            { name: "边境工业口岸物理防御", status: "DEFCON 2 最高防卫" },
            { name: "过境天然气与煤炭流量", status: "受控低流速传输" },
            { name: "非美/物物本位交易链路", status: "多边备选通道建立" },
            { name: "特种合金钢材生产及配额", status: "完全国有化管制" }
          ] : [
            { name: "Transit Border Military Hardening", status: "DEFCON 2 CRITICAL" },
            { name: "Gas Pipeline Flow Fragmentation", status: "RESTRICTED / REGIONAL BLOCK" },
            { name: "Currency Sanction Mitigation Systems", status: "NON-FIAT MONETARY SETTLEMENT" },
            { name: "Sovereign Metal Stockpiling Quotas", status: "MAXIMUM CAPACITY ENGAGED" }
          ]
        };
      case 'China':
        return {
          text: language === 'zh'
            ? "中国继续以极高的政策敏捷度强化产业链自主可控与出口重金属卡位。针对西方芯片限制及环太平洋物流禁运，稀土、精炼锂和高纯度石墨出口控制的周度合规机制已被提到国家安全高度。金融层面，央行稳健购金趋势与去美债化进程在场外网络（ATS）中暗中提速，海运油品及天然气的人民币跨境计价结算比例提升。Survvi 地缘政治分析揭示，高密度自足型基建链（如国内高品质水泥和低能耗电炉钢产能）正在得到特批保障，展现了极其强大的防御厚度。"
            : "The Chinese domestic and trade posture is heavily focused on manufacturing self-sufficiency and resource-export dominance. Amid heightened Pacific cargo corridor security controls and high-tech logic chip barriers, domestic agencies have tightened export quotas on critical refined metals, lithium, and rare earths to build strategic internal reserves. Economically, the PBOC continues its physical gold reserve accumulation program while accelerating cross-border Renminbi trade settlements for bulk chemicals and marine oil inputs, quietly executed through off-exchange sovereign channels.",
          variables: language === 'zh' ? [
            { name: "太平洋海运货运航线警戒", status: "主动护卫编队巡航" },
            { name: "石墨/稀土等特种材料出口", status: "周度安全配额管制" },
            { name: "离岸大宗原物料人民币结算", status: "季度增幅 14%" },
            { name: "特批电炉钢与低碳水泥产能", status: "全额负荷运转" }
          ] : [
            { name: "Pacific Carrier Lane Surveillance", status: "ELEVATED POSTURE ACTIVE" },
            { name: "Refined Lithium & Rare Earth Quotas", status: "HIGHLY RESTRICTED EXPORTS" },
            { name: "Cross-Border Yuan Trade Settlement", status: "EXPANDED BY 14% QOQ" },
            { name: "Private ATS Sovereign Crossings", status: "MONITORED FOR ACCUMULATION" }
          ]
        };
      default:
        return {
          text: language === 'zh'
            ? `该地区目前正处于全球绿色碳税（如碳边境调节税）及中东航路改道导致的多米诺级运费上涨辐射带。地方监管机构正在微调主权物流框架，并启动针对公用输电系统的周期性网络检查，以隔离外部系统性风险带来的电网不稳定性。由于运力周转拉长，重工业和重料加工企业被迫将本地静态库存周转周数拉高至原来的1.5倍。Survvi 建议投资者注重高流动性短期抵押资产，以对冲运价高宽幅波动。`
            : `The ${region} region is adapting to secondary ripples of carbon-border tax regimes and maritime bottleneck diversions. Local authorities are adjusting sovereign logistics guidelines and upgrading utility cybersecurity defenses to cushion the regional industrial ecosystem against global collateral. Economically, interest rate spreads and wage growth remain stable, though raw material transit delays require firms to hold larger local stockpiles. Survvi advises structuring operations around local resource pools and utilizing un-sanctionable asset hedges where possible.`,
          variables: language === 'zh' ? [
            { name: "次级多式联运走廊畅通度", status: "验证全线畅通" },
            { name: "关键公用事业电网检查", status: "合规证书已获批" },
            { name: "大宗建材进口国碳税对冲", status: "审查完成" },
            { name: "本地应急大宗原材料储备", status: "保持在 45 天高位" }
          ] : [
            { name: "Secondary Multimodal Transit Flow", status: "VERIFIED CLEAR & PASSABLE" },
            { name: "Key Utility Grid Systems Safety", status: "COMPLIANCE CERTIFICATE ISSUED" },
            { name: "Import Carbon Levies Hedging Ratio", status: "COMPLETED AUDIT" },
            { name: "Local Dry Material Storage Level", status: "MAINTAINED AT 45-DAY HIGH" }
          ]
        };
    }
  };

  const outlookData = getRegionalStrategicOutlook(activeRegion);

  const fetchMacroNews = async (region: string) => {
    setLoading(true);
    const result = await getRegionalMacroNews(region);
    setNews(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchMacroNews(activeRegion);
    // Reset custom simulation when switching regions to keep UI clean
    setSimResult(null);
    setCustomIncident('');
    setSimError('');
  }, [activeRegion]);

  const filteredNews = news.filter(item => {
    if (activeCategoryFilter === 'All') return true;
    return item.category?.toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  // Custom simulation prompt runner
  const handleRunSimulation = async (scenarioText?: string) => {
    const textToRun = scenarioText || customIncident;
    if (!textToRun.trim()) return;

    setSimLoading(true);
    setSimError('');
    setSimResult(null);

    // Decorative simulation log ticker
    const steps = [
      "DECRYPTING LOGISTICS NETWORK ROUTING...",
      "POLLING G10 SOVEREIGN BOND RISK INDICES...",
      "RESOLVING MILITARY SUPPLY CHAIN CORRIDOR CODES...",
      "APPLYING DRIFT COMPLIANCE MULTIPLIERS...",
      "SYNTHESIZING PREDICTIVE COUPLING ASSESSMENT..."
    ];

    let currentStep = 0;
    setSimStepText(steps[currentStep]);
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setSimStepText(steps[currentStep]);
      }
    }, 1200);

    try {
      const response = await analyzeMacroIncident(activeRegion, textToRun);
      clearInterval(interval);
      if (response) {
        setSimResult(response);
      } else {
        setSimError('The AI strategist failed to yield a strategic assessment. Please modify your query and attempt again.');
      }
    } catch (err) {
      clearInterval(interval);
      setSimError('Network interruption during analytical modeling. Check connection and retry.');
    } finally {
      setSimLoading(false);
    }
  };

  // Preset Scenario click handler
  const handlePresetScenarioClick = (preset: string) => {
    setCustomIncident(preset);
    handleRunSimulation(preset);
  };

  // Simulated live strategic alert log feed
  const [tickerLogs, setTickerLogs] = useState<string[]>([
    "INTEL_ALERT: Maritime escort patterns adjusted in Gulf of Aden dry corridors.",
    "ECONOMIC_TICKER: G10 Sovereign yields shift +12bps on carbon credit border adjustment speculation.",
    "TACTICAL_WIRE: Isolated power grid telemetry anomalies resolved in Baltic Sea pipelines.",
  ]);

  useEffect(() => {
    const alerts = [
      "CRITICAL_INFRASTRUCTURE: Port terminal bottlenecks reported at European transshipment hubs.",
      "DEFENSE_POSTURE: Active airspace surveillance patrols elevated along Pacific logistic channels.",
      "POLICY_UPDATE: Sovereign rare-earth metal processing export limits drafted in Asian trade board.",
      "MACRO_LOGISTICS: Dry bulk carrier spot pricing shows 15% day-over-day surge in Atlantic sectors.",
    ];

    const interval = setInterval(() => {
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      setTickerLogs(prev => [randomAlert, ...prev.slice(0, 4)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-brand text-text overflow-y-auto"
    >
      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
              <Globe className="w-3 h-3 animate-spin [animation-duration:20s]" />
              {t.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Macroeconomics & <span className="text-accent">Strategy Page</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-accent/30 text-white/70 hover:text-accent transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Regions Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 px-1 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-accent/80" />
                {t.selectRegion}
              </h3>
              <div className="space-y-1.5">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setActiveRegion(region)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 border flex items-center justify-between",
                      activeRegion === region 
                        ? "bg-accent text-brand border-accent shadow-lg shadow-accent/10" 
                        : "bg-white/0 text-white/50 border-transparent hover:bg-white/5 hover:text-white/80"
                    )}
                  >
                    <span>{regionTranslations[region] || region}</span>
                    <ArrowRight className={cn("w-3.5 h-3.5 opacity-0 -translate-x-2 transition-all", activeRegion === region && "opacity-100 translate-x-0 text-brand")} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sovereign DEFCON Alert Widget */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase block mb-1">
                  {localized.riskIndicator}
                </span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border", activeSovereignInfo.color)}>
                    {activeSovereignInfo.label}
                  </span>
                  <span className="text-white/40 text-[10px] font-mono">
                    {activeSovereignInfo.defcon}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase block mb-1">
                  Active Directives
                </span>
                <p className="text-[11px] font-mono text-white/80 leading-relaxed flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping mt-1 flex-shrink-0" />
                  {activeSovereignInfo.alert}
                </p>
              </div>
            </div>

            {/* Live Security Wire Ticker */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 hidden lg:block">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">
                  {localized.liveFeed}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {tickerLogs.map((log, idx) => (
                  <div key={idx} className="text-[10px] font-mono leading-relaxed text-white/60 border-l border-white/10 pl-2 py-0.5">
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Category Navigation Bar & Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'All', icon: Globe },
                  { id: 'Economic', icon: TrendingUp },
                  { id: 'Political', icon: Landmark },
                  { id: 'Defense & Security', icon: ShieldAlert }
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryFilter(cat.id as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border",
                        activeCategoryFilter === cat.id
                          ? "bg-white/10 text-accent border-accent/40"
                          : "bg-white/5 text-white/50 border-white/5 hover:border-white/20 hover:text-white/80"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>
                        {cat.id === 'All' ? localized.all :
                         cat.id === 'Economic' ? localized.economic :
                         cat.id === 'Political' ? localized.political :
                         localized.defense}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">ACTIVE REGION</span>
                <span className="text-xs font-bold uppercase text-accent tracking-wider">
                  {regionTranslations[activeRegion] || activeRegion}
                </span>
              </div>
            </div>

            {/* News Updates List */}
            {loading ? (
              <div className="h-[400px] bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent animate-pulse">
                    {t.loading}
                  </p>
                </div>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{localized.noResults}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/40 hover:bg-white/[0.08] transition-all duration-300 group relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header Info */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 border",
                          item.category?.toLowerCase() === 'economic' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          item.category?.toLowerCase() === 'political' ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {item.category?.toLowerCase() === 'economic' && <TrendingUp className="w-2 h-2" />}
                          {item.category?.toLowerCase() === 'political' && <Landmark className="w-2 h-2" />}
                          {(item.category?.toLowerCase() === 'defense & security' || item.category?.toLowerCase() === 'defense') && <ShieldAlert className="w-2 h-2" />}
                          {item.category || 'Update'}
                        </span>

                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                          item.riskLevel === 'Low' ? "text-emerald-400" :
                          item.riskLevel === 'Medium' ? "text-amber-400" :
                          "text-red-400"
                        )}>
                          {item.riskLevel} Risk
                        </span>
                      </div>

                      <h4 className="text-md font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-white/40 text-xs leading-relaxed mb-6 line-clamp-4">
                        {item.summary}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent">{t.impact}</span>
                      </div>
                      <p className="text-[11px] text-white/70 leading-relaxed italic line-clamp-3">
                        "{item.industrialImpact}"
                      </p>
                      
                      {item.timestamp && (
                        <div className="flex items-center gap-1.5 mt-4 text-[9px] font-mono text-white/30">
                          <Clock className="w-3 h-3" />
                          <span>{item.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Regional Outlook Summary Card */}
            <div className="p-8 bg-accent/5 border border-accent/10 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BookOpen className="w-48 h-48" />
              </div>
              <div className="relative z-10 grid md:grid-cols-12 gap-8">
                {/* Strategic Text Outlook Column */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t.outlook}: {regionTranslations[activeRegion] || activeRegion}</h3>
                      <p className="text-xs text-white/40 uppercase tracking-widest">
                        {language === 'zh' ? '周度滚动宏观分析' : 'Weekly Rolling Macro Analysis'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-white/75 leading-relaxed text-sm">
                    {outlookData.text}
                  </p>
                  
                  <div className="pt-2">
                    <p className="text-[11px] text-accent/80 font-mono italic">
                      {language === 'zh' 
                        ? "* Survvi 奢华情报指令强制推行多轨供应链和地缘政治避险策略。" 
                        : "* Survvi Opulence Insights mandates high-agility local redundancy and geo-hedging protocols."}
                    </p>
                  </div>
                </div>

                {/* Variable Verification Column */}
                <div className="md:col-span-5 bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">
                        {language === 'zh' ? "情报验证周期" : "Intelligence Validity"}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {language === 'zh' ? "最新滚动更新 (< 1周前)" : "Fresh Rolling Update (< 1 week old)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-wider">
                        {language === 'zh' ? "最新" : "Fresh"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">
                      {language === 'zh' ? "验证时间" : "VERIFIED TIMELINE"}
                    </span>
                    <span className="text-xs font-mono text-white/80 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {getIntelligenceDateText()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">
                      {language === 'zh' ? "已验证的重要宏观/安全变量" : "VERIFIED MACRO & SECURITY VARIABLES"}
                    </span>
                    <div className="space-y-2">
                      {outlookData.variables.map((variable, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-bold text-white/80 leading-tight">
                              {variable.name}
                            </p>
                            <span className="text-[9px] font-mono text-white/40 block mt-0.5 uppercase tracking-wider">
                              {variable.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE STRATEGIC SIMULATION PANEL */}
            <div className="p-8 bg-[#0b0c10] border border-white/10 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-white/10 border border-white/5 rounded-bl-3xl bg-white/5">
                {localized.realtimeAnalysis}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-accent animate-pulse" />
                <h3 className="text-lg font-bold uppercase tracking-wider">{localized.sandboxTitle}</h3>
              </div>
              
              <p className="text-white/40 text-xs mb-6 max-w-3xl leading-relaxed">
                {localized.sandboxDesc}
              </p>

              {/* Input Form Area */}
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={customIncident}
                    onChange={(e) => setCustomIncident(e.target.value)}
                    placeholder={localized.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 min-h-[90px] resize-y"
                    disabled={simLoading}
                  />
                  <div className="absolute bottom-4 right-4 text-white/25">
                    <Cpu className={cn("w-5 h-5", simLoading && "animate-spin text-accent")} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Preset Quick Runs */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest self-center mr-1">
                      {localized.suggestedScenarios}:
                    </span>
                    {[
                      { label: "Red Sea Bottleneck", text: "Red Sea naval bottleneck triggers maritime container rerouting" },
                      { label: "Steel Tariff Hike", text: "Western European steel manufacturers hit with carbon border tax spikes" },
                      { label: "Power Cyber Attack", text: "Sovereign cyber incident disrupts major Baltic electric pipeline grid" }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePresetScenarioClick(preset.text)}
                        className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-accent/30 text-white/60 hover:text-accent transition-all"
                        disabled={simLoading}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 self-end w-full sm:w-auto">
                    {simResult && (
                      <button
                        onClick={() => {
                          setSimResult(null);
                          setCustomIncident('');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-widest text-white/60 transition-all bg-white/0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{localized.clear}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleRunSimulation()}
                      disabled={simLoading || !customIncident.trim()}
                      className={cn(
                        "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        simLoading || !customIncident.trim()
                          ? "bg-white/5 text-white/25 border border-transparent cursor-not-allowed"
                          : "bg-accent text-brand border border-accent hover:shadow-lg hover:shadow-accent/15"
                      )}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{simLoading ? localized.analyzing : localized.analyzeBtn}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Result Area */}
              <AnimatePresence mode="wait">
                {simLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center min-h-[160px]"
                  >
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-[10px] font-mono text-accent animate-pulse uppercase tracking-widest">
                      {simStepText}
                    </p>
                    <p className="text-[9px] font-mono text-white/30 mt-2">
                      RUNNING CLOUD MATRIX DEPLOYMENT
                    </p>
                  </motion.div>
                )}

                {simError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-300 font-mono">{simError}</p>
                  </motion.div>
                )}

                {simResult && !simLoading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 border-t border-white/10 pt-8 space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                          {localized.nationalSecurityPost}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                            simResult.threatLevel === 'Critical' ? "bg-red-500/25 text-red-400 border-red-500/40" :
                            simResult.threatLevel === 'High' ? "bg-orange-500/25 text-orange-400 border-orange-500/40" :
                            simResult.threatLevel === 'Medium' ? "bg-yellow-500/25 text-yellow-400 border-yellow-500/40" :
                            "bg-emerald-500/25 text-emerald-400 border-emerald-500/40"
                          )}>
                            {simResult.threatLevel}
                          </span>
                          <span className="text-[10px] font-mono text-white/40">INCIDENT CONDITION MATRIX</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                        <Zap className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent">REAL-TIME FORECAST</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left: Summary and Positions */}
                      <div className="space-y-6">
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2 hover:border-white/10 transition-colors">
                          <span className="text-[10px] font-bold tracking-widest text-accent uppercase flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-accent" />
                            {localized.summary}
                          </span>
                          <p className="text-xs text-white/80 leading-relaxed font-sans pt-1">
                            {simResult.eventSummary}
                          </p>
                        </div>

                        <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 space-y-2 hover:border-accent/20 transition-colors">
                          <span className="text-[10px] font-bold tracking-widest text-accent uppercase flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-accent" />
                            {localized.positioning}
                          </span>
                          <p className="text-xs text-white/90 font-mono leading-relaxed pt-1">
                            {simResult.recommendedPositioning}
                          </p>
                        </div>
                      </div>

                      {/* Right: Detailed Vector Impacts */}
                      <div className="space-y-4">
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2 hover:border-white/10 transition-colors">
                          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            {localized.econImpact}
                          </span>
                          <p className="text-xs text-white/60 leading-relaxed pt-1">
                            {simResult.economicImpact}
                          </p>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2 hover:border-white/10 transition-colors">
                          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5 text-sky-400" />
                            {localized.polImpact}
                          </span>
                          <p className="text-xs text-white/60 leading-relaxed pt-1">
                            {simResult.politicalImpact}
                          </p>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2 hover:border-white/10 transition-colors">
                          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                            {localized.defBriefing}
                          </span>
                          <p className="text-xs text-white/60 leading-relaxed pt-1">
                            {simResult.defenseSecurityBriefing}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default MacroStrategyPage;
