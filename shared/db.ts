const kv = await Deno.openKv();

export async function getGlobalStatistics() {
  const res = await kv.get<number>(["global-statistics"]) ?? 0;
  return res.value ?? 0;
}

export async function setGlobalStatistics(value: number) {
  const pv = await getGlobalStatistics();
  await kv.set(["global-statistics"], pv + value);
}
