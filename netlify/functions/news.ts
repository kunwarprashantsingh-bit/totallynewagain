import Parser from "rss-parser";

const parser = new Parser();

const FALLBACK_NEWS = [
  {
    title: "Defense Sector Ramps Up Next-Generation Aerospace Production",
    summary: "Commercial and defense aerospace manufacturers align workflows to meet surging demand for advanced materials and high-precision tooling.",
    source: "Aerospace Defense Intelligence",
    url: "https://www.defenseaerospace.com/news",
    date: new Date().toISOString().split('T')[0],
    riskLevel: "Medium",
    industry: "Defense & Aerospace",
    relevance: 97
  },
  { 
    title: "Global Steel Demand Set to Rise in 2026", 
    summary: "Analysts predict a 3% increase in steel consumption driven by major infrastructure projects in Southeast Asia and India.", 
    source: "World Steel Association", 
    url: "https://worldsteel.org/steel-topics/statistics/",
    date: new Date().toISOString().split('T')[0],
    riskLevel: "Low",
    industry: "Steel",
    relevance: 95
  },
  { 
    title: "Green Hydrogen: The New Frontier for Energy Grids", 
    summary: "New electrolysis techniques are bringing down the cost of green hydrogen, making it an immediate alternative for heavy industry.", 
    source: "International Energy Agency", 
    url: "https://www.iea.org/reports/hydrogen",
    date: new Date().toISOString().split('T')[0],
    riskLevel: "Medium",
    industry: "Energy",
    relevance: 88
  },
  { 
    title: "Cement Industry Decarbonization Accelerates", 
    summary: "Leading cement manufacturers announce a breakthrough in carbon capture technology, aiming for net-zero by 2040.", 
    source: "Global Cement and Concrete Association", 
    url: "https://gccassociation.org/news/",
    date: new Date().toISOString().split('T')[0],
    riskLevel: "Low",
    industry: "Building Materials",
    relevance: 92
  },
  { 
    title: "Autonomous Cargo Systems Redefine Defense Logistics", 
    summary: "Survvi systems indicate a rapid scale of unmanned logistics, optimizing supply key hubs and increasing route resilience.", 
    source: "Survvi Strategic Briefing", 
    url: "https://www.survvi.com",
    date: new Date().toISOString().split('T')[0],
    riskLevel: "Low",
    industry: "Defense & Aerospace",
    relevance: 94
  }
];

export const handler = async (event: any, context: any) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    "Access-Control-Allow-Credentials": "true"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    const query = event.queryStringParameters?.q || "global industrial supply chain";
    const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`);
    
    const news = feed.items.slice(0, 5).map((item: any) => ({
      title: item.title,
      summary: item.contentSnippet || item.content || "Read full article for details.",
      source: item.source || "Google News",
      url: item.link,
      date: item.pubDate,
      riskLevel: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low",
      industry: query.toLowerCase().includes("defense") ? "Defense & Aerospace" : "General Industrial",
      relevance: Math.floor(Math.random() * (98 - 75 + 1) + 75)
    }));

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600"
      },
      body: JSON.stringify(news)
    };
  } catch (error) {
    console.log("Error fetching news from live source, using fallback:", error);
    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Cache-Control": "public, max-age=0, s-maxage=0"
      },
      body: JSON.stringify(FALLBACK_NEWS)
    };
  }
};
