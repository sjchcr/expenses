import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";
import {
  LandingFeatures,
  LandingHeader,
  LandingHero,
  LandingPrivacySection,
} from "@/components/landing";
import { AuthDialog } from "@/components/login";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { useTheme } from "@/hooks/useTheme";
import i18n from "@/lib/i18n";

export default function Landing() {
  const { t } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const authDialog = useAuthDialog();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });
  const features = t("landing.features.items", {
    returnObjects: true,
  }) as { title: string; description: string }[];

  const openSignIn = () => authDialog.openAuthDialog("signin");
  const openSignUp = () => authDialog.openAuthDialog("signup");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LandingHeader
        siteTitle={siteTitle}
        resolvedTheme={resolvedTheme}
        theme={theme}
        setTheme={setTheme}
        currentLanguage={i18n.resolvedLanguage || i18n.language}
        onSignUp={openSignUp}
      />

      <main>
        <LandingHero onSignIn={openSignIn} onSignUp={openSignUp} />
        <LandingFeatures features={features} />
        <LandingPrivacySection />
      </main>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {siteTitle}. {t("footer.rights")}
      </footer>

      <AuthDialog controller={authDialog} />
      <Toaster
        richColors
        theme={resolvedTheme as "light" | "dark"}
        position="bottom-center"
      />
    </div>
  );
}
