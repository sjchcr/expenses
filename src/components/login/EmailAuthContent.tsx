import type { ComponentType, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthMode, PasswordChecks } from "@/components/login/types";
import { DialogBody } from "@/components/ui/dialog";

interface EmailAuthContentProps {
  Header: ComponentType<{ children: ReactNode; className?: string }>;
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

export function EmailAuthContent({
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
    <>
      <Header className="border-b pb-4">
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
      <DialogBody>
        <form
          onSubmit={mode === "forgotPassword" ? onForgotPassword : onSubmit}
          className={`space-y-4 py-4 ${formClassName}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
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
                className="flex flex-col gap-3"
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
                className="flex flex-col items-start gap-2 w-full"
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
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
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
                      {
                        key: "uppercase",
                        label: t("auth.passwordRuleUppercase"),
                      },
                      {
                        key: "lowercase",
                        label: t("auth.passwordRuleLowercase"),
                      },
                      { key: "digit", label: t("auth.passwordRuleDigit") },
                      { key: "symbol", label: t("auth.passwordRuleSymbol") },
                    ].map(({ key, label }) => {
                      const passed =
                        passwordChecks[key as keyof PasswordChecks];
                      const Icon = passed ? CheckCircle2 : XCircle;
                      return (
                        <li
                          key={key}
                          className={`flex items-center gap-2 ${
                            passed
                              ? "text-emerald-600"
                              : "text-muted-foreground"
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
      </DialogBody>
      <Footer className="flex flex-col sm:flex-col gap-2 border-t pt-4">
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
    </>
  );
}
