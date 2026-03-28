"use client";

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
import type { MemberDailyStat } from "./queries";

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

type ChartDatum = {
  name: string;
  avg: number;
  stddev: number;
  fill: string;
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
        Avg: {d.avg.toFixed(1)}/day &plusmn; {d.stddev.toFixed(1)}
      </p>
    </div>
  );
}

function BarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  index?: number;
  data?: ChartDatum[];
}) {
  const { x = 0, y = 0, width = 0, value = 0, index = 0, data } = props;
  const datum = data?.[index];
  if (!datum) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={12}
      fill="#374151"
    >
      {value.toFixed(1)}/day &plusmn; {datum.stddev.toFixed(1)}
    </text>
  );
}

function RoundedBar(props: Record<string, unknown>) {
  return <Rectangle {...(props as object)} radius={[6, 6, 0, 0]} />;
}

export function MemberAvgChart({ data }: { data: MemberDailyStat[] }) {
  if (data.length === 0 || data.every((d) => d.totalLogs === 0)) {
    return (
      <p className="py-8 text-center text-gray-400">
        No chore data for the selected period.
      </p>
    );
  }

  const chartData: ChartDatum[] = data.map((d, i) => ({
    name: d.memberName,
    avg: Math.round(d.avg * 10) / 10,
    stddev: Math.round(d.stddev * 10) / 10,
    fill: COLORS[i % COLORS.length] ?? "#3b82f6",
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={chartData}
        margin={{ top: 24, right: 20, bottom: 0, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="avg"
          shape={<RoundedBar />}
          label={<BarLabel data={chartData} />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
