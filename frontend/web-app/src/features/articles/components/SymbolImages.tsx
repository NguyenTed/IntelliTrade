type Props = {
  imgs: string[];
  size1?: number;
  size2?: number;
  iconGap?: number;
};

export default function SymbolImages({
  imgs = [],
  size1 = 32,
  size2 = 28,
  iconGap = 4,
}: Props) {
  const [a, b] = imgs;
  if (!a && !b) return null;

  const isSingle = imgs.length === 1;
  const finalSize = isSingle ? size1 : size2;

  const baseSizeStyle: React.CSSProperties = {
    width: finalSize,
    height: finalSize,
  };

  return (
    <div className={`flex items-center ${isSingle ? "pr1" : "pr-2"}`}>
      <div className="relative" style={baseSizeStyle}>
        {b && (
          <img
            alt="symbol-0"
            src={b}
            style={baseSizeStyle}
            className={`absolute rounded-full border-2 border-white object-cover z-10 ${
              isSingle ? "top-0 left-0" : "bottom-0 left-0"
            }`}
          />
        )}

        {a && (
          <img
            alt="symbol-1"
            src={a}
            style={{
              ...baseSizeStyle,
              ...(isSingle ? {} : { top: -iconGap, right: -iconGap }),
            }}
            className={`absolute rounded-full border-2 border-white object-cover ${
              isSingle ? "top-0 left-0" : ""
            }`}
          />
        )}
      </div>
    </div>
  );
}
