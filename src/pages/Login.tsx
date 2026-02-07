import { useState, type ComponentType, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import { toast, Toaster } from "sonner";
import { authService } from "@/services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";
import { useMobile } from "@/hooks/useMobile";
import { Mail, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

type PasswordChecks = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  digit: boolean;
  symbol: boolean;
};

type AuthMode = "signin" | "signup" | "forgotPassword";

interface EmailAuthContentProps {
  Header: ComponentType<{ children: ReactNode }>;
  Title: ComponentType<{ children: ReactNode; className?: string }>;
  Description: ComponentType<{ children: ReactNode }>;
  Footer: ComponentType<{ children: ReactNode; className?: string }>;
  mode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  passwordChecks: PasswordChecks;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: (e: React.FormEvent) => void;
  formClassName?: string;
  buttonClassName?: string;
}

function EmailAuthContent({
  Header,
  Title,
  Description,
  Footer,
  mode,
  onChangeMode,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  toggleShowPassword,
  passwordChecks,
  error,
  loading,
  onSubmit,
  onForgotPassword,
  formClassName = "",
  buttonClassName = "",
}: EmailAuthContentProps) {
  const { t } = useTranslation();

  const titles: Record<AuthMode, string> = {
    signin: t("auth.signInWithEmail"),
    signup: t("auth.createAccount"),
    forgotPassword: t("auth.forgotPassword"),
  };

  const descriptions: Record<AuthMode, string> = {
    signin: t("auth.signInWithEmailDesc"),
    signup: t("auth.createAccountDesc"),
    forgotPassword: t("auth.forgotPasswordDesc"),
  };

  return (
    <div className="flex flex-col gap-4 pr-0">
      <Header>
        <Title className="text-xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${mode}-title`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {titles[mode]}
            </motion.span>
          </AnimatePresence>
        </Title>
        <Description>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${mode}-desc`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {descriptions[mode]}
            </motion.span>
          </AnimatePresence>
        </Description>
      </Header>
      <form
        onSubmit={mode === "forgotPassword" ? onForgotPassword : onSubmit}
        className={`flex flex-col gap-4 ${formClassName}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          {mode === "signup" && (
            <motion.div
              key="name-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              <div className="flex flex-col items-start gap-2 w-full">
                <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                <Input
                  id="firstName"
                  type="text"
                  variant="muted"
                  placeholder={t("auth.firstNamePlaceholder")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="flex flex-col items-start gap-2 w-full">
                <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                <Input
                  id="lastName"
                  type="text"
                  variant="muted"
                  placeholder={t("auth.lastNamePlaceholder")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col items-start gap-2 w-full">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            variant="muted"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {mode !== "forgotPassword" && (
            <motion.div
              key="password-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-start gap-2 w-full overflow-hidden"
            >
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="password">{t("auth.password")}</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => onChangeMode("forgotPassword")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("auth.forgotPassword")}
                  </button>
                )}
              </div>
              <div className="w-full relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  variant="muted"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <ul className="text-xs space-y-1 text-muted-foreground w-full pl-3">
                  {[
                    { key: "length", label: t("auth.passwordRuleLength") },
                    { key: "uppercase", label: t("auth.passwordRuleUppercase") },
                    { key: "lowercase", label: t("auth.passwordRuleLowercase") },
                    { key: "digit", label: t("auth.passwordRuleDigit") },
                    { key: "symbol", label: t("auth.passwordRuleSymbol") },
                  ].map(({ key, label }) => {
                    const passed = passwordChecks[key as keyof PasswordChecks];
                    const Icon = passed ? CheckCircle2 : XCircle;
                    return (
                      <li
                        key={key}
                        className={`flex items-center gap-2 ${
                          passed ? "text-emerald-600" : "text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      <Footer className="flex-col gap-2">
        <Button
          type="submit"
          disabled={loading}
          onClick={mode === "forgotPassword" ? onForgotPassword : onSubmit}
          className={buttonClassName}
        >
          {loading
            ? t("common.loading")
            : mode === "signup"
            ? t("auth.createAccount")
            : mode === "forgotPassword"
            ? t("auth.sendResetLink")
            : t("auth.signIn")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onChangeMode(mode === "signup" ? "signin" : "signup")}
          className={buttonClassName}
        >
          {mode === "signup" ? t("auth.haveAccount") : t("auth.noAccount")}
        </Button>
        {mode === "forgotPassword" && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChangeMode("signin")}
            className={buttonClassName}
          >
            {t("auth.backToSignIn")}
          </Button>
        )}
      </Footer>
    </div>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isMobile = useMobile();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const passwordChecks: PasswordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (authMode === "signup" && !PASSWORD_RULE.test(password)) {
        setError(t("auth.passwordRequirements"));
        setLoading(false);
        return;
      }
      setError(null);
      if (authMode === "signup") {
        const result = await authService.signUpWithEmail(email, password, {
          firstName,
          lastName,
        });
        setEmailDrawerOpen(false);
        // Check if email confirmation is required
        if (result.user && !result.session) {
          toast.success(t("auth.signUpSuccess"), {
            description: t("auth.checkEmailConfirmation"),
          });
        }
      } else {
        await authService.signInWithEmail(email, password);
        setEmailDrawerOpen(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t("auth.emailRequired"));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email);
      setEmailDrawerOpen(false);
      toast.success(t("auth.resetEmailSent"), {
        description: t("auth.checkEmailReset"),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openEmailDrawer = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setEmailDrawerOpen(true);
  };

  const changeAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithGoogle();
    } catch (err: any) {
      // Don't show error for user cancellation
      if (!isCancellationError(err)) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithApple();
    } catch (err: any) {
      // Don't show error for user cancellation
      if (!isCancellationError(err)) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to detect cancellation errors from native sign-in
  const isCancellationError = (err: any): boolean => {
    const message = err?.message?.toLowerCase() || "";
    return (
      message.includes("cancel") ||
      message.includes("cancelled") ||
      message.includes("1001") || // Apple cancellation code
      message.includes("user denied") ||
      message.includes("popup closed")
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center sm:px-6 bg-linear-to-b from-primary to-primary/70 dark:to-accent">
      <Card className="w-full min-h-screen sm:h-fit flex flex-col items-center justify-center gap-10 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-4 max-w-md pb-4 rounded-none sm:rounded-2xl bg-transparent border-0 shadow-none">
        <CardHeader className="w-full text-primary-foreground">
          <img
            src={
              resolvedTheme === "dark"
                ? "/icon-1024x1024-dark.png"
                : "/icon-1024x1024.png"
            }
            alt={siteTitle}
            className="h-24 w-24"
          />
          <CardTitle className="text-3xl">{siteTitle}</CardTitle>
          <CardDescription className="text-primary-foreground/75 text-md">
            {t("auth.manageFinances")}
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-950 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {t("auth.signInWithApple")}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
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
            <Button
              disabled={loading}
              onClick={() => openEmailDrawer("signin")}
              className="w-full flex items-center justify-center gap-3"
            >
              <Mail className="w-5 h-5" />
              {t("auth.signInWithEmail")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isMobile ? (
        <Drawer open={emailDrawerOpen} onOpenChange={setEmailDrawerOpen}>
          <DrawerContent
            className="bg-background/70 backdrop-blur-lg"
            closeButton="top-right"
          >
            <EmailAuthContent
              Header={DrawerHeader}
              Title={DrawerTitle}
              Description={DrawerDescription}
              Footer={DrawerFooter}
              mode={authMode}
              onChangeMode={changeAuthMode}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword((prev) => !prev)}
              passwordChecks={passwordChecks}
              error={error}
              loading={loading}
              onSubmit={handleEmailAuth}
              onForgotPassword={handleForgotPassword}
              formClassName="px-4"
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={emailDrawerOpen} onOpenChange={setEmailDrawerOpen}>
          <DialogContent className="bg-background/90 backdrop-blur-lg p-4">
            <EmailAuthContent
              Header={DialogHeader}
              Title={DialogTitle}
              Description={DialogDescription}
              Footer={DialogFooter}
              mode={authMode}
              onChangeMode={changeAuthMode}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword((prev) => !prev)}
              passwordChecks={passwordChecks}
              error={error}
              loading={loading}
              onSubmit={handleEmailAuth}
              onForgotPassword={handleForgotPassword}
              buttonClassName="w-full"
            />
          </DialogContent>
        </Dialog>
      )}

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
