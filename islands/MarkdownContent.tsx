import { CSS, render } from "$gfm";

export default function MarkdownContent({ mdData }: { mdData: string }) {
  return (
    <div class="px-4 py-8 aspect-square mx-8 my-8 bg-white items-center justify-center">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        class="markdown-body"
        dangerouslySetInnerHTML={{ __html: render(mdData) }}
      >
      </div>
    </div>
  );
}
