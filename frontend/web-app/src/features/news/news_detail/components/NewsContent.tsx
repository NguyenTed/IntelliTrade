export default function NewsContent({ contentHtml }: { contentHtml: string }) {
  const correctedHtml = contentHtml.replace(/className=/g, "class=");

  return (
    <article className="lg:col-span-8">
      {/* Timeline CSS */}
      <style>{`
        [class^="timeline-"] {
          position: relative;
          border-left: 2px solid #d1d5db;
          padding-left: 1.5rem;
        }

        [class^="timelineItem-"] {
          position: relative;
          margin-bottom: 2.5rem;
        }

        [class^="timelineItem-"]::before {
          content: '';
          position: absolute;
          left: -35px;
          top: 0;
          width: 20px;
          height: 20px;
          background-color: #d1d5db;
          border-radius: 9999px;
          border: 2px solid white;
          z-index: 10;
        }
        [class^="pair-"] {
          position: relative;
          display: inline-block;
          width: 2rem; /* khoảng 32px */
          height: 2rem;
        }

        [class^="pair-"] img:last-child {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid white;
          z-index: 10;
        }

        [class^="pair-"] img:first-child {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid white;
        }

        [class^="time-"] {
          position: relative;
          top: -5px; 
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        [class^="tag-"]{
          display: flex;
          align-items: center;
          gap: 6px;
        }
        [class^="logo-"]{
          border-radius: 9999px;
          object-fit: cover;
          width: 20px;
          height: 20px;
          margin: 0;
        }
      `}</style>

      <div
        className="max-w-none leading-7 prose font-semibold text-[18px]"
        dangerouslySetInnerHTML={{ __html: correctedHtml }}
      />
    </article>
  );
}
