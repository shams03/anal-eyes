import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchBatchPrices } from "@/lib/priceFetcher";
import { generatePortfolioInsights } from "@/lib/gemini";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, visibility, cash, holdings } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Portfolio name is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        name,
        description,
        visibility,
        cash: cash || 0,
        userId: user.id,
      },
    });

    // Create holdings if provided
    if (holdings && Array.isArray(holdings) && holdings.length > 0) {
      for (const holding of holdings) {
        await prisma.holding.create({
          data: {
            symbol: holding.symbol,
            name: holding.name,
            quantity: holding.quantity,
            portfolioId: portfolio.id,
          },
        });
      }
    }

    // Generate insights if there are holdings
    if (holdings && holdings.length > 0) {
      // Fetch prices for holdings
      const symbols = holdings.map((h) => h.symbol);
      const prices = await fetchBatchPrices(symbols);

      // Calculate values
      const holdingsWithValues = holdings.map((h) => ({
        ...h,
        price: prices[h.symbol] || 0,
        value: (prices[h.symbol] || 0) * h.quantity,
      }));

      // Generate insights
      const insights = await generatePortfolioInsights(
        holdingsWithValues,
        cash || 0
      );

      // Update portfolio with insights
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { insightSummary: insights },
      });
    }

    // Create a share token if visibility is SMART_SHARED
    if (visibility === "SMART_SHARED") {
      const token = nanoid(21); // Generate secure token

      await prisma.sharedPortfolioAccess.create({
        data: {
          token,
          portfolioId: portfolio.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio created successfully",
      portfolio,
    });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio" },
      { status: 500 }
    );
  }
}
