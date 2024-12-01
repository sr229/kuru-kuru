import { Handlers } from "$fresh/server.ts";
import Counter from "../islands/CounterCard.tsx";
import { getGlobalStatistics, setGlobalStatistics } from "../shared/db.ts";
import MarkdownContent from "../components/MarkdownContent.tsx";
import { useTranslation } from "react-i18next";

const kuruAudio: { [key: string]: string[] } = {
  en: [],
  ja: [],
};

const mdData = {
  en: await Deno.readTextFile("home_content/en.md"),
  ja: await Deno.readTextFile("home_content/ja.md"),
};

for (const lang of Object.keys(kuruAudio)) {
  for (const f of Deno.readDirSync(`static/assets/audio/${lang}/`)) {
    if (f.isDirectory) continue;
    kuruAudio[lang].push(`/assets/audio/${lang}/${f.name}`);
  }
}

export const handler: Handlers = {
  GET: async (req, ctx) => {
    let bc = new BroadcastChannel("global-count");
    const headers = req.headers;

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
          if (socket.readyState === 1) {
            socket.send(JSON.stringify({ globalCount: e.data }));
          }
        } catch (e: any) {
          console.warn(`[${new Date().toISOString()}] ${e.stack}`);
        }
      });

      socket.onmessage = async (e) => {
        if (e.data === (0x0).toString()) {
          socket.send((0x1).toString());
        } else {
          const reqNewCount = JSON.parse(e.data);

          if (reqNewCount.data >= Number.MAX_SAFE_INTEGER && Number.isNaN(reqNewCount)) {
            console.warn(`[${new Date().toISOString()}] Unsafe data received from ${ctx.remoteAddr}. Ignoring.`);
          }
          if (reqNewCount.data < 0) {
            console.warn(`[${new Date().toISOString()}] Negative data received from ${ctx.remoteAddr}. Is this an attack?`);
          } 

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

    if (!headers.get("sec-fetch-mode")) {
      return new Response("", {
        status: 403,
        statusText: "Forbidden",
      });
    }

    if (body.data >= Number.MAX_SAFE_INTEGER) {
      return new Response("", {
        status: 413,
        statusText: "Payload Too Large",
      });
    }

    return new Response("", {
      status: 410,
      statusText: "Gone.",
    });
  },
};

export default function Home(
  { data: { globalCount } }: { data: { globalCount: bigint } },
) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div>
      <div class="px-4 py-8 mx-auto bg-[#9d88d3]">
        <div
          class="max-w-screen-md mx-auto flex flex-col items-center justify-center"
          id="mascot-tgt"
        >
          <img class="z-10" src="/favicon.png" width="60px" />
          <h1 class="text-4xl text-white text-center font-bold z-10">
            {t('welcome')}
          </h1>
          <p class="my-4 font-bold text-center text-white z-10">
            {t('description')}
          </p>
          <Counter
            globalCount={globalCount}
            audioFiles={kuruAudio[lang]}
          />
        </div>
        <MarkdownContent mdData={mdData[lang]} />
      </div>
    </div>
  );
}
