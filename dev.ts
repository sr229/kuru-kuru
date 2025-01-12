#!/usr/bin/env -S deno run -A --unstable-broadcast-channel --unstable-kv --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "jsr:@std/dotenv/load";

await dev(import.meta.url, "./main.ts", config);
