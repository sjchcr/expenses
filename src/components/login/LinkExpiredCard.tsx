import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function LinkExpiredCard() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });

  return (
    <div className="min-h-dvh w-full flex items-center justify-center sm:px-6 bg-linear-to-b from-primary to-primary/70 dark:to-accent">
      <Card className="w-full min-h-dvh sm:min-h-0 sm:h-fit flex flex-col items-center justify-center gap-6 pt-[calc(1rem+env(safe-area-inset-top))] max-w-md rounded-none sm:rounded-2xl bg-background/90 backdrop-blur-lg">
        <CardHeader className="w-full">
          <img
            src={
              resolvedTheme === "dark"
                ? "/icon-1024x1024-dark.png"
                : "/icon-1024x1024.png"
            }
            alt={siteTitle}
            className="h-16 w-16"
          />
          <CardTitle className="text-xl">{t("auth.linkExpired")}</CardTitle>
          <CardDescription>{t("auth.linkExpiredDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <Button onClick={() => navigate("/login")} className="w-full">
            {t("auth.backToSignIn")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
