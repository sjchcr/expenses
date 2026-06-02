import { useTranslation } from "react-i18next";
import { HandHeart, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingPreview } from "./LandingPreview";

interface LandingHeroProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function LandingHero({ onSignIn, onSignUp }: LandingHeroProps) {
  const { t } = useTranslation();

  return (
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
            <Button size="lg" onClick={onSignUp}>
              {t("landing.primaryCta")}
            </Button>
            <Button size="lg" variant="outline" onClick={onSignIn}>
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
  );
}
