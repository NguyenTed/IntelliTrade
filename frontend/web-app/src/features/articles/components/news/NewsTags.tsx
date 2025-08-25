export default function NewsTags({ tags }: { tags: string[] }) {
  return (
    <div>
      {tags?.length && (
        <div className="mt-10 flex flex-wrap gap-2">
          {(tags ?? []).map((t) => (
            <span
              key={`tag-${t}`}
              className="rounded-lg bg-gray-100 px-3 py-1 text-[14px]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
