export default function SymbolImages({
  imgs,
  size1,
  size2,
  iconGap,
}: {
  imgs: string[];
  size1?: number;
  size2?: number;
  iconGap?: number;
}) {
  return (
    <div className="flex items-center">
      {imgs.length > 0 && (
        <div className={`relative w-${size1} h-${size1}`}>
          {imgs.length === 1 ? (
            <img
              src={imgs[0]}
              alt="symbol"
              className={` w-${size1 ?? 8} h-${
                size1 ?? 8
              } rounded-full border-2 border-white object-cover`}
            />
          ) : (
            <>
              <img
                src={imgs[0]}
                alt="symbol-0"
                className={`absolute bottom-0 left-0 w-${size2} h-${size2} rounded-full border-2 border-white object-cover z-2`}
              />
              <img
                src={imgs[1]}
                alt="symbol-1"
                style={{
                  top: `-${iconGap ?? 2}px`,
                  right: `-${iconGap ?? 2}px`,
                }}
                className={`absolute w-${size2} h-${size2} rounded-full border-2 border-white object-cover`}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
