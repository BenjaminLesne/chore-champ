"use client";

export interface MonthWinner {
  year: number;
  month: number;
  memberName: string;
  totalPoints: number;
  label: string;
}

interface PastMonth {
  year: number;
  month: number;
  label: string;
  winners: { name: string; points: number }[];
}

export function PastWinners({ monthlyData }: { monthlyData: MonthWinner[] }) {
  // Group by year-month
  const monthsMap = new Map<string, PastMonth>();
  for (const row of monthlyData) {
    const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
    let entry = monthsMap.get(key);
    if (!entry) {
      entry = {
        year: row.year,
        month: row.month,
        label: row.label,
        winners: [],
      };
      monthsMap.set(key, entry);
    }
    entry.winners.push({
      name: row.memberName,
      points: Number(row.totalPoints),
    });
  }

  // For each month, find the max score and filter to winners only
  const months: PastMonth[] = [];
  for (const entry of monthsMap.values()) {
    const maxPoints = Math.max(...entry.winners.map((w) => w.points));
    if (maxPoints > 0) {
      months.push({
        ...entry,
        winners: entry.winners.filter((w) => w.points === maxPoints),
      });
    }
  }

  // Sort by most recent first
  months.sort((a, b) => b.year - a.year || b.month - a.month);

  if (months.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Past Winners</h2>

      <div className="space-y-3">
        {months.map((m) => (
          <div
            key={`${m.year}-${m.month}`}
            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {m.winners.length > 1
                  ? m.winners.map((w) => w.name).join(" & ")
                  : m.winners[0]?.name}
              </p>
              <p className="text-xs text-gray-500">{m.label}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-amber-500">
                {m.winners[0]?.points}
              </span>
              <span className="text-xs text-gray-400">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
