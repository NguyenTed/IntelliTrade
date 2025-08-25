import type { ISymbol } from "../../model/ISymbol";
import SymbolImages from "../SymbolImages";

type Props = { symbols: ISymbol[] };

export default function SymbolRow({ symbols = [] }: Props) {
  if (!symbols?.length) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-4">
      {symbols.map((symbol) => {
        const imgs = symbol.symbolImgs ?? [];
        const isPair = imgs.length === 2;

        return (
          <div
            key={symbol.id ?? `${symbol.name}-${imgs.join("|")}`}
            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2"
          >
            <div className={isPair ? "mt-2" : ""}>
              <SymbolImages imgs={imgs} size1={24} size2={20} iconGap={10} />
            </div>
            <span className="text-sm">{symbol.name}</span>
          </div>
        );
      })}
    </div>
  );
}
