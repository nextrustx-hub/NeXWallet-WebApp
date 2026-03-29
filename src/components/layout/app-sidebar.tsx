"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Link2,
  Code2,
  Shield,
  LogOut,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { useNavigation, type Page } from "@/stores/navigation-store";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { page: "transactions", label: "Extrato", icon: Receipt },
  { page: "exchange", label: "Exchange", icon: ArrowLeftRight },
  { page: "payment-links", label: "Links de Pagamento", icon: Link2 },
  { page: "developers", label: "Developers (API)", icon: Code2 },
  { page: "security", label: "Segurança", icon: Shield },
];

export function AppSidebar() {
  const { currentPage, navigate } = useNavigation();
  const { user, logout } = useAuth();

  const handleNav = (page: Page) => {
    navigate(page);
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3 overflow-hidden">
        <div className="flex items-center gap-2.5 px-2 py-1.5 min-w-0">
          <img
            src="/logo.png"
            alt="NeXWallet"
            className="h-8 w-8 rounded-lg object-contain shrink-0"
          />
          <div className="group-data-[collapsible=icon]:hidden flex flex-col min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight truncate">
              NeXWallet
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 tracking-wider uppercase truncate">
              by NeXTrustX
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      onClick={() => handleNav(item.page)}
                      className={cn(
                        "cursor-pointer transition-all duration-150",
                        isActive &&
                          "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-2" />
        <div className="flex items-center gap-2 px-2 py-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2) ?? "US"}
            </AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden flex flex-1 flex-col min-w-0">
            <span className="text-xs font-medium text-sidebar-foreground truncate">
              {user?.name ?? "Utilizador"}
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 truncate">
              {user?.email ?? "user@nexwallet.com"}
            </span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
