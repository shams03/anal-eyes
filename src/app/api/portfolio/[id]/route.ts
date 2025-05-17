import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchBatchPrices } from "@/lib/priceFetcher";
import { generatePortfolioInsights } from "@/lib/gemini";

type RouteContext = {
  params: {
    id: string;
  };
};

// GET portfolio by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: context.params.id },
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
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Check if user has access
    const isOwner = session?.user?.email === portfolio.user.email;
    const isPublic = portfolio.visibility === "PUBLIC";
    const isSmartShared =
      portfolio.visibility === "SMART_SHARED" && portfolio.sharedAccess;

    // For shared portfolios, check if the request has a valid share token
    const url = new URL(request.url);
    const shareToken = url.searchParams.get("token");
    const hasValidShareToken =
      shareToken && portfolio.sharedAccess?.token === shareToken;

    if (!isOwner && !isPublic && !(isSmartShared && hasValidShareToken)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Fetch current prices for holdings
    const symbols = portfolio.holdings.map((holding) => holding.symbol);
    const prices = await fetchBatchPrices(symbols);

    // Calculate current values
    const holdingsWithValues = portfolio.holdings.map((holding) => {
      const currentPrice = prices[holding.symbol] || 0;
      return {
        ...holding,
        currentPrice,
        value: currentPrice * holding.quantity,
      };
    });

    // Calculate total value
    const totalValue = holdingsWithValues.reduce(
      (sum, holding) => sum + holding.value,
      portfolio.cash
    );

    return NextResponse.json({
      ...portfolio,
      holdings: holdingsWithValues,
      totalValue,
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

// Update portfolio
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, visibility, cash, holdings } = body;

    // Verify portfolio exists and user has ownership
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id: context.params.id },
      include: { user: true },
    });

    if (!existingPortfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    if (existingPortfolio.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Update portfolio
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: context.params.id },
      data: {
        name,
        description,
        visibility,
        cash,
        lastUpdated: new Date(),
      },
    });

    // Handle holdings updates if provided
    if (holdings && Array.isArray(holdings)) {
      // Delete existing holdings first
      await prisma.holding.deleteMany({
        where: { portfolioId: context.params.id },
      });

      // Create new holdings
      for (const holding of holdings) {
        await prisma.holding.create({
          data: {
            symbol: holding.symbol,
            name: holding.name,
            quantity: holding.quantity,
            portfolioId: context.params.id,
          },
        });
      }
    }

    // Generate new insights
    const updatedPortfolioWithHoldings = await prisma.portfolio.findUnique({
      where: { id: context.params.id },
      include: { holdings: true },
    });

    if (!updatedPortfolioWithHoldings) {
      return NextResponse.json(
        { error: "Failed to fetch updated portfolio" },
        { status: 500 }
      );
    }

    const symbols = updatedPortfolioWithHoldings.holdings.map((h) => h.symbol);
    const prices = await fetchBatchPrices(symbols);

    const holdingsWithPrices = updatedPortfolioWithHoldings.holdings.map(
      (h) => ({
        ...h,
        price: prices[h.symbol] || 0,
        value: (prices[h.symbol] || 0) * h.quantity,
      })
    );

    const insights = await generatePortfolioInsights(
      holdingsWithPrices,
      updatedPortfolioWithHoldings.cash
    );

    // Update with new insights
    await prisma.portfolio.update({
      where: { id: context.params.id },
      data: {
        insightSummary: insights,
      },
    });

    return NextResponse.json({
      message: "Portfolio updated successfully",
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  // ... rest of the function implementation ...
}
