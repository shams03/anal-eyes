import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = params.token;

    // Find the shared access
    const sharedAccess = await prisma.sharedPortfolioAccess.findUnique({
      where: { token },
      include: {
        portfolio: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!sharedAccess) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    // Check if requester is the portfolio owner
    if (sharedAccess.portfolio.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized: Only the portfolio owner can revoke access" },
        { status: 403 }
      );
    }

    // Revoke the access
    await prisma.sharedPortfolioAccess.update({
      where: { id: sharedAccess.id },
      data: { isRevoked: true },
    });

    return NextResponse.json({ message: "Share revoked successfully" });
  } catch (error) {
    console.error("Error revoking share:", error);
    return NextResponse.json(
      { error: "Failed to revoke share" },
      { status: 500 }
    );
  }
}
 