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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Globe,
  AlertTriangle,
  Webhook,
  Shield,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import type { ApiKey, Webhook } from "@/lib/api";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const maskKey = (key: string) => key.slice(0, 12) + "****" + key.slice(-4);

export function DevelopersPage() {
  // API Keys state
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [generating, setGenerating] = useState(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(true);
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

  // Load webhooks on mount
  useEffect(() => {
    api
      .getWebhooks()
      .then((res) => setWebhooks(res.data))
      .catch(() => toast.error("Erro ao carregar webhooks"))
      .finally(() => setWebhooksLoading(false));
  }, []);

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

  const handleDeleteKey = async (id: string) => {
    try {
      await api.deleteApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("Chave revogada!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao revogar chave");
    }
  };

  const handleSaveWebhook = async () => {
    if (!newWebhookUrl.trim()) return;
    setSaving(true);
    try {
      const res = await api.configWebhook(newWebhookUrl.trim());
      setWebhooks((prev) => [...prev, res.data]);
      setNewWebhookUrl("");
      toast.success("Webhook configurado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao configurar webhook");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await api.deleteWebhook(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toast.success("Webhook removido!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover webhook");
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
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Último uso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keysLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <>
                      {keys.map((apiKey) => (
                        <TableRow key={apiKey.id}>
                          <TableCell className="font-medium">
                            {apiKey.name}
                          </TableCell>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {maskKey(apiKey.key)}
                            </code>
                          </TableCell>
                          <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                          <TableCell>
                            {apiKey.lastUsed
                              ? formatDate(apiKey.lastUsed)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyKey(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteKey(apiKey.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {keys.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-muted-foreground py-8"
                          >
                            Nenhuma chave de API encontrada
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

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Adicionar Webhook
              </CardTitle>
              <CardDescription>
                Configure endpoints para receber notificações de eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="https://seu-app.com/webhooks/nexwallet"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveWebhook()}
                  disabled={saving}
                />
                <Button onClick={handleSaveWebhook} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {webhooksLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-9" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                {webhooks.map((webhook) => (
                  <Card key={webhook.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {webhook.url}
                            </code>
                            <Badge
                              variant={webhook.active ? "default" : "secondary"}
                              className={
                                webhook.active
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : ""
                              }
                            >
                              {webhook.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Criado em {formatDate(webhook.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={webhook.active}
                            onCheckedChange={() =>
                              handleToggleWebhook(webhook.id)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {webhooks.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhum webhook configurado
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Key Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Nova Chave de API
            </DialogTitle>
            <DialogDescription>
              Guarde esta chave! Ela não será exibida novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Guarde esta chave! Ela não será exibida novamente.
              </span>
            </div>
            <div className="space-y-2">
              <Label>Sua Chave de API</Label>
              <div className="flex gap-2">
                <Input value={newKey} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyKey(newKey)}
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
