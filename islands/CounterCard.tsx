import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";

interface SharedProps {
  count: Signal<number>;
  localCount: Signal<number>;
  globalCount: Signal<number>;
  hasClicked: Signal<boolean>;
}

export default function Counter(props: SharedProps) {
  const onClick = () => {
    props.count.value += 1;
    props.localCount.value += 1;
    props.hasClicked.value = true;

    // set a timer to update the global count, resetting
    // whenever a user activity is detected
    let timer: number;
    timer = setTimeout(async () => {
      // TODO: add the upload code here
    }, 5000);

    window.onclick = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // Upload code goes here
      }, 5000);
    }
  }
  return (
    <div class="max-w-sm text-center rounded overflow-hidden">
      <div class="px-6 py-4">
        <p class="text-3xl">{props.count}</p>
        <p class="text-gray-700 text-base">Times clicked</p>
      </div>
      <div class="px-6 pt-4 pb-2">
        <Button onClick={onClick}>Squish that button</Button>
      </div>
      <div class="px-6 pt-4 pb-2">
        <p>Everyone has clicked the button {props.globalCount} times!</p>
      </div>
    </div>
  );
}
