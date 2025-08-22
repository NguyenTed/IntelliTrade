export default function RightInfo({ tags }: { tags: string[] }) {
  return (
    <aside className="lg:col-span-4 xl:col-span-3 text-[#0F0F0F]">
      {tags.length ? (
        <div className="rounded-lg ">
          <div className="flex flex-wrap gap-4 justify-start">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-0.5 rounded bg-gray-100  text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
