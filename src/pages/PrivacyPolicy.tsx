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

  return (
    <div className="min-h-dvh w-full flex items-center justify-center sm:px-6 py-6 bg-linear-to-b from-primary to-primary/70 dark:to-accent">
      <Card className="w-full min-h-dvh sm:h-fit flex flex-col items-center justify-center gap-10 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-4 max-w-xl pb-4 rounded-none sm:rounded-2xl">
        <CardHeader className="w-full">
          <img
            src={
              resolvedTheme === "dark"
                ? "/icon-1024x1024-dark.png"
                : "/icon-1024x1024.png"
            }
            alt={siteTitle}
            className="h-24 w-24"
          />
          <CardTitle className="text-3xl">{t("privacy.title")}</CardTitle>
          <CardDescription className="text-md">
            {t("privacy.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-start items-start gap-4 w-full">
          <p>{intro}</p>
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex flex-col justify-start items-start gap-4 w-full"
            >
              <Separator />
              <h2 className="text-xl font-medium">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.listTitle && <p>{section.listTitle}</p>}
              {section.list && (
                <ul className="list-disc list-inside">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.afterList?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
