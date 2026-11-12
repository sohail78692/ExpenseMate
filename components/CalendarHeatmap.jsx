"use client";

import { useMemo, useState, useEffect } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    format,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    getDay,
    isSameDay,
    parseISO,
} from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { getCategoryStyles } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function CalendarHeatmap({
    data = [],
    rawExpenses = [],
    currentMonth = new Date(),
    className,
}) {
    const [selectedDateStr, setSelectedDateStr] = useState(null);
    const [today, setToday] = useState(null);

    useEffect(() => {
        setToday(new Date());
    }, []);

    // Clear selected day when switching months
    useEffect(() => {
        setSelectedDateStr(null);
    }, [currentMonth]);

    const days = useMemo(
        () =>
            eachDayOfInterval({
                start: startOfMonth(currentMonth),
                end: endOfMonth(currentMonth),
            }),
        [currentMonth]
    );

    // Map yyyy-MM-dd -> total amount
    const { dataMap, maxAmount } = useMemo(() => {
        const map = {};
        data.forEach((item) => {
            const parsed =
                typeof item.date === "string" && item.date.length === 10
                    ? parseISO(item.date)
                    : new Date(item.date);
            const dateStr = format(parsed, "yyyy-MM-dd");
            map[dateStr] = (map[dateStr] || 0) + Number(item.amount || 0);
        });
        const values = Object.values(map).filter((v) => v > 0);
        return {
            dataMap: map,
            maxAmount: values.length > 0 ? Math.max(...values) : 0,
        };
    }, [data]);

    // Group rawExpenses by yyyy-MM-dd for interactive day drill-down
    const expensesByDay = useMemo(() => {
        const grouped = {};
        rawExpenses.forEach((expense) => {
            const dateStr = format(new Date(expense.date), "yyyy-MM-dd");
            if (!grouped[dateStr]) grouped[dateStr] = [];
            grouped[dateStr].push(expense);
        });
        return grouped;
    }, [rawExpenses]);

    const getCellStyle = (amount) => {
        if (!amount || amount <= 0 || maxAmount === 0) {
            return "bg-slate-100/80 border-slate-200/70 text-slate-700 hover:border-slate-300 dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-400 dark:hover:border-white/20";
        }
        const ratio = amount / maxAmount;
        if (ratio <= 0.25) {
            return "bg-emerald-100/85 border-emerald-200/90 text-emerald-900 hover:border-emerald-400 dark:bg-emerald-500/18 dark:border-emerald-400/30 dark:text-emerald-200 dark:hover:border-emerald-400/60";
        }
        if (ratio <= 0.5) {
            return "bg-emerald-200/80 border-emerald-300/85 text-emerald-950 hover:border-emerald-500 dark:bg-emerald-500/28 dark:border-emerald-400/40 dark:text-emerald-100 dark:hover:border-emerald-400/70";
        }
        if (ratio <= 0.75) {
            return "bg-teal-200/90 border-teal-300 text-teal-950 hover:border-teal-500 dark:bg-teal-500/32 dark:border-teal-400/45 dark:text-teal-100 dark:hover:border-teal-400/75";
        }
        return "bg-rose-100/95 border-rose-300/80 text-rose-700 hover:border-rose-400 dark:bg-rose-500/28 dark:border-rose-400/45 dark:text-rose-200 dark:hover:border-rose-400/80";
    };

    const startDay = getDay(startOfMonth(currentMonth));
    const emptyDays = Array(startDay).fill(null);

    const selectedDayExpenses = selectedDateStr ? expensesByDay[selectedDateStr] || [] : [];
    const selectedDayTotal = selectedDateStr ? dataMap[selectedDateStr] || 0 : 0;

    return (
        <div
            className={cn(
                "rounded-[24px] bg-white/78 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_16px_42px_-12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col transition-colors",
                className
            )}
        >
            <div className="p-5 sm:p-6 pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/12 dark:bg-blue-500/15 border border-blue-500/20 dark:border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-none">
                        <CalendarIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                            Monthly Spending Heatmap
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                            Daily spend intensity for {format(currentMonth, "MMMM yyyy")}.
                        </p>
                    </div>
                </div>

                {/* Intensity Scale Legend */}
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400 shrink-0 sm:pt-1">
                    <span>Low</span>
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 dark:bg-white/[0.06] dark:border-white/15" title="No spend" />
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-400/35" title="Up to 25% of peak" />
                    <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300 dark:bg-emerald-500/35 dark:border-emerald-400/50" title="26% – 75% of peak" />
                    <span className="w-3 h-3 rounded bg-rose-200/90 border border-rose-300 dark:bg-rose-500/35 dark:border-rose-400/55" title="Peak (>75%)" />
                    <span>Peak</span>
                </div>
            </div>

            <div className="px-5 sm:px-6 pb-5 pt-1 space-y-4 flex-1 flex flex-col justify-center">
                <TooltipProvider delayDuration={100}>
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="text-center text-[11px] font-semibold text-slate-500 dark:text-zinc-400 pb-1"
                            >
                                {day}
                            </div>
                        ))}

                        {emptyDays.map((_, i) => (
                            <div key={`empty-${i}`} className="h-9 sm:h-10 w-full" />
                        ))}

                        {days.map((day) => {
                            const dateStr = format(day, "yyyy-MM-dd");
                            const amount = dataMap[dateStr] || 0;
                            const isSelected = selectedDateStr === dateStr;
                            const isToday = today ? isSameDay(day, today) : false;
                            const txCount = (expensesByDay[dateStr] || []).length;

                            return (
                                <Tooltip key={dateStr}>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedDateStr((prev) =>
                                                    prev === dateStr ? null : dateStr
                                                )
                                            }
                                            aria-label={`${format(day, "MMMM d, yyyy")}: ${formatINR(amount)}`}
                                            aria-pressed={isSelected}
                                            className={cn(
                                                "h-9 sm:h-10 w-full rounded-xl border flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                                getCellStyle(amount),
                                                isSelected && "ring-2 ring-blue-600 border-blue-600 text-slate-950 dark:ring-sky-400 dark:border-sky-400 dark:text-white shadow-sm",
                                                isToday && !isSelected && "ring-1 ring-blue-500/60 dark:ring-sky-400/60"
                                            )}
                                        >
                                            <span className="tabular-nums">{format(day, "d")}</span>
                                            {amount > 0 && (
                                                <span className="w-1 h-1 rounded-full bg-current opacity-75 mt-0.5 hidden sm:block" />
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-white/15 text-slate-900 dark:text-white px-3 py-2 rounded-2xl shadow-xl backdrop-blur-xl">
                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                            {format(day, "EEE, MMM d, yyyy")}
                                        </p>
                                        <p className="text-xs font-bold font-mono text-slate-950 dark:text-white mt-0.5 tabular-nums">
                                            {formatINR(amount)}
                                        </p>
                                        {txCount > 0 && (
                                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                                {txCount} {txCount === 1 ? "expense" : "expenses"}
                                            </p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </TooltipProvider>

                {/* Interactive Selected-Day Breakdown Drawer */}
                {selectedDateStr && (
                    <div className="rounded-2xl bg-slate-50/85 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 p-3.5 sm:p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                                <span className="text-xs font-semibold text-slate-950 dark:text-white">
                                    {format(parseISO(selectedDateStr), "EEE, MMM d, yyyy")}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/15 text-[11px] font-mono font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
                                    {formatINR(selectedDayTotal)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDateStr(null)}
                                aria-label="Close selected day details"
                                className="text-slate-500 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {selectedDayExpenses.length > 0 ? (
                            <div className="divide-y divide-slate-200/70 dark:divide-white/[0.08]">
                                {selectedDayExpenses.map((expense, idx) => {
                                    const { icon: Icon, color, bg } = getCategoryStyles(expense.category);
                                    return (
                                        <div
                                            key={`${expense.date}-${expense.title}-${idx}`}
                                            className="py-2 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className={cn(
                                                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                                        bg
                                                    )}
                                                >
                                                    <Icon className={cn("w-3.5 h-3.5", color)} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                                                        {expense.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                        {expense.category}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-mono font-semibold text-slate-950 dark:text-white tabular-nums shrink-0">
                                                {formatINR(expense.amount)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                No transactions logged on this day.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
