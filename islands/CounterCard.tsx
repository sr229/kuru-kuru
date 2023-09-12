import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { useEffect, useState } from "preact/hooks";
import axios from "axios-web";

interface SharedProps {
  hasClicked: Signal<boolean>;
  globalCount: number;
}

export default function Counter(props: SharedProps) {
  const [count, setCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(props.globalCount);
  const [internalCount, setInternalCount] = useState(0);

  const onClick = () => {
    setInternalCount(internalCount + 1);
    setCount(count + 1);
  };

  useEffect(() => {
    // set a timer to update the global count, resetting
    // whenever a user activity is detected
    let timer: number;

    timer = setTimeout(() => {
      axios.post(window.location.href, JSON.stringify({ data: internalCount }));
      setInternalCount(0);
    }, 5000)

    window.onclick = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.info(
          `[${new Date()}] Updating global count: ${internalCount + 1}`,
        );
        axios.post(
          window.location.href,
          JSON.stringify({ data: internalCount + 1 }),
        );

        setInternalCount(0);
      }, 5000);
    };
  });

  useEffect(() => {
    let es = new EventSource(window.location.href);

    es.addEventListener("open", () => {
      console.log(`Connected to statistics stream`);
    });

    es.addEventListener("message", (e) => {
      console.log(` Received global count: ${e.data}`);
      const data = JSON.parse(e.data);
      setGlobalCount(parseInt(data.globalCount));
    });

    // TODO: Reconnect backoff logic could be improved
    es.addEventListener("error", () => {
      console.warn(
        `Disconnected from statistics stream, attempting to reconnect...`,
      );
      const backoff = 1000 + Math.random() * 5000;
      new Promise((resolve) => setTimeout(resolve, backoff));
      es = new EventSource(window.location.href);
    });
  }, []);

  return (
    <div class="max-w-sm text-center rounded overflow-hidden">
      <div class="px-6 py-4">
        <p class="text-3xl">{count}</p>
        <p class="text-gray-700 text-base">Times clicked</p>
      </div>
      <div class="px-6 pt-4 pb-2">
        <Button onClick={onClick}>Squish that button</Button>
      </div>
      <div class="px-6 pt-4 pb-2">
        <p>
          Everyone has clicked the button {globalCount} times!
        </p>
      </div>
    </div>
  );
}
