"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { format, addMonths, subMonths, isSameMonth, getDaysInMonth } from "date-fns";
import {
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDown,
    Wallet,
    Target,
    PieChart,
    Plus,
    Receipt,
    Gauge,
    CalendarDays,
    Calendar,
    AlertTriangle,
    Bell,
    Info,
    CreditCard,
    Check,
    X,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    BarChart3,
    Crown,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExpenseForm from "@/components/ExpenseForm";
import { getCategoryStyles } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

interface ExpenseItem {
    _id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string;
    paymentMethod?: string;
}

interface BudgetItem {
    _id: string;
    category: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    alertThreshold: number;
}

interface RecommendationItem {
    type: string;
    title: string;
    message: string;
    icon: string;
}

interface SavingsGoalItem {
    _id: string;
    name?: string;
    title?: string;
    icon?: string;
    category?: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    remaining: number;
    daysLeft: number;
    deadline: string;
    isCompleted?: boolean;
}

interface DashboardClientProps {
    initialData: {
        dashboard: {
            totalSpent: number;
            todaySpent: number;
            highestCategory: { _id: string; total: number } | null;
            dailyTrend: { _id: string; amount: number }[];
            recentExpenses: ExpenseItem[];
        } | null;
        budgetsAndInsights: {
            budgets: BudgetItem[];
            insights: {
                monthlyComparison: {
                    current: number;
                    last: number;
                    change: string | number;
                    trend: "up" | "down";
                };
                topCategories: { category: string; amount: number; count: number }[];
                budgetAlerts: { category: string; budget: number; spent: number; percentage: string }[];
                averagePerDay?: string | number;
                totalTransactions?: number;
                recommendations: RecommendationItem[];
            };
        } | null;
        savings: {
            goals: SavingsGoalItem[];
        } | null;
        user: {
            name?: string;
            email?: string;
        } | null;
    };
}

const GLASS_CARD =
    "rounded-[24px] bg-white/82 dark:bg-[#0d1224]/78 backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_18px_46px_-12px_rgba(0,0,0,0.68),inset_0_1px_1px_rgba(255,255,255,0.08)]";

const BREAKDOWN_COLORS: Record<string, string> = {
    Housing: "#8B5CF6",
    Shopping: "#EC4899",
    Food: "#F59E0B",
    Utilities: "#06B6D4",
    Transport: "#3B82F6",
    Entertainment: "#A855F7",
    Health: "#EF4444",
    Other: "#94A3B8",
};

function getSliceColor(category: string) {
    if (!category) return BREAKDOWN_COLORS.Other;
    const match = Object.keys(BREAKDOWN_COLORS).find(
        (key) => key.toLowerCase() === category.toLowerCase()
    );
    if (match) return BREAKDOWN_COLORS[match];
    return getCategoryStyles(category).hex || BREAKDOWN_COLORS.Other;
}

function formatINR(value: number) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatCompactAxis(value: number) {
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${Math.round(value / 1000)}K`;
    return `${value}`;
}

function getRecommendationTheme(type: string) {
    if (type === "warning") {
        return {
            Icon: AlertTriangle,
            href: "/expenses",
            cardClass:
                "bg-gradient-to-br from-amber-50/90 via-white/82 to-orange-50/45 border-amber-200/80 dark:from-amber-500/[0.15] dark:via-[#171322]/85 dark:to-orange-950/30 dark:border-amber-500/30",
            badgeClass:
                "bg-amber-500/15 border-amber-500/35 text-amber-600 dark:bg-amber-500/20 dark:border-amber-400/35 dark:text-amber-300",
        };
    }
    if (type === "alert") {
        return {
            Icon: Bell,
            href: "/budgets",
            cardClass:
                "bg-gradient-to-br from-rose-50/90 via-white/82 to-pink-50/45 border-rose-200/80 dark:from-rose-500/[0.15] dark:via-[#191124]/85 dark:to-pink-950/30 dark:border-rose-500/30",
            badgeClass:
                "bg-rose-500/15 border-rose-500/35 text-rose-600 dark:bg-rose-500/20 dark:border-rose-400/35 dark:text-rose-300",
        };
    }
    if (type === "success") {
        return {
            Icon: TrendingDown,
            href: "/analytics",
            cardClass:
                "bg-gradient-to-br from-emerald-50/90 via-white/82 to-teal-50/45 border-emerald-200/80 dark:from-emerald-500/[0.15] dark:via-[#0e1b24]/85 dark:to-teal-950/30 dark:border-emerald-500/30",
            badgeClass:
                "bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-400/35 dark:text-emerald-300",
        };
    }
    return {
        Icon: Info,
        href: "/analytics",
        cardClass:
            "bg-gradient-to-br from-sky-50/90 via-white/82 to-indigo-50/45 border-sky-200/80 dark:from-blue-500/[0.15] dark:via-[#10162b]/85 dark:to-indigo-950/30 dark:border-blue-400/30",
        badgeClass:
            "bg-sky-500/15 border-sky-500/35 text-blue-600 dark:bg-sky-500/20 dark:border-sky-400/35 dark:text-sky-300",
    };
}

/** Builds smooth decorative cubic Bezier curves for KPI sparklines. */
function buildSparklinePaths(values: number[], width = 108, height = 38) {
    const pts = values && values.length >= 2 ? values : [20, 44, 34, 66, 52, 84];
    const max = Math.max(...pts, 1);
    const min = Math.min(...pts, 0);
    const span = max - min || 1;
    const padY = 4;
    const usableH = height - padY * 2;
    const stepX = width / Math.max(1, pts.length - 1);

    const coords = pts.map((v, i) => {
        const norm = (v - min) / span;
        const x = i * stepX;
        const y = height - padY - norm * usableH;
        return [x, y];
    });

    let line = `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const [x0, y0] = coords[i];
        const [x1, y1] = coords[i + 1];
        const cx = ((x0 + x1) / 2).toFixed(1);
        line += ` C ${cx} ${y0.toFixed(1)}, ${cx} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    const area = `${line} L ${width} ${height} L 0 ${height} Z`;
    return { line, area };
}

function MiniWaveSparkline({
    id,
    color,
    values,
    className,
}: {
    id: string;
    color: string;
    values: number[];
    className?: string;
}) {
    const { line, area } = useMemo(() => buildSparklinePaths(values), [values]);
    return (
        <svg
            viewBox="0 0 108 38"
            className={cn("overflow-visible pointer-events-none select-none", className)}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.44" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${id})`} />
            <path
                d={line}
                fill="none"
                stroke={color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"feed" | "budgets" | "heatmap">(
        "feed"
    );
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [now] = useState(() => new Date());

    // Heatmap month navigation state (defaults to current month using server data)
    const [heatmapDate, setHeatmapDate] = useState<Date>(() => new Date());
    const [fetchedHeatmapTrend, setFetchedHeatmapTrend] = useState<
        { date: string; amount: number }[] | null
    >(null);
    const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);

    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    const { dashboard, budgetsAndInsights, savings, user } = initialData;

    const totalSpent = dashboard?.totalSpent || 0;
    const todaySpent = dashboard?.todaySpent || 0;
    const highestCategory = dashboard?.highestCategory;
    const recentExpenses = dashboard?.recentExpenses || [];
    const dailyTrend = useMemo(() => dashboard?.dailyTrend || [], [dashboard]);

    const budgets = useMemo(() => budgetsAndInsights?.budgets || [], [budgetsAndInsights]);
    const insights = budgetsAndInsights?.insights;
    const recommendations = insights?.recommendations || [];
    const savingsGoals = useMemo(() => savings?.goals || [], [savings]);

    // Calculate total budget without double-counting when a "Total" cap exists
    const { totalBudget, remainingBudget, budgetPct } = useMemo(() => {
        const masterCap = budgets.find((b) => b.category === "Total");
        const categoryBudgets = budgets.filter((b) => b.category !== "Total");
        const limit = masterCap
            ? masterCap.amount
            : categoryBudgets.reduce((acc, b) => acc + b.amount, 0);
        const remaining = limit > 0 ? limit - totalSpent : 0;
        const pct = limit > 0 ? Math.round((totalSpent / limit) * 100) : null;
        return { totalBudget: limit, remainingBudget: remaining, budgetPct: pct };
    }, [budgets, totalSpent]);

    const primaryGoal = useMemo(() => {
        const active = savingsGoals.filter((g) => !g.isCompleted);
        return active.length > 0 ? active[0] : savingsGoals.length > 0 ? savingsGoals[0] : null;
    }, [savingsGoals]);

    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    const currentMonthName = format(now, "MMMM");

    // Fetch heatmap trend when switching away from current month
    const handleHeatmapMonthChange = async (nextDate: Date) => {
        setHeatmapDate(nextDate);
        if (isSameMonth(nextDate, now)) {
            setFetchedHeatmapTrend(null);
            return;
        }
        setIsLoadingHeatmap(true);
        try {
            const isoParam = format(nextDate, "yyyy-MM-15");
            const res = await fetch(`/api/analytics?date=${isoParam}&range=1m`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error("Failed to load month activity");
            const payload = await res.json();
            setFetchedHeatmapTrend(payload.heatmapData || payload.dailyTrend || []);
        } catch {
            setFetchedHeatmapTrend([]);
        } finally {
            setIsLoadingHeatmap(false);
        }
    };

    // Heatmap calculations for selected heatmap month
    const heatmapYear = heatmapDate.getFullYear();
    const heatmapMonthIndex = heatmapDate.getMonth();
    const heatmapMonthName = format(heatmapDate, "MMMM");
    const heatmapDaysInMonth = getDaysInMonth(heatmapDate);
    const heatmapFirstDayOfWeek = new Date(heatmapYear, heatmapMonthIndex, 1).getDay();

    const activeHeatmapRaw = useMemo(() => {
        if (fetchedHeatmapTrend !== null) {
            return fetchedHeatmapTrend.map((d) => ({ _id: d.date, amount: d.amount }));
        }
        return dailyTrend;
    }, [fetchedHeatmapTrend, dailyTrend]);

    const heatmapStats = useMemo(() => {
        const map: Record<number, number> = {};
        const weekdayTotals = [0, 0, 0, 0, 0, 0, 0];
        let peakAmount = 0;
        let peakDay = 0;
        let lowestPositiveAmount = Infinity;
        let lowestPositiveDay = 0;
        let activeDays = 0;
        let monthTotal = 0;

        activeHeatmapRaw.forEach((item) => {
            const parts = String(item._id || "").split("-");
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (y === heatmapYear && m === heatmapMonthIndex + 1 && !Number.isNaN(d)) {
                map[d] = (map[d] || 0) + Number(item.amount || 0);
            }
        });

        for (let day = 1; day <= heatmapDaysInMonth; day++) {
            const amt = map[day] || 0;
            if (amt > 0) {
                activeDays += 1;
                monthTotal += amt;
                const dow = new Date(heatmapYear, heatmapMonthIndex, day).getDay();
                weekdayTotals[dow] += amt;
                if (amt > peakAmount) {
                    peakAmount = amt;
                    peakDay = day;
                }
                if (amt < lowestPositiveAmount) {
                    lowestPositiveAmount = amt;
                    lowestPositiveDay = day;
                }
            }
        }

        const weekdayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        let topWeekdayIdx = 0;
        weekdayTotals.forEach((val, idx) => {
            if (val > weekdayTotals[topWeekdayIdx]) topWeekdayIdx = idx;
        });

        const avgDaily = activeDays > 0 ? monthTotal / activeDays : 0;

        return {
            spendingMap: map,
            activeDays,
            monthTotal,
            avgDaily,
            peakAmount,
            peakDay,
            lowestAmount: lowestPositiveAmount === Infinity ? 0 : lowestPositiveAmount,
            lowestDay: lowestPositiveDay,
            topWeekday: weekdayTotals[topWeekdayIdx] > 0 ? weekdayNames[topWeekdayIdx] : null,
        };
    }, [activeHeatmapRaw, heatmapYear, heatmapMonthIndex, heatmapDaysInMonth]);

    // Sparkline series for Month Spend & Budget Status KPI cards
    const spendSparkSeries = useMemo(() => {
        if (dailyTrend.length >= 2) {
            return dailyTrend.slice(-8).map((d) => Number(d.amount || 0));
        }
        return [18, 42, 30, 58, 46, 78];
    }, [dailyTrend]);

    const budgetSparkSeries = useMemo(() => {
        if (spendSparkSeries.length >= 2 && totalBudget > 0) {
            let cum = 0;
            return spendSparkSeries.map((amt) => {
                cum += amt;
                return Math.max(0, totalBudget - cum);
            });
        }
        return [82, 74, 68, 60, 52, 48];
    }, [spendSparkSeries, totalBudget]);

    // Budget Guardrails tab: Donut Breakdown + Budget vs Spending Cumulative Area Series
    const budgetVisuals = useMemo(() => {
        const categoryRows = budgets.filter((b) => b.category !== "Total");
        const donutSource =
            categoryRows.length > 0
                ? categoryRows.map((b) => ({
                      name: b.category,
                      value: Number(b.spent || 0),
                  }))
                : (insights?.topCategories || []).map((c) => ({
                      name: c.category,
                      value: Number(c.amount || 0),
                  }));

        const positiveSlices = donutSource.filter((d) => d.value > 0);
        const totalSliceValue = positiveSlices.reduce((s, d) => s + d.value, 0);
        const legendRows = donutSource
            .slice()
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
            .map((item) => ({
                ...item,
                color: getSliceColor(item.name),
                pct:
                    totalSliceValue > 0
                        ? ((item.value / totalSliceValue) * 100).toFixed(1)
                        : "0.0",
            }));

        const donutData =
            positiveSlices.length > 0
                ? positiveSlices.map((d) => ({
                      ...d,
                      color: getSliceColor(d.name),
                  }))
                : [{ name: "No Spending", value: 1, color: isDark ? "#1e293b" : "#cbd5e1" }];

        // Cumulative daily spending across current month
        const daysCount = getDaysInMonth(now);
        const byDay: Record<number, number> = {};
        dailyTrend.forEach((item) => {
            const parts = String(item._id || "").split("-");
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (y === currentYear && m === currentMonthIndex + 1 && !Number.isNaN(d)) {
                byDay[d] = (byDay[d] || 0) + Number(item.amount || 0);
            }
        });

        const areaData: { label: string; spent: number; budget: number }[] = [];
        let running = 0;
        const shortMonth = format(now, "MMM");
        for (let d = 1; d <= daysCount; d++) {
            running += byDay[d] || 0;
            areaData.push({
                label: `${shortMonth} ${d}`,
                spent: running,
                budget: totalBudget,
            });
        }

        return {
            categoryRows,
            donutData,
            legendRows,
            areaData,
            hasPositiveSpend: positiveSlices.length > 0,
        };
    }, [budgets, insights, dailyTrend, now, currentYear, currentMonthIndex, totalBudget, isDark]);

    const handleExpenseAdded = (newExpense: ExpenseItem) => {
        setToastMessage(`Logged "${newExpense.title}" (${formatINR(newExpense.amount)})`);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(""), 4200);
        router.refresh();
    };

    const comparison = insights?.monthlyComparison;
    const comparisonNum = comparison ? Number(comparison.change || 0) : 0;

    const tabs: {
        id: "feed" | "budgets" | "heatmap";
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        count?: number;
    }[] = [
        { id: "feed", label: "Recent Feed", icon: Receipt, count: recentExpenses.length },
        { id: "budgets", label: "Budget Guardrails", icon: Gauge, count: budgets.length },
        { id: "heatmap", label: "Activity Heatmap", icon: CalendarDays },
    ];

    const handleTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        setActiveWorkspaceTab(tabs[nextIndex].id);
    };

    // Heatmap tile class based on spending tier matching the legend
    const getHeatmapTileStyle = (spent: number) => {
        if (spent <= 0) {
            return "bg-slate-100/85 border-slate-200/80 text-slate-600 dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-500";
        }
        if (spent <= 500) {
            return "bg-emerald-100/90 border-emerald-300/90 text-emerald-900 dark:bg-emerald-500/25 dark:border-emerald-400/40 dark:text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]";
        }
        if (spent <= 2000) {
            return "bg-amber-100/90 border-amber-300/90 text-amber-950 dark:bg-amber-400/30 dark:border-amber-400/50 dark:text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]";
        }
        if (spent <= 5000) {
            return "bg-orange-100/95 border-orange-300 text-orange-950 dark:bg-orange-500/40 dark:border-orange-400/55 dark:text-orange-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]";
        }
        return "bg-rose-100/95 border-rose-300 text-rose-950 dark:bg-rose-500/45 dark:border-rose-400/60 dark:text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]";
    };

    return (
        <div className="relative w-full space-y-6 pb-28 lg:pb-10 text-slate-900 dark:text-zinc-100">
            {/* Soft Atmospheric Liquid-Glass Canvas Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-indigo-300/25 blur-[140px] dark:bg-indigo-600/18" />
                <div className="absolute top-12 -right-24 h-[500px] w-[500px] rounded-full bg-violet-300/25 blur-[140px] dark:bg-violet-600/18" />
                <div className="absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full bg-sky-300/25 blur-[135px] dark:bg-blue-600/14" />
                <div className="absolute bottom-8 right-1/4 h-[360px] w-[360px] rounded-full bg-fuchsia-200/20 blur-[120px] dark:bg-fuchsia-500/10" />
            </div>

            {/* Centered Floating Liquid-Glass Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-20 sm:top-22 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
                    >
                        <div
                            role="status"
                            aria-live="polite"
                            className="pointer-events-auto relative overflow-hidden w-fit max-w-full rounded-full pl-2.5 pr-2 py-2 flex items-center gap-3 text-xs sm:text-[13px] font-medium backdrop-blur-2xl shadow-2xl border bg-white/92 border-white/95 text-slate-900 ring-1 ring-emerald-500/25 dark:bg-zinc-900/92 dark:border-white/15 dark:text-white dark:ring-emerald-400/25"
                        >
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-300">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                            <span className="truncate">{toastMessage}</span>
                            <button
                                type="button"
                                onClick={() => setToastMessage("")}
                                aria-label="Dismiss notification"
                                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Header with Action Bar + Uploaded 3D Dashboard Illustration */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="relative z-10 min-w-0 flex-1 space-y-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/[0.06] border border-white/95 dark:border-white/[0.11] backdrop-blur-xl shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                                <span className="text-slate-800 dark:text-zinc-100">Live Workspace</span>
                            </span>
                            <span className="text-slate-400 dark:text-zinc-600">|</span>
                            <span
                                className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 tabular-nums"
                                suppressHydrationWarning
                            >
                                <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                                <span>{format(now, "EEE, MMM d, yyyy")}</span>
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.08] bg-gradient-to-r from-slate-950 via-indigo-700 to-fuchsia-600 dark:from-white dark:via-indigo-200 dark:to-fuchsia-400 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
                            Welcome back,{" "}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {user?.name || "Member"}
                            </span>
                            .
                            <br className="hidden sm:block" />{" "}
                            Here is your {currentMonthName} spending snapshot and budget guardrails.
                        </p>
                    </div>

                    {/* Hero Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                        <Link
                            href="/analytics"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-[13px] font-medium bg-white/85 hover:bg-white text-slate-700 hover:text-slate-950 border border-white/95 dark:bg-[#131831]/80 dark:hover:bg-[#192040] dark:text-zinc-200 dark:hover:text-white dark:border-white/[0.12] backdrop-blur-xl shadow-[0_6px_18px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.4)] transition-all"
                        >
                            <PieChart className="w-3.5 h-3.5" />
                            <span>Analytics</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsExpenseModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 hover:brightness-110 text-white shadow-[0_8px_24px_-4px_rgba(124,58,237,0.55)] hover:shadow-[0_12px_28px_-4px_rgba(124,58,237,0.7)] transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.25]" />
                            <span>Add Expense</span>
                        </button>
                    </div>
                </div>

                {/* Right-Aligned Uploaded Hero Illustration */}
                <div className="relative flex justify-center md:justify-end items-center shrink-0">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 scale-110 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22),rgba(59,130,246,0.1)_55%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.34),rgba(59,130,246,0.14)_55%,transparent_75%)] blur-2xl pointer-events-none"
                    />
                    <Image
                        src="/images/dashboard-hero.png"
                        alt="3D dashboard analytics chart, receipt, and ring illustration"
                        width={1024}
                        height={682}
                        priority
                        className="relative z-10 w-[210px] sm:w-[260px] lg:w-[305px] xl:w-[330px] h-auto object-contain drop-shadow-[0_14px_30px_rgba(79,70,229,0.22)] dark:drop-shadow-[0_18px_38px_rgba(139,92,246,0.38)] select-none pointer-events-none"
                    />
                </div>
            </div>

            {/* Top 4 KPI Summary Cards (Single Row on Laptop/Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Current Month Spend (Rose/Pink) */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-4 xl:p-5 flex flex-col justify-between min-h-[148px] bg-gradient-to-br from-rose-50/90 via-white/85 to-pink-50/55 dark:from-rose-600/[0.17] dark:via-[#151126]/88 dark:to-pink-950/35 dark:border-rose-400/25"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-rose-400/20 blur-2xl dark:bg-rose-500/20"
                    />
                    <div className="relative z-10 flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-[0_6px_18px_rgba(244,63,94,0.4)] flex items-center justify-center shrink-0">
                            <Wallet className="w-[18px] h-[18px]" />
                        </div>

                        {comparison && comparison.last > 0 ? (
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums border shrink-0",
                                    comparison.trend === "up"
                                        ? "bg-rose-100/90 border-rose-200 text-rose-700 dark:bg-rose-500/18 dark:border-rose-400/35 dark:text-rose-300"
                                        : "bg-emerald-100/90 border-emerald-200 text-emerald-700 dark:bg-emerald-500/18 dark:border-emerald-400/35 dark:text-emerald-300"
                                )}
                            >
                                {comparison.trend === "up" ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                <span>{comparisonNum > 0 ? `+${comparisonNum}%` : `${comparisonNum}%`}</span>
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/90 border border-slate-200/80 text-slate-600 dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-zinc-300 shrink-0">
                                Active
                            </span>
                        )}
                    </div>

                    <div className="relative z-10 mt-3 pr-16">
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-300/90 truncate">
                            {currentMonthName} Spend
                        </p>
                        <p className="text-xl xl:text-2xl font-bold tracking-tight text-slate-950 dark:text-white tabular-nums mt-0.5 truncate">
                            {formatINR(totalSpent)}
                        </p>
                        <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 tabular-nums mt-1 truncate">
                            Today: {formatINR(todaySpent)}
                        </p>
                    </div>

                    <MiniWaveSparkline
                        id="dash-spend-spark"
                        color="#F43F5E"
                        values={spendSparkSeries}
                        className="absolute bottom-2.5 right-3 w-[82px] h-[30px] opacity-95"
                    />
                </div>

                {/* 2. Budget Status (Emerald) */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-4 xl:p-5 flex flex-col justify-between min-h-[148px] bg-gradient-to-br from-emerald-50/90 via-white/85 to-teal-50/55 dark:from-emerald-500/[0.16] dark:via-[#0d1926]/88 dark:to-teal-950/30 dark:border-emerald-400/25"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl dark:bg-emerald-500/20"
                    />
                    <div className="relative z-10 flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_6px_18px_rgba(16,185,129,0.38)] flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-[18px] h-[18px]" />
                        </div>

                        {budgetPct !== null ? (
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0",
                                    budgetPct >= 100
                                        ? "bg-rose-100/90 border-rose-200 text-rose-700 dark:bg-rose-500/18 dark:border-rose-400/35 dark:text-rose-300"
                                        : budgetPct >= 80
                                        ? "bg-amber-100/90 border-amber-200 text-amber-700 dark:bg-amber-500/18 dark:border-amber-400/35 dark:text-amber-300"
                                        : "bg-emerald-100/90 border-emerald-200 text-emerald-700 dark:bg-emerald-500/18 dark:border-emerald-400/35 dark:text-emerald-300"
                                )}
                            >
                                {budgetPct >= 100
                                    ? "Exceeded"
                                    : budgetPct >= 80
                                    ? `${budgetPct}% Used`
                                    : "On Track"}
                            </span>
                        ) : (
                            <Link
                                href="/budgets/new"
                                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-950 dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-zinc-200 dark:hover:text-white shrink-0"
                            >
                                Set Cap
                            </Link>
                        )}
                    </div>

                    <div className="relative z-10 mt-3 pr-16">
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-300/90 truncate">
                            Budget Status
                        </p>
                        <p
                            className={cn(
                                "text-xl xl:text-2xl font-bold tracking-tight tabular-nums mt-0.5 truncate",
                                remainingBudget < 0
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-slate-950 dark:text-white"
                            )}
                        >
                            {totalBudget > 0 ? formatINR(remainingBudget) : "₹0.00"}
                        </p>
                        <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 tabular-nums mt-1 truncate">
                            {totalBudget > 0
                                ? `Of ${formatINR(totalBudget)} cap`
                                : "No limit set"}
                        </p>
                    </div>

                    <MiniWaveSparkline
                        id="dash-budget-spark"
                        color="#10B981"
                        values={budgetSparkSeries}
                        className="absolute bottom-2.5 right-3 w-[82px] h-[30px] opacity-95"
                    />
                </div>

                {/* 3. Primary Goal / Top Category (Indigo/Cyan) */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-4 xl:p-5 flex flex-col justify-between min-h-[148px] bg-gradient-to-br from-indigo-50/90 via-white/85 to-cyan-50/55 dark:from-indigo-600/[0.18] dark:via-[#0f152a]/88 dark:to-cyan-950/30 dark:border-indigo-400/25"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl dark:bg-indigo-500/20"
                    />
                    <div className="relative z-10 flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_6px_18px_rgba(99,102,241,0.38)] flex items-center justify-center shrink-0">
                            <Target className="w-[18px] h-[18px]" />
                        </div>
                        {primaryGoal ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/90 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/18 dark:border-emerald-400/35 dark:text-emerald-300 tabular-nums shrink-0">
                                {Number(primaryGoal.progress || 0).toFixed(1).replace(/\.0$/, "")}%
                            </span>
                        ) : highestCategory ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-100/90 border border-indigo-200 text-indigo-700 dark:bg-indigo-500/18 dark:border-indigo-400/35 dark:text-indigo-300 shrink-0">
                                Leading
                            </span>
                        ) : null}
                    </div>

                    <div className="relative z-10 mt-3 min-w-0">
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-300/90 truncate">
                            {primaryGoal ? "Primary Goal" : "Top Category"}
                        </p>
                        <p className="text-base xl:text-[18px] font-bold tracking-tight text-slate-950 dark:text-white mt-0.5 truncate">
                            {primaryGoal
                                ? primaryGoal.name || primaryGoal.title || "Savings Goal"
                                : highestCategory
                                ? highestCategory._id
                                : "No Activity"}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 tabular-nums truncate">
                            {primaryGoal
                                ? `${formatINR(primaryGoal.currentAmount)} of ${formatINR(primaryGoal.targetAmount)}`
                                : highestCategory
                                ? `${formatINR(highestCategory.total)} spent`
                                : "Log an expense"}
                        </p>
                        {primaryGoal && (
                            <div className="mt-2 h-2 rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all duration-500"
                                    style={{
                                        width: `${Math.min(100, Math.max(0, Number(primaryGoal.progress) || 0))}%`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Daily Pace (Blue/Violet with 4 Mini Ascending Bars) */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-4 xl:p-5 flex flex-col justify-between min-h-[148px] bg-gradient-to-br from-sky-50/90 via-white/85 to-violet-50/55 dark:from-blue-600/[0.17] dark:via-[#10162c]/88 dark:to-violet-950/35 dark:border-blue-400/25"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl dark:bg-blue-500/20"
                    />
                    <div className="relative z-10 flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_6px_18px_rgba(59,130,246,0.38)] flex items-center justify-center shrink-0">
                            <TrendingUp className="w-[18px] h-[18px]" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-3 pr-14">
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-300/90 truncate">
                            Daily Pace
                        </p>
                        <p className="text-xl xl:text-2xl font-bold tracking-tight text-slate-950 dark:text-white tabular-nums mt-0.5 truncate">
                            {formatINR(Number(insights?.averagePerDay || 0))}
                        </p>
                        <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 tabular-nums mt-1 truncate">
                            {insights?.totalTransactions || 0}{" "}
                            {(insights?.totalTransactions || 0) === 1
                                ? "entry"
                                : "entries"}{" "}
                            this month
                        </p>
                    </div>

                    {/* 4 Ascending Glowing Mini Bars */}
                    <div
                        aria-hidden="true"
                        className="absolute bottom-3.5 right-4 flex items-end gap-1 h-8 pointer-events-none"
                    >
                        {[36, 54, 76, 100].map((pct, i) => (
                            <div
                                key={i}
                                className="w-2 rounded-t-sm bg-gradient-to-t from-indigo-600 via-violet-500 to-purple-400 opacity-90 shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                                style={{ height: `${pct}%` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Smart Recommendations / Alert Banners */}
            {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.slice(0, 2).map((rec, index) => {
                        const { Icon, href, cardClass, badgeClass } = getRecommendationTheme(rec.type);
                        return (
                            <Link
                                key={`${rec.type}-${index}`}
                                href={href}
                                className={cn(
                                    GLASS_CARD,
                                    cardClass,
                                    "p-4 sm:px-5 sm:py-4 flex items-center justify-between gap-3.5 group hover:brightness-[1.02] transition-all"
                                )}
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
                                            badgeClass
                                        )}
                                    >
                                        <Icon className="w-[18px] h-[18px]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                            {rec.title}
                                        </h2>
                                        <p className="text-xs text-slate-600 dark:text-zinc-300/85 mt-0.5 leading-relaxed">
                                            {rec.message}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 dark:text-zinc-400 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Signature Workspace Section (Horizontal Underline Tabs) */}
            <div className="space-y-4">
                <div
                    role="tablist"
                    aria-label="Dashboard workspace views"
                    className="flex border-b border-slate-200/80 dark:border-white/[0.1] gap-6 overflow-x-auto no-scrollbar"
                >
                    {tabs.map((tab, idx) => {
                        const isActive = activeWorkspaceTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                id={`dashboard-tab-${tab.id}`}
                                role="tab"
                                type="button"
                                aria-selected={isActive}
                                aria-controls={`dashboard-panel-${tab.id}`}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setActiveWorkspaceTab(tab.id)}
                                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                                className={cn(
                                    "relative pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none",
                                    isActive
                                        ? "text-slate-950 dark:text-white"
                                        : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-4 h-4",
                                        isActive
                                            ? "text-violet-600 dark:text-violet-400"
                                            : "text-slate-400 dark:text-zinc-400"
                                    )}
                                />
                                <span>{tab.label}</span>
                                {typeof tab.count === "number" && (
                                    <span
                                        className={cn(
                                            "px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums",
                                            isActive
                                                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-xs"
                                                : "bg-slate-200/80 text-slate-700 dark:bg-white/[0.08] dark:text-zinc-400"
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="dashboardTabUnderline"
                                        className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_12px_rgba(139,92,246,0.75)]"
                                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {/* Tab 1: Recent Feed */}
                    {activeWorkspaceTab === "feed" && (
                        <motion.div
                            key="feed"
                            id="dashboard-panel-feed"
                            role="tabpanel"
                            aria-labelledby="dashboard-tab-feed"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.16 }}
                            className={cn(GLASS_CARD, "relative overflow-hidden")}
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-violet-500/[0.06] to-transparent dark:from-violet-500/[0.1]"
                            />

                            {/* Header */}
                            <div className="relative z-10 p-5 sm:p-6 pb-4 flex items-center justify-between gap-3 border-b border-slate-200/70 dark:border-white/[0.08]">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                                        <Receipt className="w-[18px] h-[18px]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-950 dark:text-white">
                                            Recent Transactions
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 truncate">
                                            Your latest {Math.max(5, recentExpenses.length)} entries logged in ExpenseMate.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/expenses"
                                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/85 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] dark:text-zinc-200 dark:hover:text-white dark:border-white/[0.12] transition-all shrink-0 inline-flex items-center gap-1"
                                >
                                    <span>Full Ledger</span>
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>

                            {recentExpenses.length > 0 ? (
                                <div className="relative z-10 divide-y divide-slate-200/60 dark:divide-white/[0.06]">
                                    {recentExpenses.map((expense) => {
                                        const catStyle = getCategoryStyles(expense.category);
                                        const CategoryIcon = catStyle.icon;
                                        return (
                                            <div
                                                key={expense._id}
                                                className="px-5 sm:px-6 py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 hover:bg-slate-50/75 dark:hover:bg-white/[0.025] transition-colors"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                    <div
                                                        className={cn(
                                                            "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                                                            catStyle.bg,
                                                            catStyle.border,
                                                            catStyle.color
                                                        )}
                                                    >
                                                        <CategoryIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-12 sm:items-center gap-1.5 sm:gap-3">
                                                        <p className="sm:col-span-5 text-xs sm:text-[13.5px] font-semibold text-slate-900 dark:text-white truncate">
                                                            {expense.title}
                                                        </p>
                                                        <div className="sm:col-span-3 flex items-center">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/85 border border-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-zinc-200">
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                                                    style={{ backgroundColor: catStyle.hex }}
                                                                />
                                                                <span>{expense.category}</span>
                                                            </span>
                                                        </div>
                                                        <div className="sm:col-span-4 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <span>
                                                                {expense.date
                                                                    ? format(new Date(expense.date), "MMM d, yyyy")
                                                                    : "—"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                                                    -{formatINR(expense.amount)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="relative z-10 px-6 py-12 text-center space-y-3">
                                    <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mx-auto">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            No transactions recorded yet
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
                                            Add your first expense to populate your feed, budgets, and activity heatmap.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsExpenseModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Expense</span>
                                    </button>
                                </div>
                            )}

                            <div className="relative z-10 px-5 sm:px-6 py-3.5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                                <span>Showing latest {recentExpenses.length} transactions</span>
                                <Link
                                    href="/expenses"
                                    className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors"
                                >
                                    <span>View all expenses</span>
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Tab 2: Budget Guardrails */}
                    {activeWorkspaceTab === "budgets" && (
                        <motion.div
                            key="budgets"
                            id="dashboard-panel-budgets"
                            role="tabpanel"
                            aria-labelledby="dashboard-tab-budgets"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.16 }}
                            className={cn(GLASS_CARD, "relative overflow-hidden")}
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-violet-500/[0.06] to-transparent dark:from-violet-500/[0.1]"
                            />

                            {/* Header */}
                            <div className="relative z-10 p-5 sm:p-6 pb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 dark:border-white/[0.08]">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-[18px] h-[18px]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-950 dark:text-white">
                                            Monthly Budget Guardrails
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                            Live progress against your configured {currentMonthName} limits.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/budgets/new"
                                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/85 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] dark:text-zinc-200 dark:hover:text-white dark:border-white/[0.12] transition-all shrink-0 inline-flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>New Budget</span>
                                </Link>
                            </div>

                            {budgets.length > 0 ? (
                                <div className="relative z-10">
                                    {/* Visual Analytics Strip: Category Donut + Budget vs Spending Area Chart */}
                                    <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 border-b border-slate-200/70 dark:border-white/[0.08]">
                                        {/* Left: Donut + Category Shares */}
                                        <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.07] flex flex-col sm:flex-row items-center gap-5">
                                            <div className="relative w-[176px] h-[176px] shrink-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsPieChart>
                                                        <Pie
                                                            data={budgetVisuals.donutData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            innerRadius={56}
                                                            outerRadius={80}
                                                            paddingAngle={budgetVisuals.hasPositiveSpend ? 3 : 0}
                                                            stroke="none"
                                                        >
                                                            {budgetVisuals.donutData.map((entry, idx) => (
                                                                <Cell key={`slice-${idx}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        {budgetVisuals.hasPositiveSpend && (
                                                            <RechartsTooltip
                                                                formatter={(value) => formatINR(Number(value || 0))}
                                                                contentStyle={{
                                                                    borderRadius: "12px",
                                                                    border: isDark
                                                                        ? "1px solid rgba(255,255,255,0.14)"
                                                                        : "1px solid rgba(226,232,240,0.9)",
                                                                    background: isDark
                                                                        ? "rgba(11,16,34,0.94)"
                                                                        : "rgba(255,255,255,0.96)",
                                                                    fontSize: "12px",
                                                                }}
                                                            />
                                                        )}
                                                    </RechartsPieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                                                    <span className="text-sm font-bold text-slate-950 dark:text-white tabular-nums">
                                                        {formatINR(totalSpent)}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                                                        Total Spent
                                                    </span>
                                                    {totalBudget > 0 && (
                                                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums mt-0.5">
                                                            {((totalSpent / totalBudget) * 100).toFixed(1)}% of{" "}
                                                            {formatCompactAxis(totalBudget)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 w-full space-y-2.5">
                                                {budgetVisuals.legendRows.length > 0 ? (
                                                    budgetVisuals.legendRows.map((row) => (
                                                        <div
                                                            key={row.name}
                                                            className="flex items-center justify-between gap-2 text-xs"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span
                                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                    style={{ backgroundColor: row.color }}
                                                                />
                                                                <span className="font-medium text-slate-700 dark:text-zinc-200 truncate">
                                                                    {row.name}
                                                                </span>
                                                            </div>
                                                            <span className="font-semibold text-slate-900 dark:text-white tabular-nums shrink-0">
                                                                {row.pct}%
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                                                        No category spend recorded yet.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Budget vs Spending Cumulative Area Chart */}
                                        <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.07] flex flex-col justify-between">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                                    Budget vs Spending
                                                </h4>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-zinc-300 tabular-nums">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                                                        Spent {formatINR(totalSpent)}
                                                    </span>
                                                    {totalBudget > 0 && (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <span className="w-3 border-t-2 border-dashed border-slate-400 dark:border-zinc-400" />
                                                            Budget {formatINR(totalBudget)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="h-[156px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart
                                                        data={budgetVisuals.areaData}
                                                        margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                                                    >
                                                        <defs>
                                                            <linearGradient id="dashBudgetAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.42} />
                                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            vertical={false}
                                                            stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(148,163,184,0.22)"}
                                                        />
                                                        <XAxis
                                                            dataKey="label"
                                                            tick={{
                                                                fontSize: 10,
                                                                fill: isDark ? "#94A3B8" : "#64748B",
                                                            }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            minTickGap={26}
                                                        />
                                                        <YAxis
                                                            tickFormatter={formatCompactAxis}
                                                            tick={{
                                                                fontSize: 10,
                                                                fill: isDark ? "#94A3B8" : "#64748B",
                                                            }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />
                                                        <RechartsTooltip
                                                            formatter={(value) => formatINR(Number(value || 0))}
                                                            contentStyle={{
                                                                borderRadius: "12px",
                                                                border: isDark
                                                                    ? "1px solid rgba(255,255,255,0.14)"
                                                                    : "1px solid rgba(226,232,240,0.9)",
                                                                background: isDark
                                                                    ? "rgba(11,16,34,0.94)"
                                                                    : "rgba(255,255,255,0.96)",
                                                                fontSize: "12px",
                                                            }}
                                                        />
                                                        {totalBudget > 0 && (
                                                            <ReferenceLine
                                                                y={totalBudget}
                                                                stroke={isDark ? "#94A3B8" : "#64748B"}
                                                                strokeDasharray="4 4"
                                                                strokeWidth={1.5}
                                                            />
                                                        )}
                                                        <Area
                                                            type="monotone"
                                                            dataKey="spent"
                                                            stroke="#8B5CF6"
                                                            strokeWidth={2.2}
                                                            fill="url(#dashBudgetAreaGrad)"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Individual Category Progress Bars */}
                                    <div className="divide-y divide-slate-200/60 dark:divide-white/[0.06]">
                                        {budgets.map((b) => {
                                            const catStyle = getCategoryStyles(b.category);
                                            const CategoryIcon = catStyle.icon;
                                            const threshold = b.alertThreshold || 80;
                                            const isOver = b.percentage >= 100;
                                            const isAlert = b.percentage >= threshold;

                                            return (
                                                <div
                                                    key={b._id}
                                                    className="px-5 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4"
                                                >
                                                    {/* Category Icon + Title */}
                                                    <div className="md:col-span-3 flex items-center gap-2.5 min-w-0">
                                                        <div
                                                            className={cn(
                                                                "w-8 h-8 rounded-xl border flex items-center justify-center shrink-0",
                                                                b.category === "Total"
                                                                    ? "bg-violet-500/15 border-violet-400/30 text-violet-600 dark:text-violet-300"
                                                                    : cn(catStyle.bg, catStyle.border, catStyle.color)
                                                            )}
                                                        >
                                                            {b.category === "Total" ? (
                                                                <Wallet className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <CategoryIcon className="w-3.5 h-3.5" />
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                                            {b.category === "Total" ? "Overall Monthly Cap" : b.category}
                                                        </span>
                                                        {isAlert && (
                                                            <span
                                                                className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0",
                                                                    isOver
                                                                        ? "bg-rose-100/90 border-rose-200 text-rose-700 dark:bg-rose-500/18 dark:border-rose-400/35 dark:text-rose-300"
                                                                        : "bg-amber-100/90 border-amber-200 text-amber-700 dark:bg-amber-500/18 dark:border-amber-400/35 dark:text-amber-300"
                                                                )}
                                                            >
                                                                {isOver ? "Over Limit" : "Alert"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="md:col-span-5 relative h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-300",
                                                                isOver
                                                                    ? "bg-gradient-to-r from-rose-500 to-red-500"
                                                                    : isAlert
                                                                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                                                    : "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                            )}
                                                            style={{
                                                                width: `${Math.min(100, Math.max(0, b.percentage))}%`,
                                                            }}
                                                        />
                                                        {threshold > 0 && threshold < 100 && (
                                                            <div
                                                                className="absolute top-0 bottom-0 w-0.5 bg-slate-500/50 dark:bg-white/40"
                                                                style={{ left: `${threshold}%` }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Amount + Status Pill */}
                                                    <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-3 text-xs tabular-nums">
                                                        <span className="text-slate-600 dark:text-zinc-400">
                                                            <span className="text-slate-950 dark:text-white font-semibold">
                                                                {formatINR(b.spent)}
                                                            </span>{" "}
                                                            / {formatINR(b.amount)} ({b.percentage}%)
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0",
                                                                isOver
                                                                    ? "bg-rose-100/90 border-rose-200 text-rose-700 dark:bg-rose-500/18 dark:border-rose-400/35 dark:text-rose-300"
                                                                    : isAlert
                                                                    ? "bg-amber-100/90 border-amber-200 text-amber-700 dark:bg-amber-500/18 dark:border-amber-400/35 dark:text-amber-300"
                                                                    : "bg-emerald-100/90 border-emerald-200 text-emerald-700 dark:bg-emerald-500/18 dark:border-emerald-400/35 dark:text-emerald-300"
                                                            )}
                                                        >
                                                            {isOver ? "Over Limit" : isAlert ? "Near Limit" : "On Track"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative z-10 px-6 py-12 text-center space-y-3">
                                    <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mx-auto">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            No monthly budgets configured
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
                                            Set spending caps for categories like Food, Transport, or Overall Monthly Total.
                                        </p>
                                    </div>
                                    <Link
                                        href="/budgets/new"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-md hover:brightness-110 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Configure Budget</span>
                                    </Link>
                                </div>
                            )}

                            <div className="relative z-10 px-5 sm:px-6 py-3.5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                                <span>{budgets.length} active budget rules</span>
                                <Link
                                    href="/budgets"
                                    className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors"
                                >
                                    <span>Manage budgets & alerts</span>
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Tab 3: Activity Heatmap */}
                    {activeWorkspaceTab === "heatmap" && (
                        <motion.div
                            key="heatmap"
                            id="dashboard-panel-heatmap"
                            role="tabpanel"
                            aria-labelledby="dashboard-tab-heatmap"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.16 }}
                            className={cn(GLASS_CARD, "relative overflow-hidden p-5 sm:p-6 space-y-5")}
                        >
                            {/* Header + Month Switcher */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                                        <CalendarDays className="w-[18px] h-[18px]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-950 dark:text-white">
                                            Daily Spending Activity
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                            A heatmap view of your {heatmapMonthName} {heatmapYear} spending patterns.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div
                                        className="inline-flex items-center rounded-full bg-white/85 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.12] p-1"
                                        role="group"
                                        aria-label="Heatmap month navigation"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleHeatmapMonthChange(subMonths(heatmapDate, 1))
                                            }
                                            disabled={isLoadingHeatmap}
                                            aria-label="Previous month"
                                            className="p-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-100 inline-flex items-center gap-1.5 tabular-nums">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                                            <span>{format(heatmapDate, "MMM yyyy")}</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleHeatmapMonthChange(addMonths(heatmapDate, 1))
                                            }
                                            disabled={isLoadingHeatmap || isSameMonth(heatmapDate, now)}
                                            aria-label="Next month"
                                            className="p-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {isLoadingHeatmap && (
                                        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                                    )}
                                </div>
                            </div>

                            {/* Calendar Heatmap Grid */}
                            <div className="space-y-2.5">
                                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                        <div key={day} className="pb-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                    {Array.from({ length: heatmapFirstDayOfWeek }).map((_, idx) => (
                                        <div key={`empty-${idx}`} className="h-12 sm:h-14 rounded-xl" />
                                    ))}

                                    {Array.from({ length: heatmapDaysInMonth }).map((_, i) => {
                                        const dayNum = i + 1;
                                        const spentOnDay = heatmapStats.spendingMap[dayNum] || 0;
                                        const tileClass = getHeatmapTileStyle(spentOnDay);

                                        return (
                                            <div
                                                key={dayNum}
                                                className={cn(
                                                    "h-12 sm:h-14 rounded-xl border flex flex-col items-center justify-center p-1 transition-all",
                                                    tileClass
                                                )}
                                                title={`${heatmapMonthName} ${dayNum}, ${heatmapYear}: ${formatINR(spentOnDay)}`}
                                            >
                                                <span className="text-[10px] opacity-80 leading-none tabular-nums font-medium">
                                                    {dayNum}
                                                </span>
                                                <span className="text-[10px] sm:text-[11px] font-semibold leading-tight mt-1 truncate max-w-full tabular-nums">
                                                    {spentOnDay > 0 ? `₹${Math.round(spentOnDay)}` : "—"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 5-Tier Legend */}
                                <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-600 dark:text-zinc-300">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 dark:bg-white/[0.06] dark:border-white/[0.12]" />
                                        No Spend
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300 dark:bg-emerald-500/35 dark:border-emerald-400/50" />
                                        Low (≤ ₹500)
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded bg-amber-200 border border-amber-300 dark:bg-amber-400/40 dark:border-amber-400/55" />
                                        Moderate (₹501 – ₹2,000)
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded bg-orange-200 border border-orange-300 dark:bg-orange-500/50 dark:border-orange-400/60" />
                                        High (₹2,001 – ₹5,000)
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded bg-rose-200 border border-rose-300 dark:bg-rose-500/55 dark:border-rose-400/65" />
                                        Peak (&gt; ₹5,000)
                                    </span>
                                </div>
                            </div>

                            {/* 5 Monthly Activity Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                <div className="p-3.5 rounded-2xl bg-indigo-50/75 dark:bg-indigo-500/[0.1] border border-indigo-200/70 dark:border-indigo-400/20">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-2.5">
                                        <CalendarDays className="w-4 h-4" />
                                    </div>
                                    <p className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tabular-nums">
                                        {heatmapStats.activeDays} {heatmapStats.activeDays === 1 ? "Day" : "Days"}
                                    </p>
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                                        With Expenses
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-emerald-50/75 dark:bg-emerald-500/[0.1] border border-emerald-200/70 dark:border-emerald-400/20">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-2.5">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <p className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tabular-nums truncate">
                                        {formatINR(heatmapStats.avgDaily)}
                                    </p>
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                                        Daily Average
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-amber-50/75 dark:bg-amber-500/[0.1] border border-amber-200/70 dark:border-amber-400/20">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-2.5">
                                        <Crown className="w-4 h-4" />
                                    </div>
                                    <p className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tabular-nums truncate">
                                        {formatINR(heatmapStats.peakAmount)}
                                    </p>
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 truncate">
                                        {heatmapStats.peakDay > 0
                                            ? `Peak · ${format(
                                                  new Date(heatmapYear, heatmapMonthIndex, heatmapStats.peakDay),
                                                  "MMM d, yyyy"
                                              )}`
                                            : "Peak Day Spend"}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-sky-50/75 dark:bg-blue-500/[0.1] border border-sky-200/70 dark:border-blue-400/20">
                                    <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-600 dark:text-sky-300 flex items-center justify-center mb-2.5">
                                        <ArrowDown className="w-4 h-4" />
                                    </div>
                                    <p className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tabular-nums truncate">
                                        {formatINR(heatmapStats.lowestAmount)}
                                    </p>
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 truncate">
                                        {heatmapStats.lowestDay > 0
                                            ? `Lowest · ${format(
                                                  new Date(heatmapYear, heatmapMonthIndex, heatmapStats.lowestDay),
                                                  "MMM d, yyyy"
                                              )}`
                                            : "Lowest Spend"}
                                    </p>
                                </div>

                                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-violet-50/75 dark:bg-violet-500/[0.12] border border-violet-200/70 dark:border-violet-400/25">
                                    <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-400/30 text-violet-600 dark:text-violet-300 flex items-center justify-center mb-2.5">
                                        <BarChart3 className="w-4 h-4" />
                                    </div>
                                    <p className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tabular-nums truncate">
                                        {formatINR(heatmapStats.monthTotal)}
                                    </p>
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                                        Total This Month
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Activity Insights Banner */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_6px_16px_rgba(124,58,237,0.35)] flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                            Activity Insights
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                            Key takeaways from your spending activity
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-200 flex-1 lg:px-4">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span>
                                            {heatmapStats.peakDay > 0
                                                ? `Highest spending on ${format(
                                                      new Date(heatmapYear, heatmapMonthIndex, heatmapStats.peakDay),
                                                      "MMM d, yyyy"
                                                  )} (${formatINR(heatmapStats.peakAmount)}).`
                                                : `No expenses recorded in ${heatmapMonthName} ${heatmapYear} yet.`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span>
                                            You had expenses on {heatmapStats.activeDays} out of {heatmapDaysInMonth}{" "}
                                            days ({Math.round((heatmapStats.activeDays / heatmapDaysInMonth) * 100)}%).
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span>
                                            {heatmapStats.topWeekday
                                                ? `Highest cumulative spending occurs on ${heatmapStats.topWeekday}s.`
                                                : "Log transactions across the month to spot weekday patterns."}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href="/analytics"
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-[0_6px_18px_-4px_rgba(124,58,237,0.5)] hover:brightness-110 transition-all shrink-0"
                                >
                                    <span>View Detailed Analytics</span>
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3 Bottom Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Visual Analytics */}
                <Link
                    href="/analytics"
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-5 sm:p-6 min-h-[162px] sm:min-h-[168px] flex flex-col justify-between bg-gradient-to-br from-violet-50/85 via-white/82 to-indigo-50/55 dark:from-violet-600/[0.16] dark:via-[#121229]/86 dark:to-indigo-950/35 dark:border-violet-400/25 hover:brightness-[1.03] transition-all group"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-6 -right-4 w-36 h-28 rounded-full bg-violet-500/20 blur-xl dark:bg-violet-500/30"
                    />
                    <div>
                        <div className="relative z-10 flex items-center justify-between mb-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_6px_16px_rgba(99,102,241,0.35)] flex items-center justify-center">
                                <BarChart3 className="w-[18px] h-[18px]" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:text-zinc-400 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <h3 className="relative z-10 text-sm sm:text-base font-semibold text-slate-950 dark:text-white">
                            Visual Analytics
                        </h3>
                        <p className="relative z-10 text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed max-w-[190px] xl:max-w-[215px]">
                            Explore daily velocity curves, category breakdowns, and monthly heatmaps.
                        </p>
                    </div>

                    <Image
                        src="/images/card-analytics-chart.png"
                        alt=""
                        aria-hidden="true"
                        width={780}
                        height={406}
                        className="pointer-events-none select-none absolute bottom-2 sm:bottom-2.5 right-3 sm:right-4 w-32 sm:w-36 md:w-40 xl:w-44 h-auto object-contain drop-shadow-[0_8px_18px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>

                {/* Card 2: Budget Guardrails */}
                <Link
                    href="/budgets"
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-5 sm:p-6 min-h-[162px] sm:min-h-[168px] flex flex-col justify-between bg-gradient-to-br from-sky-50/85 via-white/82 to-cyan-50/55 dark:from-sky-500/[0.15] dark:via-[#0e172a]/86 dark:to-cyan-950/30 dark:border-sky-400/25 hover:brightness-[1.03] transition-all group"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-4 -right-2 w-32 h-28 rounded-full bg-sky-500/20 blur-xl dark:bg-sky-500/30"
                    />
                    <div>
                        <div className="relative z-10 flex items-center justify-between mb-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_6px_16px_rgba(14,165,233,0.35)] flex items-center justify-center">
                                <ShieldCheck className="w-[18px] h-[18px]" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:text-zinc-400 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <h3 className="relative z-10 text-sm sm:text-base font-semibold text-slate-950 dark:text-white">
                            Budget Guardrails
                        </h3>
                        <p className="relative z-10 text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed max-w-[200px] xl:max-w-[225px]">
                            Configure category caps and alert thresholds before exceeding monthly limits.
                        </p>
                    </div>

                    <Image
                        src="/images/card-budget-shield.png"
                        alt=""
                        aria-hidden="true"
                        width={507}
                        height={593}
                        className="pointer-events-none select-none absolute bottom-3 sm:bottom-3.5 right-4 sm:right-5 w-16 sm:w-18 md:w-20 xl:w-22 h-auto object-contain drop-shadow-[0_8px_18px_rgba(14,165,233,0.45)] group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>

                {/* Card 3: Savings Goals */}
                <Link
                    href="/savings"
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-5 sm:p-6 min-h-[162px] sm:min-h-[168px] flex flex-col justify-between bg-gradient-to-br from-purple-50/85 via-white/82 to-fuchsia-50/55 dark:from-purple-600/[0.16] dark:via-[#151229]/86 dark:to-fuchsia-950/30 dark:border-purple-400/25 hover:brightness-[1.03] transition-all group"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-4 -right-2 w-32 h-28 rounded-full bg-amber-500/18 blur-xl dark:bg-amber-500/25"
                    />
                    <div>
                        <div className="relative z-10 flex items-center justify-between mb-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-[0_6px_16px_rgba(168,85,247,0.35)] flex items-center justify-center">
                                <Target className="w-[18px] h-[18px]" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:text-zinc-400 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <h3 className="relative z-10 text-sm sm:text-base font-semibold text-slate-950 dark:text-white">
                            Savings Goals
                        </h3>
                        <p className="relative z-10 text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed max-w-[200px] xl:max-w-[225px]">
                            Track milestone progress, log deposits, and review recommended monthly pace.
                        </p>
                    </div>

                    <Image
                        src="/images/card-savings-coins.png"
                        alt=""
                        aria-hidden="true"
                        width={620}
                        height={572}
                        className="pointer-events-none select-none absolute bottom-3 sm:bottom-3.5 right-4 sm:right-5 w-20 sm:w-22 md:w-24 xl:w-26 h-auto object-contain drop-shadow-[0_8px_18px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>
            </div>

            {/* Quick Add Expense Modal directly from Dashboard */}
            <ExpenseForm
                isOpen={isExpenseModalOpen}
                setIsOpen={setIsExpenseModalOpen}
                onExpenseAdded={handleExpenseAdded}
                expenseToEdit={null}
                onExpenseUpdated={() => {}}
            />
        </div>
    );
}
