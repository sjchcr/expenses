import { BarChart3, FileText, Receipt, Tags, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeatureGraphic } from "./LandingFeatureGraphics";

const FEATURE_ICONS = [Receipt, Tags, BarChart3, Wallet] as const;

interface LandingFeature {
  title: string;
  description: string;
}

interface LandingFeaturesProps {
  features: LandingFeature[];
}

export function LandingFeatures({ features }: LandingFeaturesProps) {
  return (
    <section className="relative bg-muted dark:bg-card">
      {features.map((feature, index) => {
        const Icon = FEATURE_ICONS[index] ?? FileText;
        const isReversed = index % 2 === 1;
        return (
          <div
            key={feature.title}
            className={cn(
              "sticky top-[calc(4rem_+_env(safe-area-inset-top))] min-h-[calc(100svh_-_4rem_-_env(safe-area-inset-top))] overflow-hidden shadow-[0_-35px_50px_0px_rgba(0,0,0,0.05)] dark:shadow-[0_-25px_50px_0px_rgba(0,0,0,0.2)]",
              isReversed ? "bg-muted dark:bg-card" : "bg-background",
            )}
            style={{ zIndex: index + 1 }}
          >
            <div className="mx-auto flex min-h-[inherit] max-w-6xl flex-col items-center justify-center gap-32 px-4 py-12 sm:flex-row sm:px-6">
              <div className="flex flex-col items-center justify-center gap-2 md:items-start">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-10" />
                </div>
                <div className="flex flex-col items-center justify-center gap-1 md:items-start">
                  <h2 className="text-2xl font-semibold">{feature.title}</h2>
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
  );
}
