"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { getCategoryStyles } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function CustomCategoryTooltip({ active, payload, total }) {
    if (!active || !payload || !payload.length) return null;

    const entry = payload[0]?.payload;
    if (!entry) return null;

    const share = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
    const { hex } = getCategoryStyles(entry.name);

    return (
        <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-white/15 px-3.5 py-2.5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: hex }}
                />
                <span className="text-xs font-semibold text-slate-950 dark:text-white">{entry.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-slate-500 dark:text-zinc-400">{share}% of spend</span>
                <span className="font-mono font-semibold text-slate-950 dark:text-white tabular-nums">
                    {formatINR(entry.value)}
                </span>
            </div>
        </div>
    );
}

export default function CategoryPieChart({ data = [], onSelectCategory, className }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";

    const total = useMemo(
        () => data.reduce((sum, item) => sum + Number(item.value || 0), 0),
        [data]
    );

    const activeSlice =
        hoveredIndex !== null && data[hoveredIndex] ? data[hoveredIndex] : null;

    const activePercent =
        activeSlice && total > 0
            ? ((activeSlice.value / total) * 100).toFixed(1)
            : null;

    return (
        <div
            className={cn(
                "rounded-[24px] bg-white/80 dark:bg-[#0d1224]/78 backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_18px_46px_-12px_rgba(0,0,0,0.68),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col transition-colors",
                className
            )}
        >
            {/* Card Header */}
            <div className="p-5 sm:p-6 pb-3 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_6px_18px_rgba(99,102,241,0.35)] flex items-center justify-center shrink-0">
                    <PieChartIcon className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">
                        Spending by Category
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                        Distribution across your active expense categories.
                    </p>
                </div>
            </div>

            {/* Side-by-side Donut & Legend on sm+, stacked cleanly on mobile */}
            <div className="px-5 sm:px-6 pb-6 pt-2 flex-1 flex flex-col justify-center">
                {data.length > 0 && total > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                        {/* Donut Ring */}
                        <div className="relative h-[196px] w-[196px] sm:h-[210px] sm:w-[210px] shrink-0 mx-auto sm:mx-0">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                                minWidth={0}
                                minHeight={0}
                                initialDimension={{ width: 205, height: 205 }}
                            >
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={62}
                                        outerRadius={88}
                                        paddingAngle={data.length > 1 ? 3 : 0}
                                        cornerRadius={4}
                                        dataKey="value"
                                        onMouseEnter={(_, idx) => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        onClick={(entry) => {
                                            if (entry?.name && onSelectCategory) {
                                                onSelectCategory(entry.name);
                                            }
                                        }}
                                    >
                                        {data.map((entry, index) => {
                                            const { hex } = getCategoryStyles(entry.name);
                                            const isDimmed =
                                                hoveredIndex !== null && hoveredIndex !== index;
                                            return (
                                                <Cell
                                                    key={`cell-${entry.name}-${index}`}
                                                    fill={hex}
                                                    stroke={isLight ? "rgba(255,255,255,0.9)" : "rgba(15,23,42,0.85)"}
                                                    strokeWidth={2}
                                                    fillOpacity={isDimmed ? 0.35 : 1}
                                                    className="transition-opacity duration-200 cursor-pointer outline-none"
                                                />
                                            );
                                        })}
                                    </Pie>
                                    <Tooltip content={<CustomCategoryTooltip total={total} />} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Centered Donut Readout */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate max-w-[110px]">
                                    {activeSlice ? activeSlice.name : "Total Spent"}
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-950 dark:text-white font-mono tabular-nums mt-0.5">
                                    {formatINR(activeSlice ? activeSlice.value : total)}
                                </span>
                                {activePercent && (
                                    <span className="text-[10px] font-medium text-blue-600 dark:text-sky-400 mt-0.5">
                                        {activePercent}%
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Clean Category Breakdown Legend */}
                        <div className="flex-1 w-full min-w-0 space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                            {data.slice(0, 7).map((entry, index) => {
                                const { hex } = getCategoryStyles(entry.name);
                                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
                                const isActive = hoveredIndex === index;
                                return (
                                    <button
                                        key={`legend-${entry.name}-${index}`}
                                        type="button"
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        onClick={() => onSelectCategory?.(entry.name)}
                                        className={cn(
                                            "w-full flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 rounded-xl transition-all cursor-pointer text-left",
                                            isActive
                                                ? "bg-slate-100/90 text-slate-950 dark:bg-white/[0.08] dark:text-white"
                                                : "text-slate-700 hover:bg-slate-100/60 dark:text-zinc-300 dark:hover:bg-white/[0.05]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: hex }}
                                            />
                                            <span className="font-medium truncate">{entry.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 tabular-nums">
                                            <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium w-10 text-right">
                                                {pct}%
                                            </span>
                                            <span className="text-slate-950 dark:text-white font-semibold font-mono text-xs">
                                                {formatINR(entry.value)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-[220px] w-full rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center px-6">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 mb-3">
                            <PieChartIcon className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">No category breakdown</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            Category distribution will appear once expenses are logged.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
