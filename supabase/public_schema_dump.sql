


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."set_expense_buckets_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_expense_buckets_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."exchange_rates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "from_currency" "text" NOT NULL,
    "to_currency" "text" NOT NULL,
    "rate" numeric(20,6) NOT NULL,
    "date" "date" NOT NULL,
    "source" "text" DEFAULT 'exchangerate-api'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."exchange_rates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expense_buckets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "monthly_budget" numeric DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "category_ids" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."expense_buckets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expense_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "is_recurring" boolean DEFAULT false,
    "recurrence_day" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "amounts" "jsonb" DEFAULT '[]'::"jsonb",
    "category_id" "uuid",
    CONSTRAINT "expense_templates_recurrence_day_check" CHECK ((("recurrence_day" >= 1) AND ("recurrence_day" <= 31)))
);


ALTER TABLE "public"."expense_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "due_date" "date" NOT NULL,
    "is_paid" boolean DEFAULT false,
    "payment_period" "text" NOT NULL,
    "template_id" "uuid",
    "exchange_rate" numeric(20,6),
    "exchange_rate_source" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "amounts" "jsonb" DEFAULT '[]'::"jsonb",
    "category_id" "uuid",
    CONSTRAINT "expenses_exchange_rate_source_check" CHECK (("exchange_rate_source" = ANY (ARRAY['api'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."monthly_budget_overrides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "month" "text" NOT NULL,
    "excluded_category_ids" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bucket_budget_overrides" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    CONSTRAINT "monthly_budget_overrides_month_format" CHECK (("month" ~ '^\d{4}-\d{2}$'::"text"))
);


ALTER TABLE "public"."monthly_budget_overrides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."salaries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "year" integer NOT NULL,
    "month" integer NOT NULL,
    "payment_number" integer NOT NULL,
    "gross_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "currency" character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "salaries_month_check" CHECK ((("month" >= 1) AND ("month" <= 12))),
    CONSTRAINT "salaries_payment_number_check" CHECK ((("payment_number" >= 1) AND ("payment_number" <= 2)))
);


ALTER TABLE "public"."salaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."salary_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "gross_amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'CRC'::"text" NOT NULL,
    "effective_date" "date" NOT NULL,
    "deductions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."salary_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."salary_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "deductions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "rent_tax_brackets" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."salary_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_periods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vesting_date" "date" NOT NULL,
    "quantity" integer NOT NULL,
    "stock_price_usd" numeric(12,4) NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "stock_periods_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "stock_periods_stock_price_usd_check" CHECK (("stock_price_usd" >= (0)::numeric))
);


ALTER TABLE "public"."stock_periods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stocks_settings" (
    "user_id" "uuid" NOT NULL,
    "us_tax_percentage" numeric(5,4) DEFAULT 0 NOT NULL,
    "local_tax_percentage" numeric(5,4) DEFAULT 0 NOT NULL,
    "broker_cost_usd" numeric(12,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "other_deductions" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."stocks_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."template_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "template_ids" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "color" "text" DEFAULT '#2563eb'::"text" NOT NULL,
    "icon" "text" DEFAULT 'tag'::"text" NOT NULL
);


ALTER TABLE "public"."template_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "user_id" "uuid" NOT NULL,
    "primary_currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "payment_periods" "jsonb" DEFAULT '[{"period": 1, "end_day": 15, "start_day": 1}, {"period": 2, "end_day": 31, "start_day": 16}]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "language" "text" DEFAULT 'en'::"text"
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."exchange_rates"
    ADD CONSTRAINT "exchange_rates_from_currency_to_currency_date_key" UNIQUE ("from_currency", "to_currency", "date");



ALTER TABLE ONLY "public"."exchange_rates"
    ADD CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_buckets"
    ADD CONSTRAINT "expense_buckets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_templates"
    ADD CONSTRAINT "expense_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_budget_overrides"
    ADD CONSTRAINT "monthly_budget_overrides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_budget_overrides"
    ADD CONSTRAINT "monthly_budget_overrides_user_id_month_key" UNIQUE ("user_id", "month");



ALTER TABLE ONLY "public"."salaries"
    ADD CONSTRAINT "salaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."salaries"
    ADD CONSTRAINT "salaries_user_id_year_month_payment_number_key" UNIQUE ("user_id", "year", "month", "payment_number");



ALTER TABLE ONLY "public"."salary_records"
    ADD CONSTRAINT "salary_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."salary_settings"
    ADD CONSTRAINT "salary_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."salary_settings"
    ADD CONSTRAINT "salary_settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."stock_periods"
    ADD CONSTRAINT "stock_periods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stocks_settings"
    ADD CONSTRAINT "stocks_settings_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."template_groups"
    ADD CONSTRAINT "template_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id");



CREATE UNIQUE INDEX "exchange_rates_daily_pair_idx" ON "public"."exchange_rates" USING "btree" ("from_currency", "to_currency", "date");



CREATE INDEX "exchange_rates_date_idx" ON "public"."exchange_rates" USING "btree" ("date");



CREATE INDEX "expense_buckets_user_id_idx" ON "public"."expense_buckets" USING "btree" ("user_id");



CREATE INDEX "expense_templates_category_id_idx" ON "public"."expense_templates" USING "btree" ("category_id");



CREATE INDEX "expense_templates_user_id_idx" ON "public"."expense_templates" USING "btree" ("user_id");



CREATE INDEX "expenses_category_id_idx" ON "public"."expenses" USING "btree" ("category_id");



CREATE INDEX "expenses_due_date_idx" ON "public"."expenses" USING "btree" ("due_date");



CREATE INDEX "expenses_is_paid_idx" ON "public"."expenses" USING "btree" ("is_paid");



CREATE INDEX "expenses_payment_period_idx" ON "public"."expenses" USING "btree" ("payment_period");



CREATE INDEX "expenses_user_id_idx" ON "public"."expenses" USING "btree" ("user_id");



CREATE INDEX "idx_stock_periods_user_vesting_date" ON "public"."stock_periods" USING "btree" ("user_id", "vesting_date");



CREATE INDEX "idx_stock_periods_vesting_date" ON "public"."stock_periods" USING "btree" ("vesting_date");



CREATE INDEX "salaries_user_year_idx" ON "public"."salaries" USING "btree" ("user_id", "year");



CREATE OR REPLACE TRIGGER "set_expense_buckets_updated_at" BEFORE UPDATE ON "public"."expense_buckets" FOR EACH ROW EXECUTE FUNCTION "public"."set_expense_buckets_updated_at"();



CREATE OR REPLACE TRIGGER "update_expenses_updated_at" BEFORE UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_stock_periods_updated_at" BEFORE UPDATE ON "public"."stock_periods" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_stocks_settings_updated_at" BEFORE UPDATE ON "public"."stocks_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."expense_buckets"
    ADD CONSTRAINT "expense_buckets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_templates"
    ADD CONSTRAINT "expense_templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."template_groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expense_templates"
    ADD CONSTRAINT "expense_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."template_groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."expense_templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."monthly_budget_overrides"
    ADD CONSTRAINT "monthly_budget_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."salaries"
    ADD CONSTRAINT "salaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."salary_records"
    ADD CONSTRAINT "salary_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."salary_settings"
    ADD CONSTRAINT "salary_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stock_periods"
    ADD CONSTRAINT "stock_periods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stocks_settings"
    ADD CONSTRAINT "stocks_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_groups"
    ADD CONSTRAINT "template_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view exchange rates" ON "public"."exchange_rates" FOR SELECT USING (true);



CREATE POLICY "Users can create own expense buckets" ON "public"."expense_buckets" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own expense buckets" ON "public"."expense_buckets" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own expenses" ON "public"."expenses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own templates" ON "public"."expense_templates" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their monthly budget overrides" ON "public"."monthly_budget_overrides" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own salaries" ON "public"."salaries" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own stock periods" ON "public"."stock_periods" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own stocks settings" ON "public"."stocks_settings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own template groups" ON "public"."template_groups" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own expenses" ON "public"."expenses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own settings" ON "public"."user_settings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own templates" ON "public"."expense_templates" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their monthly budget overrides" ON "public"."monthly_budget_overrides" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own salaries" ON "public"."salaries" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own stock periods" ON "public"."stock_periods" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own stocks settings" ON "public"."stocks_settings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own template groups" ON "public"."template_groups" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own salary records" ON "public"."salary_records" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own salary settings" ON "public"."salary_settings" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their monthly budget overrides" ON "public"."monthly_budget_overrides" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own expense buckets" ON "public"."expense_buckets" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own expenses" ON "public"."expenses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own settings" ON "public"."user_settings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own templates" ON "public"."expense_templates" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their monthly budget overrides" ON "public"."monthly_budget_overrides" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own salaries" ON "public"."salaries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own stock periods" ON "public"."stock_periods" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own stocks settings" ON "public"."stocks_settings" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own template groups" ON "public"."template_groups" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own expense buckets" ON "public"."expense_buckets" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own expenses" ON "public"."expenses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own settings" ON "public"."user_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own templates" ON "public"."expense_templates" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own salaries" ON "public"."salaries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own stock periods" ON "public"."stock_periods" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own stocks settings" ON "public"."stocks_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own template groups" ON "public"."template_groups" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."exchange_rates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_buckets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."monthly_budget_overrides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."salaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."salary_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."salary_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stock_periods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stocks_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."template_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."set_expense_buckets_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_expense_buckets_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_expense_buckets_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."exchange_rates" TO "anon";
GRANT ALL ON TABLE "public"."exchange_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."exchange_rates" TO "service_role";



GRANT ALL ON TABLE "public"."expense_buckets" TO "anon";
GRANT ALL ON TABLE "public"."expense_buckets" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_buckets" TO "service_role";



GRANT ALL ON TABLE "public"."expense_templates" TO "anon";
GRANT ALL ON TABLE "public"."expense_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_templates" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_budget_overrides" TO "anon";
GRANT ALL ON TABLE "public"."monthly_budget_overrides" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_budget_overrides" TO "service_role";



GRANT ALL ON TABLE "public"."salaries" TO "anon";
GRANT ALL ON TABLE "public"."salaries" TO "authenticated";
GRANT ALL ON TABLE "public"."salaries" TO "service_role";



GRANT ALL ON TABLE "public"."salary_records" TO "anon";
GRANT ALL ON TABLE "public"."salary_records" TO "authenticated";
GRANT ALL ON TABLE "public"."salary_records" TO "service_role";



GRANT ALL ON TABLE "public"."salary_settings" TO "anon";
GRANT ALL ON TABLE "public"."salary_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."salary_settings" TO "service_role";



GRANT ALL ON TABLE "public"."stock_periods" TO "anon";
GRANT ALL ON TABLE "public"."stock_periods" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_periods" TO "service_role";



GRANT ALL ON TABLE "public"."stocks_settings" TO "anon";
GRANT ALL ON TABLE "public"."stocks_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."stocks_settings" TO "service_role";



GRANT ALL ON TABLE "public"."template_groups" TO "anon";
GRANT ALL ON TABLE "public"."template_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."template_groups" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







