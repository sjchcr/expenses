import { supabase } from "@/lib/supabase";
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from "@/lib/categoryOptions";
import type {
  ExpenseCategory,
  ExpenseCategoryInsert,
  ExpenseCategoryUpdate,
} from "@/types";

const parseTemplateIds = (templateIds: unknown): string[] => {
  if (!templateIds || !Array.isArray(templateIds)) return [];
  return templateIds as string[];
};

const transformCategory = (row: {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  template_ids: unknown;
  created_at: string | null;
}): ExpenseCategory => ({
  ...row,
  color: row.color || DEFAULT_CATEGORY_COLOR,
  icon: row.icon || DEFAULT_CATEGORY_ICON,
  template_ids: parseTemplateIds(row.template_ids),
});

export const categoriesService = {
  async getCategories(): Promise<ExpenseCategory[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("template_groups")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data || []).map(transformCategory);
  },

  async createCategory(
    category: Omit<ExpenseCategoryInsert, "user_id" | "template_ids">,
  ): Promise<ExpenseCategory> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("template_groups")
      .insert({
        name: category.name,
        color: category.color || DEFAULT_CATEGORY_COLOR,
        icon: category.icon || DEFAULT_CATEGORY_ICON,
        template_ids: [],
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformCategory(data);
  },

  async updateCategory(
    id: string,
    updates: ExpenseCategoryUpdate,
  ): Promise<ExpenseCategory> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.icon !== undefined) updateData.icon = updates.icon;

    const { data, error } = await supabase
      .from("template_groups")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return transformCategory(data);
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from("template_groups")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
