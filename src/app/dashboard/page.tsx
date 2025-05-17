import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch user's portfolios
  const portfolios = await prisma.portfolio.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      holdings: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="bg-[#1a1a1a] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-indigo-400">Anal-Eyes</div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, {session.user.name || session.user.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-gray-300 hover:text-white"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Your Portfolios</h1>
          <Link
            href="/portfolio/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create New Portfolio
          </Link>
        </div>

        {portfolios.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              No Portfolios Yet
            </h2>
            <p className="text-gray-300 mb-4">
              Create your first portfolio to get started with portfolio analysis
              and sharing.
            </p>
            <Link
              href="/portfolio/create"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Portfolio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <Link
                key={portfolio.id}
                href={`/portfolio/${portfolio.id}`}
                className="bg-[#1a1a1a] rounded-lg shadow-md p-6 hover:bg-[#222222] transition-colors"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {portfolio.name}
                </h3>
                {portfolio.description && (
                  <p className="text-gray-300 mb-4">{portfolio.description}</p>
                )}
                <div className="flex justify-between items-center text-gray-300">
                  <span>{portfolio.holdings.length} holdings</span>
                  <span>${portfolio.cash.toLocaleString()} cash</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
