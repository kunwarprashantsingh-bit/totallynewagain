import { Language } from './types';

export const translations: Record<Language, any> = {
  en: {
    nav: { story: "Our Story", methodology: "Methodology", news: "News Hub", research: "Research", macro: "Macro Strategy", global: "Global", sentiment: "Sentiment", predictive: "Predictive", slogan: "Redefining Industrial Intelligence" },
    hero: { 
      badge: "Strategic Excellence", 
      title: "REDEFINING INDUSTRIAL INTELLIGENCE.", 
      subtitle: "Global leaders in building materials and energy market research. We blend deep industrial expertise with cutting-edge AI to drive transformational growth at Survvi Opulence Insights.", 
      cta1: "Explore Research", 
      cta2: "Our Methodology",
      indexTitle: "Global Energy Index",
      indexSubtitle: "Real-time composite tracking",
      changeLabel: "24h Change",
      volatility: "Volatility",
      sentiment: "Sentiment",
      liquidity: "Liquidity",
      low: "Low",
      bullish: "Bullish",
      high: "High",
      verified: "Verified Data",
      sourceInfo: "Sourced from Bloomberg, Reuters & IEA."
    },
    sectors: { energy: "Energy Markets", materials: "Building Materials", shipping: "Global Shipping & BDI", steel: "Steel & Metallurgy", chemicals: "Chemicals & Petro", mining: "Mining & Rare Earths", agribusiness: "Agribusiness", logistics: "Logistics & Supply", ai: "Industrial AI", pharma: "Pharmaceuticals", defense: "Defense & Aerospace", other: "Global Industrial" },
    regions: {
      latin: "Latin and Central America",
      north: "North America",
      weurope: "Western Europe",
      eeurope: "Eastern Europe",
      mideast: "Middle East",
      africa: "Africa",
      india: "India",
      china: "China",
      asia: "Asia -ex China",
      oceania: "Oceania"
    },
    news: { title: "Global Industrial Intelligence Feed", subtitle: "Real-time updates from the world's leading industrial and energy news sources.", filters: { source: "Source:", date: "Date:", risk: "Risk:", industry: "Industry:", sort: "Sort By:", allSources: "All Sources", allDates: "All Dates", allRisks: "All Risks", allIndustries: "All Industries", clear: "Clear Filters", sortOptions: { dateDesc: "Newest First", dateAsc: "Oldest First", riskDesc: "Risk: High to Low", riskAsc: "Risk: Low to High", relevanceDesc: "Most Relevant" } } },
    research: { title: "Global Research Hub", subtitle: "Top 10 Reports", filters: { source: "Filter by Source", date: "Filter by Date", allSources: "All Sources", allDates: "All Dates" }, generatePdf: "Generate AI PDF Briefing", generatingPdf: "Generating PDF..." },
    intelligence: { title: "Client Intelligence Suite", subtitle: "Advanced Decision Support", description: "Proprietary tools designed to give industrial leaders an unfair advantage in a volatile world." },
    sentiment: { title: "Sentiment Dashboard", subtitle: "Global Market Perception", filters: { commodities: "Commodities", dateRange: "Date Range", custom: "Custom Range", start: "Start Date", end: "End Date", search: "Search commodities..." }, heatmap: { commodity: "Commodity", sentiment: "Sentiment", trend: "Trend", volume: "Volume" } },
    predictive: { 
      title: "Predictive Analytics", 
      subtitle: "AI-driven market forecasting and industrial trend analysis.",
      loading: "Analyzing Market Dynamics...",
      forecastTitle: "12-Month Price Index Forecast",
      priceIndex: "Price Index",
      aiSummary: "AI Summary",
      opportunities: "Strategic Opportunities",
      risk: "Risk",
      error: "Failed to load predictive analytics."
    },
    scenario: {
      badge: "Strategic Simulation",
      title: "Scenario Intelligence Modeler",
      subtitle: "Adjust variables to simulate market shifts and industrial growth impact.",
      growth: "Projected Growth",
      oil: "Oil Price",
      steel: "Steel Price",
      geoRisk: "Geopolitical Risk",
      supplyChain: "Supply Chain Disruption",
      baseline: "Baseline Forecast",
      scenario: "Scenario Forecast",
      impact: "Simulated Industrial Impact"
    },
    macro: {
      badge: "Global Intelligence",
      title: "Macroeconomics & Strategy",
      selectRegion: "Select Region",
      loading: "Synthesizing Regional Intelligence...",
      impact: "Industrial Impact",
      outlook: "Strategic Outlook",
      analysis: "March 2026 Analysis"
    },
    hub: {
      time: "Global Standard Time",
      access: "Your Access Point",
      detecting: "Detecting Location...",
      grid: "Local Energy Grid",
      optimized: "Optimized for"
    },
    predictor: {
      title: "Astraeus AI Market Predictor",
      description: "Our proprietary LLM analyzes millions of data points across global building material and energy supply chains to provide real-time strategic foresight.",
      placeholder: "Ask about a market trend (e.g. 'Future of Green Hydrogen')",
      engine: "AI Analysis Engine",
      default: "Select a topic to generate AI-powered industrial insights."
    },
    journey: [
      { year: "2000s", title: "The Factory Floor", description: "Two decades on the front lines of global industrial management." },
      { year: "2010s", title: "The Intelligence Gap", description: "Identifying the disconnect between raw power and digital foresight." },
      { year: "2020", title: "Survvi Opulence Insights Genesis", description: "Founding the firm to bridge the gap with proprietary industrial AI." },
      { year: "2026+", title: "Industrial Consciousness", description: "Building the neural pathways for the next century of industry." }
    ],
    experts: {
      title: "Global Talent Synthesis",
      roles: ["Quantum Material Scientist", "Energy Arbitrage Strategist", "Supply Chain Architect"],
      bios: [
        "Former lead at CERN, specializing in molecular concrete structures.",
        "Ex-Goldman Sachs, mapping global energy volatility for 15 years.",
        "Pioneer of blockchain-based provenance for rare earth metals."
      ]
    },
    oracle: {
      title: "SUBSCRIBE TO THE ORACLE",
      subtitle: "Get weekly strategic signals, market arbitrage alerts, and industrial foresight delivered to your inbox.",
      placeholder: "Enter your corporate email",
      button: "Join Now",
      trusted: "Trusted by leaders at ArcelorMittal, Holcim, and Shell."
    },
    footer: {
      description: "The world's first technology-native management consulting firm dedicated to the industrial backbone of our global economy.",
      sectors: "Sectors",
      company: "Company",
      links: ["Our Story", "Methodology", "Careers", "Contact"],
      legal: ["Privacy Policy", "Terms of Service", "Data Sourcing Credits"]
    }
  },
  zh: {
    nav: { story: "我们的故事", methodology: "方法论", news: "新闻中心", research: "研究报告", macro: "宏观战略", global: "全球视野", sentiment: "情绪分析", predictive: "预测分析", slogan: "重新定义工业智能" },
    hero: { 
      badge: "战略卓越", 
      title: "重新定义工业情报。", 
      subtitle: "全球建筑材料和能源市场研究的领导者。我们将深厚的工业专业知识与尖端人工智能相结合，推动 Survvi Opulence Insights 的转型增长。", 
      cta1: "探索研究", 
      cta2: "我们的方法论",
      indexTitle: "全球能源指数",
      indexSubtitle: "实时综合追踪",
      changeLabel: "24小时变化",
      volatility: "波动性",
      sentiment: "情绪",
      liquidity: "流动性",
      low: "低",
      bullish: "看涨",
      high: "高",
      verified: "已验证数据",
      sourceInfo: "数据源自彭博社、路透社和国际能源署 (IEA)。"
    },
    sectors: { energy: "能源市场", materials: "建筑材料", shipping: "全球航运与 BDI", steel: "钢铁与冶金", chemicals: "化工与石油", mining: "采矿与稀土", agribusiness: "农业综合企业", logistics: "物流与供应链", ai: "工业人工智能", pharma: "制药", defense: "国防与航空航天", other: "全球工业" },
    regions: {
      latin: "拉丁美洲和中美洲",
      north: "北美",
      weurope: "西欧",
      eeurope: "东欧",
      mideast: "中东",
      africa: "非洲",
      india: "印度",
      china: "中国",
      asia: "亚洲（不含中国）",
      oceania: "大洋洲"
    },
    news: { title: "全球工业情报动态", subtitle: "来自世界领先工业和能源新闻源的实时更新。", filters: { source: "来源:", date: "日期:", risk: "风险:", industry: "行业:", sort: "排序:", allSources: "所有来源", allDates: "所有日期", allRisks: "所有风险", allIndustries: "所有行业", clear: "清除筛选", sortOptions: { dateDesc: "最新发布", dateAsc: "最早发布", riskDesc: "风险：从高到低", riskAsc: "风险：从低到高", relevanceDesc: "最相关" } } },
    research: { title: "全球研究中心", subtitle: "前10名报告", filters: { source: "按来源筛选", date: "按日期筛选", allSources: "所有来源", allDates: "所有日期" }, generatePdf: "生成AI PDF简报", generatingPdf: "正在生成PDF..." },
    intelligence: { title: "客户情报套件", subtitle: "高级决策支持", description: "专为工业领袖设计的专有工具，在动荡的世界中提供不公平的优势。" },
    sentiment: { title: "情绪仪表盘", subtitle: "全球市场感知", filters: { commodities: "商品", dateRange: "日期范围", custom: "自定义范围", start: "开始日期", end: "结束日期", search: "搜索商品..." }, heatmap: { commodity: "商品", sentiment: "情绪", trend: "趋势", volume: "成交量" } },
    predictive: { 
      title: "预测分析", 
      subtitle: "人工智能驱动的市场预测和工业趋势分析。",
      loading: "正在分析市场动态...",
      forecastTitle: "12个月价格指数预测",
      priceIndex: "价格指数",
      aiSummary: "AI 总结",
      opportunities: "战略机遇",
      risk: "风险",
      error: "加载预测分析失败。"
    },
    scenario: {
      badge: "战略模拟",
      title: "情景智能建模器",
      subtitle: "调整变量以模拟市场变化和工业增长影响。",
      growth: "预计增长",
      oil: "石油价格",
      steel: "钢材价格",
      geoRisk: "地缘政治风险",
      supplyChain: "供应链中断",
      baseline: "基准预测",
      scenario: "情景预测",
      impact: "模拟工业影响"
    },
    macro: {
      badge: "全球情报",
      title: "宏观经济与战略",
      selectRegion: "选择区域",
      loading: "正在合成区域情报...",
      impact: "工业影响",
      outlook: "战略展望",
      analysis: "2026年3月分析"
    },
    hub: {
      time: "全球标准时间",
      access: "您的接入点",
      detecting: "正在检测位置...",
      grid: "本地能源网格",
      optimized: "优化于"
    },
    predictor: {
      title: "Astraeus AI 市场预测器",
      description: "我们的专有大语言模型分析全球建筑材料和能源供应链中的数百万个数据点，提供实时战略洞察。",
      placeholder: "询问市场趋势（例如：‘绿色氢能的未来’）",
      engine: "人工智能分析引擎",
      default: "选择一个主题以生成人工智能驱动的工业洞察。"
    },
    journey: [
      { year: "2000年代", title: "工厂车间", description: "在全球工业管理前线奋斗了二十年。" },
      { year: "2010年代", title: "情报鸿沟", description: "识别原始动力与数字洞察之间的脱节。" },
      { year: "2020年", title: "Survvi Opulence Insights 创立", description: "成立公司，利用专有工业人工智能弥合差距。" },
      { year: "2026年+", title: "工业意识", description: "为下一个世纪的工业构建神经通路。" }
    ],
    experts: {
      title: "全球人才综合",
      roles: ["量子材料科学家", "能源套利战略家", "供应链架构师"],
      bios: [
        "前欧洲核子研究中心 (CERN) 负责人，专注于分子混凝土结构。",
        "前高盛集团成员，拥有15年全球能源波动测绘经验。",
        "稀土金属区块链溯源先驱。"
      ]
    },
    oracle: {
      title: "订阅神谕",
      subtitle: "每周获取战略信号、市场套利警报和工业远见。",
      placeholder: "输入您的公司邮箱",
      button: "立即加入",
      trusted: "深受 ArcelorMittal、Holcim 和 Shell 领导者的信任。"
    },
    footer: {
      description: "全球首家致力于全球经济工业支柱的技术原生管理咨询公司。",
      sectors: "行业",
      company: "公司",
      links: ["我们的故事", "方法论", "职业生涯", "联系我们"],
      legal: ["隐私政策", "服务条款", "数据来源致谢"]
    }
  }
};
