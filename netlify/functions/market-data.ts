import YahooFinanceImport from "yahoo-finance2";

// Robust ESM/CJS interop for yahoo-finance2
const YahooFinanceClass: any = (YahooFinanceImport as any).default || YahooFinanceImport;
const yahooFinance = new YahooFinanceClass();

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

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60"
      },
      body: JSON.stringify(finalData)
    };
  } catch (error) {
    console.error("Error fetching market data in Netlify function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch market data" })
    };
  }
};
