import { supabase } from "@/lib/supabase";
import type {
  ExpenseBucket,
  ExpenseBucketInsert,
  ExpenseBucketUpdate,
} from "@/types";

const parseCategoryIds = (categoryIds: unknown): string[] => {
  if (!categoryIds || !Array.isArray(categoryIds)) return [];
  return categoryIds as string[];
};

const transformBucket = (row: {
  id: string;
  user_id: string;
  name: string;
  monthly_budget: number;
  currency: string;
  category_ids: unknown;
  created_at: string | null;
  updated_at: string | null;
}): ExpenseBucket => ({
  ...row,
  category_ids: parseCategoryIds(row.category_ids),
});

export const expenseBucketsService = {
  async getBuckets(): Promise<ExpenseBucket[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("expense_buckets")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data || []).map(transformBucket);
  },

  async createBucket(
    bucket: Omit<ExpenseBucketInsert, "user_id">,
  ): Promise<ExpenseBucket> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("expense_buckets")
      .insert({
        name: bucket.name,
        monthly_budget: bucket.monthly_budget ?? 0,
        currency: bucket.currency ?? "USD",
        category_ids: bucket.category_ids ?? [],
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformBucket(data);
  },

  async updateBucket(
    id: string,
    updates: ExpenseBucketUpdate,
  ): Promise<ExpenseBucket> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.monthly_budget !== undefined) {
      updateData.monthly_budget = updates.monthly_budget;
    }
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.category_ids !== undefined) {
      updateData.category_ids = updates.category_ids;
    }

    const { data, error } = await supabase
      .from("expense_buckets")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return transformBucket(data);
  },

  async deleteBucket(id: string): Promise<void> {
    const { error } = await supabase
      .from("expense_buckets")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
