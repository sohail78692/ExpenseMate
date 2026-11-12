"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    addMonths,
    isSameMonth,
    eachDayOfInterval,
    parseISO,
    getDay,
    getDaysInMonth,
} from "date-fns";
import {
    IndianRupee,
    TrendingUp,
    Flame,
    Layers,
    Download,
    ChevronLeft,
    ChevronRight,
    Loader2,
    BarChart3,
    ListOrdered,
    AlertTriangle,
    X,
    Search,
    ArrowUpRight,
    CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DailyTrendChart from "@/components/charts/DailyTrendChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import { getCategoryStyles } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsClient({ initialData }) {
    const [data, setData] = useState(initialData);
    const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoadingMonth, setIsLoadingMonth] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [now, setNow] = useState(null);

    // Categories & Transactions filter state
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("amount");

    const fetchControllerRef = useRef(null);

    useEffect(() => {
        setNow(new Date());
        return () => {
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }
        };
    }, []);

    const currentMonthStart = useMemo(
        () => startOfMonth(now || new Date()),
        [now]
    );
    const isCurrentMonth = isSameMonth(selectedMonth, currentMonthStart);

    // Fetch analytics when changing months
    const handleMonthChange = async (targetDate) => {
        const normalizedTarget = startOfMonth(targetDate);
        if (normalizedTarget > currentMonthStart) return;

        if (fetchControllerRef.current) {
            fetchControllerRef.current.abort();
        }
        const controller = new AbortController();
        fetchControllerRef.current = controller;

        setSelectedMonth(normalizedTarget);
        setSelectedCategoryFilter("all");
        setSearchQuery("");
        setIsLoadingMonth(true);
        setErrorMessage("");

        try {
            const res = await fetch(
                `/api/analytics?date=${encodeURIComponent(normalizedTarget.toISOString())}`,
                { signal: controller.signal }
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to load analytics for selected month");
            }
            const nextData = await res.json();
            setData(nextData);
        } catch (err) {
            if (err.name === "AbortError") return;
            setErrorMessage(err.message || "Unable to fetch analytics data");
        } finally {
            if (fetchControllerRef.current === controller) {
                setIsLoadingMonth(false);
            }
        }
    };

    // Derive timezone-accurate metrics strictly for selectedMonth
    const analytics = useMemo(() => {
        if (!data) {
            return {
                monthExpenses: [],
                activeDaysTrend: [],
                continuousDailySeries: [],
                categoryBreakdown: [],
                weekdayTotals: [],
                totalSpent: 0,
                avgPerActiveDay: 0,
                avgPerElapsedDay: 0,
                highestDay: null,
                topCategory: null,
                highestWeekday: null,
                daysInMonth: getDaysInMonth(selectedMonth),
                elapsedDays: getDaysInMonth(selectedMonth),
            };
        }

        const targetMonth = selectedMonth.getMonth();
        const targetYear = selectedMonth.getFullYear();
        const rawList = Array.isArray(data.rawExpenses) ? data.rawExpenses : [];

        // Filter rawExpenses to local month boundaries
        const monthExpenses = rawList.filter((item) => {
            const localDate = new Date(item.date);
            return localDate.getMonth() === targetMonth && localDate.getFullYear() === targetYear;
        });

        // Group daily totals
        const dailyMap = {};
        const categoryMap = {};
        const weekdayTotals = WEEKDAY_NAMES.map((day) => ({ day, amount: 0, count: 0 }));

        let totalSpent = 0;
        let latestExpenseDate = null;

        monthExpenses.forEach((item) => {
            const amount = Number(item.amount || 0);
            const localDate = new Date(item.date);
            const dateStr = format(localDate, "yyyy-MM-dd");
            const category = item.category || "Other";
            const weekdayIndex = getDay(localDate);

            totalSpent += amount;
            dailyMap[dateStr] = (dailyMap[dateStr] || 0) + amount;

            if (!categoryMap[category]) {
                categoryMap[category] = { name: category, value: 0, count: 0 };
            }
            categoryMap[category].value += amount;
            categoryMap[category].count += 1;

            weekdayTotals[weekdayIndex].amount += amount;
            weekdayTotals[weekdayIndex].count += 1;

            if (!latestExpenseDate || localDate > latestExpenseDate) {
                latestExpenseDate = localDate;
            }
        });

        // Active-day trend (only days with spending)
        let activeDaysTrend = Object.entries(dailyMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Fallback if server only returned aggregated dailyTrend without rawExpenses
        if (rawList.length === 0 && Array.isArray(data.dailyTrend) && data.dailyTrend.length > 0) {
            activeDaysTrend = [...data.dailyTrend].sort((a, b) => a.date.localeCompare(b.date));
            totalSpent = activeDaysTrend.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        }

        // Continuous daily series for smooth time-series chart
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);
        const referenceToday = now || new Date();
        let seriesEnd = monthEnd;
        if (isSameMonth(selectedMonth, referenceToday)) {
            seriesEnd =
                latestExpenseDate && latestExpenseDate > referenceToday
                    ? latestExpenseDate
                    : referenceToday;
            if (seriesEnd > monthEnd) seriesEnd = monthEnd;
        }

        const continuousDailySeries = eachDayOfInterval({
            start: monthStart,
            end: seriesEnd,
        }).map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            return {
                date: dateStr,
                amount: dailyMap[dateStr] || 0,
            };
        });

        const categoryBreakdown =
            Object.keys(categoryMap).length > 0
                ? Object.values(categoryMap).sort((a, b) => b.value - a.value)
                : rawList.length === 0 && Array.isArray(data.categoryBreakdown)
                ? data.categoryBreakdown.map((c) => ({ ...c, count: 0 }))
                : [];

        const highestDay =
            activeDaysTrend.length > 0
                ? activeDaysTrend.reduce(
                      (max, item) => (item.amount > max.amount ? item : max),
                      activeDaysTrend[0]
                  )
                : null;

        const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

        const nonZeroWeekdays = weekdayTotals.filter((w) => w.amount > 0);
        const highestWeekday =
            nonZeroWeekdays.length > 0
                ? nonZeroWeekdays.reduce(
                      (max, w) => (w.amount > max.amount ? w : max),
                      nonZeroWeekdays[0]
                  )
                : null;

        const daysInMonth = getDaysInMonth(selectedMonth);
        const elapsedDays = isSameMonth(selectedMonth, referenceToday)
            ? Math.max(1, referenceToday.getDate())
            : daysInMonth;

        const avgPerActiveDay =
            activeDaysTrend.length > 0 ? totalSpent / activeDaysTrend.length : 0;
        const avgPerElapsedDay = totalSpent / elapsedDays;

        return {
            monthExpenses,
            activeDaysTrend,
            continuousDailySeries,
            categoryBreakdown,
            weekdayTotals,
            totalSpent,
            avgPerActiveDay,
            avgPerElapsedDay,
            highestDay,
            topCategory,
            highestWeekday,
            daysInMonth,
            elapsedDays,
        };
    }, [data, selectedMonth, now]);

    // Filtered & sorted transactions for the Transactions tab
    const filteredExpenses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return analytics.monthExpenses
            .filter((item) => {
                const matchesCategory =
                    selectedCategoryFilter === "all" ||
                    (item.category || "Other").toLowerCase() === selectedCategoryFilter.toLowerCase();
                const matchesQuery =
                    !query ||
                    (item.title || "").toLowerCase().includes(query) ||
                    (item.category || "").toLowerCase().includes(query);
                return matchesCategory && matchesQuery;
            })
            .sort((a, b) => {
                if (sortBy === "amount") return Number(b.amount) - Number(a.amount);
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }, [analytics.monthExpenses, selectedCategoryFilter, searchQuery, sortBy]);

    const exportHref = useMemo(() => {
        const start = startOfMonth(selectedMonth).toISOString();
        const end = endOfMonth(selectedMonth).toISOString();
        return `/api/export?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
    }, [selectedMonth]);

    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        {
            id: "categories",
            label: "Categories",
            icon: Layers,
            count: analytics.categoryBreakdown.length,
        },
        {
            id: "transactions",
            label: "Transactions",
            icon: ListOrdered,
            count: analytics.monthExpenses.length,
        },
    ];

    const handleTabKeyDown = (e, currentIndex) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
    };

    const monthLabel = format(selectedMonth, "MMMM yyyy");
    const shortMonthLabel = format(selectedMonth, "MMM yyyy");
    const topCategoryShare =
        analytics.topCategory && analytics.totalSpent > 0
            ? ((analytics.topCategory.value / analytics.totalSpent) * 100).toFixed(1)
            : null;
    const todaySpent = Number(data?.todaySpent || 0);
    const trackingCoveragePct = Math.round(
        (analytics.activeDaysTrend.length / analytics.elapsedDays) * 100
    );

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
                                    isCurrentMonth ? "bg-emerald-500 dark:bg-emerald-400" : "bg-zinc-400"
                                )}
                            />
                            {isCurrentMonth ? "Live Month" : "Archive"}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-600">•</span>
                        <span className="font-mono text-zinc-600 dark:text-zinc-300">{monthLabel}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                        Spending Analytics
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Track daily velocity, category distribution, and monthly spending habits.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Month Switcher */}
                    <div
                        className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5"
                        role="group"
                        aria-label="Month navigation"
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
                            {isLoadingMonth && <Loader2 className="w-3 h-3 animate-spin text-zinc-500 dark:text-zinc-400" />}
                            <span>{shortMonthLabel}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleMonthChange(addMonths(selectedMonth, 1))}
                            disabled={isCurrentMonth || isLoadingMonth}
                            aria-label="Next month"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-white dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Scoped Monthly CSV Export */}
                    <a
                        href={exportHref}
                        download
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 shadow-xs dark:shadow-none"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </a>
                </div>
            </div>

            {/* Error Alert Banner */}
            <AnimatePresence>
                {errorMessage && (
                    <motion.div
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
                    >
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorMessage("")}
                            aria-label="Dismiss error"
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
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Monthly Total</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <IndianRupee className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(analytics.totalSpent)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {analytics.monthExpenses.length}{" "}
                            {analytics.monthExpenses.length === 1 ? "transaction" : "transactions"} in{" "}
                            {shortMonthLabel}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Daily Average</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(analytics.avgPerActiveDay)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            Per active day · {formatINR(analytics.avgPerElapsedDay)} overall
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Peak Spending Day</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <Flame className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {analytics.highestDay ? formatINR(analytics.highestDay.amount) : "₹0.00"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {analytics.highestDay
                                ? format(parseISO(analytics.highestDay.date), "EEE, MMM d, yyyy")
                                : "No activity recorded"}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Top Category</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <Layers className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white truncate">
                            {analytics.topCategory ? analytics.topCategory.name : "—"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {analytics.topCategory && topCategoryShare
                                ? `${topCategoryShare}% share · ${formatINR(analytics.topCategory.value)}`
                                : "No categories active"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Horizontal Sub-Navigation Tabs (Linear / Vercel style) */}
            <div
                role="tablist"
                aria-label="Analytics sections"
                className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {tabs.map((tab, idx) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            id={`analytics-tab-${tab.id}`}
                            role="tab"
                            type="button"
                            aria-selected={isActive}
                            aria-controls={`analytics-panel-${tab.id}`}
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
                            {typeof tab.count === "number" && (
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
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="analyticsTabUnderline"
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
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            id="analytics-panel-overview"
                            role="tabpanel"
                            aria-labelledby="analytics-tab-overview"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            {/* Primary Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <DailyTrendChart
                                    className="lg:col-span-7"
                                    data={analytics.continuousDailySeries}
                                    monthLabel={monthLabel}
                                    activeDays={analytics.activeDaysTrend.length}
                                />
                                <CategoryPieChart
                                    className="lg:col-span-5"
                                    data={analytics.categoryBreakdown}
                                />
                            </div>

                            {/* Heatmap + Insights Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                <CalendarHeatmap
                                    className="lg:col-span-7"
                                    data={analytics.activeDaysTrend}
                                    rawExpenses={analytics.monthExpenses}
                                    currentMonth={selectedMonth}
                                />

                                {/* Spending Insights Card */}
                                <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                                    <div className="p-6 pb-4">
                                        <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                            Spending Insights
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            Automated highlights derived from your {shortMonthLabel} ledger.
                                        </p>
                                    </div>

                                    <div className="px-6 pb-4 divide-y divide-zinc-200/80 dark:divide-zinc-800/80 text-xs">
                                        <div className="py-3.5 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-200">
                                                    Dominant Category
                                                </p>
                                                <p className="text-zinc-500 text-[11px] mt-0.5">
                                                    {analytics.topCategory
                                                        ? `${analytics.topCategory.name} drives ${topCategoryShare}% of monthly spend`
                                                        : "No category expenses logged yet"}
                                                </p>
                                            </div>
                                            <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 tabular-nums shrink-0">
                                                {analytics.topCategory
                                                    ? formatINR(analytics.topCategory.value)
                                                    : "—"}
                                            </span>
                                        </div>

                                        {isCurrentMonth && (
                                            <div className="py-3.5 flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-200">
                                                        Today vs. Daily Avg
                                                    </p>
                                                    <p className="text-zinc-500 text-[11px] mt-0.5">
                                                        {analytics.avgPerActiveDay > 0
                                                            ? todaySpent > analytics.avgPerActiveDay
                                                                ? `${((todaySpent / analytics.avgPerActiveDay - 1) * 100).toFixed(0)}% above your active-day avg`
                                                                : "Within your usual daily pace"
                                                            : "No baseline established yet"}
                                                    </p>
                                                </div>
                                                <span
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-full text-[11px] font-mono tabular-nums shrink-0 border",
                                                        analytics.avgPerActiveDay > 0 &&
                                                            todaySpent > analytics.avgPerActiveDay
                                                            ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800/80 dark:text-amber-300"
                                                            : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800/80 dark:text-emerald-400"
                                                    )}
                                                >
                                                    {formatINR(todaySpent)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="py-3.5 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-200">
                                                    Heaviest Weekday
                                                </p>
                                                <p className="text-zinc-500 text-[11px] mt-0.5">
                                                    {analytics.highestWeekday
                                                        ? `${analytics.highestWeekday.day}s account for the highest volume (${analytics.highestWeekday.count} txns)`
                                                        : "No weekday pattern yet"}
                                                </p>
                                            </div>
                                            <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 tabular-nums shrink-0">
                                                {analytics.highestWeekday
                                                    ? formatINR(analytics.highestWeekday.amount)
                                                    : "—"}
                                            </span>
                                        </div>

                                        <div className="py-3.5 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-200">
                                                    Tracking Coverage
                                                </p>
                                                <p className="text-zinc-500 text-[11px] mt-0.5">
                                                    {analytics.activeDaysTrend.length} of{" "}
                                                    {analytics.elapsedDays} elapsed days had logged spend
                                                </p>
                                            </div>
                                            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                                                {trackingCoveragePct}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                        <span>Need to log a missed expense?</span>
                                        <Link
                                            href="/expenses"
                                            className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white font-medium transition-colors"
                                        >
                                            <span>Expenses</span>
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 2: CATEGORIES */}
                    {activeTab === "categories" && (
                        <motion.div
                            key="categories"
                            id="analytics-panel-categories"
                            role="tabpanel"
                            aria-labelledby="analytics-tab-categories"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                                <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                            Category Breakdown
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            Ranked spending share across all categories for {monthLabel}. Select a category to inspect its transactions.
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-mono tabular-nums self-start sm:self-auto">
                                        {formatINR(analytics.totalSpent)}
                                    </span>
                                </div>

                                {analytics.categoryBreakdown.length > 0 ? (
                                    <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                        {analytics.categoryBreakdown.map((category, index) => {
                                            const share =
                                                analytics.totalSpent > 0
                                                    ? (category.value / analytics.totalSpent) * 100
                                                    : 0;
                                            const avgTxn =
                                                category.count > 0
                                                    ? category.value / category.count
                                                    : category.value;
                                            const { icon: Icon, color, bg, hex } =
                                                getCategoryStyles(category.name);

                                            return (
                                                <button
                                                    key={`${category.name}-${index}`}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategoryFilter(category.name);
                                                        setActiveTab("transactions");
                                                    }}
                                                    className="w-full text-left px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer space-y-2.5 group focus-visible:outline-none focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-900/60"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div
                                                                className={cn(
                                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200/80 dark:border-zinc-800/80",
                                                                    bg
                                                                )}
                                                            >
                                                                <Icon className={cn("w-4 h-4", color)} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-zinc-950 dark:text-white truncate">
                                                                        {category.name}
                                                                    </span>
                                                                    <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded">
                                                                        {share.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
                                                                    {category.count > 0
                                                                        ? `${category.count} ${category.count === 1 ? "expense" : "expenses"} · avg ${formatINR(avgTxn)}`
                                                                        : "Aggregated category total"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-sm font-semibold font-mono text-zinc-950 dark:text-white tabular-nums">
                                                                {formatINR(category.value)}
                                                            </span>
                                                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                                                        </div>
                                                    </div>

                                                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(100, share)}%`,
                                                                backgroundColor: hex,
                                                            }}
                                                        />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center text-xs text-zinc-500">
                                        No category data recorded for {monthLabel}.
                                    </div>
                                )}

                                <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                    <span>Click any category row to filter its transactions</span>
                                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                                        {analytics.categoryBreakdown.length} categories
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 3: TRANSACTIONS & PATTERNS */}
                    {activeTab === "transactions" && (
                        <motion.div
                            key="transactions"
                            id="analytics-panel-transactions"
                            role="tabpanel"
                            aria-labelledby="analytics-tab-transactions"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            {/* Weekday Spend Distribution */}
                            <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                                <div className="p-6 pb-4">
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                        Weekday Spend Distribution
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Compare how your spending distributes across days of the week in {monthLabel}.
                                    </p>
                                </div>

                                <div className="px-6 pb-6">
                                    {(() => {
                                        const maxWeekday = Math.max(
                                            ...analytics.weekdayTotals.map((w) => w.amount),
                                            0
                                        );
                                        return (
                                            <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end pt-2">
                                                {analytics.weekdayTotals.map((w) => {
                                                    const pct =
                                                        maxWeekday > 0 ? (w.amount / maxWeekday) * 100 : 0;
                                                    const isPeak =
                                                        maxWeekday > 0 && w.amount === maxWeekday;
                                                    return (
                                                        <div
                                                            key={w.day}
                                                            className="flex flex-col items-center gap-2"
                                                        >
                                                            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tabular-nums truncate max-w-full">
                                                                {w.amount > 0
                                                                    ? `₹${w.amount >= 1000 ? `${(w.amount / 1000).toFixed(1)}k` : Math.round(w.amount)}`
                                                                    : "—"}
                                                            </span>
                                                            <div className="w-full h-24 rounded-lg bg-zinc-100/80 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-1 flex items-end">
                                                                <div
                                                                    className={cn(
                                                                        "w-full rounded transition-all duration-300",
                                                                        isPeak
                                                                            ? "bg-zinc-900 dark:bg-white"
                                                                            : "bg-zinc-300 dark:bg-zinc-600"
                                                                    )}
                                                                    style={{
                                                                        height:
                                                                            w.amount > 0
                                                                                ? `${Math.max(8, pct)}%`
                                                                                : "0%",
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "text-[11px] font-medium",
                                                                    isPeak
                                                                        ? "text-zinc-950 dark:text-white"
                                                                        : "text-zinc-500"
                                                                )}
                                                            >
                                                                {w.day}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Monthly Transactions Ledger */}
                            <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                                <div className="p-6 pb-4 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                                Monthly Expense Ledger
                                            </h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                Filter and rank every transaction included in {monthLabel}.
                                            </p>
                                        </div>

                                        {/* Sort Toggle */}
                                        <div className="inline-flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
                                            {[
                                                { id: "amount", label: "Highest" },
                                                { id: "recent", label: "Recent" },
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

                                    {/* Search & Category Filter Row */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search title or category..."
                                                aria-label="Search monthly transactions"
                                                className="w-full h-9 pl-8 pr-3 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCategoryFilter("all")}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap transition-colors cursor-pointer",
                                                    selectedCategoryFilter === "all"
                                                        ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                )}
                                            >
                                                All
                                            </button>
                                            {analytics.categoryBreakdown.map((cat) => {
                                                const active =
                                                    selectedCategoryFilter.toLowerCase() ===
                                                    cat.name.toLowerCase();
                                                return (
                                                    <button
                                                        key={cat.name}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedCategoryFilter(
                                                                active ? "all" : cat.name
                                                            )
                                                        }
                                                        className={cn(
                                                            "px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap transition-colors cursor-pointer",
                                                            active
                                                                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                                                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                        )}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {filteredExpenses.length > 0 ? (
                                    <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 max-h-[460px] overflow-y-auto">
                                        {filteredExpenses.map((expense, idx) => {
                                            const { icon: Icon, color, bg } =
                                                getCategoryStyles(expense.category);
                                            return (
                                                <div
                                                    key={`${expense.date}-${expense.title}-${idx}`}
                                                    className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div
                                                            className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200/80 dark:border-zinc-800/80",
                                                                bg
                                                            )}
                                                        >
                                                            <Icon className={cn("w-4 h-4", color)} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                                {expense.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                                                                <span>{expense.category}</span>
                                                                <span>•</span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <CalendarDays className="w-3 h-3" />
                                                                    {format(
                                                                        new Date(expense.date),
                                                                        "MMM d, yyyy"
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <span className="text-xs sm:text-sm font-semibold font-mono text-zinc-950 dark:text-white tabular-nums shrink-0">
                                                        {formatINR(expense.amount)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-6 py-12 text-center space-y-2">
                                        <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            No matching transactions
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {analytics.monthExpenses.length === 0
                                                ? `No expenses logged in ${monthLabel}.`
                                                : "Try clearing your search or category filter."}
                                        </p>
                                    </div>
                                )}

                                <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                    <span>
                                        Showing {filteredExpenses.length} of{" "}
                                        {analytics.monthExpenses.length} transactions
                                    </span>
                                    <span className="font-mono text-zinc-600 dark:text-zinc-400 tabular-nums">
                                        Subtotal:{" "}
                                        {formatINR(
                                            filteredExpenses.reduce(
                                                (sum, e) => sum + Number(e.amount || 0),
                                                0
                                            )
                                        )}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
