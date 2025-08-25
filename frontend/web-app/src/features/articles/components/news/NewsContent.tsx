export default function NewsContent({ contentHtml }: { contentHtml: string }) {
  // Sửa className / classname => class
  const correctedHtml = contentHtml
    .replace(/className=/g, "class=")
    .replace(/classname=/g, "class=");

  return (
    <article className="prose prose-neutral text-[20px] max-w-none prose-p:leading-relaxed prose-h2:mt-8 prose-h3:mt-6">
      <style>{`
        /* Ẩn biểu tượng symbol container */
        [class^="symbolsContainer-"] {
          display: none !important;
        }

        /* Container có thể chứa biểu tượng */
        [class^="container-"] {
          display: flex;
          gap: 10px;
        }

        /* Thẻ pair chứa 2 ảnh */
        [class^="pair-"] {
          position: relative;
          display: inline-block;
          width: 2rem;
          height: 2rem;
        }

        [class^="pair-"] img {
          border-radius: 9999px; /* tròn */
          object-fit: cover;
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid white;
        }

        /* Hình thứ nhất nằm góc trên phải */
        [class^="pair-"] img:first-child {
          position: absolute;
          top: -2px;
          right: -2px;
          z-index: 1;
          margin: 0;
        }

        [class^="pair-"] img:last-child {
          position: absolute;
          bottom: 0;
          left: 0;
          z-index: 2;
          margin: 0;
        }
        [class^="logo-"]{
          border-radius: 9999px;
          object-fit: cover;
          width: 20px;
          height: 20px;
          margin: 0;
        }
        a[class*="symbolTag-"] {
          display: inline-flex;
          align-items: center;
          background-color: #f3f4f6; 
          border-radius: 9999px;     
          padding: 0.25rem 0.5rem; 
          text-decoration: none;
          translate: translateY(100px);
          gap: 4px;
          font-size: 16px;
          font-weight: normal;
        }
        a[class*="symbolTag-"]:has(.pair-ocURKVwI) {
          transform: translateY(10px);
        }
      `}</style>

      {correctedHtml ? (
        <div
          className="prose max-w-none text-[20px] text-black"
          dangerouslySetInnerHTML={{ __html: correctedHtml }}
        />
      ) : (
        <div className="prose max-w-none text-[20px] text-black">
          <p>No content available</p>
        </div>
      )}
    </article>
  );
}
