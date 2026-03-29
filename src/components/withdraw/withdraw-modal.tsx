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
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { api } from "@/lib/api";
import { cryptoNetworks, usdtNetworks } from "@/lib/config";
import { toast } from "sonner";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  // ── PIX state ──
  const [pixAmount, setPixAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixLoading, setPixLoading] = useState(false);
  const [pixResult, setPixResult] = useState(false);
  const [pixTxId, setPixTxId] = useState("");

  // ── SEPA state ──
  const [sepaAmount, setSepaAmount] = useState("");
  const [sepaIban, setSepaIban] = useState("");
  const [sepaLoading, setSepaLoading] = useState(false);
  const [sepaResult, setSepaResult] = useState(false);
  const [sepaTxId, setSepaTxId] = useState("");

  // ── Crypto state ──
  const [cryptoCurrency, setCryptoCurrency] = useState("");
  const [usdtNetwork, setUsdtNetwork] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoResult, setCryptoResult] = useState(false);
  const [cryptoTxId, setCryptoTxId] = useState("");

  // ── Helpers ──

  const resetAll = () => {
    // PIX
    setPixAmount("");
    setPixKey("");
    setPixLoading(false);
    setPixResult(false);
    setPixTxId("");
    // SEPA
    setSepaAmount("");
    setSepaIban("");
    setSepaLoading(false);
    setSepaResult(false);
    setSepaTxId("");
    // Crypto
    setCryptoCurrency("");
    setUsdtNetwork("");
    setCryptoAmount("");
    setCryptoAddress("");
    setCryptoLoading(false);
    setCryptoResult(false);
    setCryptoTxId("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetAll();
    onOpenChange(nextOpen);
  };

  const getSelectedCryptoLabel = () => {
    if (cryptoCurrency === "USDT") {
      const net = usdtNetworks.find((n) => n.value === usdtNetwork);
      return net ? `USDT (${net.label})` : "USDT";
    }
    const found = cryptoNetworks.find((n) => n.value === cryptoCurrency);
    return found ? found.label : cryptoCurrency;
  };

  // ── PIX handler ──

  const handlePixWithdraw = async () => {
    if (!pixAmount || parseFloat(pixAmount) <= 0) {
      toast.error("Insira um valor v\u00e1lido.");
      return;
    }
    if (!pixKey.trim()) {
      toast.error("Insira a sua chave PIX.");
      return;
    }
    setPixLoading(true);
    try {
      const res = await api.withdrawFiat(
        parseFloat(pixAmount),
        "BRL",
        pixKey.trim()
      );
      setPixTxId(res.transactionId);
      setPixResult(true);
      toast.success(res.message || "Saque solicitado com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao solicitar saque PIX.";
      toast.error(message);
    } finally {
      setPixLoading(false);
    }
  };

  // ── SEPA handler ──

  const handleSepaWithdraw = async () => {
    if (!sepaAmount || parseFloat(sepaAmount) <= 0) {
      toast.error("Insira um valor v\u00e1lido.");
      return;
    }
    if (!sepaIban.trim()) {
      toast.error("Insira o IBAN de destino.");
      return;
    }
    setSepaLoading(true);
    try {
      const res = await api.withdrawFiat(
        parseFloat(sepaAmount),
        "EUR",
        undefined,
        sepaIban.trim()
      );
      setSepaTxId(res.transactionId);
      setSepaResult(true);
      toast.success(res.message || "Saque solicitado com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao solicitar saque SEPA.";
      toast.error(message);
    } finally {
      setSepaLoading(false);
    }
  };

  // ── Crypto handler ──

  const handleCryptoWithdraw = async () => {
    let currency = cryptoCurrency;

    if (!currency) {
      toast.error("Selecione uma criptomoeda.");
      return;
    }
    if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) {
      toast.error("Insira um valor v\u00e1lido.");
      return;
    }
    if (!cryptoAddress.trim()) {
      toast.error("Insira o endere\u00e7o da carteira de destino.");
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
      const res = await api.withdrawCrypto(
        parseFloat(cryptoAmount),
        currency,
        cryptoAddress.trim()
      );
      setCryptoTxId(res.transactionId);
      setCryptoResult(true);
      toast.success(res.message || "Saque crypto solicitado com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao solicitar saque crypto.";
      toast.error(message);
    } finally {
      setCryptoLoading(false);
    }
  };

  // ── Success state component ──

  const SuccessView = ({
    txId,
    onReset,
    resetLabel,
  }: {
    txId: string;
    onReset: () => void;
    resetLabel: string;
  }) => (
    <div className="space-y-4">
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-6 flex flex-col items-center gap-3">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
          Solicita\u00e7\u00e3o enviada com sucesso!
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Sua solicita\u00e7\u00e3o est\u00e1 sendo processada. Voc\u00ea receber\u00e1 uma
          confirma\u00e7\u00e3o em breve.
        </p>
        {txId && (
          <div className="w-full space-y-1">
            <Label className="text-xs text-muted-foreground">
              ID da Transa\u00e7\u00e3o
            </Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={txId}
                className="text-xs font-mono truncate"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(txId);
                  toast.success("ID copiado!");
                }}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onReset}
      >
        {resetLabel}
      </Button>
    </div>
  );

  // ── Render ──

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sacar</DialogTitle>
          <DialogDescription>
            Escolha o m\u00e9todo de saque que preferir.
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
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : pixResult ? (
              <SuccessView
                txId={pixTxId}
                onReset={() => {
                  setPixResult(false);
                  setPixTxId("");
                }}
                resetLabel="Novo saque PIX"
              />
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="pix-withdraw-amount">
                    Valor do saque (R$)
                  </Label>
                  <Input
                    id="pix-withdraw-amount"
                    type="number"
                    placeholder="0,00"
                    min={0}
                    step={0.01}
                    value={pixAmount}
                    onChange={(e) => setPixAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pix-withdraw-key">Chave PIX</Label>
                  <Input
                    id="pix-withdraw-key"
                    type="text"
                    placeholder="E-mail, telefone, CPF ou chave aleat\u00f3ria"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Insira sua chave PIX (e-mail, telefone, CPF/CNPJ ou chave
                    aleat\u00f3ria)
                  </p>
                </div>

                <Button
                  onClick={handlePixWithdraw}
                  className="w-full"
                  disabled={pixLoading || !pixAmount || !pixKey}
                >
                  {pixLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Saque"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ═══════════ SEPA Tab ═══════════ */}
          <TabsContent value="sepa" className="space-y-4 pt-2">
            {sepaLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : sepaResult ? (
              <SuccessView
                txId={sepaTxId}
                onReset={() => {
                  setSepaResult(false);
                  setSepaTxId("");
                }}
                resetLabel="Novo saque SEPA"
              />
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="sepa-withdraw-amount">
                    Valor do saque (&euro;)
                  </Label>
                  <Input
                    id="sepa-withdraw-amount"
                    type="number"
                    placeholder="0,00"
                    min={0}
                    step={0.01}
                    value={sepaAmount}
                    onChange={(e) => setSepaAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sepa-withdraw-iban">IBAN de destino</Label>
                  <Input
                    id="sepa-withdraw-iban"
                    type="text"
                    placeholder="PT50 1234 5678 9012 3456 7890 12"
                    value={sepaIban}
                    onChange={(e) => setSepaIban(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Insira o IBAN da conta banc\u00e1ria de destino
                  </p>
                </div>

                <Button
                  onClick={handleSepaWithdraw}
                  className="w-full"
                  disabled={sepaLoading || !sepaAmount || !sepaIban}
                >
                  {sepaLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Saque"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ═══════════ Crypto Tab ═══════════ */}
          <TabsContent value="crypto" className="space-y-4 pt-2">
            {cryptoLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : cryptoResult ? (
              <SuccessView
                txId={cryptoTxId}
                onReset={() => {
                  setCryptoResult(false);
                  setCryptoTxId("");
                }}
                resetLabel="Novo saque crypto"
              />
            ) : (
              <div className="space-y-4">
                {/* Crypto selector */}
                <div className="space-y-2">
                  <Label>Criptomoeda</Label>
                  <Select
                    value={cryptoCurrency}
                    onValueChange={(val) => {
                      setCryptoCurrency(val);
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
                          htmlFor={`w-${net.value}`}
                          className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 has-[input:checked]:border-emerald-500/50 has-[input:checked]:bg-emerald-500/5"
                        >
                          <RadioGroupItem value={net.value} id={`w-${net.value}`} />
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

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="crypto-withdraw-amount">Quantidade</Label>
                  <Input
                    id="crypto-withdraw-amount"
                    type="number"
                    placeholder="0.00000000"
                    min={0}
                    step="0.00000001"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(e.target.value)}
                  />
                </div>

                {/* Wallet address */}
                <div className="space-y-2">
                  <Label htmlFor="crypto-withdraw-address">
                    Endere\u00e7o da carteira
                  </Label>
                  <Input
                    id="crypto-withdraw-address"
                    type="text"
                    placeholder="0x..."
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                {/* Network warning */}
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <AlertTitle className="text-amber-600 dark:text-amber-400">
                    Aten\u00e7\u00e3o
                  </AlertTitle>
                  <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                    Verifique a rede e o endere\u00e7o de destino com cuidado. O
                    envio para uma rede ou endere\u00e7o incorreto pode resultar
                    em perda permanente dos fundos.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleCryptoWithdraw}
                  className="w-full"
                  disabled={
                    cryptoLoading ||
                    !cryptoCurrency ||
                    !cryptoAmount ||
                    !cryptoAddress ||
                    (cryptoCurrency === "USDT" && !usdtNetwork)
                  }
                >
                  {cryptoLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Saque"
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
