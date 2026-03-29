"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Wallet,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Receipt,
  History,
} from "lucide-react";
import { api, Transaction, BalanceData } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { DepositModal } from "@/components/deposit/deposit-modal";
import { WithdrawModal } from "@/components/withdraw/withdraw-modal";
import { useNavigation } from "@/stores/navigation-store";

// ─── Formatting helpers ────────────────────────────────────────────────

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatEUR = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

const formatCrypto = (v: number) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Status helpers ────────────────────────────────────────────────────

const statusVariant = (s: string) => {
  if (s === "completed") return "default";
  if (s === "pending") return "secondary";
  if (s === "failed" || s === "rejected") return "destructive";
  return "outline";
};

const statusLabel = (s: string) => {
  const labels: Record<string, string> = {
    completed: "Concluído",
    pending: "Pendente",
    failed: "Falhou",
    rejected: "Rejeitado",
    processing: "Processando",
  };
  return labels[s] || s;
};

// ─── Transaction type / method labels ──────────────────────────────────

const typeLabel = (t: string) => {
  const labels: Record<string, string> = {
    deposit: "Depósito",
    withdrawal: "Saque",
    swap: "Conversão",
    transfer: "Transferência",
  };
  return labels[t] || t;
};

const methodLabel = (m: string) => {
  const labels: Record<string, string> = {
    pix: "PIX",
    sepa: "SEPA",
    usdttrc20: "USDT TRC-20",
    usdtbep20: "USDT BEP-20",
    usdterc20: "USDT ERC-20",
    crypto: "Cripto",
    bank_transfer: "Transferência Bancária",
  };
  return labels[m.toLowerCase()] || m;
};

const amountForDisplay = (tx: Transaction) => {
  const amount = parseFloat(tx.amount_from) || 0;
  const abs = Math.abs(amount);
  const currency = tx.currency_from;

  if (currency === "BRL") return formatBRL(abs);
  if (currency === "EUR") return formatEUR(abs);
  return `${formatCrypto(abs)} ${currency}`;
};

const typeIcon = (t: string) => {
  if (t === "deposit") return ArrowDownToLine;
  if (t === "withdrawal") return ArrowUpFromLine;
  if (t === "swap") return ArrowLeftRight;
  return Receipt;
};

const isPositive = (t: string) => t === "deposit";

// ─── Component ─────────────────────────────────────────────────────────

export function DashboardPage() {
  const [balance, setBalance] = useState<BalanceData>({
    BRL: 0,
    EUR: 0,
    USDT: 0,
    BTC: 0,
  });
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { navigate } = useNavigation();
  const { user } = useAuth();

  // Fetch balance
  useEffect(() => {
    api
      .getBalance()
      .then((res) => {
        if (res.balances) {
          setBalance(res.balances);
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setBalanceLoading(false));
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    api
      .getTransactions({ limit: 5 })
      .then((res) => {
        if (res.data?.transactions) {
          setTransactions(res.data.transactions);
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setTxLoading(false));
  }, []);

  const quickActions = [
    {
      icon: ArrowDownToLine,
      label: "Depositar",
      onClick: () => setDepositOpen(true),
      disabled: false,
    },
    {
      icon: ArrowUpFromLine,
      label: "Sacar",
      onClick: () => setWithdrawOpen(true),
      disabled: false,
    },
    {
      icon: ArrowLeftRight,
      label: "Exchange",
      onClick: () => navigate("exchange"),
      disabled: false,
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome */}
      {user && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Olá, {user.name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            Aqui está o resumo da sua carteira
          </p>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fiat Balance Card */}
        <Card className="border-l-2 border-l-emerald-500 hover:shadow-md transition-shadow py-4">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-5 text-emerald-500" />
              Saldo Fiduciário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="space-y-1">
                {balanceLoading ? (
                  <>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-5 w-24 mt-2" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatBRL(balance.BRL)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatEUR(balance.EUR)}
                    </p>
                  </>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDepositOpen(true)}
              >
                Depositar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Crypto Balance Card */}
        <Card className="border-l-2 border-l-purple-500 hover:shadow-md transition-shadow py-4">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="size-5 text-purple-500" />
              NeXWallet Crypto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="space-y-1">
                {balanceLoading ? (
                  <>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-5 w-24 mt-2" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatCrypto(balance.USDT)} USDT
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCrypto(balance.BTC)} BTC
                    </p>
                  </>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDepositOpen(true)}
              >
                Depositar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-md transition-shadow"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <action.icon className="size-5 text-muted-foreground" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="hover:shadow-md transition-shadow py-4">
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Transações Recentes</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => navigate("transactions")}
          >
            <History className="size-3.5 mr-1" />
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => {
                    const positive = isPositive(tx.type);
                    const Icon = typeIcon(tx.type);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="size-3.5 text-muted-foreground shrink-0" />
                            <span>
                              {typeLabel(tx.type)}
                              {tx.method && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  · {methodLabel(tx.method)}
                                </span>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm font-semibold ${
                            positive
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {positive ? "+" : "-"}
                          {amountForDisplay(tx)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={statusVariant(tx.status)}>
                            {statusLabel(tx.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
      {/* Withdraw Modal */}
      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </div>
  );
}
