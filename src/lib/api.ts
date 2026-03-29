import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// ─── Types ───────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface BalanceData {
  BRL: number;
  EUR: number;
  USDT: number;
  BTC: number;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "swap" | "payment_received" | "checkout_payment";
  currency: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "rejected";
  createdAt: string;
  description?: string;
}

export interface DepositFiatResponse {
  paymentCode?: string;
  qrCodeBase64?: string;
  iban?: string;
  bankName?: string;
  bic?: string;
}

export interface DepositCryptoResponse {
  address: string;
  network: string;
  currency: string;
}

export interface SwapResponse {
  transactionId: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
}

export interface Webhook {
  id: string;
  url: string;
  active: boolean;
  createdAt: string;
}

export interface CheckoutLink {
  id: string;
  shortId: string;
  title: string;
  description: string;
  currency: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentsCount?: number;
}

export interface CheckoutDetails {
  id: string;
  shortId: string;
  title: string;
  description: string;
  currency: string;
  amount: number;
  status: string;
  paymentCode?: string;
  qrCodeBase64?: string;
  expiresAt?: string;
  merchantName?: string;
}

// ─── Token Management ────────────────────────────────────────────

const TOKEN_KEY = "nx_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return Cookies.get(TOKEN_KEY) ?? null;
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: "Lax",
    secure: window.location.protocol === "https:",
  });
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

// ─── API Class ───────────────────────────────────────────────────

class NeXWalletApi {
  private getHeaders(noAuth = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (!noAuth) {
      const token = getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    noAuth = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(noAuth),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = "Erro de conexão com o servidor.";
      try {
        const errorData = await response.json();
        // Tenta várias estruturas de erro comuns em NestJS
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData?.data?.message) {
          errorMessage = errorData.data.message;
        }
        // Status code específicos
        if (response.status === 401) {
          errorMessage = errorData?.message || "Sessão expirada. Inicie sessão novamente.";
          removeToken();
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }
      } catch {
        if (response.status === 401) {
          removeToken();
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as T;
  }

  // ─── Auth ──────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, true);
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }, true);
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request("/auth/me");
  }

  // ─── Balance ───────────────────────────────────────────────────
  async getBalance(): Promise<ApiResponse<BalanceData>> {
    return this.request("/wallet/balance");
  }

  // ─── Deposit Fiat ──────────────────────────────────────────────
  async depositFiat(amount: number, currency: "BRL" | "EUR"): Promise<ApiResponse<DepositFiatResponse>> {
    return this.request("/wallet/deposit/fiat", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
    });
  }

  // ─── Deposit Crypto ────────────────────────────────────────────
  async depositCrypto(currency: string): Promise<ApiResponse<DepositCryptoResponse>> {
    return this.request("/wallet/deposit/crypto", {
      method: "POST",
      body: JSON.stringify({ currency }),
    });
  }

  // ─── Withdraw Fiat ─────────────────────────────────────────────
  async withdrawFiat(amount: number, currency: "BRL" | "EUR", pixKey?: string, iban?: string): Promise<ApiResponse<{ transactionId: string }>> {
    return this.request("/wallet/withdraw/fiat", {
      method: "POST",
      body: JSON.stringify({ amount, currency, pix_key: pixKey, iban }),
    });
  }

  // ─── Swap / Exchange ───────────────────────────────────────────
  async swap(from: string, to: string, amount: number): Promise<ApiResponse<SwapResponse>> {
    return this.request("/wallet/swap", {
      method: "POST",
      body: JSON.stringify({ from, to, amount }),
    });
  }

  // ─── Transactions ──────────────────────────────────────────────
  async getTransactions(params?: { limit?: number; offset?: number }): Promise<ApiResponse<Transaction[]>> {
    const query = params ? `?limit=${params.limit || 50}&offset=${params.offset || 0}` : "";
    return this.request(`/wallet/transactions${query}`);
  }

  // ─── API Keys ──────────────────────────────────────────────────
  async generateApiKey(): Promise<ApiResponse<ApiKey>> {
    return this.request("/developers/keys/generate", { method: "POST" });
  }

  async getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    return this.request("/developers/keys");
  }

  async deleteApiKey(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/developers/keys/${id}`, { method: "DELETE" });
  }

  // ─── Webhooks ──────────────────────────────────────────────────
  async configWebhook(url: string): Promise<ApiResponse<Webhook>> {
    return this.request("/developers/webhooks", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    return this.request("/developers/webhooks");
  }

  async deleteWebhook(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/developers/webhooks/${id}`, { method: "DELETE" });
  }

  // ─── Checkout / Payment Links ──────────────────────────────────
  async createCheckoutLink(data: {
    title: string;
    description?: string;
    currency: "BRL" | "EUR";
    amount: number;
  }): Promise<ApiResponse<CheckoutLink>> {
    return this.request("/checkout/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listCheckoutLinks(): Promise<ApiResponse<CheckoutLink[]>> {
    return this.request("/checkout/list");
  }

  async getCheckoutDetails(id: string): Promise<ApiResponse<CheckoutDetails>> {
    return this.request(`/checkout/${id}`, {}, true);
  }
}

export const api = new NeXWalletApi();
