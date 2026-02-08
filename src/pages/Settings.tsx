import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUserSettings } from "@/hooks/useUserSettings";
import i18n, { changeLanguage } from "@/lib/i18n";
import { useExpenses } from "@/hooks/useExpenses";
import { useTemplates } from "@/hooks/useTemplates";
import { useMobile } from "@/hooks/useMobile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CustomHeader from "@/components/common/CustomHeader";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import {
  SettingsHeader,
  AccountCard,
  PaymentPeriodsCard,
  PrimaryCurrencyCard,
  ExportDataCard,
  LanguageCard,
  ExportDialog,
  SettingsLoadingSkeleton,
} from "@/components/settings";

export default function Settings() {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const { settings, isLoading, refetch: refetchSettings } = useUserSettings();
  const { data: expenses, refetch: refetchExpenses } = useExpenses({});
  const { data: templates, refetch: refetchTemplates } = useTemplates();
  const {
    user,
    isLoading: isUserLoading,
    refresh: refreshUser,
  } = useCurrentUser();

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Sync language from database if different from current
  useEffect(() => {
    if (settings?.language && settings.language !== i18n.language) {
      changeLanguage(settings.language);
    }
  }, [settings]);

  if (isLoading || isUserLoading) {
    return <SettingsLoadingSkeleton />;
  }

  const handleRefresh = async () => {
    await Promise.all([
      refetchSettings(),
      refetchExpenses(),
      refetchTemplates(),
      refreshUser(),
    ]);
  };

  const content = (
    <div className="px-4 sm:px-0 flex flex-col gap-6">
      <SettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountCard user={user} onProfileUpdate={refreshUser} />

        <PaymentPeriodsCard
          initialPeriods={
            settings?.payment_periods || [
              { period: 1, start_day: 1, end_day: 15 },
              { period: 2, start_day: 16, end_day: 31 },
            ]
          }
        />

        <PrimaryCurrencyCard
          initialCurrency={settings?.primary_currency || "USD"}
        />

        <ExportDataCard
          expensesCount={expenses?.length || 0}
          templatesCount={templates?.length || 0}
          onExportClick={() => setIsExportDialogOpen(true)}
        />

        <LanguageCard />
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-6 sm:pt-6 md:px-[calc(100%/12)] sm:px-6">
      {isMobile && (
        <CustomHeader title={t("settings.title")} hasAvatar={false} />
      )}
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh}>{content}</PullToRefresh>
      ) : (
        content
      )}

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        expenses={expenses}
        templates={templates}
        settings={settings}
      />
    </div>
  );
}
