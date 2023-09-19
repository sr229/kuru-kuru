import { Handlers } from "$fresh/server.ts";
import Counter from "../islands/CounterCard.tsx";
import { getGlobalStatistics, setGlobalStatistics } from "../shared/db.ts";
import { useSignal } from "@preact/signals";

interface GlobalCountData {
  globalCount: number;
}

export const handler: Handlers = {
  GET: async (req, ctx) => {
    const accept = req.headers.get("accept");

    if (accept?.includes("text/event-stream")) {
      const bc = new BroadcastChannel("global-count");
      const body = new ReadableStream({
        start(controller) {
          bc.addEventListener("message", async () => {
            try {
              const data = await getGlobalStatistics();
              const chunk = `data: ${JSON.stringify({globalCount: data})}\n\n`;
              controller.enqueue(new TextEncoder().encode(chunk));
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
    const data = await getGlobalStatistics();
    const res = await ctx.render({globalCount: data});
    return res;
  },
  POST: async (req, ctx) => {
    const body = await req.json();
    await setGlobalStatistics(body.data);

    const bc = new BroadcastChannel("global-count");
    bc.postMessage(new TextEncoder().encode(getGlobalStatistics().toString()))

    return new Response("", {
      status: 200,
      statusText: "OK"
    })
  }
}

export default function Home({ data: { globalCount } }: { data: { globalCount: number }}) {
  const hasClicked = useSignal(false);
  return (
    <div class="px-4 py-8 mx-auto bg-[#9d88d3]" id="mascot-tgt">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl text-white font-bold">Welcome to herta kuru (v2?)</h1>
        <p class="my-4 text-white">
            The website for Herta, the <del>annoying</del> cutest genius Honkai:
            Star Rail character out there.
        </p>
        <Counter
        globalCount={globalCount}
        hasClicked={hasClicked}/>
      </div>
    </div>
  );
}
