"use client";

import { Separator } from "@/components/ui/separator";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm mt-auto">
      <div className="px-4 md:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            © {currentYear}{" "}
            <a
              href="https://www.nextrustx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              NeXTrustX
            </a>{" "}
            — Todos os direitos reservados
          </p>

          <div className="flex items-center gap-3">
            <a
              href="https://www.nextrustx.com/termos-e-condicoes"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Termos e Condições
            </a>
            <Separator orientation="vertical" className="h-3" />
            <a
              href="https://www.nextrustx.com/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
