"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  QrCode,
  Landmark,
  Bitcoin,
  Check,
  Copy,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { cryptoNetworks, usdtNetworks } from "@/lib/config";
import { toast } from "sonner";
import type { DepositFiatResponse, DepositCryptoResponse } from "@/lib/api";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  // ── PIX state ──
  const [pixAmount, setPixAmount] = useState("");
  const [pixLoading, setPixLoading] = useState(false);
  const [pixResult, setPixResult] = useState(false);
  const [pixData, setPixData] = useState<DepositFiatResponse | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  // ── SEPA state ──
  const [sepaAmount, setSepaAmount] = useState("");
  const [sepaLoading, setSepaLoading] = useState(false);
  const [sepaResult, setSepaResult] = useState(false);
  const [sepaData, setSepaData] = useState<DepositFiatResponse | null>(null);
  const [sepaIbanCopied, setSepaIbanCopied] = useState(false);
  const [sepaBicCopied, setSepaBicCopied] = useState(false);
  const [sepaRefCopied, setSepaRefCopied] = useState(false);

  // ── Crypto state ──
  const [cryptoCurrency, setCryptoCurrency] = useState("");
  const [usdtNetwork, setUsdtNetwork] = useState("");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoResult, setCryptoResult] = useState(false);
  const [cryptoData, setCryptoData] = useState<DepositCryptoResponse | null>(null);
  const [cryptoCopied, setCryptoCopied] = useState(false);

  // ── Helpers ──

  const handleCopy = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      toast.success("Copiado para a \u00e1rea de transfer\u00eancia!");
      setTimeout(() => setter(false), 2000);
    } catch {
      toast.error("Falha ao copiar. Tente novamente.");
    }
  };

  const resetAll = () => {
    // PIX
    setPixAmount("");
    setPixLoading(false);
    setPixResult(false);
    setPixData(null);
    setPixCopied(false);
    // SEPA
    setSepaAmount("");
    setSepaLoading(false);
    setSepaResult(false);
    setSepaData(null);
    setSepaIbanCopied(false);
    setSepaBicCopied(false);
    setSepaRefCopied(false);
    // Crypto
    setCryptoCurrency("");
    setUsdtNetwork("");
    setCryptoLoading(false);
    setCryptoResult(false);
    setCryptoData(null);
    setCryptoCopied(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetAll();
    onOpenChange(nextOpen);
  };

  // ── PIX handler ──

  const handlePixGenerate = async () => {
    if (!pixAmount || parseFloat(pixAmount) <= 0) {
      toast.error("Insira um valor v\u00e1lido.");
      return;
    }
    setPixLoading(true);
    try {
      const res = await api.depositFiat(parseFloat(pixAmount), "BRL");
      setPixData(res);
      setPixResult(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar PIX.";
      toast.error(message);
    } finally {
      setPixLoading(false);
    }
  };

  // ── SEPA handler ──

  const handleSepaGenerate = async () => {
    if (!sepaAmount || parseFloat(sepaAmount) <= 0) {
      toast.error("Insira um valor v\u00e1lido.");
      return;
    }
    setSepaLoading(true);
    try {
      const res = await api.depositFiat(parseFloat(sepaAmount), "EUR");
      setSepaData(res);
      setSepaResult(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar IBAN.";
      toast.error(message);
    } finally {
      setSepaLoading(false);
    }
  };

  // ── Crypto handler ──

  const handleCryptoGenerate = async () => {
    let currency = cryptoCurrency;

    if (!currency) {
      toast.error("Selecione uma criptomoeda.");
      return;
    }

    // If USDT is selected, require a network
    if (currency === "USDT") {
      if (!usdtNetwork) {
        toast.error("Selecione a rede do USDT.");
        return;
      }
      currency = usdtNetwork;
    }

    setCryptoLoading(true);
    try {
      const res = await api.depositCrypto(currency);
      setCryptoData(res);
      setCryptoResult(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar endere\u00e7o.";
      toast.error(message);
    } finally {
      setCryptoLoading(false);
    }
  };

  // ── Determine the display label for the selected crypto ──

  const getSelectedCryptoLabel = () => {
    if (cryptoCurrency === "USDT") {
      const net = usdtNetworks.find((n) => n.value === usdtNetwork);
      return net ? `USDT (${net.label})` : "USDT";
    }
    const found = cryptoNetworks.find((n) => n.value === cryptoCurrency);
    return found ? found.label : cryptoCurrency;
  };

  // ── Render ──

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Depositar</DialogTitle>
          <DialogDescription>
            Escolha o m\u00e9todo de dep\u00f3sito que preferir.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pix" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="pix" className="flex-1 gap-1.5">
              <QrCode className="size-4" />
              <span className="hidden sm:inline">PIX</span>
            </TabsTrigger>
            <TabsTrigger value="sepa" className="flex-1 gap-1.5">
              <Landmark className="size-4" />
              <span className="hidden sm:inline">SEPA</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex-1 gap-1.5">
              <Bitcoin className="size-4" />
              <span className="hidden sm:inline">Crypto</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ PIX Tab ═══════════ */}
          <TabsContent value="pix" className="space-y-4 pt-2">
            {pixLoading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Skeleton className="size-[200px] rounded-lg" />
                </div>
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : pixResult ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center gap-4">
                  {/* QR Code */}
                  {pixData?.qr_code ? (
                    <div className="bg-white rounded-lg flex items-center justify-center size-[200px] border p-2">
                      <img
                        src={`data:image/png;base64,${pixData.qr_code}`}
                        alt="QR Code PIX"
                        className="size-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg flex items-center justify-center size-[200px] border">
                      <QrCode className="size-32 text-muted-foreground/60" />
                    </div>
                  )}

                  {/* Copy-paste code */}
                  {pixData?.copy_paste && (
                    <div className="w-full space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        C\u00f3digo PIX Copia e Cola
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={pixData.copy_paste}
                          className="text-xs font-mono truncate"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() =>
                            handleCopy(pixData.copy_paste!, setPixCopied)
                          }
                        >
                          {pixCopied ? (
                            <Check className="size-4 text-emerald-500" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Amount display */}
                  <p className="text-xs text-muted-foreground text-center">
                    Valor:{" "}
                    <span className="font-semibold text-foreground">
                      R${" "}
                      {parseFloat(pixAmount).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>

                  {/* Transaction ID */}
                  {pixData?.transactionId && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      ID: {pixData.transactionId}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setPixResult(false);
                    setPixData(null);
                  }}
                >
                  <RefreshCw className="size-4 mr-2" />
                  Gerar novo PIX
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="pix-amount">Valor do dep\u00f3sito (R$)</Label>
                  <Input
                    id="pix-amount"
                    type="number"
                    placeholder="0,00"
                    min={0}
                    step={0.01}
                    value={pixAmount}
                    onChange={(e) => setPixAmount(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handlePixGenerate}
                  className="w-full"
                  disabled={pixLoading || !pixAmount}
                >
                  {pixLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    "Gerar PIX"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ═══════════ SEPA Tab ═══════════ */}
          <TabsContent value="sepa" className="space-y-4 pt-2">
            {sepaLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-2/3 mx-auto" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ) : sepaResult ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <div className="text-center">
                    <p className="font-semibold">
                      Transfer\u00eancia SEPA \u2014 NeXWallet EU
                    </p>
                  </div>

                  {/* IBAN */}
                  {sepaData?.payment_info && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          IBAN
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            readOnly
                            value={sepaData.payment_info.iban}
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() =>
                              handleCopy(
                                sepaData!.payment_info!.iban,
                                setSepaIbanCopied
                              )
                            }
                          >
                            {sepaIbanCopied ? (
                              <Check className="size-4 text-emerald-500" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* BIC / SWIFT */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          BIC / SWIFT
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            readOnly
                            value={sepaData.payment_info.bic}
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() =>
                              handleCopy(
                                sepaData!.payment_info!.bic,
                                setSepaBicCopied
                              )
                            }
                          >
                            {sepaBicCopied ? (
                              <Check className="size-4 text-emerald-500" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Reference */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Refer\u00eancia
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            readOnly
                            value={sepaData.payment_info.reference}
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() =>
                              handleCopy(
                                sepaData!.payment_info!.reference,
                                setSepaRefCopied
                              )
                            }
                          >
                            {sepaRefCopied ? (
                              <Check className="size-4 text-emerald-500" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amount display */}
                  <p className="text-xs text-muted-foreground text-center">
                    Valor:{" "}
                    <span className="font-semibold text-foreground">
                      &euro;{" "}
                      {parseFloat(sepaAmount).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>

                  {/* Transaction ID */}
                  {sepaData?.transactionId && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      ID: {sepaData.transactionId}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSepaResult(false);
                    setSepaData(null);
                  }}
                >
                  <RefreshCw className="size-4 mr-2" />
                  Gerar novo IBAN
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="sepa-amount">
                    Valor do dep\u00f3sito (&euro;)
                  </Label>
                  <Input
                    id="sepa-amount"
                    type="number"
                    placeholder="0,00"
                    min={0}
                    step={0.01}
                    value={sepaAmount}
                    onChange={(e) => setSepaAmount(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSepaGenerate}
                  className="w-full"
                  disabled={sepaLoading || !sepaAmount}
                >
                  {sepaLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Gerando IBAN...
                    </>
                  ) : (
                    "Gerar IBAN"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ═══════════ Crypto Tab ═══════════ */}
          <TabsContent value="crypto" className="space-y-4 pt-2">
            {cryptoLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : cryptoResult ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  {/* Currency label */}
                  <div className="text-center">
                    <p className="font-semibold">
                      {cryptoData?.currency ?? getSelectedCryptoLabel()}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Endere\u00e7o de Dep\u00f3sito
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={cryptoData?.address ?? ""}
                        className="font-mono text-xs truncate"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          handleCopy(cryptoData?.address ?? "", setCryptoCopied)
                        }
                      >
                        {cryptoCopied ? (
                          <Check className="size-4 text-emerald-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  {cryptoData?.transactionId && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      ID: {cryptoData.transactionId}
                    </p>
                  )}

                  {/* Network warning */}
                  <Alert className="border-amber-500/30 bg-amber-500/5">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <AlertTitle className="text-amber-600 dark:text-amber-400">
                      Aten\u00e7\u00e3o
                    </AlertTitle>
                    <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                      Envie apenas{" "}
                      <span className="font-semibold">
                        {cryptoData?.currency ?? getSelectedCryptoLabel()}
                      </span>{" "}
                      para este endere\u00e7o. O envio de outros ativos ou uso de
                      uma rede diferente pode resultar em perda permanente dos
                      fundos.
                    </AlertDescription>
                  </Alert>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setCryptoResult(false);
                    setCryptoData(null);
                  }}
                >
                  <RefreshCw className="size-4 mr-2" />
                  Selecionar outra rede
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Crypto selector */}
                <div className="space-y-2">
                  <Label>Criptomoeda</Label>
                  <Select
                    value={cryptoCurrency}
                    onValueChange={(val) => {
                      setCryptoCurrency(val);
                      // Reset USDT network when changing crypto
                      setUsdtNetwork("");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a criptomoeda" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoNetworks.map((network) => (
                        <SelectItem key={network.value} value={network.value}>
                          <span className="flex items-center gap-2">
                            <span className={network.color}>{network.icon}</span>
                            <span>{network.label}</span>
                            <span className="text-muted-foreground text-xs">
                              {network.sublabel}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                      {/* USDT option */}
                      <SelectItem value="USDT">
                        <span className="flex items-center gap-2">
                          <span className="text-emerald-500">₮</span>
                          <span>Tether (USDT)</span>
                          <span className="text-muted-foreground text-xs">
                            V\u00e1rias redes
                          </span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* USDT network RadioGroup */}
                {cryptoCurrency === "USDT" && (
                  <div className="space-y-2">
                    <Label>Rede do USDT</Label>
                    <RadioGroup
                      value={usdtNetwork}
                      onValueChange={setUsdtNetwork}
                      className="gap-2"
                    >
                      {usdtNetworks.map((net) => (
                        <label
                          key={net.value}
                          htmlFor={net.value}
                          className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 has-[input:checked]:border-emerald-500/50 has-[input:checked]:bg-emerald-500/5"
                        >
                          <RadioGroupItem value={net.value} id={net.value} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {net.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Taxa: {net.fee}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {net.sublabel}
                            </span>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <Button
                  onClick={handleCryptoGenerate}
                  className="w-full"
                  disabled={
                    cryptoLoading ||
                    !cryptoCurrency ||
                    (cryptoCurrency === "USDT" && !usdtNetwork)
                  }
                >
                  {cryptoLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Gerando endere\u00e7o...
                    </>
                  ) : (
                    "Gerar Endere\u00e7o"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
