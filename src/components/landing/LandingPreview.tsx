import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "motion/react";
import { BarChart3, Tags, Wallet } from "lucide-react";
import {
  CategoryPill,
  MonthlyPreviewCard,
  PreviewBar,
  type PreviewRow,
} from "./PreviewPrimitives";

export function LandingPreview() {
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
  }) as PreviewRow[];
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
        className="hidden w-full rounded-[2rem] border bg-card/95 p-4 shadow-2xl backdrop-blur sm:absolute sm:bottom-4 sm:right-0 sm:z-30 sm:block sm:w-[68%]"
      >
        <MonthlyPreviewCard rows={rows} />
      </motion.div>
    </div>
  );
}
