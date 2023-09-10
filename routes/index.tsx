import Counter from "../islands/CounterCard.tsx";
import { getGlobalStatistics, setGlobalStatistics } from "../shared/db.ts";
import { useSignal } from "@preact/signals";

const currentGlobalCount = getGlobalStatistics();

export default function Home() {
  // to clear some confusion here:
  // count is the publicly visible count
  // localCount is the count that is used internally to update the global count
  const count = useSignal(0);
  const localCount = useSignal(0);
  const hasClicked = useSignal(false);
  const globalCount = useSignal(!currentGlobalCount ? currentGlobalCount : 0);
  return (
    <div class="px-4 py-8 mx-auto bg-[#9d88d3]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
        <Counter
          count={count}
          localCount={localCount}
          globalCount={globalCount}
          hasClicked={hasClicked}
        />
      </div>
    </div>
  );
}
