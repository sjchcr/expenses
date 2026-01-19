import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";

export function useUserSettings() {
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => settingsService.getSettings(),
  });

  // Initialize settings on first load if they don't exist
  useEffect(() => {
    if (!isLoading && !settings) {
      settingsService.initializeSettings();
    }
  }, [isLoading, settings]);

  return { settings, isLoading, error };
}
