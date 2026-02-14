import { useTranslation } from "react-i18next";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";

export function LoginHeader() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });

  return (
    <CardHeader className="w-full text-primary-foreground">
      <img
        src={
          resolvedTheme === "dark"
            ? "/icon-1024x1024-dark.png"
            : "/icon-1024x1024.png"
        }
        alt={siteTitle}
        className="h-24 w-24"
      />
      <CardTitle className="text-3xl">{siteTitle}</CardTitle>
      <CardDescription className="text-primary-foreground/75 text-md">
        {t("auth.manageFinances")}
      </CardDescription>
    </CardHeader>
  );
}
