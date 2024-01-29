#!/usr/bin/env -S deno run -A --unstable-broadcast-channel --unstable-kv --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";

await dev(import.meta.url, "./main.ts", config);
