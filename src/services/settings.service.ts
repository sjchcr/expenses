import { supabase } from "@/lib/supabase";
import type { UserSettings } from "@/types";

export const settingsService = {
  async getSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If no settings exist, return defaults
      if (error.code === "PGRST116") {
        return {
          user_id: user.id,
          primary_currency: "USD",
          payment_periods: [
            { period: 1, start_day: 1, end_day: 15 },
            { period: 2, start_day: 16, end_day: 31 },
          ],
        } as UserSettings;
      }
      throw error;
    }

    return data as unknown as UserSettings;
  },

  async initializeSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if settings already exist
    const { data: existing } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    // Only create if they don't exist
    if (!existing) {
      const defaultPeriods = [
        { period: 1, start_day: 1, end_day: 15 },
        { period: 2, start_day: 16, end_day: 31 },
      ];

      const { data, error } = await supabase
        .from("user_settings")
        .insert({
          user_id: user.id,
          primary_currency: "USD",
          payment_periods: defaultPeriods as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as UserSettings;
    }

    return existing;
  },

  async updateSettings(
    settings: Partial<
      Omit<UserSettings, "user_id" | "created_at" | "updated_at">
    >
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const updateData: any = {
      user_id: user.id,
    };

    if (settings.primary_currency) {
      updateData.primary_currency = settings.primary_currency;
    }

    if (settings.payment_periods) {
      updateData.payment_periods = settings.payment_periods;
    }

    const { data, error } = await supabase
      .from("user_settings")
      .upsert(updateData)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as UserSettings;
  },
};
