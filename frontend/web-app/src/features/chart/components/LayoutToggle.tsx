import React from "react";

export type LayoutMode = "1" | "2v" | "2h" | "3v" | "3h" | "4";

const MODES: { key: LayoutMode; label: string }[] = [
  { key: "1", label: "1" },
  { key: "2v", label: "2 (V)" },
  { key: "2h", label: "2 (H)" },
  { key: "3v", label: "3 (V)" },
  { key: "3h", label: "3 (H)" },
  { key: "4", label: "4" },
];

export default function LayoutToggle({
  mode,
  onChange,
}: {
  mode: LayoutMode;
  onChange: (m: LayoutMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-800/70">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`px-2 py-1 rounded-lg text-sm ${
            mode === m.key
              ? "bg-neutral-700 text-white"
              : "text-neutral-300 hover:text-white"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
