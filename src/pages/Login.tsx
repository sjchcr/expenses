import { Toaster } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { AuthDialog, LoginHeader, OAuthButtons } from "@/components/login";
import { useAuthDialog } from "@/hooks/useAuthDialog";

export default function Login() {
  const { resolvedTheme } = useTheme();
  const authDialog = useAuthDialog();

  return (
    <div className="min-h-dvh w-full flex items-center justify-center sm:px-6 bg-linear-to-b from-primary to-primary/70 dark:to-accent">
      <Card className="w-full min-h-dvh sm:h-fit flex flex-col items-center justify-center gap-10 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-4 max-w-md pb-4 rounded-none sm:rounded-2xl bg-transparent border-0 shadow-none">
        <LoginHeader />
        <CardContent className="w-full">
          {authDialog.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {authDialog.error}
            </div>
          )}
          <OAuthButtons
            loading={authDialog.loading}
            onGoogleSignIn={authDialog.handleGoogleSignIn}
            onAppleSignIn={authDialog.handleAppleSignIn}
            onEmailSignIn={() => authDialog.openAuthDialog("signin")}
          />
        </CardContent>
      </Card>

      <AuthDialog controller={authDialog} />

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
