import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { accountService } from "@/services/account.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteAccountCardProps {
  user: SupabaseUser | null;
}

export function DeleteAccountCard({ user }: DeleteAccountCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const userEmail = user?.email || "";
  const isConfirmed = confirmation.trim() === userEmail;

  const handleOpenChange = (open: boolean) => {
    if (isDeleting) return;
    setIsOpen(open);
    if (!open) {
      setConfirmation("");
    }
  };

  const handleDeleteAccount = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await accountService.deleteAccount();
      toast.success(t("settings.deleteAccountSuccess"));
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Account deletion failed:", error);
      toast.error(t("settings.deleteAccountFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-destructive/25 bg-destructive/5 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {t("settings.dangerZone")}
          </CardTitle>
          <CardDescription>{t("settings.dangerZoneDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => setIsOpen(true)}
            disabled={!user}
          >
            <Trash2 className="h-4 w-4" />
            {t("settings.deleteAccount")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.deleteAccountTitle")}</DialogTitle>
            <DialogDescription>
              {t("settings.deleteAccountDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
              {t("settings.deleteAccountWarning")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deleteAccountConfirmation">
                {t("settings.deleteAccountConfirmLabel", {
                  email: userEmail,
                })}
              </Label>
              <Input
                id="deleteAccountConfirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                inputMode="email"
                disabled={isDeleting}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!isConfirmed || isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting
                ? t("settings.deletingAccount")
                : t("settings.deleteAccount")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
