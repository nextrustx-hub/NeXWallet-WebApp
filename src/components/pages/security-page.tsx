"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Monitor,
  Trash2,
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
import { toast } from "sonner";

const mockSessions = [
  {
    id: "s1",
    browser: "Chrome — macOS",
    lastActive: "Ativa agora",
    current: true,
  },
  {
    id: "s2",
    browser: "Safari — iPhone",
    lastActive: "Há 2 horas",
    current: false,
  },
  {
    id: "s3",
    browser: "Firefox — Windows",
    lastActive: "Há 3 dias",
    current: false,
  },
];

export function SecurityPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    toast.success("Palavra-passe alterada com sucesso");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleEndSessions = () => {
    toast.success("Todas as outras sessões foram encerradas");
  };

  return (
    <div className="space-y-6">
      {/* Card 1: 2FA */}
      <Card className="transition-shadow hover:shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Autenticação de Dois Fatores (2FA)
                </CardTitle>
                <CardDescription>
                  Proteja sua conta com uma camada extra de segurança
                </CardDescription>
              </div>
            </div>
            <Badge
              className={
                twoFAEnabled
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/15"
              }
            >
              {twoFAEnabled ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground max-w-md">
              Ao ativar a 2FA, você precisará inserir um código gerado pelo seu
              aplicativo autenticador além da sua senha ao fazer login.
            </p>
            <Switch
              checked={twoFAEnabled}
              onCheckedChange={setTwoFAEnabled}
              aria-label="Ativar 2FA"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards grid: Password + Sessions side by side on md+ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 2: Change Password */}
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
            <div className="space-y-3">
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              className="w-full"
              size="sm"
            >
              Salvar
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Active Sessions */}
        <Card className="transition-shadow hover:shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Sessões Ativas</CardTitle>
                <CardDescription>
                  Dispositivos conectados à sua conta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator className="-mx-6 w-auto" />
            <div className="space-y-3">
              {mockSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{session.browser}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {session.current && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
                    >
                      Atual
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={handleEndSessions}
              variant="outline"
              size="sm"
              className="w-full gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Terminar todas as sessões
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Card 4: API Access */}
      <Card className="transition-shadow hover:shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">API Access</CardTitle>
              <CardDescription>
                Gerencie suas chaves de acesso à API
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Suas chaves de API concedem acesso total à sua conta. Nunca
                compartilhe suas chaves secretas e mantenha-as armazenadas de
                forma segura. Revogue chaves que não estejam em uso.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <Key className="h-4 w-4" />
              Gerenciar Chaves
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
