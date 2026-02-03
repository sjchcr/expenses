import { supabase } from "@/lib/supabase";
import { Capacitor } from "@capacitor/core";

export const authService = {
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const redirectTo = Capacitor.isNativePlatform()
      ? "cr.steven.expensestracker://callback"
      : `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    if (error) throw error;
    return data;
  },

  async signInWithApple() {
    const redirectTo = Capacitor.isNativePlatform()
      ? "cr.steven.expensestracker://callback"
      : `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo,
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  async updateProfile(data: { firstName?: string; lastName?: string }) {
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
    const { data: userData, error } = await supabase.auth.updateUser({
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: fullName,
      },
    });
    if (error) throw error;
    return userData.user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};
