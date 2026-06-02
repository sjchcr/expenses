import { Capacitor } from "@capacitor/core";

const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getApiBaseUrl(featureName = "API"): string | null {
  if (ENV_API_BASE_URL) {
    return ENV_API_BASE_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && !Capacitor.isNativePlatform()) {
    return window.location.origin;
  }

  console.warn(
    `${featureName} base URL is not configured. Set VITE_API_BASE_URL for native builds.`,
  );
  return null;
}
