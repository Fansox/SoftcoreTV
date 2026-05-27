import { env } from "@/lib/config/env";
import { boltTokenManager } from "@/lib/services/boltTokenManager";
import type { BoltFleetOrder } from "@/lib/finance/types";

interface BoltOrdersResponse {
  code: number;
  message: string;
  data?: {
    company_id: number;
    company_name: string;
    total_orders: number;
    orders: BoltFleetOrder[];
  };
}

const endpoint = `${env.boltFleetApiBaseUrl}/fleetIntegration/v1/getFleetOrders`;

export async function fetchBoltFinanceOrders(params: {
  companyId: number;
  startTs: number;
  endTs: number;
  limit?: number;
}) {
  const limit = params.limit ?? 1000;
  let offset = 0;
  let totalOrders = Number.POSITIVE_INFINITY;
  const orders: BoltFleetOrder[] = [];
  let companyName: string | undefined;

  while (offset < totalOrders) {
    const res = await boltTokenManager.fetchWithAuth(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        company_id: params.companyId,
        offset,
        limit,
        start_ts: params.startTs,
        end_ts: params.endTs,
        time_range_filter_type: "PRICE_REVIEW"
      })
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Bolt finance orders failed (${res.status}): ${body.slice(0, 500)}`);
    }

    const json = (await res.json()) as BoltOrdersResponse;
    if (json.code !== 0 || !json.data) {
      throw new Error(`Bolt finance orders returned ${json.code}: ${json.message}`);
    }

    companyName = json.data.company_name;
    totalOrders = json.data.total_orders;
    orders.push(...json.data.orders);

    if (json.data.orders.length === 0) break;
    offset += json.data.orders.length;
  }

  return {
    companyId: String(params.companyId),
    companyName,
    totalOrders: Number.isFinite(totalOrders) ? totalOrders : orders.length,
    orders
  };
}
