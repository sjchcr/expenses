import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import { AnimatePresence, motion } from "motion/react";

type AppTourSource = "auto" | "manual";

interface AppTourStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface AppTourDialogProps {
  open: boolean;
  source: AppTourSource;
  isCompleting: boolean;
  onClose: () => void;
  onComplete: () => Promise<void>;
}

const TOUR_ICONS = [
  BarChart3,
  Receipt,
  FileText,
  BriefcaseBusiness,
  Settings,
] as const;

const SWIPE_THRESHOLD = 60;

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : direction < 0 ? -48 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : direction < 0 ? 48 : 0,
    opacity: 0,
  }),
};

export function AppTourDialog({
  open,
  source,
  isCompleting,
  onClose,
  onComplete,
}: AppTourDialogProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const steps = useMemo(() => {
    const translatedSteps = t("tour.steps", {
      returnObjects: true,
    }) as { title: string; description: string }[];

    return translatedSteps.map<AppTourStep>((step, index) => ({
      ...step,
      icon: TOUR_ICONS[index] ?? BarChart3,
    }));
  }, [t]);

  const currentStep = steps[stepIndex] ?? steps[0];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const CurrentIcon = currentStep?.icon ?? BarChart3;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
      setStepIndex(0);
    }
  };

  const handleComplete = async () => {
    await onComplete();
    setStepIndex(0);
  };

  const goToStep = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= steps.length || nextIndex === stepIndex) {
      return;
    }

    setDirection(nextIndex > stepIndex ? 1 : -1);
    setStepIndex(nextIndex);
  };

  const goToPreviousStep = () => goToStep(stepIndex - 1);
  const goToNextStep = () => goToStep(stepIndex + 1);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl" fromBottom={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {source === "auto" ? t("tour.title") : t("tour.replayTitle")}
          </DialogTitle>
          <DialogDescription>{t("tour.description")}</DialogDescription>
        </DialogHeader>
        <DialogBody className="pb-0">
          <div className="flex flex-col gap-5 py-2">
            <div className="relative overflow-hidden p-3">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={stepIndex}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  drag={isMobile ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_, info) => {
                    if (info.offset.x <= -SWIPE_THRESHOLD) {
                      goToNextStep();
                    }
                    if (info.offset.x >= SWIPE_THRESHOLD) {
                      goToPreviousStep();
                    }
                  }}
                  className="flex flex-col items-center gap-2 touch-pan-y"
                >
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CurrentIcon className="size-10" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-center">
                      {currentStep?.title}
                    </h2>
                    <p className="leading-7 text-muted-foreground text-center">
                      {currentStep?.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-2">
              {steps.map((step, index) => {
                const isActive = index === stepIndex;

                return (
                  <div
                    key={step.title}
                    className="flex items-center justify-center rounded-full"
                  >
                    <motion.span
                      className={cn(
                        "h-2 rounded-full bg-primary",
                        isActive ? "w-6" : "w-2 opacity-45",
                      )}
                      animate={{ width: isActive ? 24 : 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="border-t pt-4 sm:justify-between">
          <Button variant="ghostDestructive" onClick={handleComplete}>
            {source === "auto" ? t("tour.skip") : t("common.close")}
          </Button>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={isFirstStep ? "ghost" : "outline"}
              disabled={isFirstStep}
              onClick={goToPreviousStep}
            >
              <ChevronLeft />
              {t("common.back")}
            </Button>
            {isLastStep ? (
              <Button disabled={isCompleting} onClick={handleComplete}>
                {isCompleting ? t("common.saving") : t("tour.finish")}
              </Button>
            ) : (
              <Button onClick={goToNextStep}>
                {t("common.next")}
                <ChevronRight />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
