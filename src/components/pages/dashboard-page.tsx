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
  ArrowDownUp,
  Receipt,
} from "lucide-react";
import { api, Transaction, BalanceData } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { DepositModal } from "@/components/deposit/deposit-modal";
import { useNavigation } from "@/stores/navigation-store";

// Formatting helpers
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

const statusVariant = (s: string) =>
  s === "completed" ? "default" : s === "pending" ? "secondary" : "destructive";

const statusLabel = (s: string) =>
  ({ completed: "Concluído", pending: "Pendente", failed: "Falhou", rejected: "Rejeitado" })[s] || s;

const amountForDisplay = (tx: Transaction) => {
  const abs = Math.abs(tx.amount);
  if (tx.currency === "BRL") return formatBRL(abs);
  if (tx.currency === "EUR") return formatEUR(abs);
  if (tx.currency === "USDT") return `${formatCrypto(abs)} USDT`;
  if (tx.currency === "BTC") return `${formatCrypto(abs)} BTC`;
  return abs.toString();
};

export function DashboardPage() {
  const [balance, setBalance] = useState<BalanceData>({ BRL: 0, EUR: 0, USDT: 0, BTC: 0 });
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const { navigate } = useNavigation();
  const { user } = useAuth();

  // Fetch balance
  useEffect(() => {
    api
      .getBalance()
      .then((res) => setBalance(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setBalanceLoading(false));
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    api
      .getTransactions({ limit: 5 })
      .then((res) => setTransactions(res.data))
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
      label: "Enviar",
      onClick: () => {},
      disabled: true,
    },
    {
      icon: Receipt,
      label: "Receber",
      onClick: () => {},
      disabled: true,
    },
    {
      icon: ArrowDownUp,
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {tx.description}
                      </TableCell>
                      <TableCell
                        className={`text-right text-sm font-semibold ${
                          tx.amount >= 0
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {tx.amount >= 0 ? "+" : ""}
                        {amountForDisplay(tx)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={statusVariant(tx.status)}>
                          {statusLabel(tx.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
    </div>
  );
}
