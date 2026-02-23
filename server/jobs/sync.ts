import { dashboardState } from "@/server/store/state";
import { dashboardEvents } from "@/lib/realtime/events";
import { log } from "@/server/observability/logger";

let bootstrapped = false;

export const bootstrapSync = async () => {
  if (bootstrapped) return;
  bootstrapped = true;
  await dashboardState.refresh();
  dashboardEvents.start();
  log("info", "sync bootstrapped", { mode: "polling", intervalSec: 30 });
};
