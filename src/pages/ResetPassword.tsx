import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { Spinner } from "@/components/ui/spinner";
import { LinkExpiredCard, ResetPasswordForm } from "@/components/login";

export default function ResetPassword() {
  const { resolvedTheme } = useTheme();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setHasSession(!!session);
      } catch {
        setHasSession(false);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  if (checking) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-linear-to-b from-primary to-primary/70 dark:to-accent">
        <Spinner className="size-12 text-primary-foreground" />
      </div>
    );
  }

  if (!hasSession) {
    return <LinkExpiredCard />;
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center sm:px-6 bg-linear-to-b from-primary to-primary/70 dark:to-accent">
      <ResetPasswordForm />

      <Toaster
        richColors
        theme={resolvedTheme as "light" | "dark"}
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast:
              "!rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg",
            title: "text-card-foreground font-semibold",
            description: "text-muted-foreground",
            success:
              "!bg-green-500/20 dark:!bg-green-400/20 !border-green-500/20 dark:!border-green-400/30",
          },
        }}
      />
    </div>
  );
}
