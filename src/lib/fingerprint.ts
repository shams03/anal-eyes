import FingerprintJS from "@fingerprintjs/fingerprintjs";

// This function should be called on the client side
export async function getFingerprint(): Promise<string> {
  try {
    // Load FingerprintJS
    const fp = await FingerprintJS.load();

    // Get visitor identifier
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error("Error generating fingerprint:", error);

    // Fallback to a simple fingerprint if the library fails
    const fallbackFingerprint = generateFallbackFingerprint();
    return fallbackFingerprint;
  }
}

// Generate a simple fallback fingerprint from available browser data
function generateFallbackFingerprint(): string {
  const components = [];

  if (typeof navigator !== "undefined") {
    components.push(
      navigator.userAgent,
      navigator.language,
      navigator.hardwareConcurrency,
      navigator.deviceMemory,
      navigator.platform
    );
  }

  if (typeof screen !== "undefined") {
    components.push(
      screen.colorDepth,
      screen.width,
      screen.height,
      screen.availWidth,
      screen.availHeight
    );
  }

  if (typeof Date !== "undefined") {
    components.push(new Date().getTimezoneOffset());
  }

  // Create a simple hash from the components
  const componentStr = components.filter(Boolean).join("|");
  return simpleHash(componentStr);
}

// Simple string hashing function
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
