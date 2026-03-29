"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Copy,
  Check,
  Link2,
  ExternalLink,
  Trash2,
  Loader2,
  CircleDollarSign,
} from "lucide-react";
import { api } from "@/lib/api";
import type { CheckoutListItem } from "@/lib/api";
import { useNavigation } from "@/stores/navigation-store";

const CHECKOUT_BASE_URL = "https://app.nexpay.digital/c";

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);

export function PaymentLinksPage() {
  const { openCheckout } = useNavigation();

  const [links, setLinks] = useState<CheckoutListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCurrency, setFormCurrency] = useState<"BRL" | "EUR">("BRL");
  const [formAmount, setFormAmount] = useState("");

  const resetForm = useCallback(() => {
    setFormTitle("");
    setFormDescription("");
    setFormCurrency("BRL");
    setFormAmount("");
  }, []);

  const loadLinks = useCallback(() => {
    setLoading(true);
    api
      .listCheckoutLinks()
      .then((res) => setLinks(res.data))
      .catch(() => toast.error("Erro ao carregar links de pagamento."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formAmount || parseFloat(formAmount) <= 0) return;

    setCreating(true);
    try {
      const res = await api.createCheckoutLink({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        amount: parseFloat(formAmount),
        currency: formCurrency,
      });

      // Prepend the new link to the list using the response data
      const newLink: CheckoutListItem = {
        id: res.checkout_id,
        title: formTitle.trim(),
        amount: parseFloat(formAmount),
        status: "active",
      };
      setLinks((prev) => [newLink, ...prev]);

      setDialogOpen(false);
      resetForm();
      toast.success("Link de pagamento criado com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar link de pagamento.";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyUrl = (id: string) => {
    const url = `${CHECKOUT_BASE_URL}/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      toast.success("URL copiada para a área de transferência!");
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
    toast.success("Link removido com sucesso.");
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      active: {
        label: "Ativo",
        className:
          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10",
      },
      expired: {
        label: "Expirado",
        className:
          "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10",
      },
      paid: {
        label: "Pago",
        className:
          "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/10",
      },
      cancelled: {
        label: "Cancelado",
        className:
          "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/10",
      },
    };
    const entry = map[status] ?? { label: status, className: "" };
    return (
      <Badge variant="secondary" className={entry.className}>
        {entry.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Link2 className="h-5 w-5 text-emerald-500" />
              Links de Pagamento
            </CardTitle>
            <CardDescription>
              Crie e gerencie links de pagamento para receber de seus clientes
            </CardDescription>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Link de Pagamento
          </Button>
        </CardHeader>
      </Card>

      {/* Links Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 bg-card z-10">
                  <TableHead>Link</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : links.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <CircleDollarSign className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">
                          Nenhum link de pagamento encontrado
                        </p>
                        <p className="text-xs">
                          Clique em &quot;Criar Link de Pagamento&quot; para começar a receber
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  links.map((link) => (
                    <TableRow key={link.id}>
                      {/* Link column: title + id */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{link.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {link.id}
                          </p>
                        </div>
                      </TableCell>

                      {/* Valor */}
                      <TableCell className="font-medium">
                        {formatCurrency(link.amount, "BRL")}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(link.status)}</TableCell>

                      {/* URL preview */}
                      <TableCell>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {CHECKOUT_BASE_URL}/{link.id}
                        </code>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(link.id)}
                            className="h-8 gap-1.5 text-xs"
                          >
                            {copiedId === link.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            {copiedId === link.id ? "Copiado" : "Copiar URL"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openCheckout(link.id)}
                            title="Visualizar checkout"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => handleDelete(link.id)}
                            title="Excluir link"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Payment Link Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              Criar Link de Pagamento
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para gerar um novo link de pagamento para
              seus clientes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="link-title">Título</Label>
              <Input
                id="link-title"
                placeholder="Ex: Plano Mensal Premium"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Description (optional) */}
            <div className="space-y-2">
              <Label htmlFor="link-description">
                Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="link-description"
                placeholder="Descreva o produto ou serviço"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Currency + Amount row */}
            <div className="flex gap-4">
              <div className="space-y-2 w-[140px] shrink-0">
                <Label>Moeda</Label>
                <Select
                  value={formCurrency}
                  onValueChange={(v) => setFormCurrency(v as "BRL" | "EUR")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL — Real</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="link-amount">Valor</Label>
                <Input
                  id="link-amount"
                  type="number"
                  placeholder="0,00"
                  min="0.01"
                  step="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formTitle.trim() || !formAmount || parseFloat(formAmount) <= 0 || creating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
