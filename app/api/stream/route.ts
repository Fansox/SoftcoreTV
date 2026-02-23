import { dashboardEvents } from "@/lib/realtime/events";
import { bootstrapSync } from "@/server/jobs/sync";

export async function GET() {
  await bootstrapSync();
  const stream = new ReadableStream({
    start(controller) {
      const handler = (payload: unknown) => {
        controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
      };
      dashboardEvents.on("dashboard", handler);
      controller.enqueue(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);
      return () => dashboardEvents.off("dashboard", handler);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache"
    }
  });
}
