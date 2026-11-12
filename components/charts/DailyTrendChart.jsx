"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCompactINR(value) {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${value}`;
}

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function CustomTrendTooltip({ active, payload, label, mode }) {
    if (!active || !payload || !payload.length) return null;

    let formattedDate = label;
    try {
        formattedDate = format(parseISO(label), "EEE, MMM d, yyyy");
    } catch {
        // Keep raw label if non-ISO
    }

    const point = payload[0]?.payload;
    const value = payload[0]?.value ?? 0;

    return (
        <div className="rounded-xl bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                {formattedDate}
            </p>
            <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-zinc-600 dark:text-zinc-300">
                    {mode === "cumulative" ? "Cumulative" : "Daily Spend"}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white font-mono tabular-nums">
                    {formatINR(value)}
                </span>
            </div>
            {mode === "cumulative" && point && typeof point.amount === "number" && (
                <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-zinc-200/80 dark:border-zinc-800/80">
                    <span className="text-[11px] text-zinc-500">Day spend</span>
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                        {formatINR(point.amount)}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function DailyTrendChart({
    data = [],
    monthLabel = "Current month",
    activeDays = 0,
    className,
}) {
    const [mode, setMode] = useState("daily");
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";

    const chartColors = {
        stroke: isLight ? "#0066CC" : "#fafafa",
        fill: isLight ? "#0066CC" : "#fafafa",
        grid: isLight ? "#e2e8f0" : "#27272a",
        axis: isLight ? "#475569" : "#71717a",
        cursor: isLight ? "#94a3b8" : "#52525b",
        dotStroke: isLight ? "#ffffff" : "#09090b",
    };

    const chartData = useMemo(() => {
        return data.reduce((acc, item) => {
            const amount = Number(item.amount || 0);
            const prevCumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
            return [
                ...acc,
                {
                    date: item.date,
                    amount,
                    cumulative: prevCumulative + amount,
                },
            ];
        }, []);
    }, [data]);

    const hasSpending = useMemo(
        () => chartData.some((item) => item.amount > 0),
        [chartData]
    );

    const dataKey = mode === "cumulative" ? "cumulative" : "amount";

    return (
        <div
            className={cn(
                "rounded-2xl bg-white/95 dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_24px_-14px_rgba(15,23,42,0.08)] dark:shadow-none overflow-hidden flex flex-col transition-colors",
                className
            )}
        >
            <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                        Daily Spending Trend
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {mode === "cumulative"
                            ? `Cumulative spend curve across ${monthLabel}.`
                            : `Day-by-day spending velocity for ${monthLabel}.`}
                    </p>
                </div>

                <div
                    role="group"
                    aria-label="Chart view mode"
                    className="inline-flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto"
                >
                    {[
                        { id: "daily", label: "Daily" },
                        { id: "cumulative", label: "Cumulative" },
                    ].map((option) => {
                        const isSelected = mode === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setMode(option.id)}
                                aria-pressed={isSelected}
                                className={cn(
                                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                                    isSelected
                                        ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white"
                                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                )}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 flex-1">
                {hasSpending ? (
                    <div className="h-[290px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="analyticsTrendFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={chartColors.fill} stopOpacity={isLight ? 0.22 : 0.18} />
                                        <stop offset="100%" stopColor={chartColors.fill} stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    stroke={chartColors.grid}
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    dataKey="date"
                                    stroke={chartColors.axis}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={26}
                                    tickFormatter={(val) => {
                                        try {
                                            return format(parseISO(val), "MMM d");
                                        } catch {
                                            return val;
                                        }
                                    }}
                                />
                                <YAxis
                                    stroke={chartColors.axis}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={56}
                                    tickFormatter={formatCompactINR}
                                />
                                <Tooltip
                                    content={<CustomTrendTooltip mode={mode} />}
                                    cursor={{ stroke: chartColors.cursor, strokeWidth: 1, strokeDasharray: "3 3" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={chartColors.stroke}
                                    strokeWidth={2}
                                    fill="url(#analyticsTrendFill)"
                                    activeDot={{
                                        r: 4,
                                        fill: chartColors.stroke,
                                        stroke: chartColors.dotStroke,
                                        strokeWidth: 2,
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[290px] w-full rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/20 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-3">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            No spending recorded for {monthLabel}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xs">
                            Log expenses during this period to visualize your daily and cumulative spend curve.
                        </p>
                    </div>
                )}
            </div>

            <div className="px-6 py-3 bg-slate-50/90 dark:bg-zinc-900/40 border-t border-slate-200/90 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>
                    {activeDays > 0
                        ? `${activeDays} active ${activeDays === 1 ? "day" : "days"} logged`
                        : "Waiting for transaction activity"}
                </span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">
                    {mode === "cumulative" ? "Running total" : "Daily total"}
                </span>
            </div>
        </div>
    );
}
