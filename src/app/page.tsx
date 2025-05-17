import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">Anal-Eyes</div>
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signin"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black mb-6">
            Smart Portfolio Management
            <br />
            <span className="text-indigo-600">Powered by AI</span>
          </h1>
          <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
            Create, manage, and share your investment portfolios with
            intelligent insights. Get AI-powered analysis and recommendations
            for your investments.
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="bg-indigo-600 text-black px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700"
            >
              Start Free
            </Link>
            <Link
              href="#features"
              className="text-indigo-600 px-8 py-3 rounded-md text-lg font-medium hover:text-indigo-800"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">
            Why Choose Anal-Eyes?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-2xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">Secure Sharing</h3>
              <p className="text-gray-600">
                Share your portfolios securely with customizable access controls
                and view tracking.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-2xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
              <p className="text-gray-600">
                Get intelligent portfolio analysis and recommendations powered
                by Google&apos;s Gemini AI.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-2xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor your portfolio performance and track viewer engagement
                in real-time.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 Anal-Eyes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
