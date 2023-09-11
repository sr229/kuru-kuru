import { Handlers } from "$fresh/server.ts";
import Counter from "../islands/CounterCard.tsx";
import { getGlobalStatistics, setGlobalStatistics } from "../shared/db.ts";
import { useSignal } from "@preact/signals";

export const handler: Handlers = {
  GET: async (req, ctx) => {
    const accept = req.headers.get("accept");

    if (accept?.includes("text/event-stream")) {
      const bc = new BroadcastChannel("global-count");
      const body = new ReadableStream({
        start(controller) {
          bc.addEventListener("message", () => {
            try {
              controller.enqueue(new TextEncoder().encode(getGlobalStatistics().toString()));
            } catch (e) {
              console.error(`[${new Date()}] Error while getting global statistics: ${e}`);
            }
          });
          console.log(`[${new Date()}] Opened statistics stream for ${JSON.stringify(ctx.remoteAddr)}`);
        },
        cancel() {
          bc.close();
          console.log(`[${new Date()}] Closed statistics stream for ${JSON.stringify(ctx.remoteAddr)}`);
        }
      });
      return new Response(body, {
        headers: {
          "Content-Type": "text/event-stream",
        },
      });
    }

    const res = await ctx.render(getGlobalStatistics());
    return res;
  },
  POST: async (req, ctx) => {
    const body = await req.json();
    setGlobalStatistics(body.data);

    const bc = new BroadcastChannel("global-count");
    bc.postMessage(new TextEncoder().encode(getGlobalStatistics().toString()))

    return new Response("", {
      status: 200,
      statusText: "OK"
    })
  }
}

export default function Home() {
  const hasClicked = useSignal(false);
  const globalCount = useSignal(!getGlobalStatistics() && isNaN(getGlobalStatistics()) ? getGlobalStatistics() : 0);
  return (
    <div class="px-4 py-8 mx-auto bg-[#9d88d3]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
        <Counter
        globalCount={globalCount}
        hasClicked={hasClicked}/>
      </div>
    </div>
  );
}
