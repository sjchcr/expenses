import { useTranslation } from "react-i18next";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  PendingPaymentsCard,
  MonthComparisonCard,
  ExchangeRatesCard,
  SpendingTrendsChart,
  CurrencyBreakdownChart,
  QuickStatsCards,
} from "@/components/dashboard";
import { useMobile } from "@/hooks/useMobile";
import CustomHeader from "@/components/common/CustomHeader";

export default function Dashboard() {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const { displayName } = useCurrentUser();
  const {
    pendingPayments,
    monthComparison,
    monthlyTrends,
    yearTotals,
    paidVsPending,
    exchangeRatesDisplay,
    currencies,
    primaryCurrency,
    currentYear,
    currentMonthName,
    previousMonthName,
    isLoading,
    totalExpensesCount,
  } = useDashboardStats();

  const welcomeTitle = `${t("dashboard.welcomeBack")}${
    displayName ? ` ${displayName}` : ""
  }!`;

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && <CustomHeader title={t("nav.dashboard")} hasAvatar />}
      <div className="flex flex-col gap-6 md:px-0 px-4 w-full">
        <div className="flex flex-col items-start justify-start gap-2">
          {!isMobile && (
            <h2 className="text-2xl font-semibold text-accent-foreground">
              {welcomeTitle}
            </h2>
          )}
          <h3 className="text-sm text-muted-foreground">
            {t("dashboard.financialSummary", { year: currentYear })}
          </h3>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickStatsCards
            yearTotals={yearTotals}
            paidVsPending={paidVsPending}
            totalExpensesCount={totalExpensesCount}
            currentYear={currentYear}
            isLoading={isLoading}
          />
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PendingPaymentsCard
            pendingPayments={pendingPayments}
            currentMonthName={currentMonthName}
            isLoading={isLoading}
          />
          <MonthComparisonCard
            monthComparison={monthComparison}
            currentMonthName={currentMonthName}
            previousMonthName={previousMonthName}
            isLoading={isLoading}
          />
          <ExchangeRatesCard
            exchangeRates={exchangeRatesDisplay}
            primaryCurrency={primaryCurrency}
            isLoading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SpendingTrendsChart
            monthlyTrends={monthlyTrends}
            currencies={currencies}
            currentYear={currentYear}
            isLoading={isLoading}
          />
          <CurrencyBreakdownChart
            yearTotals={yearTotals}
            currentYear={currentYear}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
