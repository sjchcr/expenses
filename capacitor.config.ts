import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cr.steven.expensestracker",
  appName: "SJ Financial Tracker",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        apple: true,
        facebook: false,
        twitter: false,
      },
    },
  },
};

export default config;
