import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { fingerprint, userAgent, ipAddress } = await request.json();
    const token = params.token;

    // Find the shared access token
    const sharedAccess = await prisma.sharedPortfolioAccess.findUnique({
      where: { token },
    });

    if (!sharedAccess) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (sharedAccess.isRevoked) {
      return NextResponse.json({ error: "Access revoked" }, { status: 403 });
    }

    // Create access log
    await prisma.tokenAccessLog.create({
      data: {
        accessToken: sharedAccess.id,
        fingerprint,
        ipAddress,
        userAgent,
      },
    });

    // Increment view count
    await prisma.sharedPortfolioAccess.update({
      where: { id: sharedAccess.id },
      data: { viewCount: { increment: 1 } },
    });

    // If user is logged in, associate their account with this token for persistent access
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        // Check if user ID is already in viewerIds
        const alreadyHasAccess = sharedAccess.viewerIds.includes(user.id);

        if (!alreadyHasAccess) {
          // Add user to viewers
          await prisma.sharedPortfolioAccess.update({
            where: { id: sharedAccess.id },
            data: {
              viewerIds: {
                push: user.id,
              },
            },
          });

          // Add token to user's accessed tokens
          await prisma.user.update({
            where: { id: user.id },
            data: {
              accessedTokenIds: {
                push: sharedAccess.id,
              },
            },
          });
        }
      }
    }

    return NextResponse.json({
      message: "Access tracked successfully",
      portfolioId: sharedAccess.portfolioId,
    });
  } catch (error) {
    console.error("Error tracking share access:", error);
    return NextResponse.json(
      { error: "Failed to track share" },
      { status: 500 }
    );
  }
}
