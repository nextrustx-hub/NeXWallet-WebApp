"use client";

import { useState, useEffect } from "react";
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
import {
  Plus,
  Copy,
  Check,
  Link2,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import type { CheckoutLink } from "@/lib/api";
import { useNavigation } from "@/stores/navigation-store";
import { Textarea } from "@/components/ui/textarea";

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function PaymentLinksPage() {
  const { openCheckout } = useNavigation();
  const [links, setLinks] = useState<CheckoutLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCurrency, setNewCurrency] = useState("BRL");
  const [newAmount, setNewAmount] = useState("");

  // Load checkout links on mount
  useEffect(() => {
    api
      .listCheckoutLinks()
      .then((res) => setLinks(res.data))
      .catch(() => toast.error("Erro ao carregar links de pagamento"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateLink = async () => {
    if (!newTitle.trim() || !newAmount) return;
    setCreating(true);
    try {
      const res = await api.createCheckoutLink({
        title: newTitle.trim(),
        description: newDescription.trim(),
        currency: newCurrency as "BRL" | "EUR",
        amount: parseFloat(newAmount),
      });
      setLinks((prev) => [res.data, ...prev]);
      setDialogOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewCurrency("BRL");
      setNewAmount("");
      toast.success("Link criado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar link");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (shortId: string) => {
    const url = `https://wallet.nextrustx.com/c/${shortId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shortId);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    toast.success("Link removido!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Links de Pagamento
            </CardTitle>
            <CardDescription>
              Crie e gerencie links de pagamento para seus clientes
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Link
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Moeda</TableHead>
                <TableHead>Pagamentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-14" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-14" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{link.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {link.shortId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(link.amount, link.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{link.currency}</Badge>
                      </TableCell>
                      <TableCell>{link.paymentsCount ?? 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            link.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10"
                              : ""
                          }
                        >
                          {link.status === "active" ? "Ativo" : "Expirado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(link.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyLink(link.shortId)}
                          >
                            {copiedId === link.shortId ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openCheckout(link.id)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {links.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhum link de pagamento encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Link Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Novo Link
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo link de pagamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título do Link</Label>
              <Input
                placeholder="Ex: Plano Mensal Premium"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Descreva o produto ou serviço"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label>Moeda</Label>
                <Select value={newCurrency} onValueChange={setNewCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL - Real</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <Label>Valor</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateLink}
              disabled={!newTitle.trim() || !newAmount || creating}
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
