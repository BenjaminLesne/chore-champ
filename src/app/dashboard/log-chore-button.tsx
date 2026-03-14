"use client";

import { useQueryState } from "nuqs";

export function LogChoreButton() {
  const [, setLog] = useQueryState("log");

  return (
    <button
      type="button"
      onClick={() => setLog("1")}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Log Chore
    </button>
  );
}
