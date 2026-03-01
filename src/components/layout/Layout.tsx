import { Toaster } from "sonner";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import RouteTransition from "@/components/layout/RouteTransition";
import { useTheme } from "@/hooks/useTheme";
import { useIsDialogOpen } from "@/contexts/KeyboardPaddingContext";

export default function Layout() {
  const { resolvedTheme } = useTheme();
  const isDialogOpen = useIsDialogOpen();

  return (
    <div className="min-h-dvh">
      {/* Navigation */}
      <Header />

      {/* Page Content - scrollable main with keyboard padding when no dialog is open */}
      <main
        className="min-h-[calc(100dvh-133px)] pb-24 md:pb-0"
        style={{
          paddingBottom: !isDialogOpen
            ? "calc(6rem + env(safe-area-inset-bottom) + var(--kb, 0px))"
            : undefined,
        }}
      >
        <RouteTransition />
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <Toaster
        richColors
        theme={resolvedTheme as "light" | "dark"}
        position="bottom-center"
        mobileOffset={{ bottom: "96px" }}
        toastOptions={{
          classNames: {
            toast:
              "!rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg",
            title: "text-card-foreground font-semibold",
            description: "text-muted-foreground",
            success:
              "!bg-green-500/20 dark:!bg-green-400/20 !border-green-500/20 dark:!border-green-400/30",
            error:
              "!bg-destructive/20 dark:!bg-destructive/20 !border-destructive/20 dark:!border-destructive/30",
            warning:
              "!bg-amber-500/20 dark:!bg-amber-500/20 !border-amber-500/20 dark:!border-amber-500/30",
            info: "!bg-primary/20 dark:!bg-primary/20 !border-primary/20 dark:!border-primary/30",
          },
        }}
      />
    </div>
  );
}
