"use client";

import { useEffect, useState } from "react";
import { getFingerprint } from "@/lib/fingerprint";

interface TrackedViewProps {
  token: string;
}

export default function TrackedView({ token }: TrackedViewProps) {
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // Track the view only once per page load
    if (tracked) return;

    const trackView = async () => {
      try {
        // Generate a fingerprint for the visitor
        const fingerprint = await getFingerprint();

        // Get user agent and limited IP info
        const userAgent = navigator.userAgent;

        // Send tracking info to the API
        await fetch(`/api/share/${token}/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fingerprint,
            userAgent,
            // Note: IP address will be collected server-side for accuracy
          }),
        });

        setTracked(true);
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();
  }, [token, tracked]);

  // This component doesn't render anything visible
  return null;
}
