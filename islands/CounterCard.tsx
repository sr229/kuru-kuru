import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { useEffect, useState } from "preact/hooks";
import axios from "axios-web";

interface SharedProps {
  hasClicked: Signal<boolean>;
  globalCount: number;
}

/**
 * Scrolls the mascot from right to left relative to the viewport
 */
export function animateMascot() {
  // create a new element to animate
  let id = 0;
  const mascotId = Math.floor(Math.random() * 2) + 1;
  const scrollSpeed = Math.floor(Math.random() * 30) + 20;
  const reversalSpeed = 100 - Math.floor(scrollSpeed);
  const counterButton = document.getElementById("ctr-btn") as HTMLElement;
  const mascotEl = document.createElement("img");
  const parentEl = document.getElementById("mascot-tgt") as HTMLElement;

  mascotEl.src = `/assets/img/hertaa${mascotId}.gif`;
  mascotEl.style.position = "absolute";
  mascotEl.style.right = "-500px";
  mascotEl.style.top = counterButton.getClientRects()[0].bottom + scrollY -
    430 + "px";
  mascotEl.classList.add("z-[-1]");
  parentEl.appendChild(mascotEl);

  let pos = -500;
  const limit = window.innerWidth + 500;
  clearInterval(id);

  id = setInterval(() => {
    if (pos >= limit) {
      clearInterval(id);
      mascotEl.remove();
    } else {
      pos += Math.floor(window.innerWidth / reversalSpeed);
      mascotEl.style.right = pos + "px";
    }
  }, 12);
}

export default function Counter(props: SharedProps) {
  const [count, setCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(props.globalCount ?? 0);
  const [internalCount, setInternalCount] = useState(0);
  const [timer, setTimer] = useState(0);

  const onClick = () => {
    setInternalCount(internalCount + 1);
    setCount(count + 1);
    animateMascot();

    clearTimeout(timer);
    setTimer(setTimeout(() => {
      console.info(
        `[${new Date()}] Updating global count: ${internalCount + 1}`,
      );
      axios.post(
        window.location.href,
        JSON.stringify({ data: internalCount + 1 }),
      );

      setInternalCount(0);
    }, 5000));
  };

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
    <div class="max-w-sm text-center rounded overflow-hidden z-10">
      <div class="px-6 py-4">
        <p class="text-3xl text-white">{count}</p>
        <p class="text-gray-700 text-gray-100">Times the kuru was squished~</p>
      </div>
      <div class="px-6 pt-4 pb-2">
        <Button id="ctr-btn" onClick={onClick}>Squish that kuru~</Button>
      </div>
      <div class="px-6 pt-4 pb-2 text-white">
        <p>
          Everyone has squished the kuru {globalCount} times!
        </p>
      </div>
    </div>
  );
}
