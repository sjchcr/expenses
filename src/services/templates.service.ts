import { supabase } from "@/lib/supabase";
import type {
  ExpenseTemplate,
  ExpenseTemplateInsert,
  ExpenseTemplateUpdate,
  TemplateAmount,
} from "@/types";

// Helper to cast database JSON to TemplateAmount[]
const parseAmounts = (amounts: unknown): TemplateAmount[] => {
  if (!amounts || !Array.isArray(amounts)) return [];
  return amounts as TemplateAmount[];
};

// Helper to transform database row to typed ExpenseTemplate
const transformTemplate = (row: {
  id: string;
  user_id: string;
  name: string;
  amounts: unknown;
  is_recurring: boolean | null;
  recurrence_day: number | null;
  created_at: string | null;
}): ExpenseTemplate => ({
  ...row,
  amounts: parseAmounts(row.amounts),
});

export const templatesService = {
  async getTemplates(): Promise<ExpenseTemplate[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("expense_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data || []).map(transformTemplate);
  },

  async getTemplate(id: string): Promise<ExpenseTemplate | null> {
    const { data, error } = await supabase
      .from("expense_templates")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? transformTemplate(data) : null;
  },

  async createTemplate(
    template: Omit<ExpenseTemplateInsert, "user_id">
  ): Promise<ExpenseTemplate> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("expense_templates")
      .insert({
        name: template.name,
        amounts: JSON.parse(JSON.stringify(template.amounts)),
        is_recurring: template.is_recurring,
        recurrence_day: template.recurrence_day,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformTemplate(data);
  },

  async updateTemplate(
    id: string,
    updates: ExpenseTemplateUpdate
  ): Promise<ExpenseTemplate> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.amounts !== undefined)
      updateData.amounts = JSON.parse(JSON.stringify(updates.amounts));
    if (updates.is_recurring !== undefined)
      updateData.is_recurring = updates.is_recurring;
    if (updates.recurrence_day !== undefined)
      updateData.recurrence_day = updates.recurrence_day;

    const { data, error } = await supabase
      .from("expense_templates")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return transformTemplate(data);
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from("expense_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getRecurringTemplates(): Promise<ExpenseTemplate[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("expense_templates")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_recurring", true)
      .order("recurrence_day", { ascending: true });

    if (error) throw error;
    return (data || []).map(transformTemplate);
  },
};
