// Mock data for demonstration purposes
const mockPrices: Record<string, number> = {
  AAPL: 185.92,
  MSFT: 416.78,
  GOOGL: 175.09,
  AMZN: 182.81,
  META: 491.83,
  TSLA: 175.34,
  JPM: 204.79,
  BAC: 40.27,
  WMT: 68.1,
  JNJ: 146.57,
  PFE: 26.96,
  XOM: 115.25,
  CVX: 149.84,
  KO: 63.47,
  PEP: 170.62,
  DIS: 111.99,
  NFLX: 633.2,
};

// Add some random fluctuation to simulate real market conditions
function getPriceWithFluctuation(basePrice: number): number {
  const fluctuationPercent = Math.random() * 4 - 2; // -2% to +2%
  return basePrice * (1 + fluctuationPercent / 100);
}

export async function fetchPrice(symbol: string): Promise<number> {
  try {
    // In a real implementation, you would call a stock API here
    // For example: const response = await fetch(`https://api.example.com/stock/${symbol}/price`);

    // For demonstration, we'll use mock data
    if (
      process.env.USE_REAL_STOCK_API === "true" &&
      process.env.STOCK_API_KEY
    ) {
      // Implement real API call here when API key is available
      console.log("Would fetch real price data for", symbol);
    }

    // Check if symbol exists in our mock data
    if (mockPrices[symbol.toUpperCase()]) {
      return getPriceWithFluctuation(mockPrices[symbol.toUpperCase()]);
    }

    // Return a random price for unknown symbols
    return Math.random() * 100 + 50; // Random price between $50 and $150
  } catch (error) {
    console.error("Error fetching price:", error);
    throw new Error("Failed to fetch price");
  }
}

export async function fetchBatchPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  try {
    // In a real implementation, you would batch request prices
    // For example: const response = await fetch(`https://api.example.com/stock/batch?symbols=${symbols.join(',')}`);

    // For demonstration, we'll use mock data with a simulated delay
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    const result: Record<string, number> = {};

    for (const symbol of symbols) {
      result[symbol] = await fetchPrice(symbol);
    }

    return result;
  } catch (error) {
    console.error("Error fetching batch prices:", error);
    throw new Error("Failed to fetch batch prices");
  }
}
