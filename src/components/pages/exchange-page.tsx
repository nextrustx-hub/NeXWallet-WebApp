"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownUp, Maximize2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { BalanceData } from "@/lib/api";

// --- Formatting helpers ---
const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v
  );
const formatEUR = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    v
  );
const formatCrypto = (v: number) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

const formatValue = (v: number, currency: string) => {
  switch (currency) {
    case "BRL":
      return formatBRL(v);
    case "EUR":
      return formatEUR(v);
    default:
      return formatCrypto(v);
  }
};

// --- Currency meta ---
const currencies = [
  { value: "BRL", label: "BRL", symbol: "R$", flag: "\uD83C\uDDE7\uD83C\uDDF7" },
  { value: "EUR", label: "EUR", symbol: "\u20AC", flag: "\uD83C\uDDEA\uD83C\uDDFA" },
  { value: "USDT", label: "USDT", symbol: "\u20B4", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { value: "BTC", label: "BTC", symbol: "\u20BF", flag: "\uD83D\uDFE3" },
] as const;

// --- Mock rate calculation (estimate for display) ---
const getRate = (from: string, to: string): number => {
  if (from === to) return 1;
  const rates: Record<string, Record<string, number>> = {
    BRL: { EUR: 0.18, USDT: 0.2, BTC: 0.000003 },
    EUR: { BRL: 5.5, USDT: 1.1, BTC: 0.000015 },
    USDT: { BRL: 5.0, EUR: 0.91, BTC: 0.000014 },
    BTC: { BRL: 340000, EUR: 62000, USDT: 68000 },
  };
  return (rates[from]?.[to] ?? 1) * 0.995; // 0.5% fee
};

export function ExchangePage() {
  const [fromCurrency, setFromCurrency] = useState("BRL");
  const [toCurrency, setToCurrency] = useState("USDT");
  const [fromAmount, setFromAmount] = useState("");
  const [swapLoading, setSwapLoading] = useState(false);

  // Balance state
  const [balances, setBalances] = useState<BalanceData>({
    BRL: 0,
    EUR: 0,
    USDT: 0,
    BTC: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadBalances = useCallback(async () => {
    try {
      const res = await api.getBalance();
      setBalances(res.data);
    } catch {
      // Silently fail – balances stay at 0
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const parsedAmount = parseFloat(fromAmount) || 0;

  const rate = useMemo(() => getRate(fromCurrency, toCurrency), [fromCurrency, toCurrency]);
  const rawRate = useMemo(() => {
    if (fromCurrency === toCurrency) return 1;
    const rates: Record<string, Record<string, number>> = {
      BRL: { EUR: 0.18, USDT: 0.2, BTC: 0.000003 },
      EUR: { BRL: 5.5, USDT: 1.1, BTC: 0.000015 },
      USDT: { BRL: 5.0, EUR: 0.91, BTC: 0.000014 },
      BTC: { BRL: 340000, EUR: 62000, USDT: 68000 },
    };
    return rates[fromCurrency]?.[toCurrency] ?? 1;
  }, [fromCurrency, toCurrency]);

  const convertedAmount = useMemo(() => parsedAmount * rate, [parsedAmount, rate]);

  const availableBalance = balances[fromCurrency as keyof BalanceData] ?? 0;

  const handleMax = () => {
    setFromAmount(String(availableBalance));
  };

  const handleSwap = () => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    setFromCurrency(prevTo);
    setToCurrency(prevFrom);
    // Swap amounts using the converted value
    if (parsedAmount > 0) {
      setFromAmount(convertedAmount > 0 ? String(convertedAmount) : "");
    }
  };

  const handleConvert = async () => {
    if (parsedAmount <= 0 || fromCurrency === toCurrency) return;

    setSwapLoading(true);
    try {
      await api.swap(fromCurrency, toCurrency, parsedAmount);
      toast.success("Convers\u00e3o realizada com sucesso!");
      setFromAmount("");
      await loadBalances();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro na convers\u00e3o.";
      toast.error(message);
    } finally {
      setSwapLoading(false);
    }
  };

  const isDisabled = parsedAmount <= 0 || fromCurrency === toCurrency || swapLoading;

  const fromMeta = currencies.find((c) => c.value === fromCurrency);
  const toMeta = currencies.find((c) => c.value === toCurrency);

  return (
    <div className="animate-slide-up max-w-lg mx-auto w-full">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Exchange</CardTitle>
          <CardDescription>
            Converta entre moedas em tempo real
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Block 1: Pagar (From) */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Voc\u00ea envia
            </Label>

            <div className="flex items-center gap-3">
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="mr-1.5">{c.flag}</span>
                      {c.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0,00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="pr-16 text-right text-lg font-semibold h-11"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMax}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs font-medium text-primary hover:text-primary/80"
                >
                  <Maximize2 className="size-3 mr-1" />
                  Max
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Dispon&iacute;vel:{" "}
              {loading ? (
                <Skeleton className="inline-block h-4 w-24 align-middle" />
              ) : (
                <span className="font-medium">{formatValue(availableBalance, fromCurrency)}</span>
              )}
            </p>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1 relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="rounded-full size-10 bg-background border shadow-lg hover:bg-accent transition-all"
            >
              <ArrowDownUp className="size-4" />
            </Button>
          </div>

          {/* Block 2: Receber (To) */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Voc&ecirc; recebe
            </Label>

            <div className="flex items-center gap-3">
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="mr-1.5">{c.flag}</span>
                      {c.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="text"
                readOnly
                value={parsedAmount > 0 ? formatValue(convertedAmount, toCurrency) : ""}
                placeholder="0,00"
                className="flex-1 text-right text-lg font-semibold h-11 bg-muted/30 cursor-not-allowed"
              />
            </div>

            {parsedAmount > 0 && fromCurrency !== toCurrency && (
              <p className="text-xs text-muted-foreground">
                Taxa estimada: 1 {fromCurrency} ={" "}
                {formatCrypto(rawRate)} {toCurrency}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="pt-2 space-y-2">
            <Separator />
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-muted-foreground">Taxa de convers&atilde;o</span>
              <span className="font-medium">0.5%</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-muted-foreground">Valor estimado a receber</span>
              <span className="font-semibold text-foreground">
                {parsedAmount > 0
                  ? formatValue(convertedAmount, toCurrency)
                  : "\u2014"}
              </span>
            </div>
          </div>

          {/* Convert Button */}
          <div className="pt-2">
            <Button
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all"
              size="lg"
              disabled={isDisabled}
              onClick={handleConvert}
            >
              {swapLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : parsedAmount > 0 && fromCurrency !== toCurrency ? (
                <>
                  Converter{" "}
                  {formatValue(parsedAmount, fromCurrency)} para {toCurrency}
                </>
              ) : (
                "Converter"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
