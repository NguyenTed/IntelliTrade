import React from "react";

export function highlightMentions(text: string) {
  const regex = /(@[a-zA-Z0-9._-]+)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (regex.test(part)) {
      return (
        <span key={idx} className="text-blue-600 hover:underline">
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}
