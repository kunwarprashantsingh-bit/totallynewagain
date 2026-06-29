import YahooFinanceImport from "yahoo-finance2";
const YahooFinanceClass: any = (YahooFinanceImport as any).default || YahooFinanceImport;
const yahooFinance = new YahooFinanceClass();

async function test() {
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
      return { symbol: t.symbol, price: quote.regularMarketPrice };
    })
  );

  console.log(results.map(r => r.status === 'fulfilled' ? `${r.value.symbol}: ${r.value.price}` : r.reason));
}
test();
