const kv = await Deno.openKv();

export async function getGlobalStatistics() {
  const res = await kv.get<bigint>(["global-statistics"])!;
  return res.value!;
}

export async function setGlobalStatistics(value: number) {
  const pv = await getGlobalStatistics();
  const converted = BigInt(value);
  await kv.set(["global-statistics"], pv + converted);
}
