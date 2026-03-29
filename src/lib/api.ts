import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-wallet.nextrustx.com/api/v1";

// ─── Types ───────────────────────────────────────────────────────

export type AccountTier = "WHITE" | "BLACK";

export interface RegisterWhitePayload {
  email: string;
  password: string;
  tier: "WHITE";
  name: string;
  cpf: string;
}

export interface RegisterBlackPayload {
  email: string;
  password: string;
  tier: "BLACK";
  name: string;
}

export type RegisterPayload = RegisterWhitePayload | RegisterBlackPayload;

export interface User {
  id: string;
  email: string;
  name: string;
  role: AccountTier;
  kyc_status: string;
  is_2fa_enabled: boolean;
}

export interface BalanceData {
  BRL: number;
  EUR: number;
  USDT: number;
  BTC: number;
}

export interface Transaction {
  id: string;
  type: string;
  method: string;
  currency_from: string;
  amount_from: string;
  status: string;
  created_at: string;
}

export interface DepositFiatResponse {
  type: string;
  qr_code?: string;
  copy_paste?: string;
  payment_info?: {
    iban: string;
    bic: string;
    reference: string;
  };
  transactionId: string;
}

export interface DepositCryptoResponse {
  address: string;
  currency: string;
  transactionId: string;
}

export interface DepositStatusResponse {
  status: "pending" | "completed";
}

export interface SwapResponse {
  from_amount: number;
  to_amount: number;
  fee_applied: string;
  transaction_id: string;
}

export interface ApiKey {
  id: string;
  key: string;
  is_active: boolean;
}

export interface WebhookResponse {
  webhook_url: string;
}

export interface CheckoutCreateResponse {
  checkout_id: string;
  url: string;
}

export interface CheckoutListItem {
  id: string;
  title: string;
  amount: number;
  status: string;
  [key: string]: unknown;
}

export interface CheckoutDetails {
  title: string;
  description: string;
  amount: number;
  currency: string;
  payment_info: {
    qr_code: string;
    copy_paste: string;
  };
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
        // NestJS ValidationPipe returns message as string[]
        if (Array.isArray(errorData?.message)) {
          errorMessage = errorData.message.join("\n");
        } else if (typeof errorData?.message === "string") {
          errorMessage = errorData.message;
        } else if (errorData?.error?.message) {
          if (Array.isArray(errorData.error.message)) {
            errorMessage = errorData.error.message.join("\n");
          } else {
            errorMessage = errorData.error.message;
          }
        } else if (errorData?.data?.message) {
          if (Array.isArray(errorData.data.message)) {
            errorMessage = errorData.data.message.join("\n");
          } else {
            errorMessage = errorData.data.message;
          }
        }
        // Force logout on 401
        if (response.status === 401) {
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

  /** POST /auth/register — Response: { access_token, tier } */
  async register(payload: RegisterPayload): Promise<{ access_token: string; tier: AccountTier }> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true);
  }

  /** POST /auth/login — Response: { access_token, tier } */
  async login(email: string, password: string): Promise<{ access_token: string; tier: AccountTier }> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, true);
  }

  /** GET /auth/me — Response: { success, data: { user } } */
  async getMe(): Promise<{ success: boolean; data: { user: User } }> {
    return this.request("/auth/me");
  }

  /** POST /auth/2fa/generate — Response: { success, qr_code } */
  async generate2FA(): Promise<{ success: boolean; qr_code: string }> {
    return this.request("/auth/2fa/generate", { method: "POST" });
  }

  /** POST /auth/2fa/verify — Payload: { token } — Response: { success, message } */
  async verify2FA(token: string): Promise<{ success: boolean; message: string }> {
    return this.request("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  // ─── Balance ───────────────────────────────────────────────────

  /** GET /wallet/balance — Response: { success, balances } */
  async getBalance(): Promise<{ success: boolean; balances: BalanceData }> {
    return this.request("/wallet/balance");
  }

  // ─── Deposit Fiat ──────────────────────────────────────────────

  /** POST /wallet/deposit/fiat — Response: { success, type, qr_code?, copy_paste?, payment_info?, transactionId } */
  async depositFiat(amount: number, currency: "BRL" | "EUR"): Promise<DepositFiatResponse & { success: boolean }> {
    return this.request("/wallet/deposit/fiat", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
    });
  }

  // ─── Deposit Crypto ────────────────────────────────────────────

  /** POST /wallet/deposit/crypto — Payload: { currency: "USDTTRC20" } */
  async depositCrypto(currency: string): Promise<DepositCryptoResponse & { success: boolean }> {
    return this.request("/wallet/deposit/crypto", {
      method: "POST",
      body: JSON.stringify({ currency }),
    });
  }

  /** GET /wallet/deposit/status/:id */
  async getDepositStatus(id: string): Promise<{ success: boolean; data: DepositStatusResponse }> {
    return this.request(`/wallet/deposit/status/${id}`);
  }

  // ─── Withdraw Fiat ─────────────────────────────────────────────

  /** POST /wallet/withdraw/fiat */
  async withdrawFiat(
    amount: number,
    currency: "BRL" | "EUR",
    pixKey?: string,
    iban?: string
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    return this.request("/wallet/withdraw/fiat", {
      method: "POST",
      body: JSON.stringify({
        amount,
        currency,
        ...(currency === "BRL" ? { pix_key: pixKey } : {}),
        ...(currency === "EUR" ? { iban } : {}),
      }),
    });
  }

  // ─── Withdraw Crypto ──────────────────────────────────────────

  /** POST /wallet/withdraw/crypto */
  async withdrawCrypto(
    amount: number,
    currency: string,
    address: string
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    return this.request("/wallet/withdraw/crypto", {
      method: "POST",
      body: JSON.stringify({ amount, currency, address }),
    });
  }

  // ─── Swap / Exchange ───────────────────────────────────────────

  /** POST /wallet/swap */
  async swap(from: string, to: string, amount: number): Promise<{ success: boolean } & SwapResponse> {
    return this.request("/wallet/swap", {
      method: "POST",
      body: JSON.stringify({ from, to, amount }),
    });
  }

  // ─── Transactions ──────────────────────────────────────────────

  /** GET /transactions — Query: ?limit=50&type=deposit&currency=USDT */
  async getTransactions(params?: {
    limit?: number;
    type?: string;
    currency?: string;
  }): Promise<{ success: boolean; data: { transactions: Transaction[] } }> {
    const queryParts: string[] = [];
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    if (params?.type) queryParts.push(`type=${params.type}`);
    if (params?.currency) queryParts.push(`currency=${params.currency}`);
    const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    return this.request(`/transactions${query}`);
  }

  // ─── API Keys (B2B) ────────────────────────────────────────────

  /** POST /b2b/api-keys/generate */
  async generateApiKey(): Promise<{ success: boolean; data: ApiKey }> {
    return this.request("/b2b/api-keys/generate", { method: "POST" });
  }

  /** GET /b2b/api-keys */
  async getApiKeys(): Promise<{ success: boolean; data: ApiKey[] }> {
    return this.request("/b2b/api-keys");
  }

  // ─── Webhooks (B2B) ───────────────────────────────────────────

  /** POST /b2b/webhooks/config */
  async configWebhook(webhook_url: string): Promise<WebhookResponse & { success: boolean }> {
    return this.request("/b2b/webhooks/config", {
      method: "POST",
      body: JSON.stringify({ webhook_url }),
    });
  }

  // ─── Checkout / Payment Links ──────────────────────────────────

  /** POST /checkout/create */
  async createCheckoutLink(data: {
    title: string;
    description?: string;
    amount: number;
    currency: "BRL" | "EUR";
  }): Promise<{ success: boolean } & CheckoutCreateResponse> {
    return this.request("/checkout/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /** GET /checkout/list */
  async listCheckoutLinks(): Promise<{ success: boolean; data: CheckoutListItem[] }> {
    return this.request("/checkout/list");
  }

  /** GET /checkout/:id — PUBLIC (no auth) */
  async getCheckoutDetails(id: string): Promise<{ success: boolean; data: CheckoutDetails }> {
    return this.request(`/checkout/${id}`, {}, true);
  }
}

export const api = new NeXWalletApi();
