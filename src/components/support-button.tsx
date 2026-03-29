"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Phone,
  AtSign,
  Headphones,
  ExternalLink,
  Copy,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

const supportChannels = [
  {
    label: "WhatsApp (USA)",
    value: "+1 (584) 666-5195",
    href: "https://wa.me/15846665195",
    icon: Phone,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    label: "Telegram",
    value: "@NeXTrustX_Support",
    href: "https://t.me/NeXTrustX_Support",
    icon: MessageCircle,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10 hover:bg-sky-500/20",
  },
  {
    label: "Discord",
    value: "discord.gg/gTABQcgZeY",
    href: "https://discord.gg/gTABQcgZeY",
    icon: Headphones,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20",
  },
  {
    label: "E-mail",
    value: "support@nextrustx.com",
    href: "mailto:support@nextrustx.com",
    icon: AtSign,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
  },
];

export function SupportButton() {
  const [open, setopen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copiado!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <>
      {/* Floating FAB Button */}
      <button
        onClick={() => setopen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
        aria-label="Suporte"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Support Dialog */}
      <Dialog open={open} onOpenChange={setopen}>
        <DialogContent className="max-w-sm p-0 gap-0">
          {/* Header */}
          <div className="bg-primary/5 border-b px-6 py-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-lg">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Headphones className="h-4 w-4" />
                </div>
                Suporte NeXWallet
              </DialogTitle>
              <DialogDescription className="text-sm mt-1.5">
                Escolha o canal preferido para falar connosco. Estamos disponíveis 24/7.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Channels */}
          <div className="px-4 py-4 space-y-2">
            {supportChannels.map((channel, idx) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${channel.bgColor} border border-transparent hover:border-border`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${channel.bgColor}`}
                >
                  <channel.icon className={`h-5 w-5 ${channel.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{channel.label}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">
                    {channel.value}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCopy(channel.value, idx);
                    }}
                  >
                    {copiedIdx === idx ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-3">
            <p className="text-[11px] text-muted-foreground text-center">
              Tempo médio de resposta:{" "}
              <span className="font-medium text-foreground">~5 minutos</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
