"use client";

import { useActionState, useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { getChoreIcon } from "@/components/icons";
import { logChore, undoChoreLog } from "@/server/chore-logs/actions";

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

interface MonthlyScore {
  memberId: number;
  memberName: string;
  totalPoints: number;
}

export function ChoreBoard({
  chores,
  members,
  recentLogs,
  monthlyScores,
}: {
  chores: Chore[];
  members: Member[];
  recentLogs: ChoreLog[];
  monthlyScores: MonthlyScore[];
}) {
  const [selectedMemberId, setSelectedMemberId] = useQueryState(
    "member",
    parseAsInteger,
  );
  const [confirmChore, setConfirmChore] = useState<Chore | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [state, formAction, isPending] = useActionState(logChore, {});
  const [undoState, undoFormAction, isUndoing] = useActionState(
    undoChoreLog,
    {},
  );

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

  if (members.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">
          No members yet. Add some in{" "}
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

  const choreMap = new Map(chores.map((c) => [c.id, c]));
  const scoreMap = new Map(
    monthlyScores.map((s) => [s.memberId, s.totalPoints]),
  );

  const logsByMember = new Map<number, ChoreLog[]>();
  for (const member of members) {
    logsByMember.set(member.id, []);
  }
  for (const log of recentLogs) {
    logsByMember.get(log.memberId)?.push(log);
  }

  return (
    <div className="space-y-4">
      {/* Error display */}
      {(state.error ?? undoState.error) && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error ?? undoState.error}
        </p>
      )}

      {/* Member columns grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${members.length}, minmax(0, 1fr))`,
        }}
      >
        {members.map((member) => {
          const memberLogs = logsByMember.get(member.id) ?? [];
          const points = scoreMap.get(member.id) ?? 0;
          return (
            <div
              key={member.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Column header */}
              <div className="border-b border-gray-100 px-3 py-3 text-center">
                <div className="font-semibold text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-500">
                  {points} {points === 1 ? "pt" : "pts"}
                </div>
              </div>

              {/* Icon chips */}
              <div className="max-h-[60vh] overflow-y-auto p-3">
                {memberLogs.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">
                    No chores yet
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {memberLogs.map((log) => {
                      const chore = choreMap.get(log.choreId);
                      if (!chore) return null;
                      const Icon = getChoreIcon(
                        chore.iconName,
                        chore.iconStyle,
                      );
                      const isExpanded = expandedLogId === log.id;
                      return (
                        <div key={log.id}>
                          <button
                            type="button"
                            title={chore.name}
                            onClick={() =>
                              setExpandedLogId(isExpanded ? null : log.id)
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                              isExpanded
                                ? "bg-blue-100 ring-2 ring-blue-400"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {Icon ? (
                              <Icon size={24} className="text-blue-600" />
                            ) : (
                              <span className="text-xs">?</span>
                            )}
                          </button>
                          {isExpanded && (
                            <div className="mt-1 w-32 rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                              <div className="text-xs font-medium text-gray-900">
                                {chore.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                +{log.pointsEarned} pts &middot;{" "}
                                {formatRelativeTime(log.loggedAt)}
                              </div>
                              <form
                                action={undoFormAction}
                                onSubmit={() => setExpandedLogId(null)}
                              >
                                <input
                                  type="hidden"
                                  name="logId"
                                  value={log.id}
                                />
                                <button
                                  type="submit"
                                  disabled={isUndoing}
                                  className="mt-1 text-xs text-red-500 hover:text-red-700"
                                >
                                  Undo
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowLogModal(true)}
        className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
        aria-label="Log Chore"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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
      </button>

      {/* Log chore modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Log Chore</h3>
              <button
                type="button"
                onClick={() => {
                  setShowLogModal(false);
                  setConfirmChore(null);
                }}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Member selector */}
            <div className="mt-4">
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
            </div>

            {/* Chore grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                      {Icon ? <Icon size={40} /> : null}
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
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmChore && selectedMemberId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Log Chore</h3>
            <p className="mt-2 text-gray-600">
              <span className="font-medium">
                {members.find((m) => m.id === selectedMemberId)?.name}
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
              <form
                action={formAction}
                onSubmit={() => {
                  setConfirmChore(null);
                  setShowLogModal(false);
                }}
              >
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
