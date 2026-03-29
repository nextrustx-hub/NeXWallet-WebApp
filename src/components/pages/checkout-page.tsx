"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Check,
  ArrowLeft,
  Shield,
  Clock,
  Lock,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import type { CheckoutDetails } from "@/lib/api";
import { useNavigation } from "@/stores/navigation-store";

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    amount
  );

const formatExpiry = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function CheckoutPage() {
  const { goBack, checkoutId } = useNavigation();
  const [details, setDetails] = useState<CheckoutDetails | null>(null);
  const [loading, setLoading] = useState(!!checkoutId);
  const [error, setError] = useState<string | null>(checkoutId ? null : "Link inválido ou expirado");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!checkoutId) return;

    api
      .getCheckoutDetails(checkoutId)
      .then((res) => setDetails(res.data))
      .catch((err: any) => setError(err.message || "Link inválido ou expirado"))
      .finally(() => setLoading(false));
  }, [checkoutId]);

  const handleCopy = () => {
    if (!details?.paymentCode) return;
    navigator.clipboard.writeText(details.paymentCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Erro ao carregar</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading || !details) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-9 w-24" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-3 w-48 mx-auto" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-9 w-40 mx-auto" />
              <div className="flex items-center justify-center gap-3">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-center">
              <Skeleton className="h-[200px] w-[200px] rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 animate-scale-in">
      <Card className="w-full max-w-md shadow-lg animate-scale-in">
        <CardContent className="p-6 space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="NeXWallet"
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="text-lg font-semibold">NeXWallet</span>
          </div>

          <Separator />

          {/* Merchant info */}
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">
              {details.merchantName || "NeXWallet"}
            </p>
            <p className="text-xs text-muted-foreground">
              Pagamento seguro via NeXWallet
            </p>
          </div>

          {/* Payment details */}
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">{details.title}</h2>
            <p className="text-sm text-muted-foreground">
              {details.description}
            </p>
          </div>

          <Separator />

          {/* Amount */}
          <div className="text-center space-y-2">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-sm text-muted-foreground">
                {details.currency}
              </span>
              <span className="text-3xl font-bold">
                {formatCurrency(details.amount, details.currency)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              >
                {details.status === "active" ? "Ativo" : details.status}
              </Badge>
              {details.expiresAt && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expira em: {formatExpiry(details.expiresAt)}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* PIX Payment */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-center">Pagar com PIX</p>

            {/* QR Code */}
            <div className="flex justify-center">
              {details.qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${details.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="w-[200px] h-[200px] rounded-lg border"
                />
              ) : (
                <div className="w-[200px] h-[200px] bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
                  QR indisponível
                </div>
              )}
            </div>

            {/* PIX Code */}
            {details.paymentCode && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Código PIX
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={details.paymentCode}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Abra o app do seu banco e escaneie o QR Code ou cole o código
            </p>
          </div>

          <Separator />

          {/* Footer */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-emerald-500" />
              Pagamento processado com segurança
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-4 w-4 text-emerald-500" />
              Dados protegidos com criptografia de ponta a ponta
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
