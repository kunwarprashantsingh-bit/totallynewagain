import YahooFinanceImport from "yahoo-finance2";
const YahooFinanceClass: any = (YahooFinanceImport as any).default || YahooFinanceImport;
const yahooFinance = new YahooFinanceClass();

async function test() {
  const tickers = [
    { symbol: 'CL=F', name: 'Crude Oil WTI', category: 'Energy' },
    { symbol: 'BZ=F', name: 'Brent Crude', category: 'Energy' },
    { symbol: 'NG=F', name: 'Natural Gas', category: 'Energy' },
    { symbol: 'HG=F', name: 'Copper Grade A', category: 'Mining' },
    { symbol: 'BDRY', name: 'Baltic Dry Index (ETF)', category: 'Shipping' },
    { symbol: '^BDI', name: 'Baltic Dry Index', category: 'Shipping' },
    { symbol: '^GSPC', name: 'S&P 500', category: 'Index' },
    { symbol: '^DJI', name: 'Dow Jones', category: 'Index' },
    { symbol: '^IXIC', name: 'Nasdaq', category: 'Index' },
    { symbol: 'SLX', name: 'Steel (ETF)', category: 'Steel' },
    { symbol: 'LBS=F', name: 'Lumber', category: 'Building Materials' },
    { symbol: 'MOO', name: 'Agribusiness (ETF)', category: 'Agribusiness' },
    { symbol: 'IYT', name: 'Logistics (ETF)', category: 'Logistics' },
    { symbol: 'VAW', name: 'Chemicals (ETF)', category: 'Chemicals' },
    { symbol: 'PPH', name: 'Pharma (ETF)', category: 'Pharmaceuticals' },
    { symbol: 'BOTZ', name: 'Industrial AI (ETF)', category: 'Industrial AI' },
  ];

  console.log("Fetching...");
  const start = Date.now();
  const results = await Promise.allSettled(
    tickers.map(async (t) => {
      const quote = await yahooFinance.quote(t.symbol) as any;
      const historical = await yahooFinance.historical(t.symbol, { 
        period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
        period2: new Date(),
        interval: '1d' 
      }) as any[];
      return quote.regularMarketPrice;
    })
  );
  console.log("Done in", Date.now() - start, "ms");
  console.log(results.map((r, i) => r.status === 'rejected' ? `${tickers[i].symbol}: ${r.reason}` : r.status));
}

test();
