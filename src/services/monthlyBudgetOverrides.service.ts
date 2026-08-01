import { supabase } from "@/lib/supabase";
import type { MonthlyBudgetOverride } from "@/types";

const parseCategoryIds = (categoryIds: unknown): string[] => {
  if (!categoryIds || !Array.isArray(categoryIds)) return [];
  return categoryIds as string[];
};

const parseBudgetOverrides = (
  budgetOverrides: unknown,
): Record<string, number> => {
  if (
    !budgetOverrides ||
    Array.isArray(budgetOverrides) ||
    typeof budgetOverrides !== "object"
  ) {
    return {};
  }

  return Object.entries(budgetOverrides).reduce<Record<string, number>>(
    (acc, [bucketId, amount]) => {
      if (typeof amount === "number" && Number.isFinite(amount)) {
        acc[bucketId] = amount;
      }
      return acc;
    },
    {},
  );
};

const transformOverride = (row: {
  id: string;
  user_id: string;
  month: string;
  bucket_budget_overrides: unknown;
  excluded_category_ids: unknown;
  created_at: string | null;
  updated_at: string | null;
}): MonthlyBudgetOverride => ({
  ...row,
  bucket_budget_overrides: parseBudgetOverrides(row.bucket_budget_overrides),
  excluded_category_ids: parseCategoryIds(row.excluded_category_ids),
});

export const monthlyBudgetOverridesService = {
  async getOverride(month: string): Promise<MonthlyBudgetOverride | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("monthly_budget_overrides")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .maybeSingle();

    if (error) throw error;
    return data ? transformOverride(data) : null;
  },

  async saveOverride({
    month,
    excludedCategoryIds,
    bucketBudgetOverrides,
  }: {
    month: string;
    excludedCategoryIds: string[];
    bucketBudgetOverrides: Record<string, number>;
  }): Promise<MonthlyBudgetOverride> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("monthly_budget_overrides")
      .upsert(
        {
          user_id: user.id,
          month,
          bucket_budget_overrides: bucketBudgetOverrides,
          excluded_category_ids: excludedCategoryIds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,month" },
      )
      .select()
      .single();

    if (error) throw error;
    return transformOverride(data);
  },
};
