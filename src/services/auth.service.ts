import { supabase } from "@/lib/supabase";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";

// Track if SocialLogin has been initialized
let socialLoginInitialized = false;

// Initialize SocialLogin plugin for native platforms
async function initializeSocialLogin() {
  if (socialLoginInitialized || !Capacitor.isNativePlatform()) {
    return;
  }

  await SocialLogin.initialize({
    google: {
      iOSClientId: import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID,
      iOSServerClientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID,
      webClientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID,
    },
    apple: {
      clientId: "cr.steven.expensestracker",
    },
  });

  socialLoginInitialized = true;
}

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
    if (Capacitor.isNativePlatform()) {
      return this.signInWithGoogleNative();
    }
    return this.signInWithGoogleWeb();
  },

  async signInWithGoogleNative() {
    await initializeSocialLogin();

    const result = await SocialLogin.login({
      provider: "google",
      options: {
        scopes: ["email", "profile"],
      },
    });

    // The result contains idToken which we exchange with Supabase
    if (result.result.responseType === "offline") {
      throw new Error("Unexpected offline response from Google Sign-In");
    }

    const idToken = result.result.idToken;
    if (!idToken) {
      throw new Error("No ID token received from Google Sign-In");
    }

    // Exchange the Google ID token with Supabase (no nonce verification)
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) throw error;
    return data;
  },

  async signInWithGoogleWeb() {
    const redirectTo = `${window.location.origin}/dashboard`;

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
    if (Capacitor.isNativePlatform()) {
      return this.signInWithAppleNative();
    }
    return this.signInWithAppleWeb();
  },

  async signInWithAppleNative() {
    await initializeSocialLogin();

    const result = await SocialLogin.login({
      provider: "apple",
      options: {
        scopes: ["email", "name"],
      },
    });

    const idToken = result.result.idToken;
    if (!idToken) {
      throw new Error("No identity token received from Apple Sign-In");
    }

    // Exchange the Apple ID token with Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: idToken,
    });

    if (error) throw error;

    // Apple only provides name on first sign-in, update user metadata if available
    const profile = result.result.profile;
    if (profile.givenName || profile.familyName) {
      await supabase.auth.updateUser({
        data: {
          first_name: profile.givenName,
          last_name: profile.familyName,
          full_name: [profile.givenName, profile.familyName]
            .filter(Boolean)
            .join(" "),
        },
      });
    }

    return data;
  },

  async signInWithAppleWeb() {
    const redirectTo = `${window.location.origin}/dashboard`;

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
    // Sign out from native providers if on native platform
    if (Capacitor.isNativePlatform() && socialLoginInitialized) {
      try {
        await SocialLogin.logout({ provider: "google" });
      } catch {
        // Ignore errors if not signed in with Google
      }
    }

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
