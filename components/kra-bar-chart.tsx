"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function KraBarChart({ data }: { data: { kraName: string; hours: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="kraName"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={70}
          />
          <YAxis tick={{ fontSize: 11 }} width={32} />
          <Tooltip formatter={(value) => [`${value}h`, "Hours"]} />
          <Bar dataKey="hours" fill="#2563eb" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
