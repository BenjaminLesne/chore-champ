"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Member {
  id: number;
  name: string;
}

interface PeriodData {
  year: number;
  week?: number;
  month?: number;
  memberId: number;
  totalPoints: number;
  choreCount: number;
}

const COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function buildLineData(
  members: Member[],
  data: PeriodData[],
  view: "weekly" | "monthly",
) {
  const periodMap = new Map<
    string,
    { label: string; [key: string]: string | number }
  >();

  for (const row of data) {
    const key =
      view === "weekly"
        ? `${row.year}-W${String(row.week ?? 0).padStart(2, "0")}`
        : `${row.year}-${String(row.month ?? 0).padStart(2, "0")}`;
    const label =
      view === "weekly"
        ? `W${row.week ?? 0}`
        : new Date(row.year, (row.month ?? 1) - 1).toLocaleString("default", {
            month: "short",
            year: "2-digit",
          });

    if (!periodMap.has(key)) {
      periodMap.set(key, { label });
    }
    const entry = periodMap.get(key);
    const member = members.find((m) => m.id === row.memberId);
    if (entry && member) {
      entry[member.name] = row.totalPoints;
    }
  }

  const result = Array.from(periodMap.values());
  for (const entry of result) {
    for (const member of members) {
      if (!(member.name in entry)) {
        entry[member.name] = 0;
      }
    }
  }

  return result;
}

function buildBarData(
  members: Member[],
  data: PeriodData[],
  view: "weekly" | "monthly",
) {
  const periodCounts = new Map<string, Map<number, number>>();

  for (const row of data) {
    const key =
      view === "weekly"
        ? `${row.year}-W${row.week ?? 0}`
        : `${row.year}-${row.month ?? 0}`;

    if (!periodCounts.has(key)) {
      periodCounts.set(key, new Map());
    }
    periodCounts.get(key)?.set(row.memberId, row.choreCount);
  }

  const memberPeriods = new Map<number, number[]>();
  for (const counts of periodCounts.values()) {
    for (const member of members) {
      if (!memberPeriods.has(member.id)) {
        memberPeriods.set(member.id, []);
      }
      memberPeriods.get(member.id)?.push(counts.get(member.id) ?? 0);
    }
  }

  const result: Record<string, string | number> = { label: "Average" };
  for (const member of members) {
    const periods = memberPeriods.get(member.id) ?? [];
    result[member.name] =
      periods.length > 0
        ? Math.round(
            (periods.reduce((sum, c) => sum + c, 0) / periods.length) * 10,
          ) / 10
        : 0;
  }
  return [result];
}

export function InsightsCharts({
  members,
  weeklyData,
  monthlyData,
}: {
  members: Member[];
  weeklyData: PeriodData[];
  monthlyData: PeriodData[];
}) {
  const [view, setView] = useState<"weekly" | "monthly">("monthly");

  const data = view === "weekly" ? weeklyData : monthlyData;
  const lineData = buildLineData(members, data, view);
  const barData = buildBarData(members, data, view);

  if (members.length === 0) {
    return (
      <p className="text-center text-gray-400">
        Add members in Settings to see insights.
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-center text-gray-400">
        No chore data yet. Log some chores to see trends!
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-gray-200 p-1">
          <button
            type="button"
            onClick={() => setView("weekly")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === "weekly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setView("monthly")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Line Chart — Points over time */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Points Over Time
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {members.map((member, i) => (
              <Line
                key={member.id}
                type="monotone"
                dataKey={member.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart — Average chores per period */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Average Chores per {view === "weekly" ? "Week" : "Month"}
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {members.map((member, i) => (
              <Bar
                key={member.id}
                dataKey={member.name}
                fill={COLORS[i % COLORS.length]}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
