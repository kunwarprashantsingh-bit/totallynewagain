import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import YahooFinanceImport from "yahoo-finance2";
const YahooFinanceClass: any = (YahooFinanceImport as any).default || YahooFinanceImport;
const yahooFinance = new YahooFinanceClass();
import Parser from "rss-parser";

const parser = new Parser();

// Server-side cache for market data
let marketDataCache: { data: any, timestamp: number } | null = null;
const MARKET_CACHE_TTL = 60 * 1000; // 60 seconds

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/market-data", async (req, res) => {
    try {
      // Check cache
      if (marketDataCache && (Date.now() - marketDataCache.timestamp < MARKET_CACHE_TTL)) {
        return res.json(marketDataCache.data);
      }

      const tickers = [
        { symbol: 'CL=F', displaySymbol: 'WTI', name: 'Crude Oil WTI', category: 'Energy' },
        { symbol: 'BZ=F', displaySymbol: 'BRENT', name: 'Brent Crude', category: 'Energy' },
        { symbol: 'NG=F', displaySymbol: 'NATGAS', name: 'Natural Gas', category: 'Energy' },
        { symbol: 'HG=F', displaySymbol: 'COPPER', name: 'Copper Grade A', category: 'Mining' },
        { symbol: 'BDRY', displaySymbol: 'BDI', name: 'Baltic Dry Index (ETF)', category: 'Shipping' },
        { symbol: '^BDI', displaySymbol: 'BDI', name: 'Baltic Dry Index', category: 'Shipping' },
        { symbol: '^GSPC', displaySymbol: 'GSPC', name: 'S&P 500', category: 'Index' },
        { symbol: '^DJI', displaySymbol: 'DJI', name: 'Dow Jones', category: 'Index' },
        { symbol: '^IXIC', displaySymbol: 'IXIC', name: 'Nasdaq', category: 'Index' },
        { symbol: 'SLX', displaySymbol: 'STEEL', name: 'Steel (ETF)', category: 'Steel' },
        { symbol: 'LBS=F', displaySymbol: 'LUMBER', name: 'Lumber', category: 'Building Materials' },
        { symbol: 'MOO', displaySymbol: 'AGRI', name: 'Agribusiness (ETF)', category: 'Agribusiness' },
        { symbol: 'IYT', displaySymbol: 'LOGI', name: 'Logistics (ETF)', category: 'Logistics' },
        { symbol: 'VAW', displaySymbol: 'CHEM', name: 'Chemicals (ETF)', category: 'Chemicals' },
        { symbol: 'PPH', displaySymbol: 'PHRM', name: 'Pharma (ETF)', category: 'Pharmaceuticals' },
        { symbol: 'BOTZ', displaySymbol: 'IAI', name: 'Industrial AI (ETF)', category: 'Industrial AI' },
      ];

      const results = await Promise.allSettled(
        tickers.map(async (t) => {
          const quote = await yahooFinance.quote(t.symbol) as any;
          const historical = await yahooFinance.historical(t.symbol, { 
            period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
            period2: new Date(),
            interval: '1d' 
          }).catch(() => null) as any[];
          
          const trend = Array.isArray(historical) ? historical.map((h: any) => h?.close).filter(Boolean) : [];
          
          return {
            symbol: t.displaySymbol,
            name: t.name,
            price: quote ? quote.regularMarketPrice || 0 : 0,
            change: quote ? quote.regularMarketChange || 0 : 0,
            changePercent: quote ? quote.regularMarketChangePercent || 0 : 0,
            category: t.category,
            trend: trend.length > 0 ? trend : [quote ? quote.regularMarketPrice || 0 : 0],
            url: `https://finance.yahoo.com/quote/${t.symbol}`
          };
        })
      );

      const marketData = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.price > 0)
        .map(r => r.value);

      // If multiple BDI sources, prefer ^BDI if it has a valid price
      const bdiIndex = marketData.find(d => d.name === 'Baltic Dry Index' && d.price > 0);
      const finalData = marketData.filter(d => {
        if (d.symbol === 'BDI') {
          if (bdiIndex) return d.name === 'Baltic Dry Index';
          return d.name === 'Baltic Dry Index (ETF)';
        }
        return true;
      });

      // Update cache
      marketDataCache = { data: finalData, timestamp: Date.now() };

      res.json(finalData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const query = req.query.q || "global industrial supply chain";
      const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(query as string)}&hl=en-US&gl=US&ceid=US:en`);
      
      const news = feed.items.slice(0, 5).map(item => ({
        title: item.title,
        summary: item.contentSnippet || item.content || "Read full article for details.",
        source: item.source || "Google News",
        url: item.link,
        date: item.pubDate,
        riskLevel: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low", // Mocked risk level for now
        industry: (query as string).toLowerCase().includes("defense") ? "Defense & Aerospace" : "General Industrial",
        relevance: Math.floor(Math.random() * (98 - 75 + 1) + 75)
      }));

      res.json(news);
    } catch (error) {
      console.log("Error fetching news from live source, using fallback:", error);
      const fallbackNews = [
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
      res.json(fallbackNews);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
