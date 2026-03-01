import { supabase } from "@/lib/supabase";
import type { Json } from "@/types/database";
import type {
  SalarySettings,
  SalarySettingsInsert,
  SalaryRecord,
  SalaryRecordInsert,
  SalaryRecordUpdate,
} from "@/types";

export const salaryService = {
  // ============================================================================
  // Salary Settings
  // ============================================================================

  async getSalarySettings(): Promise<SalarySettings | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("salary_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as SalarySettings | null;
  },

  async upsertSalarySettings(
    settings: Omit<SalarySettingsInsert, "user_id">,
  ): Promise<SalarySettings> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { deductions, rent_tax_brackets, ...rest } = settings;
    const { data, error } = await supabase
      .from("salary_settings")
      .upsert(
        {
          ...rest,
          deductions: deductions as unknown as Json,
          rent_tax_brackets: rent_tax_brackets as unknown as Json,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) throw error;
    return data as unknown as SalarySettings;
  },

  // ============================================================================
  // Salary Records
  // ============================================================================

  async listSalaryRecords(): Promise<SalaryRecord[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("salary_records")
      .select("*")
      .eq("user_id", user.id)
      .order("effective_date", { ascending: false });

    if (error) throw error;
    return data as unknown as SalaryRecord[];
  },

  async createSalaryRecord(
    record: Omit<SalaryRecordInsert, "user_id">,
  ): Promise<SalaryRecord> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { deductions, ...rest } = record;
    const { data, error } = await supabase
      .from("salary_records")
      .insert({
        ...rest,
        deductions: (deductions ?? []) as unknown as Json,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as SalaryRecord;
  },

  async updateSalaryRecord(
    id: string,
    updates: SalaryRecordUpdate,
  ): Promise<SalaryRecord> {
    const { deductions, ...rest } = updates;
    const patch: Record<string, unknown> = {
      ...rest,
      updated_at: new Date().toISOString(),
    };
    if (deductions !== undefined) {
      patch.deductions = deductions as unknown as Json;
    }

    const { data, error } = await supabase
      .from("salary_records")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as SalaryRecord;
  },

  async deleteSalaryRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from("salary_records")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
