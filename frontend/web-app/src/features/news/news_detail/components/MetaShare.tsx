import type { IArticles } from "../../../../interfaces/IArticles";

export default function MetaShare({
  data,
  minRead,
}: {
  data: IArticles;
  minRead: number;
}) {
  return (
    <div className="mb-5 flex flex-wrap justify-between items-center gap-3 text-[16px] text-gray-500 font-semibold">
      {/* {data.createdAt && <span>{formatDate(data.createdAt)}</span>} */}
      <span>• {minRead} min read</span>
      <div className="ml-0 inline-flex items-center gap-2 text-black">
        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-1 py-1 hover:bg-gray-50"
            title="Open source"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 28 28"
              width="28"
              height="28"
              fill="none"
            >
              <path
                fill="currentColor"
                d="M9.855 12.732 6.62 15.97a3.826 3.826 0 0 0 5.411 5.41l3.236-3.236 1.06 1.062-3.235 3.235a5.327 5.327 0 0 1-7.534-7.532l3.237-3.236zm7.552-1.079-5.753 5.753-1.06-1.06 5.752-5.753zm-2.499-6.095a5.327 5.327 0 0 1 7.532 7.534l-3.235 3.236-1.062-1.061 3.237-3.236a3.826 3.826 0 0 0-5.411-5.411l-3.237 3.235-1.06-1.06z"
              ></path>
            </svg>
          </a>
        )}
        <button
          className="rounded-lg border px-1 py-1 hover:bg-gray-50"
          title="Share X"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 28 28"
            width="28"
            height="28"
            fill="none"
          >
            <path
              fill="currentColor"
              d="M14.865 11.428 20.483 5h1.994l-6.724 7.69L23 23h-6.347l-4.42-6.287L6.738 23H4.746l6.6-7.55L4 5h6.348zM6.888 6.5l10.544 15h2.68L9.568 6.5z"
            ></path>
          </svg>
        </button>
        <button
          className="rounded-lg border px-1 py-1 hover:bg-gray-50"
          title="Share Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 28 28"
            width="28"
            height="28"
          >
            <path
              fill="currentColor"
              d="M15 23.95a10 10 0 1 0-3-.15V17H9.5v-3H12v-2.2c0-2.5 1.5-3.9 3.78-3.9 1.09 0 2.22.2 2.22.2v2.46h-1.25c-1.24 0-1.75.77-1.75 1.56V14h3l-.55 3H15v6.95z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
