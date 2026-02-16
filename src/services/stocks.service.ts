import { supabase } from "@/lib/supabase";
import type { Json } from "@/types/database";
import type {
  StocksSettings,
  StocksSettingsInsert,
  StockPeriod,
  StockPeriodInsert,
  StockPeriodUpdate,
} from "@/types";

export const stocksService = {
  // ============================================================================
  // Stocks Settings
  // ============================================================================

  /**
   * Get the current user's stocks settings.
   * Returns null if no settings exist yet.
   */
  async getStocksSettings(): Promise<StocksSettings | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("stocks_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as StocksSettings | null;
  },

  /**
   * Upsert stocks settings for the current user.
   * Creates new settings if none exist, otherwise updates existing.
   */
  async upsertStocksSettings(
    settings: Omit<StocksSettingsInsert, "user_id">,
  ): Promise<StocksSettings> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { other_deductions, ...rest } = settings;
    const { data, error } = await supabase
      .from("stocks_settings")
      .upsert(
        {
          ...rest,
          other_deductions: other_deductions as unknown as Json,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single();

    if (error) throw error;
    return data as unknown as StocksSettings;
  },

  // ============================================================================
  // Stock Periods
  // ============================================================================

  /**
   * List all stock periods for a specific year.
   * Filters by vesting_date year.
   */
  async listStockPeriodsByYear(year: number): Promise<StockPeriod[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await supabase
      .from("stock_periods")
      .select("*")
      .gte("vesting_date", startDate)
      .lte("vesting_date", endDate)
      .order("vesting_date", { ascending: true });

    if (error) throw error;
    return data as StockPeriod[];
  },

  /**
   * Create a new stock period.
   */
  async createStockPeriod(
    period: Omit<StockPeriodInsert, "user_id">,
  ): Promise<StockPeriod> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("stock_periods")
      .insert({
        ...period,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as StockPeriod;
  },

  /**
   * Update an existing stock period.
   */
  async updateStockPeriod(
    id: string,
    updates: StockPeriodUpdate,
  ): Promise<StockPeriod> {
    const { data, error } = await supabase
      .from("stock_periods")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as StockPeriod;
  },

  /**
   * Delete a stock period by ID.
   */
  async deleteStockPeriod(id: string): Promise<void> {
    const { error } = await supabase.from("stock_periods").delete().eq("id", id);

    if (error) throw error;
  },
};
