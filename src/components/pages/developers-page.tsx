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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Key,
  Plus,
  Copy,
  Globe,
  AlertTriangle,
  Shield,
  Loader2,
  Link2,
} from "lucide-react";
import { api } from "@/lib/api";
import type { ApiKey } from "@/lib/api";

const maskKey = (key: string) =>
  key.length > 16 ? key.slice(0, 12) + "••••" + key.slice(-4) : key.slice(0, 4) + "••••" + key.slice(-4);

interface LocalWebhook {
  webhook_url: string;
  created_at: string;
}

export function DevelopersPage() {
  // ─── API Keys State ───────────────────────────────────────
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [generating, setGenerating] = useState(false);

  // ─── Webhooks State ───────────────────────────────────────
  const [webhooks, setWebhooks] = useState<LocalWebhook[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Load API keys on mount
  useEffect(() => {
    api
      .getApiKeys()
      .then((res) => setKeys(res.data))
      .catch(() => toast.error("Erro ao carregar chaves de API"))
      .finally(() => setKeysLoading(false));
  }, []);

  // ─── API Keys Handlers ────────────────────────────────────
  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const res = await api.generateApiKey();
      setKeys((prev) => [...prev, res.data]);
      setNewKey(res.data.key);
      setDialogOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar chave");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Chave copiada!");
  };

  // ─── Webhooks Handlers ────────────────────────────────────
  const handleSaveWebhook = async () => {
    if (!newWebhookUrl.trim()) {
      toast.error("Insira uma URL válida para o webhook");
      return;
    }

    try {
      new URL(newWebhookUrl.trim());
    } catch {
      toast.error("URL inválida. Use o formato https://...");
      return;
    }

    setSaving(true);
    try {
      const res = await api.configWebhook(newWebhookUrl.trim());
      setWebhooks((prev) => [
        ...prev,
        {
          webhook_url: res.webhook_url,
          created_at: new Date().toISOString(),
        },
      ]);
      setNewWebhookUrl("");
      toast.success("Webhook configurado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao configurar webhook");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Developers
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas chaves de API e webhooks
        </p>
      </div>

      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Globe className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* ─── API Keys Tab ─────────────────────────────────── */}
        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleGenerateKey} disabled={generating}>
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Gerar Nova Chave
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chave</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keysLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <>
                      {keys.map((apiKey) => (
                        <TableRow key={apiKey.id}>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {maskKey(apiKey.key)}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                apiKey.is_active
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/15"
                              }
                            >
                              {apiKey.is_active ? "Ativa" : "Inativa"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyKey(apiKey.key)}
                                title="Copiar chave"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {keys.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground py-8"
                          >
                            <Key className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p>Nenhuma chave de API encontrada</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Webhooks Tab ─────────────────────────────────── */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Configurar Webhook
              </CardTitle>
              <CardDescription>
                Configure um endpoint para receber notificações de eventos em
                tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="https://seu-app.com/webhooks/nexwallet"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveWebhook()}
                  disabled={saving}
                  className="flex-1"
                />
                <Button onClick={handleSaveWebhook} disabled={saving} className="shrink-0">
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Salvar Webhook
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Webhooks Configurados
              </CardTitle>
              <CardDescription>
                Lista de endpoints ativos para notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webhooks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum webhook configurado</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {webhooks.map((webhook, index) => (
                      <div
                        key={`${webhook.webhook_url}-${index}`}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded truncate max-w-xs sm:max-w-md">
                              {webhook.webhook_url}
                            </code>
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              Ativo
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Configurado em{" "}
                            {new Date(webhook.created_at).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── New Key Dialog ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Nova Chave de API
            </DialogTitle>
            <DialogDescription>
              Guarde esta chave em um local seguro. Ela não será exibida
              novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Copie e guarde esta chave agora. Por segurança, ela não será
                mostrada novamente após fechar esta janela.
              </span>
            </div>
            <div className="space-y-2">
              <Label>Sua Chave de API</Label>
              <div className="flex gap-2">
                <Input
                  value={newKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyKey(newKey)}
                  title="Copiar chave"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
