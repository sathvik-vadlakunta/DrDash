"use client";
import { LineChart, Line, ReferenceLine, ResponsiveContainer } from "recharts";

export function HomeChart({ data }: { data: { t: number; v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
        <ReferenceLine y={0} stroke="var(--rule-strong)" strokeWidth={1} />
        <Line
          type="monotone"
          dataKey="v"
          stroke="#0072B2"
          dot={false}
          strokeWidth={1.5}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
