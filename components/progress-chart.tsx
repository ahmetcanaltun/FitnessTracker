"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNum } from "@/lib/design";

export type ChartPoint = { label: string; kg: number };

export function ProgressChart({ data, color }: { data: ChartPoint[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#8B8D93", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          hide
          domain={[
            (dataMin: number) => Math.max(0, dataMin - 10),
            (dataMax: number) => dataMax + 10,
          ]}
        />
        <Tooltip
          contentStyle={{
            background: "#292A2F",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#8B8D93" }}
          formatter={(value) => [`${formatNum(Number(value))} kg`, "Ağırlık"]}
        />
        <Area
          type="monotone"
          dataKey="kg"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#fillArea)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
