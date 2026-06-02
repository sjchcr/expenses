import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EmailAuthContent } from "./EmailAuthContent";
import type { AuthDialogController } from "@/hooks/useAuthDialog";

interface AuthDialogProps {
  controller: AuthDialogController;
}

export function AuthDialog({ controller }: AuthDialogProps) {
  const showOAuth = controller.authMode !== "forgotPassword";

  return (
    <Dialog open={controller.open} onOpenChange={controller.setOpen}>
      <DialogContent
        className="bg-background/90 backdrop-blur-lg p-4 max-w-md gap-0"
        backButton={controller.authMode !== "signin"}
      >
        <EmailAuthContent
          Header={DialogHeader}
          Title={DialogTitle}
          Description={DialogDescription}
          Footer={DialogFooter}
          mode={controller.authMode}
          onChangeMode={controller.changeAuthMode}
          firstName={controller.firstName}
          setFirstName={controller.setFirstName}
          lastName={controller.lastName}
          setLastName={controller.setLastName}
          email={controller.email}
          setEmail={controller.setEmail}
          password={controller.password}
          setPassword={controller.setPassword}
          showPassword={controller.showPassword}
          toggleShowPassword={controller.toggleShowPassword}
          passwordChecks={controller.passwordChecks}
          error={controller.error}
          loading={controller.loading}
          onSubmit={controller.handleEmailAuth}
          onForgotPassword={controller.handleForgotPassword}
          buttonClassName="w-full"
          topContent={
            showOAuth ? <AuthProviderOptions controller={controller} /> : null
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function AuthProviderOptions({
  controller,
}: {
  controller: AuthDialogController;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 border-b py-4">
      <div className="grid gap-2">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-950 hover:text-white transition-colors disabled:opacity-50"
          onClick={controller.handleAppleSignIn}
          disabled={controller.loading}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {t("auth.signInWithApple")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
          onClick={controller.handleGoogleSignIn}
          disabled={controller.loading}
        >
          <div className="w-5 h-5 flex items-center justify-center bg-white rounded-sm">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          {t("auth.signInWithGoogle")}
        </Button>
      </div>
    </div>
  );
}
