"use client";

import { useAuth } from "@/contexts/auth-context";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, UserCheck, Crown } from "lucide-react";
import type { RegisterWhitePayload, RegisterBlackPayload } from "@/lib/api";

type AuthMode = "login" | "register";
type RegisterTier = "WHITE" | "BLACK";

export function AuthGate() {
  const { isAuthenticated, isLoading, login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [registerTier, setRegisterTier] = useState<RegisterTier>("WHITE");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register White fields
  const [whiteName, setWhiteName] = useState("");
  const [whiteEmail, setWhiteEmail] = useState("");
  const [whitePassword, setWhitePassword] = useState("");
  const [whiteCpf, setWhiteCpf] = useState("");
  const [showWhitePassword, setShowWhitePassword] = useState(false);

  // Register Black fields
  const [blackAlias, setBlackAlias] = useState("");
  const [blackEmail, setBlackEmail] = useState("");
  const [blackPassword, setBlackPassword] = useState("");
  const [showBlackPassword, setShowBlackPassword] = useState(false);

  // Shared
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo.png"
            alt="NeXWallet"
            className="h-10 w-10 animate-pulse"
          />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AppLayout />;
  }

  // ─── Handlers ───────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success("Sessão iniciada com sucesso.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro na autenticação.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (registerTier === "WHITE") {
        const payload: RegisterWhitePayload = {
          email: whiteEmail,
          password: whitePassword,
          tier: "WHITE",
          name: whiteName,
          cpf: whiteCpf,
        };
        await register(payload);
        toast.success("Conta Standard criada com sucesso.");
      } else {
        const payload: RegisterBlackPayload = {
          email: blackEmail,
          password: blackPassword,
          tier: "BLACK",
          name: blackAlias,
        };
        await register(payload);
        toast.success("Conta VIP criada com sucesso.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro no registo.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Shared toggle link ────────────────────────────────────────

  const toggleLink = (
    <button
      type="button"
      onClick={() => {
        setMode(mode === "login" ? "register" : "login");
      }}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {mode === "login" ? (
        <>
          Não tem conta?{" "}
          <span className="text-primary font-medium">Registar-se</span>
        </>
      ) : (
        <>
          Já tem conta?{" "}
          <span className="text-primary font-medium">Entrar</span>
        </>
      )}
    </button>
  );

  // ─── Password field helper ─────────────────────────────────────

  const PasswordField = ({
    id,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
  }: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>Palavra-passe</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={onToggle}
        >
          {show ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src="/logo.png"
            alt="NeXWallet"
            className="h-16 w-16 rounded-2xl shadow-lg shadow-primary/20 object-contain"
          />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">NeXWallet</h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">
              by NeXTrustX
            </p>
          </div>
        </div>

        {/* ─── LOGIN CARD ─────────────────────────────────────────── */}
        {mode === "login" && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">Entrar na sua conta</CardTitle>
              <CardDescription>
                Acesse sua carteira digital NeXWallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <PasswordField
                  id="login-password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  show={showLoginPassword}
                  onToggle={() => setShowLoginPassword(!showLoginPassword)}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                  size="lg"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>

              <div className="mt-4 text-center">{toggleLink}</div>
            </CardContent>
          </Card>
        )}

        {/* ─── REGISTER CARD ──────────────────────────────────────── */}
        {mode === "register" && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">Criar conta</CardTitle>
              <CardDescription>
                Escolha o tipo de conta que melhor se adequa a si
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Tier selector tabs */}
                <Tabs
                  value={registerTier}
                  onValueChange={(v) => setRegisterTier(v as RegisterTier)}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="WHITE" className="flex-1 gap-1.5">
                      <UserCheck className="size-4" />
                      <span>Standard</span>
                    </TabsTrigger>
                    <TabsTrigger value="BLACK" className="flex-1 gap-1.5">
                      <Crown className="size-4" />
                      <span>VIP</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* ─── STANDARD (WHITE) TAB ──────────────────────────── */}
                  <TabsContent value="WHITE" className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Conta pessoal com verificação de identidade. Suporta PIX,
                      SEPA e criptomoedas.
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor="white-name">Nome completo</Label>
                      <Input
                        id="white-name"
                        placeholder="João Silva"
                        value={whiteName}
                        onChange={(e) => setWhiteName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="white-email">E-mail</Label>
                      <Input
                        id="white-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={whiteEmail}
                        onChange={(e) => setWhiteEmail(e.target.value)}
                        required
                      />
                    </div>

                    <PasswordField
                      id="white-password"
                      value={whitePassword}
                      onChange={setWhitePassword}
                      show={showWhitePassword}
                      onToggle={() => setShowWhitePassword(!showWhitePassword)}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="white-cpf">CPF</Label>
                      <Input
                        id="white-cpf"
                        placeholder="00000000000"
                        value={whiteCpf}
                        onChange={(e) =>
                          setWhiteCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
                        }
                        required
                        inputMode="numeric"
                        maxLength={11}
                      />
                      <p className="text-xs text-muted-foreground">
                        Apenas números, 11 dígitos
                      </p>
                    </div>
                  </TabsContent>

                  {/* ─── VIP (BLACK) TAB ───────────────────────────────── */}
                  <TabsContent value="BLACK" className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Conta anónima premium. Identificado apenas por vulgo/alias.
                      Acesso total a todos os serviços.
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor="black-alias">Vulgo / Alias</Label>
                      <Input
                        id="black-alias"
                        placeholder="O seu nome de guerra"
                        value={blackAlias}
                        onChange={(e) => setBlackAlias(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Este nome será utilizado em vez do nome real
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="black-email">E-mail</Label>
                      <Input
                        id="black-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={blackEmail}
                        onChange={(e) => setBlackEmail(e.target.value)}
                        required
                      />
                    </div>

                    <PasswordField
                      id="black-password"
                      value={blackPassword}
                      onChange={setBlackPassword}
                      show={showBlackPassword}
                      onToggle={() => setShowBlackPassword(!showBlackPassword)}
                    />
                  </TabsContent>
                </Tabs>

                <Separator />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                  size="lg"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {registerTier === "WHITE"
                    ? "Criar conta Standard"
                    : "Criar conta VIP"}
                </Button>
              </form>

              <div className="mt-4 text-center">{toggleLink}</div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/50 mt-6 space-y-1">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://www.nextrustx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-foreground"
            >
              NeXTrustX
            </a>{" "}
            &mdash; Todos os direitos reservados
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <a
              href="https://www.nextrustx.com/termos-e-condicoes"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-foreground"
            >
              Termos e Condições
            </a>
            <span>&middot;</span>
            <a
              href="https://www.nextrustx.com/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-foreground"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
