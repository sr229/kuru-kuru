// deno-lint-ignore-file
import { CSS, render } from "$gfm";
import { JSX } from "preact/jsx-runtime";

export default function MarkdownContent(
  { mdData }: { mdData: string },
  props: JSX.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      {...props}
      class="flex mx-auto flex-col px-4 py-8 aspect-auto bg-white rounded items-center z-20"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        class="markdown-body"
        dangerouslySetInnerHTML={{ __html: render(mdData) }}
      >
      </div>
    </div>
  );
}
