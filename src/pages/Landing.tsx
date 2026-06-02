import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  FileText,
  HandHeart,
  Languages,
  Lock,
  MonitorSmartphone,
  Moon,
  Palette,
  Receipt,
  Settings,
  Smartphone,
  Sun,
  Tags,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Toaster } from "sonner";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthDialog } from "@/components/login";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { useTheme } from "@/hooks/useTheme";
import i18n, { changeLanguage } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = [Receipt, Tags, BarChart3, Wallet] as const;
const THEME_OPTIONS = [
  { value: "light", labelKey: "landing.preferences.light", icon: Sun },
  { value: "dark", labelKey: "landing.preferences.dark", icon: Moon },
  {
    value: "system",
    labelKey: "landing.preferences.system",
    icon: MonitorSmartphone,
  },
] as const;

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

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={
                resolvedTheme === "dark"
                  ? "/icon-1024x1024-dark.png"
                  : "/icon-1024x1024.png"
              }
              alt={siteTitle}
              className="size-9"
            />
            <span className="font-semibold">{siteTitle}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => authDialog.openAuthDialog("signin")}
            >
              {t("auth.signIn")}
            </Button>
            <Button onClick={() => authDialog.openAuthDialog("signup")}>
              {t("auth.createAccount")}
            </Button>
            <LandingPreferencesDropdown
              theme={theme}
              setTheme={setTheme}
              currentLanguage={i18n.resolvedLanguage || i18n.language}
            />
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="public-gradient-bg absolute inset-0 opacity-50 dark:opacity-20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-transparent" />
          <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  {t("landing.heroTitle")}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {t("landing.heroDescription")}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => authDialog.openAuthDialog("signup")}
                >
                  {t("landing.primaryCta")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => authDialog.openAuthDialog("signin")}
                >
                  {t("landing.secondaryCta")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Lock className="size-4 text-primary" />
                  {t("landing.proof.private")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Smartphone className="size-4 text-primary" />
                  {t("landing.proof.mobile")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <HandHeart className="size-4 text-primary" />
                  {t("landing.proof.free")}
                </span>
              </div>
            </div>

            <LandingPreview />
          </div>
        </section>

        <section className="relative bg-muted dark:bg-card">
          {features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? FileText;
            const isReversed = index % 2 === 1;
            return (
              <div
                key={feature.title}
                className={cn(
                  "sticky top-[calc(4rem+env(safe-area-inset-top))] min-h-[calc(100svh-4rem-env(safe-area-inset-top))] overflow-hidden shadow-[0_-35px_50px_0px_rgba(0,0,0,0.05)] dark:shadow-[0_-25px_50px_0px_rgba(0,0,0,0.2)]",
                  isReversed ? "bg-muted dark:bg-card" : "bg-background",
                )}
                style={{ zIndex: index + 1 }}
              >
                <div className="mx-auto flex flex-col min-h-[inherit] max-w-6xl items-center justify-center gap-32 px-4 py-12 sm:px-6 sm:flex-row">
                  <div className="flex flex-col items-center justify-center gap-2 md:items-start">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-10" />
                    </div>
                    <div className="flex flex-col gap-1 items-center justify-center md:items-start">
                      <h2 className="font-semibold text-2xl">
                        {feature.title}
                      </h2>
                      <p className="max-w-md text-center text-sm leading-6 text-muted-foreground md:text-left">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <FeatureGraphic index={index} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Lock className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold">
              {t("landing.privacy.title")}
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground leading-7">
              {t("landing.privacy.description")}
            </p>
            <Link to="/privacy" className="w-fit">
              <Button variant="link" className="px-0">
                {t("landing.privacy.link")}
              </Button>
            </Link>
          </div>
        </section>
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

function LandingPreferencesDropdown({
  theme,
  setTheme,
  currentLanguage,
}: {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  currentLanguage: string;
}) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("landing.preferences.label")}
        >
          <Settings />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2">
            <Languages className="size-4" />
            {t("settings.language")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentLanguage.startsWith("en") ? "en" : "es"}
            onValueChange={(value) => void changeLanguage(value)}
          >
            <DropdownMenuRadioItem value="es">
              {t("settings.spanish")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="en">
              {t("settings.english")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2">
            <Palette className="size-4" />
            {t("landing.preferences.theme")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) =>
              setTheme(value as "light" | "dark" | "system")
            }
          >
            {THEME_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon className="size-4" />
                {t(labelKey)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LandingPreview() {
  const { t } = useTranslation();
  const previewRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ["start end", "end start"],
  });
  const categoryY = useTransform(scrollYProgress, [0, 1], [28, -34]);
  const salaryY = useTransform(scrollYProgress, [0, 1], [20, -44]);
  const templatesY = useTransform(scrollYProgress, [0, 1], [34, -22]);
  const mobileMainY = useTransform(scrollYProgress, [0, 1], [12, -16]);
  const rows = t("landing.preview.rows", {
    returnObjects: true,
  }) as { label: string; amount: string; status: string }[];
  const cardInitial = { opacity: 0, scale: 0.96, y: 16 };
  const cardAnimate = { opacity: 1, scale: 1, y: 0 };
  const cardTransition = {
    type: "spring" as const,
    stiffness: 110,
    damping: 18,
    mass: 0.8,
  };

  return (
    <div
      ref={previewRef}
      className="relative mx-auto h-[40rem] w-full max-w-xl overflow-visible sm:h-152"
    >
      <div className="public-gradient-bg absolute inset-0 rounded-[3rem] opacity-60 blur-2xl dark:opacity-20 sm:hidden" />

      <motion.div
        initial={cardInitial}
        animate={cardAnimate}
        transition={{ ...cardTransition, delay: 0.08 }}
        style={{ y: categoryY }}
        className="absolute left-0 top-18 z-10 w-[54%] rotate-[-5deg] rounded-2xl border bg-background/90 p-4 shadow-xl backdrop-blur sm:left-[4%] sm:top-4 sm:w-[58%]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.categoryBreakdown")}
            </p>
            <p className="text-sm font-semibold">
              {t("landing.preview.monthly")}
            </p>
          </div>
          <BarChart3 className="size-4 text-primary" />
        </div>
        <div className="grid grid-cols-[4rem_1fr] items-center gap-3 sm:grid-cols-[5rem_1fr] sm:gap-4">
          <div className="relative size-16 rounded-full bg-[conic-gradient(#14b8a6_0_38%,#f472b6_38%_62%,#facc15_62%_82%,#60a5fa_82%_100%)] sm:size-20">
            <div className="absolute inset-3 rounded-full bg-background sm:inset-4" />
          </div>
          <div className="flex flex-col gap-2">
            <PreviewBar
              label={t("landing.preview.home")}
              value="74%"
              color="bg-teal-500"
            />
            <PreviewBar
              label={t("landing.preview.food")}
              value="48%"
              color="bg-pink-400"
            />
            <div className="hidden sm:block">
              <PreviewBar
                label={t("landing.preview.stocks")}
                value="32%"
                color="bg-yellow-400"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={cardInitial}
        animate={cardAnimate}
        transition={{ ...cardTransition, delay: 0.16 }}
        style={{ y: salaryY }}
        className="absolute right-0 top-56 z-20 flex h-60 w-32 items-center justify-center rounded-2xl border bg-background/90 p-4 shadow-xl backdrop-blur sm:right-[2%] sm:top-12 sm:block sm:h-auto sm:w-[45%] sm:rotate-[4deg]"
      >
        <div className="flex rotate-90 items-center gap-5 sm:hidden">
          <div>
            <p className="text-sm font-semibold">
              {t("landing.preview.salary")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("landing.preview.netPay")}
            </p>
          </div>
          <p className="text-2xl font-semibold">$3,840</p>
          <Wallet className="size-5 text-primary" />
        </div>
        <div className="hidden sm:block">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">
              {t("landing.preview.salary")}
            </p>
            <Wallet className="size-4 text-primary" />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("landing.preview.netPay")}
              </p>
              <p className="text-2xl font-semibold">$3,840</p>
            </div>
            <PreviewBar
              label={t("landing.preview.taxes")}
              value="22%"
              color="bg-red-400"
            />
            <PreviewBar
              label={t("landing.preview.savings")}
              value="18%"
              color="bg-green-500"
            />
          </div>
        </div>
        <div className="sr-only sm:hidden">
          <div>
            <p className="text-xs text-muted-foreground">
              {t("landing.preview.netPay")}
            </p>
            <p className="text-2xl font-semibold">$3,840</p>
          </div>
          <PreviewBar
            label={t("landing.preview.taxes")}
            value="22%"
            color="bg-red-400"
          />
          <PreviewBar
            label={t("landing.preview.savings")}
            value="18%"
            color="bg-green-500"
          />
        </div>
      </motion.div>

      <motion.div
        initial={cardInitial}
        animate={cardAnimate}
        transition={{ ...cardTransition, delay: 0.24 }}
        style={{ y: templatesY }}
        className="absolute bottom-22 left-0 z-30 w-[52%] rotate-3 rounded-2xl border bg-background/90 p-4 shadow-xl backdrop-blur sm:bottom-12 sm:left-[2%] sm:w-[44%]"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">
            {t("landing.preview.templates")}
          </p>
          <Tags className="size-4 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <CategoryPill
            label={t("landing.preview.housing")}
            color="bg-teal-500"
          />
          <CategoryPill
            label={t("landing.preview.transport")}
            color="bg-blue-500"
          />
          <CategoryPill
            label={t("landing.preview.health")}
            color="bg-pink-500"
          />
        </div>
      </motion.div>

      <motion.div
        initial={cardInitial}
        animate={cardAnimate}
        transition={{ ...cardTransition, delay: 0.32 }}
        style={{ y: mobileMainY }}
        className="absolute bottom-2 left-[20%] z-50 w-[60%] rounded-[2rem] border bg-card/95 p-4 shadow-2xl backdrop-blur sm:hidden"
      >
        <MonthlyPreviewCard rows={rows} />
      </motion.div>

      <motion.div
        initial={cardInitial}
        animate={cardAnimate}
        transition={{ ...cardTransition, delay: 0.32 }}
        className="hidden w-full rounded-[2rem] border bg-card/95 p-4 shadow-2xl backdrop-blur sm:absolute sm:bottom-4 sm:right-0 sm:block sm:w-[68%] z-30"
      >
        <MonthlyPreviewCard rows={rows} />
      </motion.div>
    </div>
  );
}

function MonthlyPreviewCard({
  rows,
}: {
  rows: { label: string; amount: string; status: string }[];
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            {t("landing.preview.label")}
          </p>
          <h2 className="text-xl font-semibold">
            {t("landing.preview.title")}
          </h2>
        </div>
        <Badge>{t("dashboard.monthly")}</Badge>
      </div>
      <div className="grid gap-3 py-4 sm:grid-cols-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            {t("dashboard.totalExpenses")}
          </p>
          <p className="text-2xl font-semibold">24</p>
        </div>
        <div className="rounded-xl bg-green-500/10 p-3">
          <p className="text-xs text-muted-foreground">{t("common.paid")}</p>
          <p className="text-2xl font-semibold">$2,410</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3">
          <p className="text-xs text-muted-foreground">{t("common.pending")}</p>
          <p className="text-2xl font-semibold">$430</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border bg-background p-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-[linear-gradient(135deg,#14b8a6,#60a5fa)]" />
              <div>
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.status}</p>
              </div>
            </div>
            <p className="font-mono text-sm font-medium">{row.amount}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function PreviewBar({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: value }}
        />
      </div>
    </div>
  );
}

function FeatureGraphic({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <ExpenseFeatureGraphic />;
    case 1:
      return <TemplatesFeatureGraphic />;
    case 2:
      return <DashboardFeatureGraphic />;
    case 3:
      return <IncomeFeatureGraphic />;
    default:
      return <DashboardFeatureGraphic />;
  }
}

function FeatureGraphicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative rounded-[2rem] border bg-background/85 p-4 shadow-xl dark:shadow-none backdrop-blur">
        {children}
      </div>
    </div>
  );
}

function ExpenseFeatureGraphic() {
  const { t } = useTranslation();

  return (
    <FeatureGraphicShell>
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.expenses")}
          </p>
          <p className="font-semibold">{t("landing.preview.currentPeriod")}</p>
        </div>
        <Badge>{t("landing.preview.monthly")}</Badge>
      </div>
      <div className="grid gap-3 py-4 sm:grid-cols-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.total")}
          </p>
          <p className="text-xl font-semibold">24</p>
        </div>
        <div className="rounded-xl bg-green-500/10 p-3">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.paid")}
          </p>
          <p className="text-xl font-semibold">$2,410</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.pending")}
          </p>
          <p className="text-xl font-semibold">$430</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {[
          [t("landing.preview.rent"), "$1,250", t("landing.preview.paid")],
          [
            t("landing.preview.groceries"),
            "$340",
            t("landing.preview.pending"),
          ],
        ].map(([label, amount, status]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border bg-background p-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-[linear-gradient(135deg,#14b8a6,#60a5fa)]" />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
            </div>
            <p className="font-mono text-sm font-medium">{amount}</p>
          </div>
        ))}
      </div>
    </FeatureGraphicShell>
  );
}

function TemplatesFeatureGraphic() {
  const { t } = useTranslation();

  return (
    <FeatureGraphicShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.templates")}
          </p>
          <p className="font-semibold">{t("landing.preview.categories")}</p>
        </div>
        <Tags className="size-4 text-primary" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-background p-4">
          <p className="mb-3 text-sm font-semibold">
            {t("landing.preview.reusableTemplates")}
          </p>
          <div className="flex flex-col gap-2">
            <CategoryPill
              label={t("landing.preview.rent")}
              color="bg-teal-500"
            />
            <CategoryPill
              label={t("landing.preview.internet")}
              color="bg-blue-500"
            />
            <CategoryPill
              label={t("landing.preview.gym")}
              color="bg-pink-500"
            />
          </div>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="mb-3 text-sm font-semibold">
            {t("landing.preview.categoryColors")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              "bg-teal-500",
              "bg-pink-500",
              "bg-yellow-400",
              "bg-blue-500",
              "bg-green-500",
              "bg-violet-500",
            ].map((color) => (
              <div
                key={color}
                className={`size-10 rounded-full shadow-sm dark:shadow-none ${color}`}
              />
            ))}
          </div>
        </div>
      </div>
    </FeatureGraphicShell>
  );
}

function DashboardFeatureGraphic() {
  const { t } = useTranslation();

  return (
    <FeatureGraphicShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.dashboard")}
          </p>
          <p className="font-semibold">
            {t("landing.preview.categoryBreakdown")}
          </p>
        </div>
        <BarChart3 className="size-4 text-primary" />
      </div>
      <div className="grid grid-cols-[6rem_1fr] items-center gap-4">
        <div className="relative size-24 rounded-full bg-[conic-gradient(#14b8a6_0_38%,#f472b6_38%_62%,#facc15_62%_82%,#60a5fa_82%_100%)]">
          <div className="absolute inset-5 rounded-full bg-background" />
        </div>
        <div className="flex flex-col gap-3">
          <PreviewBar
            label={t("landing.preview.home")}
            value="74%"
            color="bg-teal-500"
          />
          <PreviewBar
            label={t("landing.preview.food")}
            value="48%"
            color="bg-pink-400"
          />
          <PreviewBar
            label={t("landing.preview.stocks")}
            value="32%"
            color="bg-yellow-400"
          />
        </div>
      </div>
    </FeatureGraphicShell>
  );
}

function IncomeFeatureGraphic() {
  const { t } = useTranslation();

  return (
    <FeatureGraphicShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.incomeTools")}
          </p>
          <p className="font-semibold">
            {t("landing.preview.salaryBreakdown")}
          </p>
        </div>
        <Wallet className="size-4 text-primary" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.netPay")}
          </p>
          <p className="text-2xl font-semibold">$3,840</p>
          <div className="mt-4 flex flex-col gap-3">
            <PreviewBar
              label={t("landing.preview.taxes")}
              value="22%"
              color="bg-red-400"
            />
            <PreviewBar
              label={t("landing.preview.savings")}
              value="18%"
              color="bg-green-500"
            />
          </div>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.stocks")}
          </p>
          <p className="text-2xl font-semibold">$2,180</p>
          <div className="mt-4 flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("landing.preview.gross")}
              </span>
              <span className="font-mono">$3,200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("landing.preview.taxes")}
              </span>
              <span className="font-mono text-red-500">-$920</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("landing.preview.broker")}
              </span>
              <span className="font-mono text-red-500">-$100</span>
            </div>
          </div>
        </div>
      </div>
    </FeatureGraphicShell>
  );
}

function CategoryPill({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-xs font-medium">
      <span className={`size-3 rounded-full ${color}`} />
      {label}
    </div>
  );
}
