/// <reference lib="deno.unstable" />
const kv = await Deno.openKv();

export async function getGlobalStatistics() {
  const res = await kv.get<number>(["global-statistics"])!;
  return res.value ?? 0;
}

export async function setGlobalStatistics(value: number) {
  const pv = await getGlobalStatistics();
  const newValue = pv + value;
  // clamp to MAX_SAFE_INTEGER to prevent overflow
  await kv.set(["global-statistics"], Math.min(newValue, Number.MAX_SAFE_INTEGER));
}
