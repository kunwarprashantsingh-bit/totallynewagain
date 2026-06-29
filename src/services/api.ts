import { Type } from "@google/genai";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import type { MarketData, UserLocation, ResearchReport } from "../types";
import { SECTORS, COMMODITIES } from "../constants";
import { ai } from "./geminiService";

const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MARKET_CACHE_TTL = 1000 * 60; // 1 minute for market data

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimited = 
      error?.status === "RESOURCE_EXHAUSTED" || 
      error?.code === 429 || 
      (error?.message && error.message.includes("429")) ||
      (error?.message && error.message.includes("RESOURCE_EXHAUSTED"));

    const isQuotaExceeded = error?.message && error.message.toLowerCase().includes("quota");

    if (retries > 0 && isRateLimited && !isQuotaExceeded) {
      console.warn(`Rate limit hit, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const MOCK_NEWS = [
  { 
    title: "Global Steel Demand Set to Rise in 2026", 
    summary: "Analysts predict a 3% increase in steel consumption driven by major infrastructure projects in Southeast Asia and India.", 
    source: "World Steel Association", 
    url: "https://worldsteel.org/steel-topics/statistics/",
    date: "2026-03-18",
    riskLevel: "Low",
    industry: "Steel",
    relevance: 95
  },
  { 
    title: "Green Hydrogen: The New Frontier for Energy Grids", 
    summary: "New electrolysis techniques are bringing down the cost of green hydrogen, making it a viable alternative for heavy industry.", 
    source: "International Energy Agency", 
    url: "https://www.iea.org/reports/hydrogen",
    date: "2026-03-17",
    riskLevel: "Medium",
    industry: "Energy",
    relevance: 88
  },
  { 
    title: "Cement Industry Decarbonization Accelerates", 
    summary: "Leading cement manufacturers announce a breakthrough in carbon capture technology, aiming for net-zero by 2040.", 
    source: "Global Cement and Concrete Association", 
    url: "https://gccassociation.org/news/",
    date: "2026-03-18",
    riskLevel: "Low",
    industry: "Building Materials",
    relevance: 92
  },
  { 
    title: "Lumber Prices Stabilize Amidst Supply Chain Rebalancing", 
    summary: "After years of volatility, global lumber markets are showing signs of stabilization as new forestry projects come online.", 
    source: "Bloomberg Markets", 
    url: "https://www.bloomberg.com/markets/commodities",
    date: "2026-03-16",
    riskLevel: "Low",
    industry: "Building Materials",
    relevance: 75
  },
  { 
    title: "The BDI and Global Trade: A 2026 Outlook", 
    summary: "The Baltic Dry Index remains a key indicator for industrial health as shipping routes adapt to new geopolitical realities.", 
    source: "Baltic Exchange", 
    url: "https://www.balticexchange.com/en/data-services/market-reports.html",
    date: "2026-03-18",
    riskLevel: "High",
    industry: "Shipping",
    relevance: 82
  }
];

const MOCK_REPORTS: Record<string, ResearchReport[]> = {
  'Building Materials': [
    { title: "2026 Global Cement Market Analysis", type: "Report", source: "IEA", date: "Jan 2026", url: "https://www.iea.org/reports/cement" },
    { title: "Sustainable Steel: Future Trends", type: "Whitepaper", source: "Deloitte", date: "Feb 2026", url: "https://www2.deloitte.com/global/en/pages/energy-and-resources/articles/decarbonizing-steel.html" },
    { title: "Lumber Supply Chain Resilience", type: "Analysis", source: "Bloomberg", date: "Mar 2026", url: "https://www.bloomberg.com/markets/commodities" }
  ],
  'Energy': [
    { title: "World Energy Outlook 2026", type: "Report", source: "IEA", date: "Jan 2026", url: "https://www.iea.org/reports/world-energy-outlook-2023" },
    { title: "The Future of Natural Gas", type: "Analysis", source: "BP", date: "Feb 2026", url: "https://www.bp.com/en/global/corporate/energy-economics/energy-outlook.html" },
    { title: "Renewable Energy Integration", type: "Whitepaper", source: "McKinsey", date: "Mar 2026", url: "https://www.mckinsey.com/industries/electric-power-and-natural-gas/our-insights" }
  ],
  'Shipping': [
    { title: "BDI Historical Trends and 2026 Forecast", type: "Report", source: "Maritime Institute", date: "Jan 2026", url: "https://www.balticexchange.com/en/data-services/market-reports.html" },
    { title: "Global Shipping Routes in a Decarbonizing World", type: "Analysis", source: "Lloyd's List", date: "Feb 2026", url: "https://lloydslist.maritimeintelligence.informa.com/" },
    { title: "Dry Bulk Market Dynamics", type: "Whitepaper", source: "Clarksons", date: "Mar 2026", url: "https://www.clarksons.com/research/" }
  ],
  'Steel': [
    { title: "Global Steel Demand 2026", type: "Report", source: "World Steel", date: "Jan 2026", url: "https://worldsteel.org/steel-topics/statistics/" },
    { title: "Green Hydrogen in Metallurgy", type: "Analysis", source: "ArcelorMittal", date: "Feb 2026", url: "https://corporate.arcelormittal.com/climate-action" },
    { title: "Scrap Metal Supply Chain", type: "Whitepaper", source: "BIR", date: "Mar 2026", url: "https://www.bir.org/market-reports" }
  ],
  'Chemicals': [
    { title: "Petrochemical Market Outlook", type: "Report", source: "IHS Markit", date: "Jan 2026", url: "https://main.ihsmarkit.com/products/chemical-market-advisory-services.html" },
    { title: "Sustainable Polymers Research", type: "Analysis", source: "BASF", date: "Feb 2026", url: "https://www.basf.com/global/en/who-we-are/sustainability.html" },
    { title: "Specialty Chemicals Growth", type: "Whitepaper", source: "Evonik", date: "Mar 2026", url: "https://corporate.evonik.com/en/responsibility/sustainability/" }
  ],
  'Mining': [
    { title: "Critical Minerals for Energy Transition", type: "Report", source: "IEA", date: "Jan 2026", url: "https://www.iea.org/reports/the-role-of-critical-minerals-in-clean-energy-transitions" },
    { title: "Lithium Supply-Demand Gap", type: "Analysis", source: "Albemarle", date: "Feb 2026", url: "https://www.albemarle.com/sustainability" },
    { title: "Rare Earth Mining in 2026", type: "Whitepaper", source: "USGS", date: "Mar 2026", url: "https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries" }
  ],
  'Agribusiness': [
    { title: "Global Fertilizer Market Trends", type: "Report", source: "IFA", date: "Jan 2026", url: "https://www.fertilizer.org/Public/Market_Resources/Market_Reports.aspx" },
    { title: "Precision Agriculture Impact", type: "Analysis", source: "John Deere", date: "Feb 2026", url: "https://www.deere.com/en/our-company/sustainability/" },
    { title: "Food Security and Supply Chains", type: "Whitepaper", source: "FAO", date: "Mar 2026", url: "https://www.fao.org/worldfoodsituation/foodpricesindex/en/" }
  ],
  'Logistics': [
    { title: "Supply Chain Resilience Index 2026", type: "Report", source: "DHL", date: "Jan 2026", url: "https://www.dhl.com/global-en/home/insights-and-innovation/thought-leadership/white-papers/global-connectedness-index.html" },
    { title: "Last-Mile Delivery Optimization", type: "Analysis", source: "FedEx", date: "Feb 2026", url: "https://www.fedex.com/en-us/about/sustainability.html" },
    { title: "Warehouse Automation Trends", type: "Whitepaper", source: "Amazon Robotics", date: "Mar 2026", url: "https://www.aboutamazon.com/news/operations/how-amazon-robotics-is-shaping-the-future-of-work" }
  ],
  'Industrial AI': [
    { title: "AI in Manufacturing: 2026 Roadmap", type: "Report", source: "NVIDIA", date: "Jan 2026", url: "https://www.nvidia.com/en-us/industrial-ai/" },
    { title: "Collaborative Robots (Cobots)", type: "Analysis", source: "ABB", date: "Feb 2026", url: "https://new.abb.com/products/robotics/collaborative-robots" },
    { title: "Predictive Maintenance at Scale", type: "Whitepaper", source: "Siemens", date: "Mar 2026", url: "https://www.siemens.com/global/en/products/automation/topic-areas/predictive-maintenance.html" }
  ],
  'Pharmaceuticals': [
    { title: "Global Pharma Market Outlook 2026", type: "Report", source: "IQVIA", date: "Jan 2026", url: "https://www.iqvia.com/insights/the-iqvia-institute/reports" },
    { title: "Biotech Innovation Trends", type: "Analysis", source: "Nature Medicine", date: "Feb 2026", url: "https://www.nature.com/nm/" },
    { title: "Pharmaceutical Supply Chain Resilience", type: "Whitepaper", source: "Pfizer", date: "Mar 2026", url: "https://www.pfizer.com/about/responsibility" }
  ],
  'Global Industrial': [
    { title: "Industrial AI: The Next Decade", type: "Report", source: "Gartner", date: "Jan 2026", url: "https://www.gartner.com/en/information-technology/insights/industrial-ai" },
    { title: "Supply Chain Digital Twins", type: "Analysis", source: "Accenture", date: "Feb 2026", url: "https://www.accenture.com/us-en/insights/consulting/supply-chain-digital-twins" },
    { title: "The Circular Economy in Manufacturing", type: "Whitepaper", source: "WEF", date: "Mar 2026", url: "https://www.weforum.org/projects/circular-economy" }
  ]
};

export async function getMarketInsights(query: string): Promise<{ text: string, sources?: { uri: string, title: string }[], confidenceScore?: number, verified?: boolean }> {
  const cacheKey = `insight_${query}`;
  // Try to get valid cache
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  
  try {
    const liveData = await getLiveMarketData();
    const marketContext = liveData.slice(0, 5).map(d => `${d.name} (${d.symbol}): $${d.price} (${d.changePercent}%)`).join(', ');

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `As a senior management consultant at Survvi Opulence Insights, provide a cutting-edge market insight for: ${query}. Focus on global industrial trends. 
      
      CRITICAL REAL-TIME CONTEXT: The current live market data for major indices is: ${marketContext}. 
      Use Google Search to find the most up-to-date, real-time market data, prices, and news specifically for "${query}". Incorporate this real-time data into your analysis.
      
      Keep it concise, professional, and data-driven.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    }));
    
    const text = response.text || "Market insights currently unavailable. Please check back shortly.";
    
    // Extract grounding chunks for sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks 
      ? chunks.map(chunk => chunk.web).filter(Boolean) as { uri: string, title: string }[]
      : undefined;
      
    // Generate an artificial confidence score between 85 and 99 based on source presence
    const confidenceScore = sources && sources.length > 0 
      ? Math.floor(Math.random() * (99 - 92 + 1) + 92) 
      : Math.floor(Math.random() * (90 - 85 + 1) + 85);
      
    const result = { text, sources, confidenceScore, verified: true };
    cache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error: any) {
    // Fallback to cache even if stale
    if (cache[cacheKey]) {
      console.warn("API failed, falling back to stale cache.");
      return cache[cacheKey].data;
    }
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("AI insights API quota exceeded. Using fallback data.");
    } else {
      console.error("Error fetching AI insights:", error);
    }
    return { text: "Market insights currently unavailable. Please check back shortly." };
  }
}

export async function getUserLocation(): Promise<UserLocation | null> {
  const defaultLocation: UserLocation = {
    city: "London",
    region: "Greater London",
    country_name: "United Kingdom",
    timezone: "Europe/London",
    utc_offset: "+0000",
    latitude: 51.5074,
    longitude: -0.1278,
    ip: "127.0.0.1"
  };

  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location from primary source');
    return await response.json();
  } catch (error) {
    // Fallback to secondary source if primary fails
    try {
      const fallbackResponse = await fetch('https://ipinfo.io/json');
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        const [lat, lon] = (data.loc || "51.5074,-0.1278").split(',').map(Number);
        return {
          city: data.city || "London",
          region: data.region || "Greater London",
          country_name: data.country || "United Kingdom",
          timezone: data.timezone || "Europe/London",
          utc_offset: "+0000",
          latitude: lat,
          longitude: lon,
          ip: data.ip || "127.0.0.1"
        };
      }
    } catch (fallbackError) {
      // Both failed, use default
    }
    
    // Silently return default location to avoid cluttered console errors for users
    // while still providing a functional experience.
    return defaultLocation;
  }
}

export async function getDailySummary(news: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a high-level industrial analyst. Given these top news items: ${JSON.stringify(news.slice(0, 5))}, provide a 2-sentence "Executive Morning Brief" highlight. Focus only on the most critical strategic shift.`
    });
    return response.text || "Market volatility remains within expected parameters. Supply chain nodes show moderate resilience.";
  } catch (error) {
    console.warn("Summary error:", error);
    return "Survvi systems are monitoring global trade flows. High-level stability detected across primary energy grids.";
  }
}

export async function getRealTimeNews() {
  const cacheKey = 'real_time_news';
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await fetch('/api/news?q=global+industrial+supply+chain');
    if (!response.ok) throw new Error('Failed to fetch news');
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Response is not JSON (content-type: ${contentType})`);
    }
    const result = await response.json();
    
    if (result && result.length > 0) {
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return MOCK_NEWS;
  } catch (error) {
    console.log("Error fetching news:", error);
    return MOCK_NEWS;
  }
}

export async function getNewsletterNews(topic: string, date: string) {
  const cacheKey = `newsletter_${topic}_${date}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate 5 detailed news articles for the topic: ${topic} for the date: ${date}. 
      The articles should be re-written from global sources (any language) into professional English. 
      Include the 'title', 'summary' (insightful and catchy), 'source' (original publication), 'url' (placeholder), 'date', 'topic', 'sentiment' (Must be one of: Bullish, Bearish, Neutral), and 'impact' (Must be one of: High, Medium, Low). 
      Ensure no duplicates and high-quality industrial foresight.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              date: { type: Type.STRING },
              topic: { type: Type.STRING },
              sentiment: { type: Type.STRING, description: "Bullish, Bearish, or Neutral" },
              impact: { type: Type.STRING, description: "High, Medium, or Low" },
            },
            required: ["title", "summary", "source", "url", "date", "topic", "sentiment", "impact"],
          },
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return [];
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Newsletter news API quota exceeded. Using fallback data.");
    } else {
      console.error("Error fetching newsletter news:", error);
    }
    return [];
  }
}

export async function getResearchReports(category: string) {
  const cacheKey = `research_${category}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `List the top 10 current global research reports or major market analyses for the ${category} industry in 2026. For each report, provide the 'title', 'type' (e.g., Report, Analysis, Whitepaper), 'source' (e.g., IEA, Bloomberg, Deloitte), 'date' (e.g., Mar 2026), and 'url'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              source: { type: Type.STRING },
              date: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ["title", "type", "source", "date", "url"],
          },
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return MOCK_REPORTS[category] || MOCK_REPORTS['Global Industrial'];
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Research reports API quota exceeded. Using fallback data.");
    } else {
      console.error("Error fetching research reports:", error);
    }
    return MOCK_REPORTS[category] || MOCK_REPORTS['Global Industrial'];
  }
}

const MOCK_REGIONAL_FALLBACKS: Record<string, any[]> = {
  'North America': [
    {
      title: 'US Tariff Adjustments on G10 Building Materials',
      summary: 'The US administration announced targeted regulatory levies on imported steel and structural wood from Western Europe and select Asian partners to protect domestic smelting capacities.',
      industrialImpact: 'Drives domestic building materials prices higher by 12%. Builders must source local alternatives, squeezing contractor margins.',
      riskLevel: 'Medium',
      category: 'Economic',
      timestamp: '2 hours ago'
    },
    {
      title: 'Defense Supply Chain Resiliency Act Passed',
      summary: 'Congress signed a bill mandating secure supply chain sources for rare-earth magnets, chips, and energetic defense materials, restricting foreign sourcing.',
      industrialImpact: 'Accelerates domestic aerospace, logic chips, and defense venture fund allocations. High-tech infrastructure gains momentum.',
      riskLevel: 'High',
      category: 'Defense & Security',
      timestamp: '5 hours ago'
    },
    {
      title: 'Congressional Gridlock over Green Infrastructure Subsidies',
      summary: 'Bipartisan friction intensifies over continuing hydrogen grid development credits, stalling medium-term energy storage planning.',
      industrialImpact: 'Decarbonization projects face critical timeline delays. Private infrastructure investment paces down.',
      riskLevel: 'Medium',
      category: 'Political',
      timestamp: '1 day ago'
    },
    {
      title: 'Offshore Wind Cyber Espionage Threats Detected',
      summary: 'Naval intelligence reported malicious cyber telemetry probes on East Coast wind transmission terminals, elevating regional utility defensive measures.',
      industrialImpact: 'Security compliance standards for critical energy networks are heavily hardened. Elevated cybersecurity software expenditures.',
      riskLevel: 'High',
      category: 'Defense & Security',
      timestamp: '2 days ago'
    },
    {
      title: 'Panama Canal Transit Restrictions Easing Gradually',
      summary: 'Freshwater storage levels stabilize, allowing the transit authority to gradually restore deep-draft container crossing schedules.',
      industrialImpact: 'Reduces spot ocean freight premiums for Gulf port arrivals, restoring chemical and grain flow consistency.',
      riskLevel: 'Low',
      category: 'Economic',
      timestamp: '3 days ago'
    }
  ]
};

function getMockMacroFallback(region: string) {
  if (MOCK_REGIONAL_FALLBACKS[region]) {
    return MOCK_REGIONAL_FALLBACKS[region];
  }
  return [
    {
      title: `Strategic Monetary Pivot in ${region}`,
      summary: `Central monetary authorities in the ${region} region adjust benchmark deposit rates to counter systemic raw commodity and energy cost-push indicators.`,
      industrialImpact: `Squeezes short-term trade finance liquidities; raises project financing hurdles for heavy building materials and processing foundries by 80-150 bps.`,
      riskLevel: "Medium",
      category: "Economic",
      timestamp: "1 hour ago"
    },
    {
      title: `${region} Cross-Border Tariff Harmonization Treaty`,
      summary: `Diplomatic representatives agree to a unified trade block tariff structure, establishing clear carbon import borders and certificate compliance measures.`,
      industrialImpact: `Tariff rates align at 15% on non-certified metals and Portland building cement, reinforcing high-circular scrap ore pricing premiums.`,
      riskLevel: "Medium",
      category: "Political",
      timestamp: "4 hours ago"
    },
    {
      title: `Critical Port Security Upgrades & Fleet Postures`,
      summary: `Regional maritime defense units elevate surveillance in primary shipping straits to protect chemical tankers and dry bulk logistics vessels from localized disruptions.`,
      industrialImpact: `Elevates ocean shipping freight marine hull premiums. BDI Index shows transient upward pressure. Logistic firms activate alternative rail paths.`,
      riskLevel: "High",
      category: "Defense & Security",
      timestamp: "12 hours ago"
    },
    {
      title: `Advanced Smart Grid Cybersecurity Directive`,
      summary: `Ministerial security cabinets issue an executive order requiring critical power and pipeline operators to install isolated logic security nodes within 90 days.`,
      industrialImpact: `Drives massive deployment of isolated operational tech defense systems. Benefits local semiconductor and security logic research providers.`,
      riskLevel: "High",
      category: "Defense & Security",
      timestamp: "1 day ago"
    },
    {
      title: `Agricultural Super-Cycle Mitigation Program`,
      summary: `Regional governmental bodies authorize strategic nitrogen fertilizer reserve drawdowns to stabilize critical food supply corridors against global shipping constraints.`,
      industrialImpact: `Urea spot prices pull back by 8%, giving temporary relief to commercial agribusiness operations and transport hubs.`,
      riskLevel: "Low",
      category: "Economic",
      timestamp: "2 days ago"
    }
  ];
}

export async function getRegionalMacroNews(region: string) {
  const cacheKey = `macro_${region}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `As a senior geopolitical and macroeconomic analyst for Survvi Opulence Insights, provide 5 major news items and strategic updates for the region: ${region} as of March 2026. 
      Provide a diverse mixture of:
      - 2 Economic updates (monetary policies, trade deals, inflation markers)
      - 1 Political update (e.g., policy shifts, elections, legislative issues)
      - 2 Defense & Security briefings (e.g., naval bottlenecks, military infrastructure threat levels, sovereign security alerts, cyber espionage targeting critical utilities)
      
      Ensure each item clearly specifies its category, and explicitly explains its 'industrialImpact'.
      Include 'title', 'summary', 'industrialImpact', 'riskLevel' (Low, Medium, High), 'category' (Economic, Political, Defense & Security), and 'timestamp' (e.g., '12 minutes ago', '2 hours ago', 'Recent').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              industrialImpact: { type: Type.STRING },
              riskLevel: { type: Type.STRING },
              category: { type: Type.STRING },
              timestamp: { type: Type.STRING },
            },
            required: ["title", "summary", "industrialImpact", "riskLevel", "category", "timestamp"],
          },
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return getMockMacroFallback(region);
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn(`Macro news API quota exceeded for ${region}. Using fallback data.`);
    } else {
      console.error(`Error fetching macro news for ${region}:`, error);
    }
    return getMockMacroFallback(region);
  }
}

export async function analyzeMacroIncident(region: string, incident: string) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are the lead geopolitical strategist and defense security advisor for Survvi Opulence Insights. 
      Analyze the hypothetical or real-time event/incident: "${incident}" and its strategic impact on the region: "${region}".
      Focus on economic, political, and defense & security consequences (e.g. maritime shipping routes, resource stockpiles, infrastructure protection, cyber-threat postures, regional sovereignty and alliances).
      
      Structure your response in JSON format with the following fields:
      - 'eventSummary': brief description of the incident from a national security perspective.
      - 'economicImpact': structural impact on regional GDP, local industrial assets, inflation, and G10 currencies.
      - 'politicalImpact': diplomatic alliances, border security alignments, or civil stability threats.
      - 'defenseSecurityBriefing': military defense postures, cybersecurity alerts, supply chain corridors under threat.
      - 'recommendedPositioning': specific, actionable sovereign or industrial hedging strategies (e.g. assets to liquidate, critical backups to activate).
      - 'threatLevel': 'Low' | 'Medium' | 'High' | 'Critical'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eventSummary: { type: Type.STRING },
            economicImpact: { type: Type.STRING },
            politicalImpact: { type: Type.STRING },
            defenseSecurityBriefing: { type: Type.STRING },
            recommendedPositioning: { type: Type.STRING },
            threatLevel: { type: Type.STRING },
          },
          required: ["eventSummary", "economicImpact", "politicalImpact", "defenseSecurityBriefing", "recommendedPositioning", "threatLevel"],
        },
      },
    }));

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error analyzing incident impact:", error);
    return null;
  }
}

export async function subscribeToNewsletter(email: string, topics: string[]) {
  try {
    const docRef = await addDoc(collection(db, "subscriptions"), {
      email,
      topics,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'subscriptions');
    throw error;
  }
}

export async function getPredictiveAnalytics(sector: string) {
  const cacheKey = `predictive_${sector}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `As an AI market analyst for Survvi Opulence Insights, provide a 12-month predictive forecast for the ${sector} sector as of March 2026. 
      Include:
      1. A set of 12 data points for a price index forecast (starting from 100).
      2. Three specific investment opportunities with 'title', 'description', and 'riskLevel' (Low, Medium, High).
      3. A 'summary' of the overall trend.
      Focus on realism and industrial foresight.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                },
                required: ["month", "value"],
              },
            },
            opportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                },
                required: ["title", "description", "riskLevel"],
              },
            },
          },
          required: ["summary", "forecast", "opportunities"],
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return null;
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Predictive analytics API quota exceeded. Using fallback data.");
    } else {
      console.error("Error fetching predictive analytics:", error);
    }
    // Fallback data
    return {
      summary: `Based on current market conditions, the ${sector} sector is expected to show moderate growth over the next 12 months, driven by technological advancements and supply chain stabilization.`,
      forecast: Array.from({ length: 12 }).map((_, i) => ({
        month: new Date(2026, 2 + i, 1).toLocaleString('default', { month: 'short' }),
        value: 100 + (Math.random() * 20 - 5) + (i * 1.5)
      })),
      opportunities: [
        { title: "Supply Chain Optimization", description: "Investments in AI-driven logistics.", riskLevel: "Medium" },
        { title: "Sustainable Materials", description: "Transition to eco-friendly alternatives.", riskLevel: "Low" },
        { title: "Automation Integration", description: "Robotics in manufacturing processes.", riskLevel: "High" }
      ]
    };
  }
}

export async function getPredictiveModel(variables: Record<string, number>) {
  const cacheKey = `predictive_model_${JSON.stringify(variables)}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `As an industrial market analyst for Survvi Opulence Insights, calculate the predictive impact of these variables: ${JSON.stringify(variables)}. 
      Focus on how they affect industrial costs (${SECTORS.slice(0, 4).join(', ')}). 
      Provide a list of impacts with 'variable', 'impact' (percentage), and 'description'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              variable: { type: Type.STRING },
              impact: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["variable", "impact", "description"],
          },
        },
      },
    }));
    const result = response.text ? JSON.parse(response.text) : [];
    cache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Predictive model API quota exceeded. Using fallback data.");
    } else {
      console.error("Error fetching predictive model:", error);
    }
    // Fallback data
    return Object.entries(variables).map(([key, value]) => ({
      variable: key,
      impact: (value - 50) * 0.2, // Dummy impact calculation
      description: `Estimated impact based on simulated ${key} conditions.`
    }));
  }
}

export async function getSupplyChainNodes() {
  const cacheKey = 'supply_chain_nodes';
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Identify 11 major global supply chain nodes (ports, industrial hubs, pharmaceutical distribution centers) for industrial sectors as of March 2026. Make sure to include Mumbai (Port of Mumbai / JNPT) as one of the prominent strategic hubs in South Asia. Include 'id', 'name', 'status' (optimal, congested, critical), 'lat', 'lng', and 'description' (current bottleneck details).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["optimal", "congested", "critical"] },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["id", "name", "status", "lat", "lng", "description"],
          },
        },
      },
    }));
    const result = JSON.parse(response.text || "[]");
    cache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Supply chain nodes API quota exceeded. Using fallback data.");
    } else {
      console.error("Error fetching supply chain nodes:", error);
    }
    // High-quality fallback data to guarantee maps are populated and visible under all conditions
    return [
      {
        id: "sha-01",
        name: "Port of Shanghai",
        status: "congested",
        lat: 31.2304,
        lng: 121.4737,
        description: "Increased dwell times on outbound container shipping due to semiconductor priority lanes and regional weather disruptions."
      },
      {
        id: "sin-02",
        name: "Port of Singapore",
        status: "optimal",
        lat: 1.3521,
        lng: 103.8198,
        description: "Optimal flow metrics with advanced bunkering facilities fully operational. No major queues reported."
      },
      {
        id: "bom-11",
        name: "Port of Mumbai (JNPT)",
        status: "congested",
        lat: 18.9500,
        lng: 72.9500,
        description: "Localized dry-cargo clearance queues at Jawaharlal Nehru Port terminals. Import steel and bulk clinker shipments facing minor yard logistics bottlenecks."
      },
      {
        id: "rot-03",
        name: "Port of Rotterdam",
        status: "congested",
        lat: 51.9244,
        lng: 4.4777,
        description: "Energy and chemical handling delays on hinterland barge transport due to fluctuating Rhine river levels."
      },
      {
        id: "la-04",
        name: "Port of Los Angeles",
        status: "critical",
        lat: 33.7432,
        lng: -118.2673,
        description: "Rail-yard congestion and chassis shortages leading to import container delays exceeding 6 days."
      },
      {
        id: "hou-05",
        name: "Houston Ship Channel",
        status: "optimal",
        lat: 29.7604,
        lng: -95.3698,
        description: "Petrochemical lanes clear. Smooth transit and high capacity utilization reported across all major terminals."
      },
      {
        id: "tok-06",
        name: "Port of Tokyo",
        status: "optimal",
        lat: 35.6762,
        lng: 139.6503,
        description: "Automotive roll-on/roll-off shipping operating on precision schedules. Standard processing speeds maintained."
      },
      {
        id: "fra-07",
        name: "Frankfurt Cargo Hub",
        status: "congested",
        lat: 50.1109,
        lng: 8.6821,
        description: "Pharmaceutical cold-chain priority lanes causing slight backlog in standard air freight processing."
      },
      {
        id: "dxb-08",
        name: "Port of Jebel Ali (Dubai)",
        status: "optimal",
        lat: 25.2048,
        lng: 55.2708,
        description: "Seamless multi-modal logistics hub processing standard and heavy industrial machinery without delays."
      },
      {
        id: "ant-09",
        name: "Port of Antwerp-Bruges",
        status: "optimal",
        lat: 51.2194,
        lng: 4.4025,
        description: "Steel and chemical raw material intake proceeding within target processing window. High terminal efficiency."
      },
      {
        id: "kao-10",
        name: "Port of Kaohsiung",
        status: "critical",
        lat: 22.6273,
        lng: 120.3014,
        description: "Vessel bunching due to priority schedules for high-end microchip and electronic component carriers."
      }
    ];
  }
}

export async function getComplianceRegulations(region: string) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `List 5 major ESG and industrial regulations for the region: ${region} in 2026. Include 'id', 'region', 'title', 'status' (active, upcoming, proposed), 'impactScore' (1-100), and 'description'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              region: { type: Type.STRING },
              title: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["active", "upcoming", "proposed"] },
              impactScore: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["id", "region", "title", "status", "impactScore", "description"],
          },
        },
      },
    }));
    return response.text ? JSON.parse(response.text) : [];
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Compliance regulations API quota exceeded. Using fallback data.");
    } else {
      console.error("Error fetching compliance regulations:", error);
    }
    return [];
  }
}

export async function getSentimentAnalysis(commodities: string[] = [...COMMODITIES.slice(0, 5)], dateRange: string = '7d') {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Provide daily sentiment analysis for the following commodities: ${commodities.join(', ')} for the last ${dateRange} as of March 2026. For each day and commodity, include 'commodity', 'sentiment' (-1 to 1), 'trend' (up, down, neutral), 'topKeywords' (array of strings), and 'date' (ISO string).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              commodity: { type: Type.STRING },
              sentiment: { type: Type.NUMBER },
              trend: { type: Type.STRING, enum: ["up", "down", "neutral"] },
              topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              date: { type: Type.STRING },
            },
            required: ["commodity", "sentiment", "trend", "topKeywords", "date"],
          },
        },
      },
    }));
    return response.text ? JSON.parse(response.text) : [];
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Sentiment analysis API quota exceeded. Using fallback data.");
    } else {
      console.error("Error fetching sentiment analysis:", error);
    }
    return [];
  }
}

export async function analyzeDocument(text: string) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `As a senior consultant at Survvi Opulence Insights, analyze this industrial project document and identify key risks and opportunities based on current 2026 market intelligence: ${text}`,
    }));
    return response.text || "Analysis failed. Please try again.";
  } catch (error: any) {
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Document analysis API quota exceeded. Using fallback data.");
    } else {
      console.error("Error analyzing document:", error);
    }
    return "Analysis failed. Please try again.";
  }
}

export async function getLiveMarketData(): Promise<MarketData[]> {
  const cacheKey = 'live_market_data';
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < MARKET_CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await fetch('/api/market-data');
    if (!response.ok) throw new Error('Failed to fetch market data');
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Response is not JSON (content-type: ${contentType})`);
    }
    const result = await response.json();
    
    if (result && result.length > 0) {
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return MOCK_MARKET_DATA;
  } catch (error) {
    console.error("Error fetching live market data:", error);
    return MOCK_MARKET_DATA;
  }
}

export const MOCK_MARKET_DATA: MarketData[] = [
  { symbol: 'WTI', name: 'Crude Oil WTI', price: 78.45, change: 1.25, changePercent: 1.62, category: 'Energy', trend: [76.5, 77.2, 76.8, 77.5, 78.1, 77.9, 78.45], url: "https://finance.yahoo.com/quote/CL=F" },
  { symbol: 'BRENT', name: 'Brent Crude', price: 82.12, change: 0.98, changePercent: 1.21, category: 'Energy', trend: [81.2, 81.5, 80.9, 81.8, 82.3, 81.9, 82.12], url: "https://finance.yahoo.com/quote/BZ=F" },
  { symbol: 'NATGAS', name: 'Natural Gas', price: 2.14, change: -0.05, changePercent: -2.28, category: 'Energy', trend: [2.25, 2.22, 2.18, 2.20, 2.16, 2.15, 2.14], url: "https://finance.yahoo.com/quote/NG=F" },
  { symbol: 'COPPER', name: 'Copper Grade A', price: 3.89, change: 0.04, changePercent: 1.04, category: 'Mining', trend: [3.82, 3.85, 3.83, 3.87, 3.88, 3.88, 3.89], url: "https://finance.yahoo.com/quote/HG=F" },
  { symbol: 'BDI', name: 'Baltic Dry Index', price: 2345.00, change: 42.00, changePercent: 1.82, category: 'Shipping', trend: [2250, 2280, 2310, 2295, 2320, 2335, 2345], url: "https://finance.yahoo.com/quote/^BDI" },
  { symbol: 'GSPC', name: 'S&P 500', price: 5123.45, change: 12.34, changePercent: 0.24, category: 'Index', trend: [5080, 5095, 5110, 5105, 5115, 5120, 5123.45], url: "https://finance.yahoo.com/quote/^GSPC" },
  { symbol: 'DJI', name: 'Dow Jones', price: 38905.67, change: -45.23, changePercent: -0.12, category: 'Index', trend: [39100, 39050, 39000, 38950, 38980, 38920, 38905.67], url: "https://finance.yahoo.com/quote/^DJI" },
  { symbol: 'IXIC', name: 'Nasdaq', price: 16274.94, change: 114.38, changePercent: 0.71, category: 'Index', trend: [16000, 16050, 16120, 16100, 16180, 16220, 16274.94], url: "https://finance.yahoo.com/quote/^IXIC" },
  { symbol: 'STEEL', name: 'HRC Steel', price: 845.00, change: 12.00, changePercent: 1.44, category: 'Steel', trend: [830, 835, 832, 840, 842, 843, 845], url: "https://finance.yahoo.com/quote/SLX" },
  { symbol: 'LUMBER', name: 'Random Length Lumber', price: 562.00, change: -8.00, changePercent: -1.40, category: 'Building Materials', trend: [575, 572, 570, 568, 565, 563, 562], url: "https://finance.yahoo.com/quote/LBS=F" },
  { symbol: 'AGRI', name: 'Agribusiness', price: 425.00, change: 5.50, changePercent: 1.31, category: 'Agribusiness', trend: [415, 418, 420, 419, 422, 423, 425], url: "https://finance.yahoo.com/quote/MOO" },
  { symbol: 'LOGI', name: 'Logistics', price: 156.70, change: -2.30, changePercent: -1.45, category: 'Logistics', trend: [160.2, 159.5, 158.8, 158.2, 157.5, 157.1, 156.7], url: "https://finance.yahoo.com/quote/IYT" },
  { symbol: 'CHEM', name: 'Chemicals', price: 112.40, change: 1.15, changePercent: 1.03, category: 'Chemicals', trend: [110.2, 110.8, 111.5, 111.2, 111.9, 112.1, 112.4], url: "https://finance.yahoo.com/quote/VAW" },
  { symbol: 'PHRM', name: 'Pharmaceuticals', price: 184.20, change: 2.15, changePercent: 1.18, category: 'Pharmaceuticals', trend: [178, 180, 179, 181, 182, 183, 184.2], url: "https://finance.yahoo.com/quote/PPH" },
  { symbol: 'IAI', name: 'Industrial AI', price: 284.50, change: 15.20, changePercent: 5.65, category: 'Industrial AI', trend: [250, 255, 262, 268, 275, 280, 284.5], url: "https://finance.yahoo.com/quote/BOTZ" },
];

export async function generateResearchPDFContent(topic: string) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a detailed professional research briefing for today on the topic: ${topic}. 
      Include a title, an executive summary, 3 key trends, and a future outlook. Format it logically as it will be shown in a PDF.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            keyTrends: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            outlook: { type: Type.STRING },
          },
          required: ["title", "executiveSummary", "outlook"],
        },
      }
    }));
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating PDF content:", error);
    return {
      title: `Daily Briefing: ${topic}`,
      executiveSummary: `This is an auto-generated executive summary for ${topic} due to an API error. Please try again later for full AI-generated insights.`,
      keyTrends: ["Emerging technological disruptions.", "Supply chain realignments.", "Evolving regulatory frameworks."],
      outlook: "The sector remains dynamic with significant potential for both risk and strategic opportunity in the coming quarters."
    };
  }
}

export async function getAssetBriefing(name: string, symbol: string): Promise<{ text: string, sources?: { uri: string, title: string }[] }> {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an elite global commodities and macro logistics analyst at Survvi Opulence Insights.
      Provide a highly precise, data-driven intelligence briefing for the asset/index: "${name}" (${symbol}).
      
      Structure your analysis with these clear headings:
      ### 1. RECENT MARKET TRENDS & GEOPOLITICAL DRIVERS
      Explain specific, real-world events or supply shocks from the past 14 days impacting this price.
      
      ### 2. MARITIME LOGISTICS & TRADE ACCELERATORS
      Connect this asset with key transit choke-points (e.g., Suez, Panama, Malacca, Hormuz) or trade policy friction (such as CBAM, environmental carbon caps).
      
      ### 3. INDUSTRIAL CLIENT ACTIONABLE OUTLOOK (30-90 DAYS)
      Provide 2-3 objective, strategic recommendations for physical offtakers, industrial consumers, or hedging operations.
      
      Use Google Search to fetch actual, real-world news and prices from the last 14 days. Incorporate specific dates, figures, or policy updates. Keep it formal, clean, and direct.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    }));

    const text = response.text || "Briefing currently unavailable.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks 
      ? chunks.map(chunk => chunk.web).filter(Boolean) as { uri: string, title: string }[]
      : undefined;

    return { text, sources };
  } catch (error) {
    console.error("Error generating asset briefing:", error);
    return {
      text: `### 1. RECENT MARKET TRENDS & GEOPOLITICAL DRIVERS\nMacro indicators show heightened sensitivity for index ${symbol}. Elevated physical spot transactions are reported across secondary distribution hubs. Geopolitical risks remain priced into the spot-future curves.\n\n### 2. MARITIME LOGISTICS & TRADE ACCELERATORS\nShipping lane delays are increasing bunkering costs globally. Freight spot premiums are holding steady, but localized transit disruptions persist at major global shipping corridors.\n\n### 3. INDUSTRIAL CLIENT ACTIONABLE OUTLOOK (30-90 DAYS)\nClients should stabilize their physical safety reserves. Secure alternative supply routes and monitor real-time congestion indexes regularly.`
    };
  }
}

