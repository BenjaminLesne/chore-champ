"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import type { ChoreBreakdownEntry } from "./queries";

type Member = {
  id: number;
  name: string;
};

type ChartDatum = {
  name: string;
  count: number;
  fill: string;
  iconName: string;
};

function CustomTooltip(props: {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
}) {
  const { active, payload } = props;
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-gray-900">{d.name}</p>
      <p className="text-gray-600">
        {d.count} {d.count === 1 ? "time" : "times"}
      </p>
    </div>
  );
}

function RoundedBar(props: Record<string, unknown>) {
  return <Rectangle {...(props as object)} radius={[0, 6, 6, 0]} />;
}

function BarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}) {
  const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dominantBaseline="central"
      fontSize={12}
      fill="#374151"
    >
      {value}
    </text>
  );
}

export function ChoreBreakdownChart({
  members,
  breakdownByMember,
}: {
  members: Member[];
  breakdownByMember: Record<string, ChoreBreakdownEntry[]>;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members[0]?.id.toString() ?? "",
  );

  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-gray-400">No members in household.</p>
    );
  }

  const entries = breakdownByMember[selectedMemberId] ?? [];

  const chartData: ChartDatum[] = entries.map((e) => ({
    name: e.choreName,
    count: e.count,
    fill: e.choreIconColor || "#3b82f6",
    iconName: e.choreIconName,
  }));

  const chartHeight = Math.max(200, chartData.length * 44 + 40);

  return (
    <div>
      <div className="mb-4">
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          aria-label="Select member"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id.toString()}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {chartData.length === 0 ? (
        <p className="py-8 text-center text-gray-400">
          No chore data for this member in the selected period.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 40, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" shape={<RoundedBar />} label={<BarLabel />} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
