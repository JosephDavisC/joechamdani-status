"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { format } from "date-fns";

interface PingData {
  responseTime: number;
  isUp: boolean;
  checkedAt: string;
}

export function ResponseSparkline({ data }: { data: PingData[] }) {
  const { theme } = useTheme();

  const chartData = data.map((p) => ({
    time: new Date(p.checkedAt).getTime(),
    responseTime: p.isUp ? p.responseTime : null,
  }));

  const colors = {
    stroke: theme === "dark" ? "#60A5FA" : "#4CBB17",
    fill: theme === "dark" ? "#60A5FA" : "#4CBB17",
    tick: theme === "dark" ? "#8b95a5" : "#78716c",
    grid: theme === "dark" ? "hsl(215 20% 25%)" : "#E2DFD8",
  };

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.fill} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colors.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(val: number) => format(new Date(val), "HH:mm")}
            tick={{ fontSize: 10, fill: colors.tick }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: colors.tick }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val: number) => `${val}ms`}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
            labelFormatter={(val) =>
              format(new Date(val as number), "MMM d, HH:mm")
            }
            formatter={(value) => [`${value}ms`, "Response Time"]}
          />
          <Area
            type="monotone"
            dataKey="responseTime"
            stroke={colors.stroke}
            fill="url(#sparkGradient)"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
