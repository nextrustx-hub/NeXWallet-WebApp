"use client";

import React, { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AppFooter } from "./app-footer";
import { TradingViewTicker } from "./ticker";
import { SupportButton } from "@/components/support-button";
import { useNavigation } from "@/stores/navigation-store";
import { DashboardPage } from "@/components/pages/dashboard-page";
import { TransactionsPage } from "@/components/pages/transactions-page";
import { ExchangePage } from "@/components/pages/exchange-page";
import { PaymentLinksPage } from "@/components/pages/payment-links-page";
import { DevelopersPage } from "@/components/pages/developers-page";
import { SecurityPage } from "@/components/pages/security-page";
import { CheckoutPage } from "@/components/pages/checkout-page";

// Force Next.js to detect this module
void TradingViewTicker;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    </div>
  );
}

function PageRouter() {
  const { currentPage } = useNavigation();

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    transactions: <TransactionsPage />,
    exchange: <ExchangePage />,
    "payment-links": <PaymentLinksPage />,
    developers: <DevelopersPage />,
    security: <SecurityPage />,
    checkout: <CheckoutPage />,
  };

  return (
    <div className="animate-fade-in" key={currentPage}>
      {pages[currentPage] ?? <DashboardPage />}
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-0">
        <AppHeader />
        <TradingViewTicker />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Suspense fallback={<PageLoader />}>
            <PageRouter />
          </Suspense>
        </main>
        <AppFooter />
      </SidebarInset>
      <SupportButton />
    </SidebarProvider>
  );
}
