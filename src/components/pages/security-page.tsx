"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Smartphone,
  MessageCircle,
  Mail,
  Moon,
  Sun,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

export function SecurityPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // ─── 2FA State ────────────────────────────────────────────
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [generating2FA, setGenerating2FA] = useState(false);

  // ─── Password State ───────────────────────────────────────
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ─── 2FA Handlers ─────────────────────────────────────────
  const handleActivate2FA = async () => {
    setGenerating2FA(true);
    setQrCode(null);
    setOtpValue("");
    try {
      const res = await api.generate2FA();
      if (res.success && res.qr_code) {
        setQrCode(res.qr_code);
        setTwoFADialogOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar QR Code");
    } finally {
      setGenerating2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (otpValue.length !== 6) {
      toast.error("Insira o código de 6 dígitos");
      return;
    }
    setVerifying2FA(true);
    try {
      const res = await api.verify2FA(otpValue);
      if (res.success) {
        toast.success(res.message || "2FA ativada com sucesso!");
        setTwoFADialogOpen(false);
        setQrCode(null);
        setOtpValue("");
        await refreshUser();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao verificar código 2FA");
    } finally {
      setVerifying2FA(false);
    }
  };

  // ─── Password Handler ─────────────────────────────────────
  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova palavra-passe deve ter pelo menos 8 caracteres");
      return;
    }
    toast.info("Funcionalidade em desenvolvimento");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ─── Derived State ────────────────────────────────────────
  const is2FAEnabled = user?.is_2fa_enabled ?? false;

  return (
    <div className="space-y-6">
      {/* ─── Card 1: Autenticação 2FA ──────────────────────── */}
      <Card className="transition-shadow hover:shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Autenticação 2FA
                </CardTitle>
                <CardDescription>
                  Proteja sua conta com uma camada extra de segurança
                </CardDescription>
              </div>
            </div>
            <Badge
              className={
                is2FAEnabled
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/15"
              }
            >
              {is2FAEnabled ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          {is2FAEnabled ? (
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="text-muted-foreground">
                2FA ativa e protegendo sua conta
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground max-w-md">
                Ao ativar a 2FA, você precisará inserir um código gerado pelo
                Google Authenticator além da sua senha ao fazer login.
              </p>
              <Button
                onClick={handleActivate2FA}
                disabled={generating2FA}
                size="sm"
                className="shrink-0"
              >
                {generating2FA ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Ativar Google Authenticator
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Card 2: Alterar Palavra-passe ─────────────────── */}
      <Card className="transition-shadow hover:shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                Alterar Palavra-passe
              </CardTitle>
              <CardDescription>
                Atualize sua palavra-passe regularmente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator className="-mx-6 w-auto" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-password" className="text-xs">
                Palavra-passe atual
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs">
                Nova palavra-passe
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs">
                Confirmar palavra-passe
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSavePassword}
            className="w-full sm:w-auto"
            size="sm"
          >
            Salvar
          </Button>
        </CardContent>
      </Card>

      {/* ─── Card 3: Preferências ──────────────────────────── */}
      <Card className="transition-shadow hover:shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sun className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Preferências</CardTitle>
              <CardDescription>
                Personalize a experiência da sua conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator className="-mx-6 w-auto" />

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Tema</p>
                <p className="text-xs text-muted-foreground">
                  Alterne entre modo claro e escuro
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {theme === "dark" ? "Escuro" : "Claro"}
              </span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                aria-label="Alternar tema"
              />
            </div>
          </div>

          <Separator />

          {/* Support Contact Info */}
          <div className="space-y-4">
            <p className="text-sm font-medium">Suporte ao Cliente</p>
            <p className="text-xs text-muted-foreground">
              Precisa de ajuda? Entre em contato através dos nossos canais:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* WhatsApp */}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground truncate">
                    +1(584)666-5195
                  </p>
                </div>
              </div>

              {/* Telegram */}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">Telegram</p>
                  <p className="text-xs text-muted-foreground truncate">
                    @NeXTrustX_Support
                  </p>
                </div>
              </div>

              {/* Discord */}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                  <MessageCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">Discord</p>
                  <p className="text-xs text-muted-foreground truncate">
                    NeXTrustX
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                  <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">Email</p>
                  <p className="text-xs text-muted-foreground truncate">
                    suporte@nextrustx.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 2FA Setup Dialog ───────────────────────────────── */}
      <Dialog open={twoFADialogOpen} onOpenChange={setTwoFADialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Configurar Autenticação 2FA
            </DialogTitle>
            <DialogDescription>
              Escaneie o código QR com o Google Authenticator e insira o código
              de 6 dígitos para ativar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="QR Code 2FA"
                  className="h-48 w-48 rounded-lg border"
                />
              ) : (
                <Skeleton className="h-48 w-48 rounded-lg" />
              )}
              <p className="text-xs text-center text-muted-foreground max-w-xs">
                Abra o Google Authenticator no seu celular e escaneie o código QR
                acima.
              </p>
            </div>

            <Separator />

            {/* OTP Input */}
            <div className="space-y-3">
              <Label className="text-sm text-center block">
                Código de verificação
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={verifying2FA}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setTwoFADialogOpen(false);
                setQrCode(null);
                setOtpValue("");
              }}
              disabled={verifying2FA}
            >
              Cancelar
            </Button>
            <Button onClick={handleVerify2FA} disabled={verifying2FA}>
              {verifying2FA ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Verificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
