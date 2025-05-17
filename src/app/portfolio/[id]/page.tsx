import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchBatchPrices } from "@/lib/priceFetcher";
import PortfolioCard from "@/components/PortfolioCard";
import HoldingTable from "@/components/HoldingTable";
import InsightSummary from "@/components/InsightSummary";
import ShareButton from "@/components/ShareButton";

export const metadata: Metadata = {
  title: "Portfolio Details",
  description: "View detailed portfolio information",
};

async function getPortfolioData(id: string, userEmail?: string) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: {
      holdings: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sharedAccess: true,
    },
  });

  if (!portfolio) {
    return null;
  }

  // Check access permissions
  const isOwner = userEmail === portfolio.user.email;
  const isPublic = portfolio.visibility === "PUBLIC";
  const isSmartShared = portfolio.visibility === "SMART_SHARED";

  if (!isOwner && !isPublic && !isSmartShared) {
    return "unauthorized";
  }

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
      currentPrice,
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
    isOwner,
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const portfolioData = await getPortfolioData(
    params.id,
    session?.user?.email || undefined
  );

  if (!portfolioData) {
    notFound();
  }

  if (portfolioData === "unauthorized") {
    redirect("/unauthorized");
  }

  // Transform holdings to include price field
  const holdings = portfolioData.holdings.map((holding) => ({
    ...holding,
    price: holding.currentPrice,
  }));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{portfolioData.name}</h1>
        {portfolioData.isOwner && (
          <div className="flex space-x-2">
            <a
              href={`/portfolio/${params.id}/edit`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
            >
              Edit
            </a>
            {portfolioData.visibility === "SMART_SHARED" &&
              portfolioData.sharedAccess && (
                <ShareButton token={portfolioData.sharedAccess.token} />
              )}
          </div>
        )}
      </div>

      {portfolioData.description && (
        <p className="text-gray-600 mb-6">{portfolioData.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
        <HoldingTable holdings={holdings} />
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
                  // Determine sentiment based on keywords (simplified)
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
  );
}
