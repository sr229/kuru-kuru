import { Button } from "../components/Button.tsx";
import { useEffect, useState } from "preact/hooks";

interface SharedProps {
  globalCount: bigint;
  audioFiles: string[];
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
  mascotEl.style.right = "-500px";
  mascotEl.style.opacity = "60%";
  mascotEl.style.top = counterButton.getClientRects()[0].top + scrollY -
    408 + "px";
  mascotEl.classList.add("z-[0]", "absolute", "bg-scroll");
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
  const [globalCount, setGlobalCount] = useState(
    BigInt(props.globalCount ?? 0),
  );
  const [internalCount, setInternalCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const ipc = new BroadcastChannel("counterIpc");

  const THRESHOLD_CLICKS = 30; // Maximum number of clicks in an interval
  const INTERVAL_TIME_SECONDS = 60 * 0.5; // Every 30 seconds
  const [clicksInInterval, setClicksInInterval] = useState(0);
  const [intervalTime, setIntervalTime] = useState(0);

  const clickThresholdSurpassed = () => {
    return clicksInInterval >= THRESHOLD_CLICKS;
  }

  useEffect(() => {
    if (clickThresholdSurpassed()) {
      // Setup a timer
      const intervalId = setTimeout(() => {
      
        // Update interval time
        setIntervalTime(prevTime => prevTime + 1);
  
        // Reset interval if expired
        if (intervalTime >= INTERVAL_TIME_SECONDS) {
          setIntervalTime(0);
          setClicksInInterval(0);
        }
      }, 1000 * 1);

      return () => { clearInterval(intervalId) }
    }
  }, [clicksInInterval, intervalTime]);

  const onClick = () => {
    setInternalCount(internalCount + 1);
    setClicksInInterval(clicksInInterval + 1);
    setCount(count + 1);
    animateMascot();

    let audioFile =
      props.audioFiles[Math.floor(Math.random() * props.audioFiles.length)];
    let lastAudioPlayed = audioFile;
    const audio = new Audio();

    // Check if the audio file is the same as the last one played
    // If so, pick another one
    if (lastAudioPlayed === audioFile) {
      audioFile =
        props.audioFiles[Math.floor(Math.random() * props.audioFiles.length)];
      lastAudioPlayed = audioFile;
      audio.src = audioFile;
    } else {
      audio.src = audioFile;
    }

    audio.play();

    clearTimeout(timer);
    setTimer(setTimeout(() => {
      // guard against numbers that are beyond MAX_SAFE_INTEGER.
      if (internalCount === Number.MAX_SAFE_INTEGER) {
        console.warn(
          "Data too large to be submitted and represented safely. Disposing.",
        );
        setCount(0);
        setInternalCount(0);
      } else {
        ipc.postMessage(internalCount + 1);
        console.info(
          `[${new Date().toISOString()}] Updating global count: ${
            internalCount + 1
          }`,
        );
        setInternalCount(0);
      }
    }, 2048));
  };

  const handleWSEvents = (ws: WebSocket) => {
    const heartbeatFunc = (fName: number) => {
      if (ws.readyState === 1) ws.send((0x0).toString());
      // do nothing because you can do nothing
      else return;
    };

    const tmFunc = () => {
      console.warn("Server is down, reconnecting...");
      ws.close();
      ws = new WebSocket(window.location.href.replace("http", "ws"));
      handleWSEvents(ws);
    };

    let heartbeat = setInterval(() => heartbeatFunc(heartbeat), 15000);
    let tm = setTimeout(tmFunc, 30000);

    ws.onopen = () => {
      console.log(
        `[${new Date().toISOString()}] Connected to statistics socket`,
      );
      ws.send(0x0.toString());
    };

    ws.onmessage = (e) => {
      switch (e.data) {
        case (0x1).toString():
          clearTimeout(tm);
          clearInterval(heartbeat);

          heartbeat = setInterval(() => heartbeatFunc(heartbeat), 15000);
          tm = setTimeout(tmFunc, 30000);
          break;
        default: {
          const data = JSON.parse(e.data);
          setGlobalCount(BigInt(parseInt(data.globalCount)));
        }
      }
    };

    ws.onclose = () => {
      console.warn(
        `[${new Date().toISOString()}] Disconnected from statistics socket.`,
      );
    };

    ws.onerror = (e) => {
      console.error(`[${new Date().toISOString()}] Socket Errored. ${e.type}`);
    };
  };

  useEffect(() => {
    let ws = new WebSocket(window.location.href.replace("http", "ws"));

    handleWSEvents(ws);

    ipc.addEventListener("message", (e) => {
      ws.send(JSON.stringify({data: e.data}));
    });

    const onlineHandler = () => {
      console.log("Client detected online, resuming connection.");
      ws = new WebSocket(window.location.href.replace("http", "ws"));
      handleWSEvents(ws);
    };

    const offlineHandler = () => {
      console.warn("Client detected offline!");
      ws!.close();
    };

    globalThis.window.addEventListener("online", onlineHandler);
    globalThis.window.addEventListener("offline", offlineHandler);
    globalThis.window.addEventListener("beforeunload", () => {
      ws!.close();
    });

    return () => {
      globalThis.window.removeEventListener("online", onlineHandler);
      globalThis.window.removeEventListener("offline", offlineHandler);
      handleWSEvents(ws!);
      ws!.close();
    };
  }, []);

  return (
    <div class="max-w-sm text-center rounded overflow-hidden z-10">
      <div class="px-6 py-4">
        <p class="text-3xl text-white">{count.toLocaleString()}</p>
        <p class="text-gray-100">Times the kuru was squished~</p>
      </div>
      <div class="px-6 pt-4 pb-2">
        {!clickThresholdSurpassed() && <Button id="ctr-btn" onClick={onClick}>Squish that kuru~</Button>}
        {clickThresholdSurpassed() && <p class="text-red-600 font-bold">Too many squishes! Wait until {INTERVAL_TIME_SECONDS - intervalTime} seconds.</p>}
      </div>
      <div class="px-6 pt-4 pb-2 text-white">
        <p>
          Everyone has squished the kuru {globalCount.toLocaleString()} times!
        </p>
      </div>
    </div>
  );
}
