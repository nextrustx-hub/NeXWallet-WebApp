"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Link2,
  Receipt,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Transaction } from "@/lib/api";
import { toast } from "sonner";

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
const formatCurrency = (v: number, c: string) => {
  if (c === "BRL") return formatBRL(v);
  if (c === "EUR") return formatEUR(v);
  return `${formatCrypto(v)} ${c}`;
};

const typeLabels: Record<string, string> = {
  deposit: "Depósito",
  withdrawal: "Saque",
  swap: "Swap",
  payment_received: "Pagamento Recebido",
  checkout_payment: "Checkout",
};

const statusLabels: Record<string, string> = {
  completed: "Concluído",
  pending: "Pendente",
  failed: "Falhou",
  rejected: "Rejeitado",
};

const typeIcons: Record<string, React.ReactNode> = {
  deposit: <ArrowDown className="h-4 w-4 text-emerald-500" />,
  withdrawal: <ArrowUp className="h-4 w-4 text-red-500" />,
  swap: <ArrowUpDown className="h-4 w-4 text-blue-500" />,
  payment_received: <CreditCard className="h-4 w-4 text-violet-500" />,
  checkout_payment: <Link2 className="h-4 w-4 text-amber-500" />,
};

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .getTransactions()
      .then((res) => setTransactions(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((tx) =>
    tx.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Extrato</CardTitle>
        <p className="text-sm text-muted-foreground">
          Histórico completo de transações
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search + Filter bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="max-h-[500px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Receipt className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">Nenhuma transação encontrada</p>
            <p className="text-xs mt-1 opacity-70">
              Tente ajustar os termos de busca
            </p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx) => (
                  <TableRow key={tx.id} className="animate-fade-in">
                    <TableCell className="text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {typeIcons[tx.type] || (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {typeLabels[tx.type] || tx.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {tx.currency}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        tx.amount >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {formatCurrency(Math.abs(tx.amount), tx.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          tx.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : tx.status === "pending"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        }
                      >
                        {statusLabels[tx.status] || tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                Mostrando {filtered.length} transações
              </TableCaption>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
