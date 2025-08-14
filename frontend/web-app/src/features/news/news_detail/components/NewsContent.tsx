import { useMemo } from "react";

export default function NewsContent({ content }: { content: string[] }) {
  const textContent = useMemo(
    () => (content && content.length ? content.join("\n\n") : ""),
    [content]
  );
  return (
    <article className="lg:col-span-8 font-bold">
      {
        <div className="prose max-w-none whitespace-pre-line leading-7">
          {textContent}
        </div>
      }
    </article>
  );
}
