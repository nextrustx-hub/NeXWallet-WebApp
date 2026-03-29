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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Landmark, Bitcoin, Check, Copy, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cryptoNetworks } from "@/lib/config";
import { toast } from "sonner";
import type { DepositFiatResponse, DepositCryptoResponse } from "@/lib/api";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  // PIX state
  const [pixAmount, setPixAmount] = useState("");
  const [pixLoading, setPixLoading] = useState(false);
  const [pixResult, setPixResult] = useState(false);
  const [pixData, setPixData] = useState<DepositFiatResponse | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  // SEPA state
  const [sepaAmount, setSepaAmount] = useState("");
  const [sepaLoading, setSepaLoading] = useState(false);
  const [sepaResult, setSepaResult] = useState(false);
  const [sepaData, setSepaData] = useState<DepositFiatResponse | null>(null);
  const [sepaIbanCopied, setSepaIbanCopied] = useState(false);
  const [sepaBicCopied, setSepaBicCopied] = useState(false);

  // Crypto state
  const [cryptoNetwork, setCryptoNetwork] = useState("");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoResult, setCryptoResult] = useState(false);
  const [cryptoData, setCryptoData] = useState<DepositCryptoResponse | null>(null);
  const [cryptoCopied, setCryptoCopied] = useState(false);

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

  const handlePixGenerate = async () => {
    if (!pixAmount || parseFloat(pixAmount) <= 0) {
      toast.error("Insira um valor v\u00e1lido.");
      return;
    }
    setPixLoading(true);
    try {
      const res = await api.depositFiat(parseFloat(pixAmount), "BRL");
      setPixData(res.data);
      setPixResult(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar PIX.";
      toast.error(message);
    } finally {
      setPixLoading(false);
    }
  };

  const handleSepaGenerate = async () => {
    if (!sepaAmount || parseFloat(sepaAmount) <= 0) {
      toast.error("Insira um valor v\u00e1lido.");
      return;
    }
    setSepaLoading(true);
    try {
      const res = await api.depositFiat(parseFloat(sepaAmount), "EUR");
      setSepaData(res.data);
      setSepaResult(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar IBAN.";
      toast.error(message);
    } finally {
      setSepaLoading(false);
    }
  };

  const handleCryptoGenerate = async () => {
    if (!cryptoNetwork) {
      toast.error("Selecione uma rede.");
      return;
    }
    setCryptoLoading(true);
    try {
      const res = await api.depositCrypto(cryptoNetwork);
      setCryptoData(res.data);
      setCryptoResult(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar endere\u00e7o.";
      toast.error(message);
    } finally {
      setCryptoLoading(false);
    }
  };

  // Reset all state when dialog closes
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPixAmount("");
      setPixLoading(false);
      setPixResult(false);
      setPixData(null);
      setPixCopied(false);
      setSepaAmount("");
      setSepaLoading(false);
      setSepaResult(false);
      setSepaData(null);
      setSepaIbanCopied(false);
      setSepaBicCopied(false);
      setCryptoNetwork("");
      setCryptoLoading(false);
      setCryptoResult(false);
      setCryptoData(null);
      setCryptoCopied(false);
    }
    onOpenChange(nextOpen);
  };

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

          {/* PIX Tab */}
          <TabsContent value="pix" className="space-y-4 pt-2">
            {!pixResult ? (
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
                <Button onClick={handlePixGenerate} className="w-full" disabled={pixLoading}>
                  {pixLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    "Gerar PIX"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center gap-4">
                  {/* QR Code */}
                  {pixData?.qrCodeBase64 ? (
                    <div className="bg-white rounded-lg flex items-center justify-center size-[200px] border p-2">
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code PIX"
                        className="size-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg flex items-center justify-center size-[200px] border">
                      <QrCode className="size-32 text-muted-foreground/60" />
                    </div>
                  )}

                  <div className="w-full space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      C\u00f3digo PIX
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={pixData?.paymentCode ?? ""}
                        className="text-xs font-mono truncate"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          handleCopy(pixData?.paymentCode ?? "", setPixCopied)
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
                </div>
              </div>
            )}
          </TabsContent>

          {/* SEPA Tab */}
          <TabsContent value="sepa" className="space-y-4 pt-2">
            {!sepaResult ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="sepa-amount">Valor do dep\u00f3sito (EUR)</Label>
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
                <Button onClick={handleSepaGenerate} className="w-full" disabled={sepaLoading}>
                  {sepaLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    "Gerar IBAN"
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="text-center">
                  <p className="font-semibold">{sepaData?.bankName ?? "NeXWallet EU \u2014 Banco Digital"}</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">IBAN</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={sepaData?.iban ?? ""}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          handleCopy(sepaData?.iban ?? "", setSepaIbanCopied)
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

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">BIC</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={sepaData?.bic ?? ""}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          handleCopy(sepaData?.bic ?? "", setSepaBicCopied)
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
                </div>

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
              </div>
            )}
          </TabsContent>

          {/* Crypto Tab */}
          <TabsContent value="crypto" className="space-y-4 pt-2">
            {!cryptoResult ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Rede</Label>
                  <Select value={cryptoNetwork} onValueChange={setCryptoNetwork}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a rede" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoNetworks.map((network) => (
                        <SelectItem key={network.value} value={network.value}>
                          <span className="flex items-center gap-2">
                            <span>{network.icon}</span>
                            <span>{network.label}</span>
                            <span className="text-muted-foreground text-xs">
                              {network.sublabel}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCryptoGenerate} className="w-full" disabled={cryptoLoading}>
                  {cryptoLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    "Gerar Endere\u00e7o"
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="text-center">
                  <p className="font-semibold">
                    {cryptoData?.currency ?? cryptoNetwork}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Endere\u00e7o</Label>
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

                {cryptoData?.network && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Rede</Label>
                    <p className="text-sm font-medium">{cryptoData.network}</p>
                  </div>
                )}

                <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 p-3">
                  <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Envie apenas{" "}
                    <span className="font-semibold">
                      {cryptoData?.currency ?? cryptoNetwork === "BTC" ? "BTC" : "USDT"}
                    </span>{" "}
                    na rede{" "}
                    <span className="font-semibold">
                      {cryptoData?.network ?? (cryptoNetwork === "BTC" ? "Bitcoin" : "TRC-20 (Tron)")}
                    </span>
                    . Outros ativos ou redes podem resultar em perda de fundos.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
