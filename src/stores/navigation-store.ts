import { create } from "zustand";

export type Page =
  | "dashboard"
  | "transactions"
  | "exchange"
  | "payment-links"
  | "developers"
  | "security"
  | "checkout";

interface NavigationState {
  currentPage: Page;
  checkoutId: string | null;
  navigate: (page: Page) => void;
  openCheckout: (id: string) => void;
  goBack: () => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  currentPage: "dashboard",
  checkoutId: null,

  navigate: (page: Page) =>
    set({ currentPage: page, checkoutId: null }),

  openCheckout: (id: string) =>
    set({ currentPage: "checkout", checkoutId: id }),

  goBack: () =>
    set((state) => ({
      currentPage: state.currentPage === "checkout" ? "payment-links" : "dashboard",
      checkoutId: null,
    })),
}));
