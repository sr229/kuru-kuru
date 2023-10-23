const kv = await Deno.openKv();

export async function getGlobalStatistics() {
  const res = await kv.get<bigint>(["global-statistics"])!;
  return res.value!;
}

export async function setGlobalStatistics(value: bigint) {
  const pv = await getGlobalStatistics();
  await kv.set(["global-statistics"], pv + value);
}
