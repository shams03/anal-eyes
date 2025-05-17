import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { fetchBatchPrices } from "@/lib/priceFetcher";
import PortfolioCard from "@/components/PortfolioCard";
import HoldingTable from "@/components/HoldingTable";
import InsightSummary from "@/components/InsightSummary";
import TrackedView from "@/components/TrackedView";

export const metadata: Metadata = {
  title: "Shared Portfolio",
  description: "View shared portfolio information",
};

async function getSharedPortfolio(token: string) {
  // Find the shared access token
  const sharedAccess = await prisma.sharedPortfolioAccess.findUnique({
    where: { token },
    include: {
      portfolio: {
        include: {
          holdings: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!sharedAccess || sharedAccess.isRevoked) {
    return null;
  }

  // Verify portfolio visibility
  if (sharedAccess.portfolio.visibility !== "SMART_SHARED") {
    return null;
  }

  const portfolio = sharedAccess.portfolio;

  // Fetch current prices for holdings
  const symbols = portfolio.holdings.map((holding) => holding.symbol);
  const prices = await fetchBatchPrices(symbols);

  // Calculate current values and changes (mock for now)
  const holdingsWithValues = portfolio.holdings.map((holding) => {
    const currentPrice = prices[holding.symbol] || 0;
    // In a real app, you would fetch historical prices to calculate real change
    // This is a mock calculation for demonstration
    const randomChange = Math.random() * 10 - 5; // Random between -5% and 5%

    return {
      ...holding,
      price: currentPrice,
      value: currentPrice * holding.quantity,
      change: parseFloat(randomChange.toFixed(2)),
    };
  });

  // Calculate total value
  const totalValue = holdingsWithValues.reduce(
    (sum, holding) => sum + holding.value,
    portfolio.cash
  );

  // Calculate total change (simplified)
  const totalChange =
    holdingsWithValues.length > 0
      ? holdingsWithValues.reduce((sum, h) => sum + h.change, 0) /
        holdingsWithValues.length
      : 0;

  // Parse insights if available
  let insights = null;
  if (portfolio.insightSummary) {
    try {
      insights = JSON.parse(portfolio.insightSummary);
    } catch (e) {
      console.error("Error parsing insights:", e);
    }
  }

  return {
    ...portfolio,
    holdings: holdingsWithValues,
    totalValue,
    totalChange,
    insights,
    creatorName: portfolio.user.name,
    viewCount: sharedAccess.viewCount,
  };
}

export default async function SharedPortfolioPage({
  params,
}: {
  params: { token: string };
}) {
  const portfolioData = await getSharedPortfolio(params.token);

  if (!portfolioData) {
    notFound();
  }

  return (
    <>
      <TrackedView token={params.token} />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-indigo-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-indigo-700">
                This is a shared view of {portfolioData.creatorName || "a user"}
                's portfolio.
                <span className="ml-1 font-medium">
                  Viewed {portfolioData.viewCount} times.
                </span>
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">{portfolioData.name}</h1>

        {portfolioData.description && (
          <p className="text-gray-600 mb-6">{portfolioData.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PortfolioCard
            title="Total Value"
            value={portfolioData.totalValue}
            change={portfolioData.totalChange}
          />
          <PortfolioCard title="Cash" value={portfolioData.cash} change={0} />
          <PortfolioCard
            title="Number of Holdings"
            value={portfolioData.holdings.length}
            change={0}
            hideChangeIndicator
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Holdings</h2>
          <HoldingTable holdings={portfolioData.holdings} />
        </div>

        {portfolioData.insights && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InsightSummary
                title="Portfolio Analysis"
                insights={[
                  {
                    text: portfolioData.insights.summary,
                    sentiment: "neutral",
                  },
                  {
                    text: portfolioData.insights.investmentThesis,
                    sentiment: "positive",
                  },
                ]}
              />
              <InsightSummary
                title="Diversification & Risk"
                insights={portfolioData.insights.diversification.map(
                  (text: string) => ({
                    text,
                    sentiment:
                      text.toLowerCase().includes("risk") ||
                      text.toLowerCase().includes("concern")
                        ? "negative"
                        : text.toLowerCase().includes("well") ||
                          text.toLowerCase().includes("strong")
                        ? "positive"
                        : "neutral",
                  })
                )}
              />
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">Recommendation</h3>
              <p className="text-blue-700">
                {portfolioData.insights.recommendation}
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
