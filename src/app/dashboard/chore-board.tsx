"use client";

import { Activity, useActionState, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import { getChoreIcon } from "@/components/icons";
import { CreateChoreButton } from "./create-chore-button";
import {
  logChore,
  undoChoreLog,
  type ChoreLogActionState,
} from "@/server/chore-logs/actions";

interface Chore {
  id: number;
  name: string;
  iconName: string;
  iconStyle: string;
  iconColor: string;
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

interface ChoreGroup {
  chore: Chore;
  logs: ChoreLog[];
  count: number;
  totalPoints: number;
}

function toDateKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(dateKey: string): string {
  const today = toDateKey(new Date());
  if (dateKey === today) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === toDateKey(yesterday)) return "Yesterday";
  const parts = dateKey.split("-").map(Number);
  const [y = 0, m = 0, d = 0] = parts;
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function parseMonthKey(monthKey: string): [number, number] {
  const parts = monthKey.split("-").map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0];
}

function formatMonthLabel(monthKey: string): string {
  const [y, m] = parseMonthKey(monthKey);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function prevMonth(monthKey: string): string {
  const [y, m] = parseMonthKey(monthKey);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(monthKey: string): string {
  const [y, m] = parseMonthKey(monthKey);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function todayString(): string {
  return toDateKey(new Date());
}

/** Lighten a hex color for use as a background tint */
function hexToTint(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ChoreBoard({
  chores,
  members,
  recentLogs,
  monthlyScores,
  currentMonth,
  currentMemberId,
}: {
  chores: Chore[];
  members: Member[];
  recentLogs: ChoreLog[];
  monthlyScores: MonthlyScore[];
  currentMonth: string;
  currentMemberId?: number;
}) {
  const [selectedMemberId, setSelectedMemberId] = useQueryState(
    "member",
    parseAsInteger.withDefault(currentMemberId ?? -1),
  );
  const [showLogModal, setShowLogModal] = useState(false);
  const [confirmChore, setConfirmChore] = useState<Chore | null>(null);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const [logDate, setLogDate] = useState(todayString);
  const [choreSearch, setChoreSearch] = useState("");
  const [logQuantity, setLogQuantity] = useState(1);
  const [state, formAction, isPending] = useActionState(
    async (prevState: ChoreLogActionState, formData: FormData) => {
      const result = await logChore(prevState, formData);
      if (result.success) {
        setConfirmChore(null);
        setLogQuantity(1);
        // Don't reset date — Activity preserves state across open/close
      }
      return result;
    },
    {},
  );
  const [undoState, undoFormAction, isUndoing] = useActionState(
    undoChoreLog,
    {},
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const isCurrentMonth = currentMonth === currentMonthKey();

  const navigateMonth = useCallback(
    (monthKey: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (monthKey === currentMonthKey()) {
        params.delete("month");
      } else {
        params.set("month", monthKey);
      }
      const qs = params.toString();
      router.push(`/dashboard${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams],
  );

  if (chores.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">
          No chores yet. Use the New Chore button to add some.
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

  // Group logs by member, then by day
  const logsByMemberByDay = new Map<number, Map<string, ChoreLog[]>>();
  for (const member of members) {
    logsByMemberByDay.set(member.id, new Map());
  }
  for (const log of recentLogs) {
    const memberDays = logsByMemberByDay.get(log.memberId);
    if (!memberDays) continue;
    const key = toDateKey(log.loggedAt);
    let dayLogs = memberDays.get(key);
    if (!dayLogs) {
      dayLogs = [];
      memberDays.set(key, dayLogs);
    }
    dayLogs.push(log);
  }

  // Collect all unique day keys across all members, sorted newest first
  const allDays = [
    ...new Set(recentLogs.map((l) => toDateKey(l.loggedAt))),
  ].sort((a, b) => b.localeCompare(a));

  // Filter chores for the log modal search
  const filteredChores = choreSearch
    ? chores.filter((c) =>
        c.name.toLowerCase().includes(choreSearch.toLowerCase()),
      )
    : chores;

  return (
    <div className="space-y-4">
      {/* Error display */}
      {(state.error ?? undoState.error) && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error ?? undoState.error}
        </p>
      )}

      {/* Log chore trigger + Month selector */}
      <button
        type="button"
        onClick={() => setShowLogModal(true)}
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
      <div className="lg:hidden">
        <CreateChoreButton />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigateMonth(prevMonth(currentMonth))}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          aria-label="Previous month"
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
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-900 capitalize">
          {formatMonthLabel(currentMonth)}
        </span>
        <button
          type="button"
          onClick={() => navigateMonth(nextMonth(currentMonth))}
          disabled={isCurrentMonth}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:invisible"
          aria-label="Next month"
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
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Member columns grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400">
                Day
              </th>
              {members.map((member) => {
                const points = scoreMap.get(member.id) ?? 0;
                return (
                  <th
                    key={member.id}
                    className="border-l border-gray-200 px-3 py-3 text-center"
                  >
                    <div className="font-semibold text-gray-900">
                      {member.name}
                    </div>
                    <div className="text-sm font-normal text-gray-500">
                      {points} {points === 1 ? "pt" : "pts"}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allDays.length === 0 ? (
              <tr>
                <td
                  colSpan={members.length + 1}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  No chores logged this month
                </td>
              </tr>
            ) : (
              allDays.map((dayKey) => (
                <tr key={dayKey} className="border-t border-gray-50">
                  <td className="px-3 py-2 align-top text-xs font-medium whitespace-nowrap text-gray-500">
                    {formatDayLabel(dayKey)}
                  </td>
                  {members.map((member) => {
                    const dayLogs =
                      logsByMemberByDay.get(member.id)?.get(dayKey) ?? [];
                    // Group logs by choreId
                    const groupMap = new Map<number, ChoreGroup>();
                    for (const log of dayLogs) {
                      const chore = choreMap.get(log.choreId);
                      if (!chore) continue;
                      let group = groupMap.get(log.choreId);
                      if (!group) {
                        group = { chore, logs: [], count: 0, totalPoints: 0 };
                        groupMap.set(log.choreId, group);
                      }
                      group.logs.push(log);
                      group.count++;
                      group.totalPoints += chore.points;
                    }

                    const memberDayTotal = [...groupMap.values()].reduce(
                      (sum, g) => sum + g.totalPoints,
                      0,
                    );
                    const groups = [...groupMap.values()];

                    return (
                      <td
                        key={member.id}
                        className="border-l border-gray-200 p-0 align-top"
                      >
                        <div className="flex min-h-[3rem] items-start">
                          {/* Icons section */}
                          <div className="flex flex-1 flex-wrap gap-1.5 px-3 py-2">
                            {groups.map((group) => {
                              const { chore } = group;
                              const result = getChoreIcon(
                                chore.iconName,
                                chore.iconStyle,
                              );
                              const groupKey = `${chore.id}-${dayKey}-${member.id}`;
                              const isExpanded = expandedGroupKey === groupKey;
                              const [latestLog] = group.logs;
                              if (!latestLog) return null;
                              const color = chore.iconColor || "#3b82f6";
                              return (
                                <div key={groupKey} className="relative">
                                  <button
                                    type="button"
                                    title={chore.name}
                                    onClick={() =>
                                      setExpandedGroupKey(
                                        isExpanded ? null : groupKey,
                                      )
                                    }
                                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                                      isExpanded
                                        ? "ring-2 ring-offset-1"
                                        : "hover:opacity-80"
                                    }`}
                                    style={
                                      result?.filled
                                        ? {
                                            backgroundColor: color,
                                            color: "white",
                                            ...(isExpanded
                                              ? { ringColor: color }
                                              : {}),
                                          }
                                        : {
                                            backgroundColor: hexToTint(
                                              color,
                                              0.1,
                                            ),
                                            color: color,
                                          }
                                    }
                                  >
                                    {result ? (
                                      <result.Icon size={22} />
                                    ) : (
                                      <span className="text-xs">?</span>
                                    )}
                                  </button>
                                  {group.count > 1 && (
                                    <span
                                      className="absolute -right-1 -bottom-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-bold text-white"
                                      style={{ backgroundColor: color }}
                                    >
                                      x{group.count}
                                    </span>
                                  )}
                                  {isExpanded && (
                                    <div className="absolute top-full left-0 z-10 mt-1 w-32 rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                                      <div className="text-xs font-medium text-gray-900">
                                        {chore.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        +{group.totalPoints} pts
                                        {group.count > 1 &&
                                          ` (${group.count}x)`}{" "}
                                        &middot;{" "}
                                        {formatRelativeTime(latestLog.loggedAt)}
                                      </div>
                                      <form
                                        action={undoFormAction}
                                        onSubmit={() =>
                                          setExpandedGroupKey(null)
                                        }
                                      >
                                        <input
                                          type="hidden"
                                          name="logId"
                                          value={latestLog.id}
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
                          {/* Daily total section */}
                          <div className="flex min-h-[3rem] items-center border-l border-gray-100 px-2.5 py-2">
                            <span className="text-sm font-semibold text-gray-700 tabular-nums">
                              {memberDayTotal > 0 ? memberDayTotal : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Log chore modal — preserved across open/close via Activity */}
      <Activity mode={showLogModal ? "visible" : "hidden"}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white p-6 shadow-xl">
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

            {/* Date picker */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={logDate}
                max={todayString()}
                onChange={(e) => setLogDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Search chores */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search chores..."
                value={choreSearch}
                onChange={(e) => setChoreSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Chore grid — scrollable */}
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filteredChores.map((chore) => {
                  const result = getChoreIcon(chore.iconName, chore.iconStyle);
                  const color = chore.iconColor || "#3b82f6";
                  return (
                    <button
                      key={chore.id}
                      type="button"
                      onClick={() => {
                        if (!selectedMemberId) return;
                        setConfirmChore(chore);
                        setLogQuantity(1);
                      }}
                      disabled={!selectedMemberId}
                      className={`flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all ${
                        selectedMemberId
                          ? "cursor-pointer hover:border-blue-300 hover:shadow-md active:scale-95"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={
                          result?.filled
                            ? { backgroundColor: color, color: "white" }
                            : {
                                backgroundColor: hexToTint(color, 0.1),
                                color: color,
                              }
                        }
                      >
                        {result ? <result.Icon size={32} /> : null}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {chore.name}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: hexToTint(color, 0.15),
                          color: color,
                        }}
                      >
                        {chore.points} {chore.points === 1 ? "pt" : "pts"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Activity>

      {/* Confirmation dialog */}
      {confirmChore && selectedMemberId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Log Chore</h3>
            <p className="mt-2 text-gray-600">
              <span className="font-medium">
                {members.find((m) => m.id === selectedMemberId)?.name}
              </span>{" "}
              did <span className="font-medium">{confirmChore.name}</span>
              {logQuantity > 1 && (
                <>
                  {" "}
                  <span className="font-semibold">x{logQuantity}</span>
                </>
              )}{" "}
              for{" "}
              <span className="font-semibold text-blue-600">
                {confirmChore.points * logQuantity}{" "}
                {confirmChore.points * logQuantity === 1 ? "pt" : "pts"}
              </span>
              {logDate !== todayString() && (
                <>
                  {" "}
                  on <span className="font-medium">{logDate}</span>
                </>
              )}
              ?
            </p>

            {/* Quantity stepper */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <button
                type="button"
                onClick={() => setLogQuantity((q) => Math.max(1, q - 1))}
                disabled={logQuantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">
                {logQuantity}
              </span>
              <button
                type="button"
                onClick={() => setLogQuantity((q) => Math.min(10, q + 1))}
                disabled={logQuantity >= 10}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmChore(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <form action={formAction}>
                <input type="hidden" name="choreId" value={confirmChore.id} />
                <input type="hidden" name="memberId" value={selectedMemberId} />
                <input type="hidden" name="loggedAt" value={logDate} />
                <input type="hidden" name="quantity" value={logQuantity} />
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
