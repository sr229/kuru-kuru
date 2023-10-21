import { CSS, render } from "$gfm";

export default function MarkdownContent({ mdData }: { mdData: string }) {
  return (
    <div class="flex mx-auto flex-col px-4 py-8 aspect-auto bg-white rounded items-center z-20">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        class="markdown-body"
        dangerouslySetInnerHTML={{ __html: render(mdData) }}
      >
      </div>
    </div>
  );
}
