import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flame, TrendingUp, HeartPulse } from "lucide-react";

export type MoodPoint = { day: string; balance: number; stress: number };

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-aurora mt-3 font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

export function Analytics({ data, streak }: { data: MoodPoint[]; streak: number }) {
  const avgBalance = Math.round(data.reduce((a, d) => a + d.balance, 0) / (data.length || 1));
  const avgStress = Math.round(data.reduce((a, d) => a + d.stress, 0) / (data.length || 1));

  const tooltip = {
    contentStyle: {
      background: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      color: "var(--popover-foreground)",
      fontSize: 12,
    },
  } as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<HeartPulse className="h-3.5 w-3.5" />}
          label="Emotional balance"
          value={`${avgBalance}%`}
          sub="14-day average"
        />
        <Stat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Stress level"
          value={`${avgStress}%`}
          sub="lower is calmer"
        />
        <Stat
          icon={<Flame className="h-3.5 w-3.5" />}
          label="Reflection streak"
          value={`${streak} days`}
          sub="keep the loom running"
        />
      </div>

      <div className="glass rounded-3xl p-5">
        <h3 className="text-base font-semibold">Emotional balance vs. stress</h3>
        <p className="mt-1 text-sm text-muted-foreground">Rolling two-week trend</p>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="gBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip {...tooltip} />
              <Area
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#gBalance)"
              />
              <Area
                type="monotone"
                dataKey="stress"
                name="Stress"
                stroke="var(--chart-3)"
                strokeWidth={2.5}
                fill="url(#gStress)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-3xl p-5">
        <h3 className="text-base font-semibold">Reflection consistency</h3>
        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...tooltip} />
              <Line
                type="monotone"
                dataKey="balance"
                name="Entries score"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--chart-2)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
