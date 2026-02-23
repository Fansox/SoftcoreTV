import { EventEmitter } from "events";
import { dashboardState } from "@/server/store/state";

class DashboardEvents extends EventEmitter {
  interval?: NodeJS.Timeout;

  start() {
    if (this.interval) return;
    this.interval = setInterval(async () => {
      const payload = await dashboardState.refresh();
      this.emit("dashboard", payload);
    }, 30_000);
  }
}

export const dashboardEvents = new DashboardEvents();
