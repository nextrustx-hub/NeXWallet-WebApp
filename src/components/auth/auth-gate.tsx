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
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function AuthGate() {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Sessão iniciada com sucesso.");
      } else {
        await register(name, email, password);
        toast.success("Conta criada com sucesso.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro na autenticação";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">
              {mode === "login" ? "Entrar na sua conta" : "Criar conta"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Acesse sua carteira digital NeXWallet"
                : "Crie sua conta e comece a usar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === "login"
                  ? "Não tem conta? "
                  : "Já tem conta? "}
                <span className="text-primary font-medium">
                  {mode === "login" ? "Registar-se" : "Entrar"}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground/50 mt-6 space-y-1">
          <p>
            © {new Date().getFullYear()}{" "}
            <a
              href="https://www.nextrustx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-foreground"
            >
              NeXTrustX
            </a>{" "}
            — Todos os direitos reservados
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
            <span>·</span>
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
