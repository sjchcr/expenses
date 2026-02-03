import { supabase } from "@/lib/supabase";
import type { Salary, SalaryInsert, SalaryUpdate } from "@/types";

export const salariesService = {
  // Get salaries for a specific aguinaldo year
  // Aguinaldo year X includes: December of year X-1 and January-November of year X
  async getSalariesForAguinaldoYear(aguinaldoYear: number): Promise<Salary[]> {
    const { data, error } = await supabase
      .from("salaries")
      .select("*")
      .or(
        `and(year.eq.${aguinaldoYear - 1},month.eq.12),and(year.eq.${aguinaldoYear},month.gte.1,month.lte.11)`,
      )
      .order("year", { ascending: true })
      .order("month", { ascending: true })
      .order("payment_number", { ascending: true });

    if (error) throw error;
    return data as Salary[];
  },

  async upsertSalary(
    salary: Omit<SalaryInsert, "user_id">,
  ): Promise<Salary> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("salaries")
      .upsert(
        {
          ...salary,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,year,month,payment_number",
        },
      )
      .select()
      .single();

    if (error) throw error;
    return data as Salary;
  },

  async updateSalary(id: string, updates: SalaryUpdate): Promise<Salary> {
    const { data, error } = await supabase
      .from("salaries")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Salary;
  },

  async deleteSalary(id: string): Promise<void> {
    const { error } = await supabase.from("salaries").delete().eq("id", id);

    if (error) throw error;
  },
};
