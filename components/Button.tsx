import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class="text-gray-300 px-2 py-1 border-[#3b0764] border-2 rounded bg-[#6b21a8] hover:bg-[#3b0764] transition-colors"
    />
  );
}
