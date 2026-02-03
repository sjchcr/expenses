import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Maneja el deep link cuando la app regresa del OAuth (solo en nativo)
if (Capacitor.isNativePlatform()) {
  App.addListener("appUrlOpen", async ({ url }) => {
    // Supabase devuelve tokens en el hash fragment (#)
    if (url.includes("#")) {
      const hash = url.split("#")[1];
      const params = new URLSearchParams(hash);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
      }
    }

    // Fallback: intenta también con query params (?)
    if (url.includes("?")) {
      const queryString = url.split("?")[1];
      const params = new URLSearchParams(queryString);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
      }
    }
  });
}
