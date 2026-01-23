import { supabase } from "@/lib/supabase";
import type {
  TemplateGroup,
  TemplateGroupInsert,
  TemplateGroupUpdate,
} from "@/types";

// Helper to cast database JSON to string[]
const parseTemplateIds = (templateIds: unknown): string[] => {
  if (!templateIds || !Array.isArray(templateIds)) return [];
  return templateIds as string[];
};

// Helper to transform database row to typed TemplateGroup
const transformGroup = (row: {
  id: string;
  user_id: string;
  name: string;
  template_ids: unknown;
  created_at: string | null;
}): TemplateGroup => ({
  ...row,
  template_ids: parseTemplateIds(row.template_ids),
});

export const templateGroupsService = {
  async getGroups(): Promise<TemplateGroup[]> {
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
    return (data || []).map(transformGroup);
  },

  async getGroup(id: string): Promise<TemplateGroup | null> {
    const { data, error } = await supabase
      .from("template_groups")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? transformGroup(data) : null;
  },

  async createGroup(
    group: Omit<TemplateGroupInsert, "user_id">
  ): Promise<TemplateGroup> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("template_groups")
      .insert({
        name: group.name,
        template_ids: JSON.parse(JSON.stringify(group.template_ids)),
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformGroup(data);
  },

  async updateGroup(
    id: string,
    updates: TemplateGroupUpdate
  ): Promise<TemplateGroup> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.template_ids !== undefined)
      updateData.template_ids = JSON.parse(JSON.stringify(updates.template_ids));

    const { data, error } = await supabase
      .from("template_groups")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return transformGroup(data);
  },

  async deleteGroup(id: string): Promise<void> {
    const { error } = await supabase
      .from("template_groups")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
