import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type PrivacySection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  listTitle?: string;
  afterList?: string[];
};

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });
  const supportEmail = "hello@steven.cr";
  const effectiveDate = "2026-02-01";
  const intro = t("privacy.intro");
  const sections = t("privacy.sections", {
    returnObjects: true,
    email: supportEmail,
    effectiveDate,
  }) as PrivacySection[];
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-muted/60 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
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
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft />
            {t("common.back")}
          </Button>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="public-gradient-bg absolute inset-0 opacity-50 dark:opacity-20" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
          <section className="flex flex-col gap-4 py-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" />
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                {t("privacy.title")}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("privacy.description")}
              </p>
            </div>
          </section>

          <Card className="bg-card/90 shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">{siteTitle}</CardTitle>
              <CardDescription>{intro}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {sections.map((section) => (
                <section
                  key={section.id}
                  className="flex flex-col justify-start items-start gap-4 w-full"
                >
                  <Separator />
                  <h2 className="text-xl font-medium">{section.title}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="leading-7 text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.listTitle && (
                    <p className="leading-7 text-muted-foreground">
                      {section.listTitle}
                    </p>
                  )}
                  {section.list && (
                    <ul className="list-disc list-inside leading-7 text-muted-foreground">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.afterList?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="leading-7 text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
