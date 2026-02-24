import https from "node:https";

interface CachedToken {
  token: string;
  expiresAt: number;
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
};

class BoltTokenManager {
  private cache?: CachedToken;
  private refreshPromise?: Promise<string>;
  private lastFailAt = 0;

  async getToken(force = false): Promise<string> {
    const now = Date.now();

    if (!force && this.cache && now < this.cache.expiresAt - 60_000) {
      return this.cache.token;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.fetchWithRetry().finally(() => {
        this.refreshPromise = undefined;
      });
    }

    return this.refreshPromise;
  }

  getHealth() {
    return {
      hasToken: !!this.cache?.token,
      expiresInSec: this.cache
        ? Math.max(0, Math.floor((this.cache.expiresAt - Date.now()) / 1000))
        : 0
    };
  }

  async fetchWithAuth(url: string, init?: RequestInit) {
    const token = await this.getToken();
    return fetch(url, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  }

  private async fetchWithRetry(): Promise<string> {
    const delays = [0, 500, 1500];

    for (const d of delays) {
      if (d) await new Promise(r => setTimeout(r, d));
      try {
        return await this.fetchToken();
      } catch {}
    }

    throw new Error("Bolt token fetch failed");
  }

  private async fetchToken(): Promise<string> {
    const clientId = process.env.BOLT_CLIENT_ID?.trim();
    const secret = process.env.BOLT_CLIENT_SECRET?.trim();

    if (!clientId || !secret) {
      throw new Error("Missing Bolt credentials");
    }

    const body =
      `grant_type=client_credentials` +
      `&scope=fleet-integration:api` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&client_secret=${encodeURIComponent(secret)}`;

    const res = await this.httpPost(
      "https://oidc.bolt.eu/token",
      body
    );

    if (res.status !== 200) {
      console.error("BOLT TOKEN ERROR", res.status, res.body);
      throw new Error("Bolt token fetch failed");
    }

    const json = JSON.parse(res.body) as TokenResponse;

    this.cache = {
      token: json.access_token,
      expiresAt: Date.now() + json.expires_in * 1000
    };

    return json.access_token;
  }

  private httpPost(url: string, body: string): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(body)
          }
        },
        res => {
          let data = "";
          res.on("data", d => (data += d));
          res.on("end", () =>
            resolve({ status: res.statusCode || 500, body: data })
          );
        }
      );

      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }
}

declare global {
  var boltTokenManager: BoltTokenManager | undefined;
}

export const boltTokenManager =
  global.boltTokenManager || (global.boltTokenManager = new BoltTokenManager());