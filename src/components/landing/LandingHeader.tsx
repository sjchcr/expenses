import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Languages,
  MonitorSmartphone,
  Moon,
  Palette,
  Settings,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { changeLanguage } from "@/lib/i18n";

type LandingTheme = "light" | "dark" | "system";

const THEME_OPTIONS = [
  { value: "light", labelKey: "landing.preferences.light", icon: Sun },
  { value: "dark", labelKey: "landing.preferences.dark", icon: Moon },
  {
    value: "system",
    labelKey: "landing.preferences.system",
    icon: MonitorSmartphone,
  },
] as const;

interface LandingHeaderProps {
  siteTitle: string;
  resolvedTheme: string;
  theme: LandingTheme;
  setTheme: (theme: LandingTheme) => void;
  currentLanguage: string;
  onSignUp: () => void;
}

export function LandingHeader({
  siteTitle,
  resolvedTheme,
  theme,
  setTheme,
  currentLanguage,
  onSignUp,
}: LandingHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-60 border-b bg-background/60 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
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
          <Button onClick={onSignUp}>{t("auth.start")}</Button>
          <LandingPreferencesDropdown
            theme={theme}
            setTheme={setTheme}
            currentLanguage={currentLanguage}
          />
        </div>
      </div>
    </header>
  );
}

function LandingPreferencesDropdown({
  theme,
  setTheme,
  currentLanguage,
}: {
  theme: LandingTheme;
  setTheme: (theme: LandingTheme) => void;
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
            onValueChange={(value) => setTheme(value as LandingTheme)}
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
