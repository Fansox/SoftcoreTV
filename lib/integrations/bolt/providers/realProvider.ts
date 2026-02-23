import type { BoltAdapter } from "@/lib/integrations/bolt/adapter";
import { boltTokenManager } from "@/lib/services/boltTokenManager";

// TODO: map actual Bolt Fleet endpoints once partner schema is provided.
export class RealBoltProvider implements BoltAdapter {
  async fetchCities() {
    await boltTokenManager.getToken();
    return [];
  }
  async fetchCitySummary() {
    await boltTokenManager.getToken();
    throw new Error("TODO: map fetchCitySummary endpoint");
  }
  async fetchCityDrivers() {
    await boltTokenManager.getToken();
    throw new Error("TODO: map fetchCityDrivers endpoint");
  }
  async fetchDriverDetail() {
    await boltTokenManager.getToken();
    throw new Error("TODO: map fetchDriverDetail endpoint");
  }
  async fetchLiveStatuses() {
    await boltTokenManager.getToken();
    throw new Error("TODO: map fetchLiveStatuses endpoint");
  }
  async fetchRevenueSeries() {
    await boltTokenManager.getToken();
    throw new Error("TODO: map fetchRevenueSeries endpoint");
  }
}
