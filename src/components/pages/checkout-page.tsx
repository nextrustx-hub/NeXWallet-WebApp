"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Check,
  ArrowLeft,
  Shield,
  Lock,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import type { CheckoutDetails } from "@/lib/api";
import { useNavigation } from "@/stores/navigation-store";

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);

export function CheckoutPage() {
  const { goBack, checkoutId } = useNavigation();
  const [details, setDetails] = useState<CheckoutDetails | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!checkoutId);
  const [copied, setCopied] = useState(false);
  const fetchingIdRef = useRef<string | null>(null);

  // Derived: when there's no checkoutId at all, show a static error
  const displayError = !checkoutId
    ? "Link de pagamento inválido ou expirado."
    : fetchError;

  useEffect(() => {
    if (!checkoutId) return;

    // Skip if already fetching this exact ID
    if (fetchingIdRef.current === checkoutId) return;
    fetchingIdRef.current = checkoutId;

    api
      .getCheckoutDetails(checkoutId)
      .then((res) => {
        setDetails(res.data);
        setFetchError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Link de pagamento inválido ou expirado.";
        setFetchError(message);
        setDetails(null);
        setLoading(false);
      });
  }, [checkoutId]);

  const handleCopyPixCode = async () => {
    if (!details?.payment_info?.copy_paste) return;

    try {
      await navigator.clipboard.writeText(details.payment_info.copy_paste);
      setCopied(true);
      toast.success("Código PIX copiado com sucesso!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar o código.");
    }
  };

  // ─── Error State ──────────────────────────────────────────────
  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Erro ao carregar</h2>
              <p className="text-sm text-muted-foreground">{displayError}</p>
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

  // ─── Loading State ────────────────────────────────────────────
  if (loading || !details) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-5">
            {/* Back button skeleton */}
            <Skeleton className="h-8 w-20" />

            {/* Logo skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-5 w-28" />
            </div>

            <Skeleton className="h-px w-full" />

            {/* Product info skeleton */}
            <div className="text-center space-y-2">
              <Skeleton className="h-5 w-36 mx-auto" />
              <Skeleton className="h-4 w-52 mx-auto" />
            </div>

            <Skeleton className="h-px w-full" />

            {/* Amount skeleton */}
            <div className="text-center space-y-2">
              <Skeleton className="h-9 w-44 mx-auto" />
            </div>

            <Skeleton className="h-px w-full" />

            {/* QR Code skeleton */}
            <div className="flex justify-center">
              <Skeleton className="h-[220px] w-[220px] rounded-lg" />
            </div>

            {/* PIX code skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Helper text skeleton */}
            <Skeleton className="h-3 w-64 mx-auto" />

            <Skeleton className="h-px w-full" />

            {/* Security badges skeleton */}
            <div className="flex justify-center gap-6">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-44" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main Receipt Card ────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-5">
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

          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-600 text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">NeXWallet</span>
          </div>

          <Separator />

          {/* Product info */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold leading-tight">
              {details.title}
            </h2>
            {details.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {details.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Amount */}
          <div className="text-center py-1">
            <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(details.amount, details.currency)}
            </p>
          </div>

          <Separator />

          {/* PIX Payment Section */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-center">Pagar com PIX</p>

            {/* QR Code */}
            <div className="flex justify-center">
              {details.payment_info?.qr_code ? (
                <img
                  src={`data:image/png;base64,${details.payment_info.qr_code}`}
                  alt="QR Code PIX"
                  className="w-[220px] h-[220px] rounded-lg border bg-white"
                />
              ) : (
                <div className="w-[220px] h-[220px] bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
                  QR indisponível
                </div>
              )}
            </div>

            {/* Copy-paste PIX code */}
            {details.payment_info?.copy_paste && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Código PIX (copia e cola)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={details.payment_info.copy_paste}
                    readOnly
                    className="font-mono text-xs select-all"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPixCode}
                    className="shrink-0"
                    title="Copiar código PIX"
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

            {/* Helper text */}
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Abra o app do seu banco e escaneie o QR Code, ou copie e cole o
              código acima.
            </p>
          </div>

          <Separator />

          {/* Security badges */}
          <div className="space-y-2 pb-1">
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
