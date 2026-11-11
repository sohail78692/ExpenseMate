"use client";

import { useState, useMemo } from "react";
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
        <div className="rounded-xl bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: hex }}
                />
                <span className="text-xs font-medium text-zinc-950 dark:text-white">{entry.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">{share}% of spend</span>
                <span className="font-mono font-semibold text-zinc-950 dark:text-white tabular-nums">
                    {formatINR(entry.value)}
                </span>
            </div>
        </div>
    );
}

export default function CategoryPieChart({ data = [], className }) {
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
                "rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden flex flex-col transition-colors",
                className
            )}
        >
            <div className="p-6 pb-2">
                <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Spending by Category</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Distribution across your active expense categories.
                </p>
            </div>

            <div className="px-6 pb-5 flex-1 flex flex-col justify-between">
                {data.length > 0 && total > 0 ? (
                    <>
                        <div className="relative h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={62}
                                        outerRadius={86}
                                        paddingAngle={data.length > 1 ? 3 : 0}
                                        dataKey="value"
                                        onMouseEnter={(_, idx) => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {data.map((entry, index) => {
                                            const { hex } = getCategoryStyles(entry.name);
                                            const isDimmed =
                                                hoveredIndex !== null && hoveredIndex !== index;
                                            return (
                                                <Cell
                                                    key={`cell-${entry.name}-${index}`}
                                                    fill={hex}
                                                    stroke={isLight ? "#ffffff" : "#09090b"}
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
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[110px]">
                                    {activeSlice ? activeSlice.name : "Total Spend"}
                                </span>
                                <span className="text-sm sm:text-base font-semibold text-zinc-950 dark:text-white font-mono tabular-nums mt-0.5">
                                    {formatINR(activeSlice ? activeSlice.value : total)}
                                </span>
                                <span className="text-[10px] text-zinc-500 mt-0.5">
                                    {activePercent
                                        ? `${activePercent}% share`
                                        : `${data.length} ${data.length === 1 ? "category" : "categories"}`}
                                </span>
                            </div>
                        </div>

                        {/* Clean Monochromatic Legend List */}
                        <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 max-h-[132px] overflow-y-auto pr-1">
                            {data.slice(0, 6).map((entry, index) => {
                                const { hex } = getCategoryStyles(entry.name);
                                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
                                const isActive = hoveredIndex === index;
                                return (
                                    <div
                                        key={`legend-${entry.name}-${index}`}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={cn(
                                            "flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors cursor-default",
                                            isActive
                                                ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white"
                                                : "text-zinc-600 dark:text-zinc-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: hex }}
                                            />
                                            <span className="truncate">{entry.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0 font-mono tabular-nums">
                                            <span className="text-zinc-500 text-[11px]">{pct}%</span>
                                            <span className="text-zinc-800 dark:text-zinc-200">{formatINR(entry.value)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="h-[290px] w-full rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/20 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-3">
                            <PieChartIcon className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No category breakdown</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Category distribution will appear once expenses are logged.
                        </p>
                    </div>
                )}
            </div>

            <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>Hover a slice to inspect</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">
                    {data.length > 6 ? `Top 6 of ${data.length}` : `${data.length} active`}
                </span>
            </div>
        </div>
    );
}
