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
    const { dataMap, maxAmount, activeDaysCount } = useMemo(() => {
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
            activeDaysCount: values.length,
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
            return "bg-slate-100/90 border-slate-200/90 text-slate-700 hover:border-slate-300 dark:bg-zinc-900/60 dark:border-zinc-800/70 dark:text-zinc-500 dark:hover:border-zinc-700";
        }
        const ratio = amount / maxAmount;
        if (ratio <= 0.25) {
            return "bg-emerald-100/85 border-emerald-300/90 text-emerald-900 hover:border-emerald-500 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 dark:hover:border-emerald-600";
        }
        if (ratio <= 0.5) {
            return "bg-amber-100/85 border-amber-300/90 text-amber-900 hover:border-amber-500 dark:bg-amber-950/60 dark:border-amber-800/60 dark:text-amber-300 dark:hover:border-amber-600";
        }
        if (ratio <= 0.75) {
            return "bg-orange-100/85 border-orange-300/90 text-orange-900 hover:border-orange-500 dark:bg-orange-950/70 dark:border-orange-700/70 dark:text-orange-300 dark:hover:border-orange-500";
        }
        return "bg-red-100/90 border-red-300/90 text-red-900 hover:border-red-500 dark:bg-red-950/80 dark:border-red-700/80 dark:text-red-200 dark:hover:border-red-500";
    };

    const startDay = getDay(startOfMonth(currentMonth));
    const emptyDays = Array(startDay).fill(null);

    const selectedDayExpenses = selectedDateStr ? expensesByDay[selectedDateStr] || [] : [];
    const selectedDayTotal = selectedDateStr ? dataMap[selectedDateStr] || 0 : 0;

    return (
        <div
            className={cn(
                "rounded-2xl bg-white/95 dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_24px_-14px_rgba(15,23,42,0.08)] dark:shadow-none overflow-hidden transition-colors",
                className
            )}
        >
            <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                        Monthly Spending Heatmap
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        Daily spend intensity for {format(currentMonth, "MMMM yyyy")}. Click any day to inspect transactions.
                    </p>
                </div>

                {/* Intensity Scale Legend */}
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-500 shrink-0">
                    <span>Low</span>
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 dark:bg-zinc-900/80 dark:border-zinc-800" title="No spend" />
                    <span className="w-3 h-3 rounded bg-emerald-200/90 border border-emerald-400/80 dark:bg-emerald-950/70 dark:border-emerald-800/70" title="Up to 25% of peak" />
                    <span className="w-3 h-3 rounded bg-amber-200/90 border border-amber-400/80 dark:bg-amber-950/70 dark:border-amber-800/70" title="26% – 50% of peak" />
                    <span className="w-3 h-3 rounded bg-orange-200/90 border border-orange-400/80 dark:bg-orange-950/80 dark:border-orange-700/80" title="51% – 75% of peak" />
                    <span className="w-3 h-3 rounded bg-red-200/90 border border-red-400/80 dark:bg-red-950/90 dark:border-red-700/90" title="76% – 100% of peak" />
                    <span>Peak</span>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
                <TooltipProvider delayDuration={100}>
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="text-center text-[11px] font-medium text-zinc-600 dark:text-zinc-500 pb-1"
                            >
                                {day}
                            </div>
                        ))}

                        {emptyDays.map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square max-h-12 w-full" />
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
                                                "aspect-square max-h-12 w-full rounded-lg border flex flex-col items-center justify-center text-xs font-medium transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                                                getCellStyle(amount),
                                                isSelected && "ring-2 ring-zinc-900 border-zinc-900 text-zinc-950 dark:ring-white dark:border-white dark:text-white",
                                                isToday && !isSelected && "ring-1 ring-zinc-500/70 dark:ring-zinc-400/70"
                                            )}
                                        >
                                            <span className="tabular-nums">{format(day, "d")}</span>
                                            {amount > 0 && (
                                                <span className="w-1 h-1 rounded-full bg-current opacity-80 mt-0.5 hidden sm:block" />
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-popover border border-slate-200/90 dark:border-zinc-800 text-popover-foreground px-3 py-2 rounded-xl shadow-xl">
                                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                            {format(day, "EEE, MMM d, yyyy")}
                                        </p>
                                        <p className="text-xs font-semibold font-mono text-zinc-950 dark:text-white mt-0.5 tabular-nums">
                                            {formatINR(amount)}
                                        </p>
                                        {txCount > 0 && (
                                            <p className="text-[10px] text-zinc-600 dark:text-zinc-500 mt-0.5">
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
                    <div className="rounded-xl bg-slate-50/90 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                                <span className="text-xs font-medium text-zinc-950 dark:text-white">
                                    {format(parseISO(selectedDateStr), "EEEE, MMMM d, yyyy")}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-800 dark:text-zinc-300 tabular-nums">
                                    {formatINR(selectedDayTotal)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDateStr(null)}
                                aria-label="Close selected day details"
                                className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white p-1 rounded-md hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {selectedDayExpenses.length > 0 ? (
                            <div className="divide-y divide-slate-200/80 dark:divide-zinc-800/80">
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
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-200 truncate">
                                                        {expense.title}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                                                        {expense.category}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-mono font-medium text-zinc-950 dark:text-white tabular-nums shrink-0">
                                                {formatINR(expense.amount)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-600 dark:text-zinc-500">
                                No transactions logged on this day.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="px-6 py-3 bg-slate-50/90 dark:bg-zinc-900/40 border-t border-slate-200/90 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-500">
                <span>
                    {activeDaysCount} of {days.length} days with spending
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-400 tabular-nums">
                    {maxAmount > 0 ? `Peak: ${formatINR(maxAmount)}` : "Peak: ₹0.00"}
                </span>
            </div>
        </div>
    );
}
