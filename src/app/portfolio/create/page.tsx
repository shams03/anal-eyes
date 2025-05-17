import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PortfolioForm from "@/components/PortfolioForm";

export const metadata: Metadata = {
  title: "Create Portfolio",
  description: "Create a new portfolio",
};

export default async function CreatePortfolioPage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);

  if (!session) {
    // Redirect to login if not authenticated
    redirect("/api/auth/signin?callbackUrl=/portfolio/create");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Portfolio</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <PortfolioForm userId={session.user.id!} />
      </div>
    </main>
  );
}
