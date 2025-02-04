/// <reference lib="deno.unstable" />
import { crypto } from "@std/crypto";
import logger from "./logger.ts";

const kv = await Deno.openKv();

export async function getGlobalStatistics() {
  const res = await kv.get<number>(["global-statistics"])!;
  return res.value!;
}

export async function setGlobalStatistics(value: number) {
  const pv = await getGlobalStatistics();
  await kv.set(["global-statistics"], pv + value);
}

export async function setSessionKey() {
  if (Deno.env.get("HERTA_SESSION_KEY")) {
    return Deno.env.get("HERTA_SESSION_KEY");
  }

  // get the session key randomly using deno's @std/crypto library
  const key = crypto.randomUUID();

  // store this key for safekeeping so we don't have to redo this
  try {
    await kv.set(["sessionkey"], key);
    return key;
  } catch (e) {
    logger.error(`Error setting session key: ${e}`);
    return null;
  }
}

export async function getSessionKey() {
  if (Deno.env.get("HERTA_SESSION_KEY")) {
    return Deno.env.get("HERTA_SESSION_KEY");
  } else {
    try {
      return (await kv.get<string>(["sessionkey"])).value!;
    } catch {
      throw new Error("No session key found! This should never happen.");
    }
  }
}
