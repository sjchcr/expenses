import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export interface PreviewRow {
  label: string;
  amount: string;
  status: string;
}

export function PreviewBar({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: value }}
        />
      </div>
    </div>
  );
}

export function CategoryPill({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-xs font-medium">
      <span className={`size-3 rounded-full ${color}`} />
      {label}
    </div>
  );
}

export function MonthlyPreviewCard({ rows }: { rows: PreviewRow[] }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            {t("landing.preview.label")}
          </p>
          <h2 className="text-xl font-semibold">
            {t("landing.preview.title")}
          </h2>
        </div>
        <Badge>{t("dashboard.monthly")}</Badge>
      </div>
      <div className="grid gap-3 py-4 sm:grid-cols-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            {t("dashboard.totalExpenses")}
          </p>
          <p className="text-2xl font-semibold">24</p>
        </div>
        <div className="rounded-xl bg-green-500/10 p-3">
          <p className="text-xs text-muted-foreground">{t("common.paid")}</p>
          <p className="text-2xl font-semibold">$2,410</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3">
          <p className="text-xs text-muted-foreground">{t("common.pending")}</p>
          <p className="text-2xl font-semibold">$430</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border bg-background p-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-[linear-gradient(135deg,#14b8a6,#60a5fa)]" />
              <div>
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.status}</p>
              </div>
            </div>
            <p className="font-mono text-sm font-medium">{row.amount}</p>
          </div>
        ))}
      </div>
    </>
  );
}
