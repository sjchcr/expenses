import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import type { UserSettings } from "@/types";

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

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      settings: Partial<
        Omit<UserSettings, "user_id" | "created_at" | "updated_at">
      >
    ) => settingsService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });
}
