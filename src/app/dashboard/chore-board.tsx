"use client";

import { useActionState, useState } from "react";
import { getChoreIcon } from "@/components/icons";
import { logChore } from "@/server/chore-logs/actions";

interface Chore {
  id: number;
  name: string;
  iconName: string;
  iconStyle: string;
  points: number;
}

interface Member {
  id: number;
  name: string;
}

interface ChoreLog {
  id: number;
  choreId: number;
  memberId: number;
  pointsEarned: number;
  loggedAt: Date;
}

export function ChoreBoard({
  chores,
  members,
  recentLogs,
}: {
  chores: Chore[];
  members: Member[];
  recentLogs: ChoreLog[];
}) {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [confirmChore, setConfirmChore] = useState<Chore | null>(null);
  const [state, formAction, isPending] = useActionState(logChore, {});

  if (chores.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">
          No chores yet. Add some in{" "}
          <a
            href="/settings"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Settings
          </a>
          .
        </p>
      </div>
    );
  }

  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  return (
    <div className="space-y-6">
      {/* Member selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Who&apos;s logging?
        </label>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelectedMemberId(member.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedMemberId === member.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-blue-300"
              }`}
            >
              {member.name}
            </button>
          ))}
        </div>
        {members.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">
            No members yet. Add some in{" "}
            <a
              href="/settings"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Settings
            </a>
            .
          </p>
        )}
      </div>

      {/* Error display */}
      {state.error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {/* Chore grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {chores.map((chore) => {
          const Icon = getChoreIcon(chore.iconName, chore.iconStyle);
          return (
            <button
              key={chore.id}
              type="button"
              onClick={() => {
                if (!selectedMemberId) return;
                setConfirmChore(chore);
              }}
              disabled={!selectedMemberId}
              className={`flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all ${
                selectedMemberId
                  ? "cursor-pointer hover:border-blue-300 hover:shadow-md active:scale-95"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              <div className="text-blue-600">
                {Icon ? <Icon size={56} /> : null}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {chore.name}
              </span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {chore.points} {chore.points === 1 ? "pt" : "pts"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Confirmation dialog */}
      {confirmChore && selectedMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Log Chore</h3>
            <p className="mt-2 text-gray-600">
              <span className="font-medium">
                {memberMap.get(selectedMemberId)}
              </span>{" "}
              did <span className="font-medium">{confirmChore.name}</span> for{" "}
              <span className="font-semibold text-blue-600">
                {confirmChore.points} {confirmChore.points === 1 ? "pt" : "pts"}
              </span>
              ?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmChore(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <form action={formAction} onSubmit={() => setConfirmChore(null)}>
                <input type="hidden" name="choreId" value={confirmChore.id} />
                <input type="hidden" name="memberId" value={selectedMemberId} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? "Logging..." : "Confirm"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const choreName =
                chores.find((c) => c.id === log.choreId)?.name ?? "Unknown";
              const memberName = memberMap.get(log.memberId) ?? "Unknown";
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {memberName}
                    </span>{" "}
                    <span className="text-gray-500">did</span>{" "}
                    <span className="font-medium text-gray-900">
                      {choreName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      +{log.pointsEarned} pts
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(log.loggedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
