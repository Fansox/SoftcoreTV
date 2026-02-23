import { env } from "@/lib/config/env";
import { MockBoltProvider } from "@/lib/integrations/bolt/providers/mockProvider";
import { RealBoltProvider } from "@/lib/integrations/bolt/providers/realProvider";

export const boltAdapter = env.dataProvider === "bolt" ? new RealBoltProvider() : new MockBoltProvider();
