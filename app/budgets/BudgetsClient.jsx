"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    addMonths,
    isSameMonth,
    getDaysInMonth,
} from "date-fns";
import {
    Plus,
    Download,
    Trash2,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Wallet,
    ShieldAlert,
    Sparkles,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowUpRight,
    Gauge,
    Bell,
    Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getCategoryStyles } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function getBudgetStatus(budget) {
    const pct = Number(budget.percentage || 0);
    const threshold = Number(budget.alertThreshold ?? 80);
    if (pct >= 100) {
        return {
            key: "over",
            label: "Over limit",
            badgeClass: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/60 dark:border-red-800/80 dark:text-red-400",
            barClass: "bg-red-500",
            textClass: "text-red-600 dark:text-red-400",
        };
    }
    if (pct >= threshold) {
        return {
            key: "risk",
            label: "Near limit",
            badgeClass: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-300",
            barClass: "bg-amber-500 dark:bg-amber-400",
            textClass: "text-amber-600 dark:text-amber-300",
        };
    }
    return {
        key: "healthy",
        label: "On track",
        badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-400",
        barClass: "bg-emerald-500 dark:bg-emerald-400",
        textClass: "text-emerald-600 dark:text-emerald-400",
    };
}

function getRecommendationIcon(type) {
    if (type === "warning") return { Icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800/70" };
    if (type === "alert") return { Icon: Bell, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800/70" };
    if (type === "success") return { Icon: TrendingDown, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800/70" };
    return { Icon: Info, color: "text-zinc-600 dark:text-zinc-300", bg: "bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800" };
}

export default function BudgetsClient({ initialBudgets, initialInsights }) {
    const router = useRouter();
    const [budgets, setBudgets] = useState(initialBudgets || []);
    const [insights] = useState(initialInsights || null);
    const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
    const [activeTab, setActiveTab] = useState("budgets");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("usage");
    const [isLoadingMonth, setIsLoadingMonth] = useState(false);

    // Feedback banner
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    // Delete confirmation modal
    const [budgetToDelete, setBudgetToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Client-only date reference for hydration safety
    const [now, setNow] = useState(null);
    const fetchControllerRef = useRef(null);

    useEffect(() => {
        setNow(new Date());
        return () => {
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(""), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    const currentMonthStart = useMemo(() => startOfMonth(now || new Date()), [now]);
    const isCurrentMonth = isSameMonth(selectedMonth, currentMonthStart);

    const handleMonthChange = async (targetDate) => {
        const normalizedTarget = startOfMonth(targetDate);
        if (fetchControllerRef.current) {
            fetchControllerRef.current.abort();
        }
        const controller = new AbortController();
        fetchControllerRef.current = controller;

        setSelectedMonth(normalizedTarget);
        setStatusFilter("all");
        setIsLoadingMonth(true);
        setMessage("");

        const monthNum = normalizedTarget.getMonth() + 1;
        const yearNum = normalizedTarget.getFullYear();

        try {
            const res = await fetch(
                `/api/budgets?month=${monthNum}&year=${yearNum}`,
                { signal: controller.signal }
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to load budgets for selected month");
            }
            const data = await res.json();
            setBudgets(Array.isArray(data.budgets) ? data.budgets : []);
        } catch (err) {
            if (err.name === "AbortError") return;
            setMessage(err.message || "Unable to fetch budgets");
            setMessageType("error");
        } finally {
            if (fetchControllerRef.current === controller) {
                setIsLoadingMonth(false);
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!budgetToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/budgets/${budgetToDelete._id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to delete budget");
            }

            const deletedCat = budgetToDelete.category;
            setBudgets((prev) => prev.filter((b) => b._id !== budgetToDelete._id));
            setBudgetToDelete(null);
            setMessage(`Removed ${deletedCat} budget`);
            setMessageType("success");
            router.refresh();
        } catch (error) {
            setBudgetToDelete(null);
            setMessage(error.message || "Error deleting budget");
            setMessageType("error");
        } finally {
            setIsDeleting(false);
        }
    };

    const { totalBudget, categoryBudgets, summary } = useMemo(() => {
        const normalized = (budgets || []).map((b) => {
            const amount = Number(b.amount || 0);
            const spent = Number(b.spent || 0);
            const remaining = amount - spent;
            const percentage =
                amount > 0 ? parseFloat(((spent / amount) * 100).toFixed(1)) : 0;
            return {
                ...b,
                amount,
                spent,
                remaining,
                percentage,
                alertThreshold: Number(b.alertThreshold ?? 80),
            };
        });

        const masterCap = normalized.find((b) => b.category === "Total") || null;
        const categoriesOnly = normalized.filter((b) => b.category !== "Total");

        const categoryLimitSum = categoriesOnly.reduce((sum, b) => sum + b.amount, 0);
        const categorySpentSum = categoriesOnly.reduce((sum, b) => sum + b.spent, 0);

        const totalBudgeted = masterCap ? masterCap.amount : categoryLimitSum;
        const totalTrackedSpend = masterCap ? masterCap.spent : categorySpentSum;
        const overallUsagePct =
            totalBudgeted > 0
                ? parseFloat(((totalTrackedSpend / totalBudgeted) * 100).toFixed(1))
                : 0;

        const alerts = normalized.filter((b) => b.percentage >= b.alertThreshold);
        const overCount = normalized.filter((b) => b.percentage >= 100).length;

        const daysInSelectedMonth = getDaysInMonth(selectedMonth);
        const referenceToday = now || new Date();
        const remainingDays = isSameMonth(selectedMonth, referenceToday)
            ? Math.max(1, daysInSelectedMonth - referenceToday.getDate() + 1)
            : daysInSelectedMonth;

        const dailyAllowance =
            masterCap && masterCap.remaining > 0
                ? masterCap.remaining / remainingDays
                : !masterCap && totalBudgeted - totalTrackedSpend > 0
                ? (totalBudgeted - totalTrackedSpend) / remainingDays
                : 0;

        return {
            totalBudget: masterCap,
            categoryBudgets: categoriesOnly,
            summary: {
                totalBudgeted,
                totalTrackedSpend,
                overallUsagePct,
                alertsCount: alerts.length,
                overCount,
                remainingDays,
                dailyAllowance,
            },
        };
    }, [budgets, selectedMonth, now]);

    const visibleCategoryBudgets = useMemo(() => {
        const filtered = categoryBudgets.filter((b) => {
            if (statusFilter === "all") return true;
            return getBudgetStatus(b).key === statusFilter;
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === "remaining") return b.remaining - a.remaining;
            if (sortBy === "name") return a.category.localeCompare(b.category);
            return b.percentage - a.percentage;
        });
    }, [categoryBudgets, statusFilter, sortBy]);

    const exportHref = useMemo(() => {
        const start = startOfMonth(selectedMonth).toISOString();
        const end = endOfMonth(selectedMonth).toISOString();
        return `/api/export?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
    }, [selectedMonth]);

    const newBudgetHref = useMemo(() => {
        const m = selectedMonth.getMonth() + 1;
        const y = selectedMonth.getFullYear();
        return `/budgets/new?month=${m}&year=${y}`;
    }, [selectedMonth]);

    const monthLabel = format(selectedMonth, "MMMM yyyy");
    const shortMonthLabel = format(selectedMonth, "MMM yyyy");

    const comparison = insights?.monthlyComparison;
    const comparisonNumeric = comparison ? Number(comparison.change || 0) : 0;

    const tabs = [
        { id: "budgets", label: "Budgets", icon: Gauge, count: budgets.length },
        {
            id: "insights",
            label: "Insights",
            icon: Sparkles,
            count:
                (insights?.budgetAlerts?.length || 0) +
                (insights?.recommendations?.length || 0),
        },
    ];

    const handleTabKeyDown = (e, currentIndex) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
    };

    return (
        <div className="w-full space-y-8 pb-8 text-zinc-900 dark:text-zinc-100">
            {/* Header: Linear / Vercel Monochromatic Minimalist Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                            <span
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    summary.alertsCount > 0 ? "bg-amber-500 dark:bg-amber-400" : "bg-emerald-500 dark:bg-emerald-400"
                                )}
                            />
                            Budget Guardrails
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-600">•</span>
                        <span className="font-mono text-zinc-600 dark:text-zinc-300">{monthLabel}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                        Budgets & Insights
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Set category spending caps, monitor threshold alerts, and control your monthly pace.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Month Switcher */}
                    <div
                        className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5"
                        role="group"
                        aria-label="Budget month navigation"
                    >
                        <button
                            type="button"
                            onClick={() => handleMonthChange(subMonths(selectedMonth, 1))}
                            disabled={isLoadingMonth}
                            aria-label="Previous month"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-white dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => !isCurrentMonth && handleMonthChange(currentMonthStart)}
                            disabled={isCurrentMonth || isLoadingMonth}
                            title={isCurrentMonth ? "Current month" : "Jump to current month"}
                            className={cn(
                                "px-2.5 py-1 text-xs font-medium min-w-[92px] text-center flex items-center justify-center gap-1.5 transition-colors",
                                isCurrentMonth
                                    ? "text-zinc-700 dark:text-zinc-200 cursor-default"
                                    : "text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white cursor-pointer"
                            )}
                        >
                            {isLoadingMonth && (
                                <Loader2 className="w-3 h-3 animate-spin text-zinc-500 dark:text-zinc-400" />
                            )}
                            <span>{shortMonthLabel}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleMonthChange(addMonths(selectedMonth, 1))}
                            disabled={isLoadingMonth}
                            aria-label="Next month"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-white dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <a
                        href={exportHref}
                        download
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 shadow-xs dark:shadow-none"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </a>

                    <Link
                        href={newBudgetHref}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 shadow-xs dark:shadow-none"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Budget</span>
                    </Link>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        role={messageType === "error" ? "alert" : "status"}
                        aria-live="polite"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={cn(
                            "p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border shadow-sm dark:shadow-none",
                            messageType === "success"
                                ? "bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200"
                                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            {messageType === "success" ? (
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                            <span>{message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMessage("")}
                            aria-label="Dismiss notification"
                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top 4 KPI Summary Strip */}
            <div
                className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-200",
                    isLoadingMonth && "opacity-60 pointer-events-none"
                )}
            >
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            {totalBudget ? "Overall Budget Cap" : "Allocated Budgets"}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <Wallet className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(summary.totalBudgeted)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {summary.totalBudgeted > 0
                                ? `${summary.overallUsagePct}% used · ${categoryBudgets.length} category ${categoryBudgets.length === 1 ? "cap" : "caps"}`
                                : "No budget cap configured"}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Monthly Comparison
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                            {comparison && comparisonNumeric > 0 ? (
                                <TrendingUp className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                            ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {comparison
                                ? comparison.last === 0
                                    ? formatINR(comparison.current)
                                    : `${comparisonNumeric > 0 ? "+" : ""}${comparisonNumeric}%`
                                : formatINR(summary.totalTrackedSpend)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {comparison
                                ? comparison.last > 0
                                    ? `vs last month (${formatINR(comparison.last)})`
                                    : "Current month spend (no prior month)"
                                : `Tracked across ${shortMonthLabel}`}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Avg. Daily Spending
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <Gauge className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {insights
                                ? formatINR(insights.averagePerDay)
                                : formatINR(summary.dailyAllowance)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {insights
                                ? `${insights.totalTransactions} transactions this month`
                                : `Suggested daily allowance`}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Budget Alerts</span>
                        <div
                            className={cn(
                                "w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center",
                                summary.overCount > 0
                                    ? "text-red-600 dark:text-red-400"
                                    : summary.alertsCount > 0
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                            )}
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {summary.alertsCount}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {summary.alertsCount === 0
                                ? "All budgets on track"
                                : summary.overCount > 0
                                ? `${summary.overCount} over limit · ${summary.alertsCount} triggered`
                                : `${summary.alertsCount} approaching limit`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Horizontal Sub-Navigation Tabs */}
            <div
                role="tablist"
                aria-label="Budget sections"
                className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {tabs.map((tab, idx) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            id={`budgets-tab-${tab.id}`}
                            role="tab"
                            type="button"
                            aria-selected={isActive}
                            aria-controls={`budgets-panel-${tab.id}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => setActiveTab(tab.id)}
                            onKeyDown={(e) => handleTabKeyDown(e, idx)}
                            className={cn(
                                "relative pb-3 text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-zinc-950 dark:focus-visible:text-white",
                                isActive
                                    ? "text-zinc-950 dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums",
                                    isActive
                                        ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200"
                                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500"
                                )}
                            >
                                {tab.count}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="budgetsTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div
                className={cn(
                    "transition-opacity duration-200",
                    isLoadingMonth && "opacity-60 pointer-events-none"
                )}
            >
                <AnimatePresence mode="wait">
                    {/* TAB 1: BUDGETS */}
                    {activeTab === "budgets" && (
                        <motion.div
                            key="budgets"
                            id="budgets-panel-budgets"
                            role="tabpanel"
                            aria-labelledby="budgets-tab-budgets"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            {/* Spotlight Master Total Budget Card (if present) */}
                            {totalBudget && (() => {
                                const status = getBudgetStatus(totalBudget);
                                return (
                                    <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-800 dark:text-white shrink-0">
                                                        <Wallet className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-sm sm:text-base font-medium text-zinc-950 dark:text-white">
                                                                Overall Monthly Budget
                                                            </h3>
                                                            <span
                                                                className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[11px] font-medium border",
                                                                    status.badgeClass
                                                                )}
                                                            >
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                            Tracks combined spending across all categories in {monthLabel}.
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setBudgetToDelete(totalBudget)}
                                                    aria-label="Delete Total budget"
                                                    title="Delete budget"
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                                                        <span className="text-xl font-semibold text-zinc-950 dark:text-white">
                                                            {formatINR(totalBudget.spent)}
                                                        </span>
                                                        <span className="text-xs text-zinc-500">
                                                            of {formatINR(totalBudget.amount)}
                                                        </span>
                                                    </div>
                                                    <span className={cn("text-sm font-mono font-semibold tabular-nums", status.textClass)}>
                                                        {totalBudget.percentage}%
                                                    </span>
                                                </div>

                                                {/* Progress Bar with Alert Threshold Marker */}
                                                <div
                                                    className="relative h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden"
                                                    role="progressbar"
                                                    aria-valuenow={Math.min(100, totalBudget.percentage)}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label="Overall Monthly Budget usage"
                                                >
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-300", status.barClass)}
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, totalBudget.percentage))}%`,
                                                        }}
                                                    />
                                                    {totalBudget.alertThreshold > 0 && totalBudget.alertThreshold < 100 && (
                                                        <div
                                                            className="absolute top-0 bottom-0 w-0.5 bg-zinc-400/70"
                                                            style={{ left: `${totalBudget.alertThreshold}%` }}
                                                            title={`Alert threshold: ${totalBudget.alertThreshold}%`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                                            <span className="text-zinc-500">
                                                Alert threshold at{" "}
                                                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                                                    {totalBudget.alertThreshold}%
                                                </span>
                                                {totalBudget.remaining > 0 && isCurrentMonth && (
                                                    <> · {formatINR(summary.dailyAllowance)}/day safe pace</>
                                                )}
                                            </span>
                                            <span className={cn("font-mono tabular-nums", totalBudget.remaining >= 0 ? "text-zinc-700 dark:text-zinc-300" : "text-red-600 dark:text-red-400")}>
                                                {totalBudget.remaining >= 0
                                                    ? `${formatINR(totalBudget.remaining)} remaining`
                                                    : `${formatINR(Math.abs(totalBudget.remaining))} over budget`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Category Budgets Filter & Sort Bar */}
                            {categoryBudgets.length > 0 && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                        {[
                                            { id: "all", label: "All" },
                                            { id: "over", label: "Over Limit" },
                                            { id: "risk", label: "Near Limit" },
                                            { id: "healthy", label: "On Track" },
                                        ].map((filter) => {
                                            const active = statusFilter === filter.id;
                                            return (
                                                <button
                                                    key={filter.id}
                                                    type="button"
                                                    onClick={() => setStatusFilter(filter.id)}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap transition-colors cursor-pointer",
                                                        active
                                                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                                            : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                    )}
                                                >
                                                    {filter.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="inline-flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto shrink-0">
                                        {[
                                            { id: "usage", label: "Highest %" },
                                            { id: "remaining", label: "Remaining" },
                                            { id: "name", label: "A–Z" },
                                        ].map((opt) => {
                                            const active = sortBy === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setSortBy(opt.id)}
                                                    aria-pressed={active}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                                        active
                                                            ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white"
                                                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                    )}
                                                >
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Category Budget Cards */}
                            {budgets.length === 0 ? (
                                <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none p-12 text-center space-y-4">
                                    <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mx-auto">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                            No budgets set for {monthLabel}
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                                            Create category spending limits or an overall monthly cap to track expenses before you overspend.
                                        </p>
                                    </div>
                                    <Link
                                        href={newBudgetHref}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Create your first budget</span>
                                    </Link>
                                </div>
                            ) : visibleCategoryBudgets.length === 0 && categoryBudgets.length > 0 ? (
                                <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none p-10 text-center space-y-2">
                                    <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        No category budgets match this filter
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("all")}
                                        className="text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white underline cursor-pointer"
                                    >
                                        Show all category budgets
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {visibleCategoryBudgets.map((budget) => {
                                        const status = getBudgetStatus(budget);
                                        const { icon: Icon, color, bg } = getCategoryStyles(
                                            budget.category
                                        );

                                        return (
                                            <div
                                                key={budget._id}
                                                className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden flex flex-col justify-between transition-colors"
                                            >
                                                <div className="p-6 space-y-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div
                                                                className={cn(
                                                                    "w-10 h-10 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center shrink-0",
                                                                    bg
                                                                )}
                                                            >
                                                                <Icon className={cn("w-4 h-4", color)} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="text-sm sm:text-base font-medium text-zinc-950 dark:text-white truncate">
                                                                    {budget.category}
                                                                </h3>
                                                                <span
                                                                    className={cn(
                                                                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border mt-1",
                                                                        status.badgeClass
                                                                    )}
                                                                >
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => setBudgetToDelete(budget)}
                                                            aria-label={`Delete ${budget.category} budget`}
                                                            title="Delete budget"
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-baseline justify-between gap-2">
                                                            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                                                                <span className="text-lg font-semibold text-zinc-950 dark:text-white">
                                                                    {formatINR(budget.spent)}
                                                                </span>
                                                                <span className="text-xs text-zinc-500">
                                                                    / {formatINR(budget.amount)}
                                                                </span>
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "text-xs font-mono font-semibold tabular-nums",
                                                                    status.textClass
                                                                )}
                                                            >
                                                                {budget.percentage}%
                                                            </span>
                                                        </div>

                                                        <div
                                                            className="relative h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden"
                                                            role="progressbar"
                                                            aria-valuenow={Math.min(100, budget.percentage)}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                            aria-label={`${budget.category} budget usage`}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "h-full rounded-full transition-all duration-300",
                                                                    status.barClass
                                                                )}
                                                                style={{
                                                                    width: `${Math.min(100, Math.max(0, budget.percentage))}%`,
                                                                }}
                                                            />
                                                            {budget.alertThreshold > 0 &&
                                                                budget.alertThreshold < 100 && (
                                                                    <div
                                                                        className="absolute top-0 bottom-0 w-0.5 bg-zinc-400/70"
                                                                        style={{
                                                                            left: `${budget.alertThreshold}%`,
                                                                        }}
                                                                        title={`Alert threshold: ${budget.alertThreshold}%`}
                                                                    />
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                                                    <span className="text-zinc-500">
                                                        Alert at{" "}
                                                        <span className="font-mono text-zinc-700 dark:text-zinc-300">
                                                            {budget.alertThreshold}%
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "font-mono tabular-nums",
                                                            budget.remaining >= 0
                                                                ? "text-zinc-700 dark:text-zinc-300"
                                                                : "text-red-600 dark:text-red-400"
                                                        )}
                                                    >
                                                        {budget.remaining >= 0
                                                            ? `${formatINR(budget.remaining)} left`
                                                            : `${formatINR(Math.abs(budget.remaining))} over`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* TAB 2: INSIGHTS */}
                    {activeTab === "insights" && (
                        <motion.div
                            key="insights"
                            id="budgets-panel-insights"
                            role="tabpanel"
                            aria-labelledby="budgets-tab-insights"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            {!isCurrentMonth && (
                                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                                    <span>
                                        Automated recommendations below summarize your live current month, while the Budgets tab shows {monthLabel}.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleMonthChange(currentMonthStart)}
                                        className="text-zinc-950 dark:text-white font-medium hover:underline shrink-0 cursor-pointer"
                                    >
                                        Jump to current month
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Recommendations */}
                                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                                    <div className="p-6 pb-4">
                                        <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                            Spending Recommendations
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            Automated signals derived from your monthly spending velocity and budget thresholds.
                                        </p>
                                    </div>

                                    {insights?.recommendations && insights.recommendations.length > 0 ? (
                                        <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                            {insights.recommendations.map((rec, index) => {
                                                const { Icon, color, bg } = getRecommendationIcon(rec.type);
                                                return (
                                                    <div
                                                        key={`${rec.type}-${index}`}
                                                        className="px-6 py-4 flex items-start gap-3.5"
                                                    >
                                                        <div
                                                            className={cn(
                                                                "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
                                                                bg
                                                            )}
                                                        >
                                                            <Icon className={cn("w-4 h-4", color)} />
                                                        </div>
                                                        <div className="space-y-1 min-w-0">
                                                            <h4 className="text-xs sm:text-sm font-medium text-zinc-950 dark:text-white">
                                                                {rec.title}
                                                            </h4>
                                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                                {rec.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="px-6 py-10 text-center text-xs text-zinc-500">
                                            No recommendations yet — add expenses and budgets to generate spending insights.
                                        </div>
                                    )}

                                    <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                        <span>Want deeper chart breakdowns?</span>
                                        <Link
                                            href="/analytics"
                                            className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white font-medium transition-colors"
                                        >
                                            <span>Open Analytics</span>
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Triggered Alerts & Top Categories */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                                        <div className="p-6 pb-4">
                                            <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                                Triggered Alerts
                                            </h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                Budgets at or above their configured alert threshold.
                                            </p>
                                        </div>

                                        {insights?.budgetAlerts && insights.budgetAlerts.length > 0 ? (
                                            <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                                {insights.budgetAlerts.map((alert, idx) => {
                                                    const pctNum = parseFloat(alert.percentage);
                                                    const isOver = pctNum >= 100;
                                                    return (
                                                        <div
                                                            key={`${alert.category}-${idx}`}
                                                            className="px-6 py-3.5 flex items-center justify-between gap-3 text-xs"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-zinc-950 dark:text-white">
                                                                    {alert.category}
                                                                </p>
                                                                <p className="text-[11px] text-zinc-500 font-mono tabular-nums mt-0.5">
                                                                    {formatINR(alert.spent)} / {formatINR(alert.budget)}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border tabular-nums",
                                                                    isOver
                                                                        ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/60 dark:border-red-800/80 dark:text-red-400"
                                                                        : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-300"
                                                                )}
                                                            >
                                                                {alert.percentage}%
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="px-6 py-8 text-center text-xs text-zinc-500">
                                                All active budgets are below their alert thresholds.
                                            </div>
                                        )}
                                    </div>

                                    {insights?.topCategories && insights.topCategories.length > 0 && (
                                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                                            <div className="p-6 pb-4">
                                                <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                                    Top Categories This Month
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                                {insights.topCategories.map((cat) => {
                                                    const { icon: Icon, color, bg } = getCategoryStyles(
                                                        cat.category
                                                    );
                                                    return (
                                                        <div
                                                            key={cat.category}
                                                            className="px-6 py-3.5 flex items-center justify-between gap-3 text-xs"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div
                                                                    className={cn(
                                                                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200/80 dark:border-zinc-800/80",
                                                                        bg
                                                                    )}
                                                                >
                                                                    <Icon className={cn("w-3.5 h-3.5", color)} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-zinc-900 dark:text-zinc-200 truncate">
                                                                        {cat.category}
                                                                    </p>
                                                                    <p className="text-[11px] text-zinc-500">
                                                                        {cat.count}{" "}
                                                                        {cat.count === 1 ? "expense" : "expenses"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="font-mono font-medium text-zinc-950 dark:text-white tabular-nums shrink-0">
                                                                {formatINR(cat.amount)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* DELETE BUDGET CONFIRMATION DIALOG */}
            <Dialog
                open={Boolean(budgetToDelete)}
                onOpenChange={(open) => !open && setBudgetToDelete(null)}
            >
                <DialogContent className="rounded-2xl bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/60 text-zinc-900 dark:text-zinc-100 max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white">
                            Delete Budget
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            Remove the{" "}
                            <span className="text-zinc-900 dark:text-white font-medium">
                                {budgetToDelete?.category}
                            </span>{" "}
                            budget ({formatINR(budgetToDelete?.amount)}) for {monthLabel}? Your logged expenses will not be affected.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex items-center gap-2 pt-3">
                        <button
                            type="button"
                            onClick={() => setBudgetToDelete(null)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                            {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                            <span>{isDeleting ? "Deleting..." : "Delete Budget"}</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
