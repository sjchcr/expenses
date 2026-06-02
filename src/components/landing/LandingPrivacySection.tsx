import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPrivacySection() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Lock className="size-5" />
        </div>
        <h2 className="text-2xl font-semibold">{t("landing.privacy.title")}</h2>
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
  );
}
