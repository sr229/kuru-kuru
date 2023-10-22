import { Handlers } from "$fresh/server.ts";
import Counter from "../islands/CounterCard.tsx";
import { CSS, render } from "$gfm";
import { getGlobalStatistics, setGlobalStatistics } from "../shared/db.ts";
import MarkdownContent from "../islands/MarkdownContent.tsx";

// TODO: This is hardcoded for now, but /assets/audio contains an N amount of files per language
// and we want to randomly play one of them when the mascot is squished
const kuruAudio: string[] = [];
// also hardcodeed for now
const mdData = await Deno.readTextFile("home_content/en.md");

// iterate inside ../static/assets/audio/ja/ and add all files to the array
for (const f of Deno.readDirSync("static/assets/audio/ja/")) {
  if (f.isDirectory) continue;
  // replace file paths with /assets/audio/ja/filename.mp3
  kuruAudio.push(`/assets/audio/ja/${f.name}`);
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
              const chunk = `data: ${
                JSON.stringify({ globalCount: data })
              }\n\n`;
              controller.enqueue(new TextEncoder().encode(chunk));
            } catch (e) {
              console.error(
                `[${new Date()}] Error while getting global statistics: ${e}`,
              );
            }
          });
          console.log(
            `[${new Date()}] Opened statistics stream for ${
              JSON.stringify(ctx.remoteAddr)
            }`,
          );
        },
        cancel() {
          bc.close();
          console.log(
            `[${new Date()}] Closed statistics stream for ${
              JSON.stringify(ctx.remoteAddr)
            }`,
          );
        },
      });
      return new Response(body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
        },
      });
    }
    const data = await getGlobalStatistics();
    const res = await ctx.render({ globalCount: data });
    return res;
  },
  POST: async (req, ctx) => {
    const body = await req.json();
    await setGlobalStatistics(body.data);

    const bc = new BroadcastChannel("global-count");
    bc.postMessage(new TextEncoder().encode(getGlobalStatistics().toString()));

    return new Response("", {
      status: 200,
      statusText: "OK",
    });
  },
};

export default function Home(
  { data: { globalCount } }: { data: { globalCount: bigint } },
) {
  // added a pseudo-div here so I can nest another div inside it smh
  return (
    <div>
      <div class="px-4 py-8 mx-auto bg-[#9d88d3]">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center" id="mascot-tgt">
          <img class="z-10" src="/favicon.png" width="60px" />
          <h1 class="text-4xl text-white text-center font-bold z-10">
            Welcome to herta kuru
          </h1>
          <p class="my-4 font-bold text-center text-white z-10">
            The website for Herta, the <del>annoying</del>{" "}
            cutest genius Honkai: Star Rail character out there.
          </p>
          <Counter
            globalCount={globalCount}
            audioFiles={kuruAudio}
          />
        </div>
        <MarkdownContent mdData={mdData} />
      </div>
    </div>
  );
}
