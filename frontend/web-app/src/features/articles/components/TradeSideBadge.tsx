import { TradeSide } from "@/enums/TradeSide";

export default function TradeSideBadge({ tradeSide }: { tradeSide: string }) {
  return (
    <>
      {/* Badge LONG / SHORT */}
      {tradeSide === TradeSide.SHORT && (
        <span className="flex items-center gap-1 bg-[#CC2F3C26] text-[#991F29] text-[12px] font-semibold px-2 rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
          >
            <path
              fill="currentColor"
              d="M5.3 6.7 15.58 17H9v2h10V9h-2v6.59L6.7 5.29 5.3 6.71Z"
            ></path>
          </svg>
          SHORT
        </span>
      )}
      {tradeSide === TradeSide.LONG && (
        <span className="flex items-center gap-1 bg-[#08995026] text-[#004D27] text-[12px] font-semibold px-2 rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
          >
            <path
              fill="currentColor"
              d="M9 5h10v10h-2V8.41L6.7 18.71l-1.4-1.42L15.58 7H9V5Z"
            ></path>
          </svg>
          LONG
        </span>
      )}
    </>
  );
}
