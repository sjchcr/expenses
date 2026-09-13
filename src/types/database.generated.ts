export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      exchange_rates: {
        Row: {
          created_at: string | null
          date: string
          from_currency: string
          id: string
          rate: number
          source: string
          to_currency: string
        }
        Insert: {
          created_at?: string | null
          date: string
          from_currency: string
          id?: string
          rate: number
          source?: string
          to_currency: string
        }
        Update: {
          created_at?: string | null
          date?: string
          from_currency?: string
          id?: string
          rate?: number
          source?: string
          to_currency?: string
        }
        Relationships: []
      }
      expense_buckets: {
        Row: {
          category_ids: Json
          created_at: string | null
          currency: string
          id: string
          monthly_budget: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_ids?: Json
          created_at?: string | null
          currency?: string
          id?: string
          monthly_budget?: number
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_ids?: Json
          created_at?: string | null
          currency?: string
          id?: string
          monthly_budget?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expense_templates: {
        Row: {
          amounts: Json | null
          category_id: string | null
          created_at: string | null
          id: string
          is_recurring: boolean | null
          name: string
          recurrence_day: number | null
          user_id: string
        }
        Insert: {
          amounts?: Json | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_recurring?: boolean | null
          name: string
          recurrence_day?: number | null
          user_id: string
        }
        Update: {
          amounts?: Json | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string
          recurrence_day?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "template_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amounts: Json | null
          category_id: string | null
          created_at: string | null
          due_date: string
          exchange_rate: number | null
          exchange_rate_source: string | null
          id: string
          is_paid: boolean | null
          name: string
          payment_period: string
          template_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amounts?: Json | null
          category_id?: string | null
          created_at?: string | null
          due_date: string
          exchange_rate?: number | null
          exchange_rate_source?: string | null
          id?: string
          is_paid?: boolean | null
          name: string
          payment_period: string
          template_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amounts?: Json | null
          category_id?: string | null
          created_at?: string | null
          due_date?: string
          exchange_rate?: number | null
          exchange_rate_source?: string | null
          id?: string
          is_paid?: boolean | null
          name?: string
          payment_period?: string
          template_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "template_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "expense_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_overrides: {
        Row: {
          bucket_budget_overrides: Json
          created_at: string | null
          excluded_category_ids: Json
          id: string
          month: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bucket_budget_overrides?: Json
          created_at?: string | null
          excluded_category_ids?: Json
          id?: string
          month: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bucket_budget_overrides?: Json
          created_at?: string | null
          excluded_category_ids?: Json
          id?: string
          month?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      salaries: {
        Row: {
          created_at: string | null
          currency: string
          gross_amount: number
          id: string
          month: number
          payment_number: number
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          currency?: string
          gross_amount?: number
          id?: string
          month: number
          payment_number: number
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          currency?: string
          gross_amount?: number
          id?: string
          month?: number
          payment_number?: number
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      salary_records: {
        Row: {
          created_at: string | null
          currency: string
          deductions: Json
          effective_date: string
          gross_amount: number
          id: string
          label: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          deductions?: Json
          effective_date: string
          gross_amount: number
          id?: string
          label: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          deductions?: Json
          effective_date?: string
          gross_amount?: number
          id?: string
          label?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      salary_settings: {
        Row: {
          created_at: string | null
          deductions: Json
          id: string
          rent_tax_brackets: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deductions?: Json
          id?: string
          rent_tax_brackets?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deductions?: Json
          id?: string
          rent_tax_brackets?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stock_periods: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          quantity: number
          stock_price_usd: number
          updated_at: string | null
          user_id: string
          vesting_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity: number
          stock_price_usd: number
          updated_at?: string | null
          user_id: string
          vesting_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          stock_price_usd?: number
          updated_at?: string | null
          user_id?: string
          vesting_date?: string
        }
        Relationships: []
      }
      stocks_settings: {
        Row: {
          broker_cost_usd: number
          created_at: string | null
          local_tax_percentage: number
          other_deductions: Json | null
          updated_at: string | null
          us_tax_percentage: number
          user_id: string
        }
        Insert: {
          broker_cost_usd?: number
          created_at?: string | null
          local_tax_percentage?: number
          other_deductions?: Json | null
          updated_at?: string | null
          us_tax_percentage?: number
          user_id: string
        }
        Update: {
          broker_cost_usd?: number
          created_at?: string | null
          local_tax_percentage?: number
          other_deductions?: Json | null
          updated_at?: string | null
          us_tax_percentage?: number
          user_id?: string
        }
        Relationships: []
      }
      template_groups: {
        Row: {
          color: string
          created_at: string | null
          icon: string
          id: string
          name: string
          template_ids: Json
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          name: string
          template_ids?: Json
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          template_ids?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          language: string | null
          payment_periods: Json
          primary_currency: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          language?: string | null
          payment_periods?: Json
          primary_currency?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          language?: string | null
          payment_periods?: Json
          primary_currency?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
