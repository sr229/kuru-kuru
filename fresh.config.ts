import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { sessionPlugin } from "fresh-session";
import { getSessionKey, setSessionKey } from "./shared/db.ts";

const key = await getSessionKey() ?? await setSessionKey();

export default defineConfig({
  plugins: [
    tailwind(),
    sessionPlugin({
      encryptionKey: key!,
      expireAfterSeconds: 60 * 60 * 1,
      sessionCookieName: "kuru-kuru"
    }),
  ],
});
