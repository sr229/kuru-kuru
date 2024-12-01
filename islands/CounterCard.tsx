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
  const limit = globalThis.window.innerWidth + 500;
  clearInterval(id);

  id = setInterval(() => {
    if (pos >= limit) {
      clearInterval(id);
      mascotEl.remove();
    } else {
      pos += Math.floor(globalThis.window.innerWidth / reversalSpeed);
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
  const [socketState, setSocketState] = useState(0);
  const ipc = new BroadcastChannel("counter-ipc");

  function handleClick(e: MouseEvent) {
    animateMascot();
    
    const lastEvt = e.timeStamp;
    const now = Date.now();

    // an average clicks per second for a human is 6.5 clicks per second (CPS) but can go up to 10 CPS.
    // ignore if its more than 10 CPS
    if (now - lastEvt < 100) {
      console.warn("Possible automation detected. Not counting.");
      return;
    }

    setInternalCount(internalCount + 1);
    setCount(count + 1);

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
  }

  const onClick = (e: MouseEvent) => {
    switch (socketState) {
      case 1:
        handleClick(e);
        break;
      default:
        console.warn(
          "WARN: Attempted to interact while the socket is not ready!",
        );
        reconnect();
        break;
    }
  };

  const reconnect = () => {
    console.log("Attempting to reconnect...");
    let delay = 1000; // start with 1 second
    const maxDelay = 60000; // maximum delay of 60 seconds

    const attemptReconnect = () => {
      let ws = new WebSocket(globalThis.window.location.href.replace("http", "ws"));
      handleWSEvents(ws);

      ws.onopen = () => {
        console.log("Reconnected successfully.");
        delay = 1000; // reset delay on successful connection
      };

      ws.onerror = () => {
        console.warn(`Reconnect attempt failed. Retrying in ${delay / 1000} seconds...`);
        setTimeout(attemptReconnect, delay);
        delay = Math.min(delay * 2, maxDelay); // double the delay, but do not exceed maxDelay
      };
    };

    attemptReconnect();
  };

  const handleWSEvents = (ws: WebSocket) => {
    const heartbeatFunc = (_fn: number) => {
      if (ws.readyState === 1) ws.send((0x0).toString());
      // do nothing because you can do nothing
      else return;
    };

    const tmFunc = () => {
      console.warn("Server is down, reconnecting...");
      ws.close();
      reconnect();
    };

    let heartbeat = setInterval(() => heartbeatFunc(heartbeat), 15000);
    let tm = setTimeout(tmFunc, 30000);

    ws.onopen = () => {
      console.log(
        `[${new Date().toISOString()}] Connected to statistics socket`,
      );
      setSocketState(1);
      ws.send((0x0).toString());
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
      setSocketState(3);
      console.warn(
        `[${new Date().toISOString()}] Disconnected from statistics socket.`,
      );
      reconnect();
    };

    ws.onerror = (e) => {
      setSocketState(3);
      console.error(`[${new Date().toISOString()}] Socket Errored. ${e.type}`);
      reconnect();
    };
  };

  useEffect(() => {
    let ws = new WebSocket(
      globalThis.window.location.href.replace("http", "ws"),
    );
    setSocketState(1);

    handleWSEvents(ws);

    ipc.addEventListener("message", (e) => {
      // don't send anything if data is negative or NaN or larger than MAX_SAFE_INTEGER
      if (e.data < 0 || Number.isNaN(e.data) || e.data >= Number.MAX_SAFE_INTEGER) {
        console.warn("Unsafe data received. Ignoring.");
      } else {
        ws!.send(JSON.stringify({ data: e.data }));
      }
    });

    const onlineHandler = () => {
      console.log("Client detected online, resuming connection.");
      ws = new WebSocket(globalThis.window.location.href.replace("http", "ws"));
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
        {socketState === 1
          ? <Button id="ctr-btn" onClick={onClick}>Squish that kuru~</Button>
          : <p class="px-6 pt-4 pb-2 text-gray-100">Please wait...</p>}
      </div>
      <div class="px-6 pt-4 pb-2 text-white">
        <p>
          Everyone has squished the kuru {globalCount.toLocaleString()} times!
        </p>
      </div>
    </div>
  );
}
