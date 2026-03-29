"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Receipt,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Transaction } from "@/lib/api";
import { toast } from "sonner";

// ─── Formatting helpers ────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Extracts the base currency from values like "USDTTRC20", "BTCTRC20", "BRL", etc. */
const extractCurrency = (raw: string): string => {
  const known = ["USDT", "BTC", "ETH", "LTC", "XMR"];
  for (const c of known) {
    if (raw.startsWith(c)) {
      const network = raw.slice(c.length);
      return network ? `${c} ${network}` : c;
    }
  }
  return raw;
};

/** Extract just the base ticker for formatting (e.g. "USDTTRC20" → "USDT") */
const baseCurrency = (raw: string): string => {
  const known = ["USDT", "BTC", "ETH", "LTC", "XMR"];
  for (const c of known) {
    if (raw.startsWith(c)) return c;
  }
  return raw;
};

const formatFiat = (v: number, code: string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: code }).format(
    v
  );

const formatCrypto = (v: number, code: string) =>
  `${v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  })} ${code}`;

const formatAmount = (amount: number, rawCurrency: string) => {
  const code = baseCurrency(rawCurrency);
  if (code === "BRL") return formatFiat(amount, "BRL");
  if (code === "EUR") return formatFiat(amount, "EUR");
  return formatCrypto(amount, code);
};

// ─── Label maps ────────────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  deposit: "Depósito",
  withdrawal: "Saque",
  swap: "Swap",
};

const methodLabels: Record<string, string> = {
  crypto: "Crypto",
  fiat: "Fiat",
};

const statusLabels: Record<string, string> = {
  completed: "Concluído",
  pending: "Pendente",
  failed: "Falhou",
};

const statusStyles: Record<string, string> = {
  completed:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  pending:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25",
};

// ─── Component ─────────────────────────────────────────────────────

export function TransactionsPage() {
  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params: { limit?: number; type?: string; currency?: string } = {
      limit: 100,
    };

    if (typeFilter !== "all") {
      params.type = typeFilter;
    }
    if (currencyFilter !== "all") {
      params.currency = currencyFilter;
    }

    try {
      const res = await api.getTransactions(params);
      setTransactions(res.data.transactions);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar transações.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, currencyFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Summary metrics calculated from all completed transactions
  const metrics = useMemo(() => {
    let deposits = 0;
    let withdrawals = 0;
    let swaps = 0;

    for (const tx of transactions) {
      if (tx.status !== "completed") continue;
      const amount = parseFloat(tx.amount_from);
      if (isNaN(amount)) continue;

      if (tx.type === "deposit") deposits += amount;
      else if (tx.type === "withdrawal") withdrawals += amount;
      else if (tx.type === "swap") swaps += amount;
    }

    return { deposits, withdrawals, swaps };
  }, [transactions]);

  // Client-side search filter on id / type / method / currency
  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q) ||
        tx.currency_from.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  // Format metric cards – group by currency
  const formatMetricBreakdown = (
    transactions: Transaction[],
    txType: string
  ): string => {
    const byCurrency: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.type !== txType || tx.status !== "completed") continue;
      const amount = parseFloat(tx.amount_from);
      if (isNaN(amount)) continue;

      const code = baseCurrency(tx.currency_from);
      byCurrency[code] = (byCurrency[code] || 0) + amount;
    }

    const entries = Object.entries(byCurrency).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return "R$ 0,00";

    return entries
      .map(([code, val]) => {
        if (code === "BRL") return formatFiat(val, "BRL");
        if (code === "EUR") return formatFiat(val, "EUR");
        return formatCrypto(val, code);
      })
      .join("  ·  ");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Extrato Analítico
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Painel de análise de movimentações e histórico de transações
        </p>
      </div>

      {/* ─── Summary Metric Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas Acumuladas */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Entradas Acumuladas
                </p>
                {loading ? (
                  <>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3.5 w-20 mt-1" />
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      {metrics.deposits > 0
                        ? formatMetricBreakdown(transactions, "deposit")
                        : "R$ 0,00"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Depósitos concluídos
                    </p>
                  </>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500/40" />
        </Card>

        {/* Saídas */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Saídas
                </p>
                {loading ? (
                  <>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3.5 w-20 mt-1" />
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400 truncate">
                      {metrics.withdrawals > 0
                        ? formatMetricBreakdown(transactions, "withdrawal")
                        : "R$ 0,00"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Saques concluídos
                    </p>
                  </>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-red-500/40" />
        </Card>

        {/* Volume de Swap */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Volume de Swap
                </p>
                {loading ? (
                  <>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3.5 w-20 mt-1" />
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-violet-600 dark:text-violet-400 truncate">
                      {metrics.swaps > 0
                        ? formatMetricBreakdown(transactions, "swap")
                        : "R$ 0,00"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Swaps concluídos
                    </p>
                  </>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <ArrowLeftRight className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-violet-500/40" />
        </Card>
      </div>

      {/* ─── Filter Bar ─────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Type filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[170px] h-9 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="deposit">Depósito</SelectItem>
                <SelectItem value="withdrawal">Saque</SelectItem>
                <SelectItem value="swap">Swap</SelectItem>
              </SelectContent>
            </Select>

            {/* Currency filter */}
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-9 text-sm">
                <SelectValue placeholder="Moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="LTC">LTC</SelectItem>
                <SelectItem value="XMR">XMR</SelectItem>
              </SelectContent>
            </Select>

            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, tipo, método ou moeda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Transaction Table ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Histórico de Transações
            </CardTitle>
            {!loading && (
              <span className="text-xs text-muted-foreground">
                {filtered.length}{" "}
                {filtered.length === 1 ? "registro" : "registros"}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            /* ── Skeleton state ────────────────────────────────── */
            <div className="max-h-96 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Moeda</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-24 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filtered.length === 0 ? (
            /* ── Empty state ───────────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              {error ? (
                <>
                  <RotateCcw className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm font-medium">
                    Erro ao carregar transações
                  </p>
                  <p className="text-xs mt-1 opacity-70">{error}</p>
                  <button
                    onClick={fetchTransactions}
                    className="mt-4 text-xs underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    Tentar novamente
                  </button>
                </>
              ) : (
                <>
                  <Receipt className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm font-medium">
                    Nenhuma transação encontrada
                  </p>
                  <p className="text-xs mt-1 opacity-70">
                    Ajuste os filtros ou realize uma transação
                  </p>
                </>
              )}
            </div>
          ) : (
            /* ── Data table ────────────────────────────────────── */
            <div className="max-h-96 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Moeda</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx) => {
                    const amount = parseFloat(tx.amount_from);
                    const isDeposit = tx.type === "deposit";
                    const isWithdrawal = tx.type === "withdrawal";

                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.type === "deposit" && (
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                            {tx.type === "withdrawal" && (
                              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                            )}
                            {tx.type === "swap" && (
                              <ArrowLeftRight className="h-3.5 w-3.5 text-violet-500" />
                            )}
                            <span className="text-sm font-medium">
                              {typeLabels[tx.type] || tx.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs font-normal">
                            {methodLabels[tx.method] || tx.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {extractCurrency(tx.currency_from)}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold whitespace-nowrap ${
                            isDeposit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isWithdrawal
                                ? "text-red-600 dark:text-red-400"
                                : "text-foreground"
                          }`}
                        >
                          {isDeposit ? "+" : isWithdrawal ? "−" : ""}
                          {formatAmount(
                            Math.abs(isNaN(amount) ? 0 : amount),
                            tx.currency_from
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusStyles[tx.status] || ""}`}
                          >
                            {statusLabels[tx.status] || tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
