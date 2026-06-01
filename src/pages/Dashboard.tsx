import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type DashboardStatsPeriod,
  useDashboardStats,
} from "@/hooks/useDashboardStats";
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
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const { displayName } = useCurrentUser();
  const [statsPeriod, setStatsPeriod] =
    useState<DashboardStatsPeriod>("yearly");
  const {
    pendingPayments,
    monthComparison,
    monthlyTrends,
    yearTotals,
    categoryTotals,
    paidVsPending,
    exchangeRatesDisplay,
    currencies,
    primaryCurrency,
    period,
    periodLabel,
    currentComparisonLabel,
    previousComparisonLabel,
    isLoading,
    totalExpensesCount,
    refetch,
  } = useDashboardStats(statsPeriod);

  const welcomeTitle = `${t("dashboard.welcomeBack")}${
    displayName ? ` ${displayName}` : ""
  }!`;

  const content = (
    <div className="flex flex-col gap-6 md:px-0 px-4 w-full">
      <div className="flex flex-col items-start justify-start gap-2">
        {!isMobile && (
          <h2 className="text-2xl font-semibold text-accent-foreground">
            {welcomeTitle}
          </h2>
        )}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm text-muted-foreground">
            {t("dashboard.financialSummaryPeriod", { period: periodLabel })}
          </h3>
          <Tabs
            value={statsPeriod}
            onValueChange={(value) =>
              setStatsPeriod(value as DashboardStatsPeriod)
            }
          >
            <TabsList background>
              <TabsTrigger value="yearly">
                {t("dashboard.yearly")}
              </TabsTrigger>
              <TabsTrigger value="monthly">
                {t("dashboard.monthly")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatsCards
          yearTotals={yearTotals}
          paidVsPending={paidVsPending}
          totalExpensesCount={totalExpensesCount}
          period={period}
          periodLabel={periodLabel}
          isLoading={isLoading}
        />
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PendingPaymentsCard
          pendingPayments={pendingPayments}
          periodLabel={periodLabel}
          isLoading={isLoading}
        />
        <MonthComparisonCard
          monthComparison={monthComparison}
          period={period}
          currentLabel={currentComparisonLabel}
          previousLabel={previousComparisonLabel}
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
          period={period}
          periodLabel={periodLabel}
          isLoading={isLoading}
        />
        <CurrencyBreakdownChart
          categoryTotals={categoryTotals}
          primaryCurrency={primaryCurrency}
          periodLabel={periodLabel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && <CustomHeader title={t("nav.dashboard")} hasAvatar />}
      {isMobile ? (
        <PullToRefresh onRefresh={refetch}>{content}</PullToRefresh>
      ) : (
        content
      )}
    </div>
  );
}
