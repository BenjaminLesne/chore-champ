"use client";

interface ScoreEntry {
  memberId: number;
  memberName: string;
  totalPoints: number;
}

export function Scoreboard({ scores }: { scores: ScoreEntry[] }) {
  if (scores.length === 0) {
    return null;
  }

  const maxPoints = Math.max(...scores.map((s) => s.totalPoints));
  const hasActivity = maxPoints > 0;
  const winners = hasActivity
    ? scores.filter((s) => s.totalPoints === maxPoints)
    : [];

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {monthName} Scoreboard
      </h2>

      {/* Winner display */}
      {winners.length > 0 && (
        <div className="mb-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-center">
          <p className="text-xs font-medium tracking-wide text-amber-600 uppercase">
            {winners.length > 1 ? "Co-Winners" : "Leader"}
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {winners.map((w) => (
              <span
                key={w.memberId}
                className="text-xl font-bold text-amber-700"
              >
                {w.memberName}
              </span>
            ))}
          </div>
          <p className="mt-1 text-2xl font-extrabold text-amber-500">
            {maxPoints} {maxPoints === 1 ? "pt" : "pts"}
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-2">
        {scores.map((entry, index) => {
          const isWinner = hasActivity && entry.totalPoints === maxPoints;
          const barWidth =
            maxPoints > 0
              ? Math.max((entry.totalPoints / maxPoints) * 100, 4)
              : 4;

          return (
            <div key={entry.memberId} className="flex items-center gap-3">
              <span
                className={`w-5 text-center text-sm font-semibold ${
                  isWinner ? "text-amber-500" : "text-gray-400"
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`truncate text-sm font-medium ${
                      isWinner ? "text-amber-700" : "text-gray-700"
                    }`}
                  >
                    {entry.memberName}
                  </span>
                  <span
                    className={`ml-2 text-sm font-semibold ${
                      isWinner ? "text-amber-600" : "text-gray-500"
                    }`}
                  >
                    {entry.totalPoints}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isWinner
                        ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                        : "bg-blue-300"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!hasActivity && (
        <p className="mt-2 text-center text-sm text-gray-400">
          No chores logged this month yet
        </p>
      )}
    </div>
  );
}
