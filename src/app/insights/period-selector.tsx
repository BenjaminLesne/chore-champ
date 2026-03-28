"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";

const PERIOD_OPTIONS = ["30d", "3m", "6m", "all"] as const;
export type Period = (typeof PERIOD_OPTIONS)[number];

const PERIOD_LABELS: Record<Period, string> = {
  "30d": "Last 30 days",
  "3m": "Last 3 months",
  "6m": "Last 6 months",
  all: "All time",
};

export function usePeriod() {
  return useQueryState(
    "period",
    parseAsStringLiteral(PERIOD_OPTIONS).withDefault("30d"),
  );
}

export function PeriodSelector() {
  const [period, setPeriod] = usePeriod();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Member Stats Period
      </h2>
      <div className="inline-flex rounded-lg bg-gray-200 p-1">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setPeriod(opt)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              period === opt
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {PERIOD_LABELS[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}
