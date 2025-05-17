import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface HoldingWithValue {
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
}

export async function generatePortfolioInsights(
  holdings: HoldingWithValue[],
  cash: number
): Promise<string> {
  try {
    // Calculate total portfolio value
    const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalValue = holdingsValue + cash;

    // Calculate sector exposure (simplified)
    const sectors: Record<string, number> = {};
    holdings.forEach((holding) => {
      const sector = getSectorForSymbol(holding.symbol);
      sectors[sector] = (sectors[sector] || 0) + holding.value;
    });

    // Format sector percentages
    const sectorExposure = Object.entries(sectors).map(([sector, value]) => ({
      sector,
      percentage: ((value / holdingsValue) * 100).toFixed(2),
    }));

    // Calculate basic risk metrics (simplified)
    const isHighConcentration = holdings.some(
      (h) => h.value / holdingsValue > 0.25
    );
    const cashPercentage = ((cash / totalValue) * 100).toFixed(2);

    // Sort holdings by value
    const sortedHoldings = [...holdings].sort((a, b) => b.value - a.value);
    const topHoldings = sortedHoldings.slice(0, 5);

    // Construct the prompt
    const prompt = `
      You are a professional portfolio analyst at ValueMetrix. Analyze this portfolio and provide insightful observations.
      
      Portfolio Summary:
      - Total Value: $${totalValue.toLocaleString()}
      - Holdings Value: $${holdingsValue.toLocaleString()} 
      - Cash: $${cash.toLocaleString()} (${cashPercentage}% of portfolio)
      - Number of Holdings: ${holdings.length}
      
      Top Holdings:
      ${topHoldings
        .map(
          (h, i) =>
            `${i + 1}. ${h.name} (${
              h.symbol
            }): $${h.value.toLocaleString()} (${(
              (h.value / totalValue) *
              100
            ).toFixed(2)}% of portfolio)`
        )
        .join("\n")}
      
      Sector Exposure:
      ${sectorExposure.map((s) => `- ${s.sector}: ${s.percentage}%`).join("\n")}
      
      Risk Indicators:
      - High Concentration: ${isHighConcentration ? "Yes" : "No"}
      - Cash Position: ${
        Number(cashPercentage) > 15
          ? "High"
          : Number(cashPercentage) < 5
          ? "Low"
          : "Moderate"
      }
      
      Based on this data, provide:
      1. A concise portfolio summary (2-3 sentences), always start with the word "Using Shams's AI model"
      2. Three key observations about diversification and risk
      3. A one-line investment thesis for this portfolio
      4. One actionable recommendation
      
      Return ONLY a valid JSON object with the following structure, no markdown formatting or additional text:
      {
        "summary": "...",
        "diversification": ["...", "...", "..."],
        "investmentThesis": "...",
        "recommendation": "..."
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Add safety checks and retries
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response text to ensure it's valid JSON
        const cleanedText = text
          .replace(/```json\s*/g, "") // Remove ```json prefix
          .replace(/```\s*$/g, "") // Remove ``` suffix
          .trim(); // Remove extra whitespace

        // Parse the response to ensure it's valid JSON
        try {
          const parsedResponse = JSON.parse(cleanedText);
          return JSON.stringify(parsedResponse);
        } catch (e) {
          console.error("Error parsing Gemini response:", e);
          lastError = e;
          attempts++;
          continue;
        }
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        lastError = error;
        attempts++;
        if (attempts === maxAttempts) break;
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    // If all attempts failed, generate a fallback response based on the portfolio data
    return generateFallbackResponse(
      holdings,
      cash,
      totalValue,
      holdingsValue,
      cashPercentage
    );
  } catch (error) {
    console.error("Error generating portfolio insights:", error);
    return generateFallbackResponse(holdings, cash, 0, 0, "0");
  }
}

function generateFallbackResponse(
  holdings: HoldingWithValue[],
  cash: number,
  totalValue: number,
  holdingsValue: number,
  cashPercentage: string
): string {
  // Generate a basic analysis based on the portfolio data
  const topHoldings = [...holdings]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const summary = `This portfolio has ${
    holdings.length
  } holdings with a total value of $${totalValue.toLocaleString()}, including $${cash.toLocaleString()} in cash (${cashPercentage}%).`;

  const diversification = [
    `The portfolio has ${holdings.length} different holdings, providing some level of diversification.`,
    `Cash position is ${
      Number(cashPercentage) > 15
        ? "high"
        : Number(cashPercentage) < 5
        ? "low"
        : "moderate"
    } at ${cashPercentage}% of total value.`,
    `Top holdings include ${topHoldings.map((h) => h.name).join(", ")}.`,
  ];

  const investmentThesis =
    "This portfolio appears to be structured for long-term growth with some risk management.";

  const recommendation =
    "Consider reviewing your portfolio allocation and consulting with a financial advisor for personalized advice.";

  return JSON.stringify({
    summary,
    diversification,
    investmentThesis,
    recommendation,
  });
}

// Helper function to determine sector for a symbol (simplified)
function getSectorForSymbol(symbol: string): string {
  // This would typically use a real sector database or API
  // For demonstration, we'll use a simplified mapping
  const sectorMap: Record<string, string> = {
    AAPL: "Technology",
    MSFT: "Technology",
    GOOGL: "Technology",
    AMZN: "Consumer Cyclical",
    META: "Technology",
    TSLA: "Automotive",
    JPM: "Financial",
    BAC: "Financial",
    WMT: "Consumer Defensive",
    JNJ: "Healthcare",
    PFE: "Healthcare",
    XOM: "Energy",
    CVX: "Energy",
    KO: "Consumer Defensive",
    PEP: "Consumer Defensive",
    DIS: "Communication Services",
    NFLX: "Communication Services",
  };

  return sectorMap[symbol] || "Other";
}
