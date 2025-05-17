import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInForm from "@/components/SignInForm";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  // If user is already logged in, redirect to dashboard
  console.log("session", session);
  console.log("authOptions", authOptions);
  if (session) {
    redirect("/dashboard");
  } else {
    console.log("No session found, showing sign in page");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Welcome Back</h1>
          <p className="text-black mt-2">Sign in to access your portfolio</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
