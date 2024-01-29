#!/usr/bin/env -S deno run --unstable-broadcast-channel --unstable-kv -A --watch=static/,routes/

import dev from "$fresh/dev.ts";

await dev(import.meta.url, "./main.ts");