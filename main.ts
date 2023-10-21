/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { Manifest, start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twindv1.ts";
import twindConfig from "./twind.config.ts";
import { freshSEOPlugin } from "https://deno.land/x/fresh_seo@1.0.1/mod.ts";

await start(manifest as unknown as Manifest, { plugins: [twindPlugin(twindConfig), freshSEOPlugin(manifest)] });
