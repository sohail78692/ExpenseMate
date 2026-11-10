"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Wallet,
    Target,
    PieChart,
    Plus,
    Receipt,
    Gauge,
    CalendarDays,
    AlertTriangle,
    Bell,
    Info,
    CreditCard,
    Check,
    X,
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

function formatINR(value: number) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function getRecommendationIcon(type: string) {
    if (type === "warning") {
        return {
            Icon: AlertTriangle,
            color: "text-amber-400",
            bg: "bg-amber-950/50 border-amber-800/70",
        };
    }
    if (type === "alert") {
        return {
            Icon: Bell,
            color: "text-red-400",
            bg: "bg-red-950/50 border-red-800/70",
        };
    }
    if (type === "success") {
        return {
            Icon: TrendingDown,
            color: "text-emerald-400",
            bg: "bg-emerald-950/50 border-emerald-800/70",
        };
    }
    return {
        Icon: Info,
        color: "text-zinc-300",
        bg: "bg-zinc-900 border-zinc-800",
    };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
    const router = useRouter();
    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"feed" | "budgets" | "heatmap">("feed");
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [now] = useState(() => new Date());

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
        const limit = masterCap
            ? masterCap.amount
            : budgets.reduce((acc, b) => acc + b.amount, 0);
        const remaining = limit > 0 ? limit - totalSpent : 0;
        const pct = limit > 0 ? Math.round((totalSpent / limit) * 100) : null;
        return { totalBudget: limit, remainingBudget: remaining, budgetPct: pct };
    }, [budgets, totalSpent]);

    const primaryGoal = useMemo(() => {
        const active = savingsGoals.filter((g) => !g.isCompleted);
        return active.length > 0 ? active[0] : savingsGoals.length > 0 ? savingsGoals[0] : null;
    }, [savingsGoals]);

    // Current month calendar generation for Activity Heatmap
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    const currentMonthName = format(now, "MMMM");
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

    const { spendingMap, maxDailySpend } = useMemo(() => {
        const year = now.getFullYear();
        const monthIndex = now.getMonth();
        const map: Record<number, number> = {};
        let peak = 0;

        dailyTrend.forEach((item) => {
            const parts = item._id.split("-");
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (y === year && m === monthIndex + 1 && !Number.isNaN(d)) {
                map[d] = (map[d] || 0) + item.amount;
                if (map[d] > peak) {
                    peak = map[d];
                }
            }
        });

        return { spendingMap: map, maxDailySpend: peak };
    }, [dailyTrend, now]);

    const handleExpenseAdded = (newExpense: ExpenseItem) => {
        setToastMessage(`Logged "${newExpense.title}" (${formatINR(newExpense.amount)})`);
        setTimeout(() => setToastMessage(""), 4000);
        router.refresh();
    };

    const comparison = insights?.monthlyComparison;
    const comparisonNum = comparison ? Number(comparison.change || 0) : 0;

    const tabs: { id: "feed" | "budgets" | "heatmap"; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
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

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 text-zinc-100">
            {/* Header: Linear / Vercel Monochromatic Minimalist Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Live Workspace
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="font-mono text-zinc-300" suppressHydrationWarning>
                            {format(now, "EEE, MMM d, yyyy")}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                        Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                        Welcome back, <span className="text-zinc-200 font-medium">{user?.name || "Member"}</span>. Here is your {currentMonthName} spending snapshot and budget guardrails.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/analytics"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                    >
                        <PieChart className="w-3.5 h-3.5" />
                        <span>Analytics</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Expense</span>
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        role="status"
                        aria-live="polite"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium bg-zinc-900 border border-zinc-700 text-zinc-200"
                    >
                        <div className="flex items-center gap-2.5">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{toastMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToastMessage("")}
                            aria-label="Dismiss notification"
                            className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top 4 KPI Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Month Spend */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-400">
                            {currentMonthName} Spend
                        </span>
                        {comparison && comparison.last > 0 ? (
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border",
                                    comparison.trend === "up"
                                        ? "bg-red-950/60 border-red-800/80 text-red-400"
                                        : "bg-emerald-950/60 border-emerald-800/80 text-emerald-400"
                                )}
                            >
                                {comparison.trend === "up" ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {comparisonNum > 0 ? `+${comparisonNum}%` : `${comparisonNum}%`}
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
                                Active
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-white font-mono tabular-nums">
                            {formatINR(totalSpent)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            Today: {formatINR(todaySpent)}
                        </p>
                    </div>
                </div>

                {/* 2. Budget Remaining */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-400">Budget Status</span>
                        {budgetPct !== null ? (
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-[11px] font-medium border",
                                    budgetPct >= 100
                                        ? "bg-red-950/60 border-red-800/80 text-red-400"
                                        : budgetPct >= 80
                                        ? "bg-amber-950/60 border-amber-800/80 text-amber-300"
                                        : "bg-emerald-950/60 border-emerald-800/80 text-emerald-400"
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
                                className="text-[11px] text-zinc-300 hover:text-white underline"
                            >
                                Set Cap
                            </Link>
                        )}
                    </div>
                    <div>
                        <p
                            className={cn(
                                "text-2xl font-semibold tracking-tight font-mono tabular-nums",
                                remainingBudget < 0 ? "text-red-400" : "text-white"
                            )}
                        >
                            {totalBudget > 0 ? formatINR(remainingBudget) : "₹0.00"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {totalBudget > 0
                                ? `Remaining of ${formatINR(totalBudget)} cap`
                                : "No monthly budget limit set"}
                        </p>
                    </div>
                </div>

                {/* 3. Primary Savings Goal / Top Category */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-400">
                            {primaryGoal ? "Primary Goal" : "Top Category"}
                        </span>
                        {primaryGoal ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
                                {primaryGoal.progress}%
                            </span>
                        ) : highestCategory ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                                Leading
                            </span>
                        ) : (
                            <span className="text-[11px] text-zinc-500">—</span>
                        )}
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-white truncate">
                            {primaryGoal
                                ? primaryGoal.name || primaryGoal.title || "Savings Goal"
                                : highestCategory
                                ? highestCategory._id
                                : "No Activity"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums truncate">
                            {primaryGoal
                                ? `${formatINR(primaryGoal.currentAmount)} of ${formatINR(primaryGoal.targetAmount)}`
                                : highestCategory
                                ? `${formatINR(highestCategory.total)} spent this month`
                                : "Log an expense to begin"}
                        </p>
                    </div>
                </div>

                {/* 4. Daily Velocity */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-400">Daily Pace</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                            <Gauge className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-white font-mono tabular-nums">
                            {formatINR(Number(insights?.averagePerDay || 0))}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {insights?.totalTransactions || 0}{" "}
                            {(insights?.totalTransactions || 0) === 1
                                ? "transaction"
                                : "transactions"}{" "}
                            this month
                        </p>
                    </div>
                </div>
            </div>

            {/* Smart Recommendations Strip (if any) */}
            {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.slice(0, 2).map((rec, index) => {
                        const { Icon, color, bg } = getRecommendationIcon(rec.type);
                        return (
                            <div
                                key={`${rec.type}-${index}`}
                                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3.5"
                            >
                                <div
                                    className={cn(
                                        "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
                                        bg
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", color)} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xs sm:text-sm font-medium text-white">
                                        {rec.title}
                                    </h2>
                                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                        {rec.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Signature Workspace Section (Horizontal Underline Tabs) */}
            <div className="space-y-5">
                <div
                    role="tablist"
                    aria-label="Dashboard workspace views"
                    className="flex border-b border-zinc-800 gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                                    "relative pb-3 text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-white",
                                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                {typeof tab.count === "number" && (
                                    <span
                                        className={cn(
                                            "px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums",
                                            isActive
                                                ? "bg-zinc-800 text-zinc-200"
                                                : "bg-zinc-900 text-zinc-500"
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="dashboardTabUnderline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
                            transition={{ duration: 0.15 }}
                            className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden"
                        >
                            <div className="p-6 pb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-medium text-white">
                                        Recent Transactions
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Your latest 5 entries logged in ExpenseMate.
                                    </p>
                                </div>
                                <Link
                                    href="/expenses"
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors shrink-0"
                                >
                                    Full Ledger
                                </Link>
                            </div>

                            {recentExpenses.length > 0 ? (
                                <div className="divide-y divide-zinc-800/80">
                                    {recentExpenses.map((expense) => {
                                        const { icon: CategoryIcon, color, bg, hex } =
                                            getCategoryStyles(expense.category);
                                        return (
                                            <div
                                                key={expense._id}
                                                className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-900/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={cn(
                                                            "w-9 h-9 rounded-xl border border-zinc-800/80 flex items-center justify-center shrink-0",
                                                            bg
                                                        )}
                                                    >
                                                        <CategoryIcon className={cn("w-4 h-4", color)} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                                                            {expense.title}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                                                            <span className="inline-flex items-center gap-1">
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full"
                                                                    style={{ backgroundColor: hex }}
                                                                />
                                                                {expense.category}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {format(
                                                                    new Date(expense.date),
                                                                    "MMM d, yyyy"
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className="text-xs sm:text-sm font-semibold font-mono text-white tabular-nums shrink-0">
                                                    -{formatINR(expense.amount)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-zinc-200">
                                            No transactions recorded yet
                                        </p>
                                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                            Add your first expense to populate your feed, budgets, and activity heatmap.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsExpenseModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Expense</span>
                                    </button>
                                </div>
                            )}

                            <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                <span>Showing latest {recentExpenses.length} transactions</span>
                                <Link
                                    href="/expenses"
                                    className="inline-flex items-center gap-1 text-zinc-300 hover:text-white font-medium transition-colors"
                                >
                                    <span>View all expenses</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
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
                            transition={{ duration: 0.15 }}
                            className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden"
                        >
                            <div className="p-6 pb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-medium text-white">
                                        Monthly Budget Guardrails
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Live progress against your configured {currentMonthName} limits.
                                    </p>
                                </div>
                                <Link
                                    href="/budgets/new"
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors shrink-0 inline-flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>New Budget</span>
                                </Link>
                            </div>

                            {budgets.length > 0 ? (
                                <div className="divide-y divide-zinc-800/80">
                                    {budgets.map((b) => {
                                        const { icon: CategoryIcon, color, bg } =
                                            getCategoryStyles(b.category);
                                        const threshold = b.alertThreshold || 80;
                                        const isOver = b.percentage >= 100;
                                        const isAlert = b.percentage >= threshold;

                                        return (
                                            <div key={b._id} className="px-6 py-4 space-y-2.5">
                                                <div className="flex items-center justify-between gap-3 text-xs">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div
                                                            className={cn(
                                                                "w-8 h-8 rounded-lg border border-zinc-800/80 flex items-center justify-center shrink-0",
                                                                b.category === "Total"
                                                                    ? "bg-zinc-900"
                                                                    : bg
                                                            )}
                                                        >
                                                            {b.category === "Total" ? (
                                                                <Wallet className="w-3.5 h-3.5 text-white" />
                                                            ) : (
                                                                <CategoryIcon
                                                                    className={cn("w-3.5 h-3.5", color)}
                                                                />
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-sm text-white truncate">
                                                            {b.category === "Total"
                                                                ? "Overall Monthly Cap"
                                                                : b.category}
                                                        </span>
                                                        {isAlert && (
                                                            <span
                                                                className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0",
                                                                    isOver
                                                                        ? "bg-red-950/60 border-red-800/80 text-red-400"
                                                                        : "bg-amber-950/60 border-amber-800/80 text-amber-300"
                                                                )}
                                                            >
                                                                {isOver ? "Over limit" : "Alert"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span className="font-mono text-zinc-400 tabular-nums shrink-0">
                                                        <span className="text-white font-semibold">
                                                            {formatINR(b.spent)}
                                                        </span>{" "}
                                                        / {formatINR(b.amount)} ({b.percentage}%)
                                                    </span>
                                                </div>

                                                <div className="relative h-2 w-full rounded-full bg-zinc-900 border border-zinc-800/80 overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-300",
                                                            isOver
                                                                ? "bg-red-500"
                                                                : isAlert
                                                                ? "bg-amber-400"
                                                                : "bg-emerald-400"
                                                        )}
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, b.percentage))}%`,
                                                        }}
                                                    />
                                                    {threshold > 0 && threshold < 100 && (
                                                        <div
                                                            className="absolute top-0 bottom-0 w-0.5 bg-zinc-400/70"
                                                            style={{ left: `${threshold}%` }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                                        <Wallet className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-zinc-200">
                                            No monthly budgets configured
                                        </p>
                                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                            Set spending caps for categories like Food, Transport, or Overall Monthly Total.
                                        </p>
                                    </div>
                                    <Link
                                        href="/budgets/new"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Configure Budget</span>
                                    </Link>
                                </div>
                            )}

                            <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                <span>{budgets.length} active budget rules</span>
                                <Link
                                    href="/budgets"
                                    className="inline-flex items-center gap-1 text-zinc-300 hover:text-white font-medium transition-colors"
                                >
                                    <span>Manage budgets & alerts</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
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
                            transition={{ duration: 0.15 }}
                            className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden"
                        >
                            <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-medium text-white">
                                        Daily Spending Intensity
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        {currentMonthName} {currentYear} heatmap scaled relative to your peak spending day.
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 shrink-0">
                                    <span>Low</span>
                                    <span className="w-3 h-3 rounded bg-zinc-900/80 border border-zinc-800" />
                                    <span className="w-3 h-3 rounded bg-emerald-950/70 border border-emerald-800/70" />
                                    <span className="w-3 h-3 rounded bg-amber-950/70 border border-amber-800/70" />
                                    <span className="w-3 h-3 rounded bg-orange-950/80 border border-orange-700/80" />
                                    <span className="w-3 h-3 rounded bg-red-950/90 border border-red-700/90" />
                                    <span>Peak</span>
                                </div>
                            </div>

                            <div className="px-6 pb-6 space-y-2">
                                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[11px] text-zinc-500 font-medium">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                        <div key={day} className="pb-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                    {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                                        <div key={`empty-${idx}`} className="h-11 sm:h-13 rounded-lg" />
                                    ))}

                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const dayNum = i + 1;
                                        const spentOnDay = spendingMap[dayNum] || 0;
                                        let tileClass =
                                            "bg-zinc-900/60 border-zinc-800/70 text-zinc-500";

                                        if (spentOnDay > 0 && maxDailySpend > 0) {
                                            const ratio = spentOnDay / maxDailySpend;
                                            if (ratio <= 0.25) {
                                                tileClass =
                                                    "bg-emerald-950/60 border-emerald-800/60 text-emerald-300";
                                            } else if (ratio <= 0.5) {
                                                tileClass =
                                                    "bg-amber-950/60 border-amber-800/60 text-amber-300";
                                            } else if (ratio <= 0.75) {
                                                tileClass =
                                                    "bg-orange-950/70 border-orange-700/70 text-orange-300";
                                            } else {
                                                tileClass =
                                                    "bg-red-950/80 border-red-700/80 text-red-200";
                                            }
                                        }

                                        return (
                                            <div
                                                key={dayNum}
                                                className={cn(
                                                    "h-11 sm:h-13 rounded-lg border flex flex-col items-center justify-center p-1 transition-colors",
                                                    tileClass
                                                )}
                                                title={`${currentMonthName} ${dayNum}: ${formatINR(spentOnDay)}`}
                                            >
                                                <span className="text-[10px] opacity-75 leading-none tabular-nums">
                                                    {dayNum}
                                                </span>
                                                <span className="text-[10px] sm:text-[11px] font-mono leading-tight mt-0.5 truncate max-w-full tabular-nums">
                                                    {spentOnDay > 0 ? `₹${Math.round(spentOnDay)}` : "—"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                <span>
                                    Peak day:{" "}
                                    <span className="font-mono text-zinc-300 tabular-nums">
                                        {formatINR(maxDailySpend)}
                                    </span>
                                </span>
                                <Link
                                    href="/analytics"
                                    className="inline-flex items-center gap-1 text-zinc-300 hover:text-white font-medium transition-colors"
                                >
                                    <span>Open interactive analytics</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    href="/analytics"
                    className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
                            <PieChart className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm font-medium text-white">Visual Analytics</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Explore daily velocity curves, category breakdowns, and monthly heatmaps.
                    </p>
                </Link>

                <Link
                    href="/budgets"
                    className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm font-medium text-white">Budget Guardrails</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Configure category caps and alert thresholds before exceeding monthly limits.
                    </p>
                </Link>

                <Link
                    href="/savings"
                    className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
                            <Target className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm font-medium text-white">Savings Goals</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Track milestone progress, log deposits, and review recommended monthly pace.
                    </p>
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
