"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-6">
            {error === "Configuration"
              ? "There is a problem with the server configuration."
              : error === "AccessDenied"
              ? "You do not have permission to sign in."
              : error === "Verification"
              ? "The verification token has expired or has already been used."
              : "An error occurred during authentication."}
          </p>
          <Link
            href="/auth/signin"
            className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
