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
import { CalendarDays, Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS = [
    { id: "1w", label: "1W" },
    { id: "1m", label: "1M" },
    { id: "3m", label: "3M" },
    { id: "6m", label: "6M" },
    { id: "1y", label: "1Y" },
];

const RANGE_DESCRIPTIONS = {
    "1w": "Recent 7-day spending velocity",
    "1m": "Day-by-day spending velocity",
    "3m": "Rolling 3-month spending trajectory",
    "6m": "Rolling 6-month spending trajectory",
    "1y": "Rolling 12-month spending trajectory",
};

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
        formattedDate = format(parseISO(label), "MMM d, yyyy");
    } catch {
        // Keep raw label if non-ISO
    }

    const point = payload[0]?.payload;
    const value = payload[0]?.value ?? 0;

    return (
        <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-indigo-200/75 dark:border-white/15 px-3.5 py-2.5 shadow-[0_12px_32px_rgba(37,99,235,0.16)] dark:shadow-2xl backdrop-blur-xl">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                {formattedDate}
            </p>
            <p className="text-sm font-bold text-slate-950 dark:text-white font-mono tabular-nums mt-0.5">
                {formatINR(value)}
            </p>
            {mode === "cumulative" && point && typeof point.amount === "number" && (
                <div className="flex items-center justify-between gap-3 mt-1 pt-1 border-t border-slate-200/80 dark:border-white/10 text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400">Day spend</span>
                    <span className="text-slate-700 dark:text-zinc-200 font-mono tabular-nums">
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
    range = "1m",
    onRangeChange,
    isLoadingRange = false,
    className,
}) {
    const [mode, setMode] = useState("daily");
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";

    const chartColors = {
        stroke: isLight ? "#4F6EF7" : "#60A5FA",
        fill: isLight ? "#4F6EF7" : "#60A5FA",
        grid: isLight ? "rgba(148, 163, 184, 0.28)" : "rgba(255, 255, 255, 0.08)",
        axis: isLight ? "#64748b" : "#94a3b8",
        cursor: isLight ? "rgba(79, 110, 247, 0.45)" : "rgba(96, 165, 250, 0.45)",
        dotStroke: isLight ? "#ffffff" : "#090d16",
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
    const rangeSubtitle = `${RANGE_DESCRIPTIONS[range] || "Day-by-day spending velocity"} (${monthLabel}).`;

    return (
        <div
            className={cn(
                "rounded-[24px] bg-white/80 dark:bg-[#0d1224]/78 backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_18px_46px_-12px_rgba(0,0,0,0.68),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col transition-colors",
                className
            )}
        >
            {/* Card Header */}
            <div className="p-5 sm:p-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_6px_18px_rgba(59,130,246,0.35)] flex items-center justify-center shrink-0">
                        <TrendingUp className="w-[18px] h-[18px]" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
                            <span>Daily Spending Trend</span>
                            {isLoadingRange && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-sky-400" />
                            )}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 truncate">
                            {mode === "cumulative"
                                ? `Cumulative spend curve for ${monthLabel}.`
                                : rangeSubtitle}
                        </p>
                    </div>
                </div>

                {/* Range & Mode Segmented Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {onRangeChange && (
                        <div
                            role="group"
                            aria-label="Timeframe range"
                            className="inline-flex items-center p-1 rounded-full bg-slate-100/85 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.1] backdrop-blur-xl shadow-xs"
                        >
                            {RANGE_OPTIONS.map((opt) => {
                                const isSelected = range === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => onRangeChange(opt.id)}
                                        aria-pressed={isSelected}
                                        className={cn(
                                            "px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                            isSelected
                                                ? "analytics-glass-pill-active text-white shadow-[0_4px_14px_rgba(99,102,241,0.45)]"
                                                : "text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div
                        role="group"
                        aria-label="Chart view mode"
                        className="inline-flex items-center p-1 rounded-full bg-slate-100/85 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.1] backdrop-blur-xl shadow-xs"
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
                                        "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                        isSelected
                                            ? "analytics-glass-pill-active text-white shadow-[0_4px_14px_rgba(99,102,241,0.45)]"
                                            : "text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white"
                                    )}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Chart Body */}
            <div className={cn("px-3 sm:px-6 pb-4 flex-1 transition-opacity duration-200", isLoadingRange && "opacity-60")}>
                {hasSpending ? (
                    <div className="h-[270px] sm:h-[290px] w-full min-w-0">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                            minWidth={0}
                            minHeight={0}
                            initialDimension={{ width: 640, height: 290 }}
                        >
                            <AreaChart
                                data={chartData}
                                margin={{ top: 14, right: 12, left: -8, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="analyticsTrendFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={chartColors.fill} stopOpacity={isLight ? 0.28 : 0.25} />
                                        <stop offset="100%" stopColor={chartColors.fill} stopOpacity={0.01} />
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
                                    minTickGap={range === "6m" || range === "1y" ? 42 : 28}
                                    tickFormatter={(val) => {
                                        try {
                                            return format(
                                                parseISO(val),
                                                range === "6m" || range === "1y" ? "MMM yy" : "MMM d"
                                            );
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
                                    width={54}
                                    tickFormatter={formatCompactINR}
                                />
                                <Tooltip
                                    content={<CustomTrendTooltip mode={mode} />}
                                    cursor={{ stroke: chartColors.cursor, strokeWidth: 1.5, strokeDasharray: "4 4" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={chartColors.stroke}
                                    strokeWidth={2.5}
                                    fill="url(#analyticsTrendFill)"
                                    activeDot={{
                                        r: 5,
                                        fill: chartColors.stroke,
                                        stroke: chartColors.dotStroke,
                                        strokeWidth: 2.5,
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[270px] sm:h-[290px] w-full rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center px-6">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 mb-3">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                            No spending recorded for {monthLabel}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-xs">
                            Log expenses during this period to visualize your daily and cumulative spend curve.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50/65 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                    <span>
                        {activeDays > 0
                            ? `${activeDays} active ${activeDays === 1 ? "day" : "days"} logged`
                            : "Waiting for transaction activity"}
                    </span>
                </span>
                <span className="font-medium text-slate-600 dark:text-zinc-400">
                    {mode === "cumulative" ? "Running total" : "Daily total"}
                </span>
            </div>
        </div>
    );
}
