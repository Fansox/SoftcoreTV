import { env } from "@/lib/config/env";

interface CachedToken {
  token: string;
  expiresAt: number;
}

export class BoltTokenManager {
  private cache?: CachedToken;
  private refreshPromise?: Promise<string>;

  async getToken(forceRefresh = false): Promise<string> {
    const now = Date.now();
    if (!forceRefresh && this.cache && now < this.cache.expiresAt - 90000) return this.cache.token;
    if (!this.refreshPromise) {
      this.refreshPromise = this.fetchToken().finally(() => {
        this.refreshPromise = undefined;
      });
    }
    return this.refreshPromise;
  }

  async fetchWithAuth(url: string, init?: RequestInit, retry = true): Promise<Response> {
    const token = await this.getToken();
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 && retry) {
      const refreshed = await this.getToken(true);
      return fetch(url, {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${refreshed}`
        }
      });
    }

    return res;
  }

  getHealth() {
    return {
      hasToken: Boolean(this.cache?.token),
      expiresInSec: this.cache ? Math.max(0, Math.floor((this.cache.expiresAt - Date.now()) / 1000)) : 0
    };
  }

  private async fetchToken(): Promise<string> {
    if (!env.boltClientId || !env.boltClientSecret) throw new Error("Bolt credentials not configured");

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "fleet-integration:api",
      client_id: env.boltClientId,
      client_secret: env.boltClientSecret
    });

    const res = await fetch(env.boltTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!res.ok) throw new Error(`Token fetch failed (${res.status})`);
    const json = (await res.json()) as { access_token: string; expires_in: number };
    this.cache = {
      token: json.access_token,
      expiresAt: Date.now() + json.expires_in * 1000
    };
    return json.access_token;
  }
}

export const boltTokenManager = new BoltTokenManager();
