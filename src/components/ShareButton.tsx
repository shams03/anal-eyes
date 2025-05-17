"use client";

import { useState } from "react";

interface ShareButtonProps {
  token: string;
}

export default function ShareButton({ token }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const shareUrl = `${window.location.origin}/share/${token}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRevokeAccess = async () => {
    if (
      confirm(
        "Are you sure you want to revoke access to this shared link? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`/api/share/${token}/revoke`, {
          method: "POST",
        });

        if (response.ok) {
          alert("Shared access has been revoked successfully.");
        } else {
          const data = await response.json();
          throw new Error(data.error || "Failed to revoke access");
        }
      } catch (error) {
        console.error("Error revoking access:", error);
        alert("Failed to revoke access. Please try again later.");
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center"
      >
        <span className="mr-1">Share</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shareable Link
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-grow text-sm border border-gray-300 rounded-l-md p-2"
              />
              <button
                onClick={copyToClipboard}
                className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-3 hover:bg-gray-200"
              >
                {isCopied ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Anyone with this link can view this portfolio without logging in
            </p>
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-200">
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <button
              onClick={handleRevokeAccess}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Revoke Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
