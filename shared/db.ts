const kv = await Deno.openKv();

export function getGlobalStatistics(): number {
  let res = 0;
  kv.get<number>(["global-statistics"]).then(v => {
    res = v.value as number;
  });

  return res;
}

export function setGlobalStatistics(value: number) {
  const pv = getGlobalStatistics();
  kv.set(["global-statistics"], pv + value).then(() => {
    return;
  })
}
