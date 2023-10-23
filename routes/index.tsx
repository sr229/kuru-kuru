import { Handlers } from "$fresh/server.ts";
import Counter from "../islands/CounterCard.tsx";
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
    let bc = new BroadcastChannel("global-count");
    const headers = req.headers;

    // check if we're requesting wss:// or ws://, then upgrade as necessary
    if (headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.onopen = () => {
        bc = new BroadcastChannel("global-count");
        console.log(
          `[${new Date().toISOString()}] Connection opened for ${
            JSON.stringify(ctx.remoteAddr)
          }`,
        );
      };

      bc.addEventListener("message", (e) => {
        try {
          // don't send if the socket is closed
          if (socket.readyState === 1) {
            socket.send(JSON.stringify({ globalCount: e.data }));
          }
        } catch (e) {
          console.warn(`[${new Date().toISOString()}] ${e.stack}`);
        }
      });

      socket.onmessage = async (e) => {
        // client will send 0x0 as a string, send back 0x1 as a string to confirm the connection is alive
        if (e.data === (0x0).toString()) {
          socket.send((0x1).toString());
        } else {
          const reqNewCount = JSON.parse(e.data);

          // check against MAX_SAFE_INTEGER. Ignore if it's larger than that
          if (reqNewCount.data >= Number.MAX_SAFE_INTEGER && Number.isNaN(reqNewCount)) return;
          await setGlobalStatistics(reqNewCount.data);

          const newCount = await getGlobalStatistics();
          bc.postMessage(newCount.toString());
        }
      };

      socket.onclose = () => {
        bc.close();
        console.log(
          `[${new Date().toISOString()}] Connection closed for ${
            JSON.stringify(ctx.remoteAddr)
          }`,
        );
      };

      socket.onerror = (e) => {
        bc.close();
        console.error(
          `[${new Date().toISOString()}] Connection errored for ${
            JSON.stringify(ctx.remoteAddr)
          }: ${e}`,
        );
      };

      return response;
    }

    const data = await getGlobalStatistics();
    const res = await ctx.render({ globalCount: data });
    return res;
  },
  POST: async (req) => {
    const body = await req.json();
    const headers = req.headers;

    // check if useragent is a browser
    // we can use the Sec-Fetch-Mode header but it's not supported by all browsers
    if (!headers.get("sec-fetch-mode")) {
      return new Response("", {
        status: 403,
        statusText: "Forbidden",
      });
    }

    // check against MAX_SAFE_INTEGER to prevent overflow
    if (body.data >= Number.MAX_SAFE_INTEGER) {
      return new Response("", {
        status: 413,
        statusText: "Payload Too Large",
      });
    }

    // ha you thought this is an endpoint
    return new Response("", {
      status: 410,
      statusText: "💀",
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
        <div
          class="max-w-screen-md mx-auto flex flex-col items-center justify-center"
          id="mascot-tgt"
        >
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
