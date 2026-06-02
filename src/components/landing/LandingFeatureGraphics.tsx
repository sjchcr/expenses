import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Tags, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryPill, PreviewBar } from "./PreviewPrimitives";

export function FeatureGraphic({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <ExpenseFeatureGraphic />;
    case 1:
      return <TemplatesFeatureGraphic />;
    case 2:
      return <DashboardFeatureGraphic />;
    case 3:
      return <IncomeFeatureGraphic />;
    default:
      return <DashboardFeatureGraphic />;
  }
}

function FeatureGraphicShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative rounded-[2rem] border bg-background/85 p-4 shadow-xl backdrop-blur dark:shadow-none">
        {children}
      </div>
    </div>
  );
}

function ExpenseFeatureGraphic() {
  const { t } = useTranslation();

  return (
    <FeatureGraphicShell>
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.expenses")}
          </p>
          <p className="font-semibold">{t("landing.preview.currentPeriod")}</p>
        </div>
        <Badge>{t("landing.preview.monthly")}</Badge>
      </div>
      <div className="grid gap-3 py-4 sm:grid-cols-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.total")}
          </p>
          <p className="text-xl font-semibold">24</p>
        </div>
        <div className="rounded-xl bg-green-500/10 p-3">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.paid")}
          </p>
          <p className="text-xl font-semibold">$2,410</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.pending")}
          </p>
          <p className="text-xl font-semibold">$430</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {[
          [t("landing.preview.rent"), "$1,250", t("landing.preview.paid")],
          [
            t("landing.preview.groceries"),
            "$340",
            t("landing.preview.pending"),
          ],
        ].map(([label, amount, status]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border bg-background p-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-[linear-gradient(135deg,#14b8a6,#60a5fa)]" />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
            </div>
            <p className="font-mono text-sm font-medium">{amount}</p>
          </div>
        ))}
      </div>
    </FeatureGraphicShell>
  );
}

function TemplatesFeatureGraphic() {
  const { t } = useTranslation();

  return (
    <FeatureGraphicShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.templates")}
          </p>
          <p className="font-semibold">{t("landing.preview.categories")}</p>
        </div>
        <Tags className="size-4 text-primary" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-background p-4">
          <p className="mb-3 text-sm font-semibold">
            {t("landing.preview.reusableTemplates")}
          </p>
          <div className="flex flex-col gap-2">
            <CategoryPill
              label={t("landing.preview.rent")}
              color="bg-teal-500"
            />
            <CategoryPill
              label={t("landing.preview.internet")}
              color="bg-blue-500"
            />
            <CategoryPill
              label={t("landing.preview.gym")}
              color="bg-pink-500"
            />
          </div>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="mb-3 text-sm font-semibold">
            {t("landing.preview.categoryColors")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              "bg-teal-500",
              "bg-pink-500",
              "bg-yellow-400",
              "bg-blue-500",
              "bg-green-500",
              "bg-violet-500",
            ].map((color) => (
              <div
                key={color}
                className={`size-10 rounded-full shadow-sm dark:shadow-none ${color}`}
              />
            ))}
          </div>
        </div>
      </div>
    </FeatureGraphicShell>
  );
}

function DashboardFeatureGraphic() {
  const { t } = useTranslation();

  return (
    <FeatureGraphicShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.dashboard")}
          </p>
          <p className="font-semibold">
            {t("landing.preview.categoryBreakdown")}
          </p>
        </div>
        <BarChart3 className="size-4 text-primary" />
      </div>
      <div className="grid grid-cols-[6rem_1fr] items-center gap-4">
        <div className="relative size-24 rounded-full bg-[conic-gradient(#14b8a6_0_38%,#f472b6_38%_62%,#facc15_62%_82%,#60a5fa_82%_100%)]">
          <div className="absolute inset-5 rounded-full bg-background" />
        </div>
        <div className="flex flex-col gap-3">
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
          <PreviewBar
            label={t("landing.preview.stocks")}
            value="32%"
            color="bg-yellow-400"
          />
        </div>
      </div>
    </FeatureGraphicShell>
  );
}

function IncomeFeatureGraphic() {
  const { t } = useTranslation();

  return (
    <FeatureGraphicShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.incomeTools")}
          </p>
          <p className="font-semibold">
            {t("landing.preview.salaryBreakdown")}
          </p>
        </div>
        <Wallet className="size-4 text-primary" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.netPay")}
          </p>
          <p className="text-2xl font-semibold">$3,840</p>
          <div className="mt-4 flex flex-col gap-3">
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
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.stocks")}
          </p>
          <p className="text-2xl font-semibold">$2,180</p>
          <div className="mt-4 flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("landing.preview.gross")}
              </span>
              <span className="font-mono">$3,200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("landing.preview.taxes")}
              </span>
              <span className="font-mono text-red-500">-$920</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("landing.preview.broker")}
              </span>
              <span className="font-mono text-red-500">-$100</span>
            </div>
          </div>
        </div>
      </div>
    </FeatureGraphicShell>
  );
}
