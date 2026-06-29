import YahooFinanceImport from "yahoo-finance2";

// Robust ESM/CJS interop for yahoo-finance2
const YahooFinanceClass: any = (YahooFinanceImport as any).default || YahooFinanceImport;
const yahooFinance = new YahooFinanceClass();

async function test() {
  try {
    const quote = await yahooFinance.quote("AAPL");
    console.log("AAPL Price:", quote.regularMarketPrice);
  } catch (e: any) {
    console.error("Error quoting:", e.message);
  }
}
test();
