"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNum } from "@/lib/design";
import type { Bucket } from "@/lib/nutrition-history";

const TOOLTIP_STYLE = {
  background: "#292A2F",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  fontSize: "12px",
};

export function KcalChart({ data, goal }: { data: Bucket[]; goal: number }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="kcalFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F6FED" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#2F6FED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#8B8D93", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis hide domain={[0, (max: number) => Math.max(max, goal) * 1.15]} />
        {/* Hedef çizgisi: aşan günler bir bakışta görünsün */}
        <ReferenceLine
          y={goal}
          stroke="#3CAA5C"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: `hedef ${goal}`, fill: "#3CAA5C", fontSize: 10, position: "insideTopRight" }}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "#8B8D93" }}
          formatter={(value) => [`${formatNum(Number(value))} kcal`, "Kalori"]}
        />
        <Area type="monotone" dataKey="kcal" stroke="#2F6FED" strokeWidth={2.5} fill="url(#kcalFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MacroChart({ data }: { data: Bucket[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#8B8D93", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "#8B8D93" }}
          formatter={(value, name) => [`${formatNum(Number(value))} g`, String(name)]}
        />
        <Legend wrapperStyle={{ fontSize: "11px", color: "#8B8D93" }} iconType="circle" iconSize={8} />
        {/* Yığılmış: toplam yüksekliği o günün toplam makro gramı */}
        <Bar dataKey="protein" name="Protein" stackId="m" fill="#E8412C" radius={[0, 0, 0, 0]} />
        <Bar dataKey="carbs" name="Karbonhidrat" stackId="m" fill="#2F6FED" />
        <Bar dataKey="fat" name="Yağ" stackId="m" fill="#E8B72C" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
