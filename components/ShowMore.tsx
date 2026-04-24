"use client";

import { useState, type ReactNode } from "react";

export default function ShowMore({
  children,
  previewCount,
  itemLabel = "items"
}: {
  children: ReactNode;
  previewCount: number;
  itemLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = Array.isArray(children) ? children : [children];
  const total = items.length;
  const hidden = total - previewCount;
  const visible = expanded ? items : items.slice(0, previewCount);

  return (
    <>
      {visible}
      {hidden > 0 && (
        <li className="col-span-full mt-2 flex justify-center list-none">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="btn-ghost text-sm"
            aria-expanded={expanded}
          >
            {expanded
              ? `Show fewer ${itemLabel}`
              : `See all ${total} ${itemLabel}`}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`ml-1 inline-block transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </li>
      )}
    </>
  );
}
