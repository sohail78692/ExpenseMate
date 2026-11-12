"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    Wallet,
    CalendarDays,
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
    ArrowRight,
    Lightbulb,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Target,
    Home,
    CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DailyTrendChart from "@/components/charts/DailyTrendChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Builds a smooth decorative SVG path from normalized numeric values. */
function buildSparklinePaths(values, width = 88, height = 34) {
    const pts = values && values.length >= 2 ? values : [0.15, 0.45, 0.3, 0.72, 0.48, 0.85, 0.62];
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

function MiniSparkline({ id, color, values }) {
    const { line, area } = useMemo(() => buildSparklinePaths(values), [values]);
    return (
        <svg
            viewBox="0 0 88 34"
            className="w-20 sm:w-[88px] h-[34px] shrink-0 overflow-visible"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#spark-${id})`} />
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

/** Custom translucent 3-bar ascending illustration for the right insight promo card. */
function InsightBarsArtwork() {
    return (
        <svg
            viewBox="0 0 92 72"
            className="w-20 h-16 drop-shadow-[0_10px_24px_rgba(99,102,241,0.28)]"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="barLeft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93C5FD" />
                    <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
                <linearGradient id="barMid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
                <linearGradient id="barRight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6D28D9" />
                </linearGradient>
            </defs>
            <ellipse cx="46" cy="64" rx="34" ry="5" fill="rgba(99, 102, 241, 0.16)" />
            <rect x="14" y="34" width="16" height="26" rx="6" fill="url(#barLeft)" opacity="0.92" />
            <rect x="38" y="16" width="16" height="44" rx="6" fill="url(#barMid)" />
            <rect x="62" y="25" width="16" height="35" rx="6" fill="url(#barRight)" opacity="0.95" />
        </svg>
    );
}

const GLASS_CARD =
    "rounded-[24px] bg-white/78 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_16px_42px_-12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]";

export default function AnalyticsClient({ initialData }) {
    const [data, setData] = useState(initialData);
    const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
    const [activeTab, setActiveTab] = useState("overview");
    const [trendRange, setTrendRange] = useState("1m");
    const [rangeCache, setRangeCache] = useState({});
    const [isLoadingMonth, setIsLoadingMonth] = useState(false);
    const [isLoadingRange, setIsLoadingRange] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [now, setNow] = useState(null);

    // Categories & Transactions filter state
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("amount");

    // AI Insights Modal state
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [insightsData, setInsightsData] = useState(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [insightsError, setInsightsError] = useState("");

    const fetchControllerRef = useRef(null);
    const rangeControllerRef = useRef(null);

    useEffect(() => {
        setNow(new Date());
        return () => {
            if (fetchControllerRef.current) fetchControllerRef.current.abort();
            if (rangeControllerRef.current) rangeControllerRef.current.abort();
        };
    }, []);

    const currentMonthStart = useMemo(
        () => startOfMonth(now || new Date()),
        [now]
    );
    const isCurrentMonth = isSameMonth(selectedMonth, currentMonthStart);
    const monthCachePrefix = format(selectedMonth, "yyyy-MM");

    // Fetch analytics when changing months
    const handleMonthChange = async (targetDate) => {
        const normalizedTarget = startOfMonth(targetDate);
        if (normalizedTarget > currentMonthStart) return;

        if (fetchControllerRef.current) fetchControllerRef.current.abort();
        if (rangeControllerRef.current) rangeControllerRef.current.abort();

        const controller = new AbortController();
        fetchControllerRef.current = controller;

        setSelectedMonth(normalizedTarget);
        setTrendRange("1m");
        setSelectedCategoryFilter("all");
        setSearchQuery("");
        setIsLoadingMonth(true);
        setIsLoadingRange(false);
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

    // Fetch multi-month trend data when selecting 3M / 6M / 1Y
    const handleRangeChange = async (nextRange) => {
        setTrendRange(nextRange);
        if (nextRange === "1w" || nextRange === "1m") return;

        const cacheKey = `${monthCachePrefix}:${nextRange}`;
        if (rangeCache[cacheKey]) return;

        if (rangeControllerRef.current) rangeControllerRef.current.abort();
        const controller = new AbortController();
        rangeControllerRef.current = controller;
        setIsLoadingRange(true);

        try {
            const res = await fetch(
                `/api/analytics?date=${encodeURIComponent(selectedMonth.toISOString())}&range=${nextRange}`,
                { signal: controller.signal }
            );
            if (!res.ok) throw new Error("Unable to load extended trend range");
            const payload = await res.json();
            setRangeCache((prev) => ({
                ...prev,
                [cacheKey]: Array.isArray(payload.rangeExpenses) ? payload.rangeExpenses : [],
            }));
        } catch (err) {
            if (err.name === "AbortError") return;
            setErrorMessage(err.message || "Unable to load extended trend range");
        } finally {
            if (rangeControllerRef.current === controller) {
                setIsLoadingRange(false);
            }
        }
    };

    // Open & fetch AI Spending Recommendations dialog
    const handleOpenInsights = async () => {
        setIsInsightsOpen(true);
        if (insightsData) return;

        setIsLoadingInsights(true);
        setInsightsError("");
        try {
            const res = await fetch("/api/insights");
            if (!res.ok) throw new Error("Failed to load recommendations");
            const json = await res.json();
            setInsightsData(json);
        } catch (err) {
            setInsightsError(err.message || "Unable to fetch insights");
        } finally {
            setIsLoadingInsights(false);
        }
    };

    // Derive timezone-accurate metrics strictly for selectedMonth + previous month MoM deltas
    const analytics = useMemo(() => {
        if (!data) {
            return {
                monthExpenses: [],
                activeDaysTrend: [],
                continuousDailySeries: [],
                categoryBreakdown: [],
                weekdayTotals: [],
                totalSpent: 0,
                prevTotalSpent: 0,
                momChangePct: null,
                avgPerActiveDay: 0,
                prevAvgPerActiveDay: 0,
                avgMomChangePct: null,
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

        // Previous month timezone-accurate metrics
        const prevDate = subMonths(selectedMonth, 1);
        const prevMonth = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();
        const prevRawList = Array.isArray(data.prevRawExpenses) ? data.prevRawExpenses : [];
        const prevDailyMap = {};
        let prevTotalSpent = 0;

        prevRawList.forEach((item) => {
            const localDate = new Date(item.date);
            if (localDate.getMonth() === prevMonth && localDate.getFullYear() === prevYear) {
                const amt = Number(item.amount || 0);
                prevTotalSpent += amt;
                const dKey = format(localDate, "yyyy-MM-dd");
                prevDailyMap[dKey] = (prevDailyMap[dKey] || 0) + amt;
            }
        });
        const prevActiveDaysCount = Object.values(prevDailyMap).filter((v) => v > 0).length;
        const prevAvgPerActiveDay = prevActiveDaysCount > 0 ? prevTotalSpent / prevActiveDaysCount : 0;

        // Current month aggregations
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

        let activeDaysTrend = Object.entries(dailyMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        if (rawList.length === 0 && Array.isArray(data.dailyTrend) && data.dailyTrend.length > 0) {
            activeDaysTrend = [...data.dailyTrend].sort((a, b) => a.date.localeCompare(b.date));
            totalSpent = activeDaysTrend.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        }

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

        const momChangePct =
            prevTotalSpent > 0 ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 : null;
        const avgMomChangePct =
            prevAvgPerActiveDay > 0
                ? ((avgPerActiveDay - prevAvgPerActiveDay) / prevAvgPerActiveDay) * 100
                : null;

        return {
            monthExpenses,
            activeDaysTrend,
            continuousDailySeries,
            categoryBreakdown,
            weekdayTotals,
            totalSpent,
            prevTotalSpent,
            momChangePct,
            avgPerActiveDay,
            prevAvgPerActiveDay,
            avgMomChangePct,
            avgPerElapsedDay,
            highestDay,
            topCategory,
            highestWeekday,
            daysInMonth,
            elapsedDays,
        };
    }, [data, selectedMonth, now]);

    // Derive trend chart series & active-day count for the active timeframe (1W / 1M / 3M / 6M / 1Y)
    const { trendSeries, trendActiveDays, trendPeriodLabel } = useMemo(() => {
        const fullMonthLabel = format(selectedMonth, "MMMM yyyy");
        if (trendRange === "1m") {
            return {
                trendSeries: analytics.continuousDailySeries,
                trendActiveDays: analytics.activeDaysTrend.length,
                trendPeriodLabel: fullMonthLabel,
            };
        }

        if (trendRange === "1w") {
            const sliced = analytics.continuousDailySeries.slice(-7);
            const activeCount = sliced.filter((d) => d.amount > 0).length;
            return {
                trendSeries: sliced,
                trendActiveDays: activeCount,
                trendPeriodLabel: `last 7 days · ${format(selectedMonth, "MMM yyyy")}`,
            };
        }

        const cacheKey = `${monthCachePrefix}:${trendRange}`;
        const rawRange = rangeCache[cacheKey] || [];
        const monthsBack = trendRange === "3m" ? 2 : trendRange === "6m" ? 5 : 11;
        const windowStart = startOfMonth(subMonths(selectedMonth, monthsBack));
        const referenceToday = now || new Date();
        const windowEnd = isSameMonth(selectedMonth, referenceToday)
            ? referenceToday
            : endOfMonth(selectedMonth);

        const dailyBucket = {};
        rawRange.forEach((item) => {
            const d = new Date(item.date);
            if (d >= windowStart && d <= endOfMonth(selectedMonth)) {
                const key = format(d, "yyyy-MM-dd");
                dailyBucket[key] = (dailyBucket[key] || 0) + Number(item.amount || 0);
            }
        });

        const series = eachDayOfInterval({ start: windowStart, end: windowEnd }).map((day) => {
            const key = format(day, "yyyy-MM-dd");
            return { date: key, amount: dailyBucket[key] || 0 };
        });

        const activeCount = series.filter((d) => d.amount > 0).length;
        const windowLabel = `${format(windowStart, "MMM yyyy")} – ${format(selectedMonth, "MMM yyyy")}`;
        return {
            trendSeries: series,
            trendActiveDays: activeCount,
            trendPeriodLabel: windowLabel,
        };
    }, [trendRange, analytics.continuousDailySeries, analytics.activeDaysTrend.length, selectedMonth, monthCachePrefix, rangeCache, now]);

    // Sparkline arrays derived from actual month data
    const sparklines = useMemo(() => {
        const seriesVals = analytics.continuousDailySeries.slice(-10).map((d) => d.amount);
        const totalVals = seriesVals.some((v) => v > 0) ? seriesVals : [2, 4, 3, 6, 4, 7, 5];
        const avgVals = analytics.weekdayTotals.map((w) => w.amount);
        const topCatName = analytics.topCategory?.name;
        const topCatVals = analytics.continuousDailySeries.slice(-8).map((d) => {
            const match = analytics.monthExpenses
                .filter((e) => format(new Date(e.date), "yyyy-MM-dd") === d.date && e.category === topCatName)
                .reduce((s, e) => s + Number(e.amount || 0), 0);
            return match;
        });

        return {
            total: totalVals,
            avg: avgVals.some((v) => v > 0) ? avgVals : [3, 5, 4, 4.5, 6, 5.2, 5.8],
            peak: totalVals,
            topCat: topCatVals.some((v) => v > 0) ? topCatVals : [1, 2, 1.5, 4, 3, 5],
        };
    }, [analytics]);

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
    const prevShortMonthLabel = format(subMonths(selectedMonth, 1), "MMM yyyy");
    const topCategoryShare =
        analytics.topCategory && analytics.totalSpent > 0
            ? ((analytics.topCategory.value / analytics.totalSpent) * 100).toFixed(1)
            : null;
    const todaySpent = Number(data?.todaySpent || 0);
    const trackingCoveragePct = Math.round(
        (analytics.activeDaysTrend.length / analytics.elapsedDays) * 100
    );

    const hasPrevComparison = analytics.momChangePct !== null;
    const momAbs = hasPrevComparison ? Math.abs(analytics.momChangePct).toFixed(1) : null;
    const isSpendingUp = hasPrevComparison && analytics.momChangePct > 0;
    const avgAbs = analytics.avgMomChangePct !== null ? Math.abs(analytics.avgMomChangePct).toFixed(1) : null;
    const isAvgUp = analytics.avgMomChangePct !== null && analytics.avgMomChangePct > 0;

    return (
        <div className="relative w-full space-y-6 pb-28 lg:pb-10 text-slate-900 dark:text-zinc-100">
            {/* Soft Atmospheric Liquid-Glass Canvas Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-sky-300/30 blur-[135px] dark:bg-blue-500/14" />
                <div className="absolute top-12 -right-24 h-[500px] w-[500px] rounded-full bg-indigo-300/30 blur-[140px] dark:bg-indigo-600/14" />
                <div className="absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full bg-violet-300/25 blur-[135px] dark:bg-violet-600/12" />
                <div className="absolute bottom-8 right-1/3 h-[360px] w-[360px] rounded-full bg-emerald-200/25 blur-[120px] dark:bg-emerald-500/8" />
            </div>

            {/* Header Row (Top Navbar remains completely untouched) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                className={cn(
                                    "w-2 h-2 rounded-full",
                                    isCurrentMonth
                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                                        : "bg-slate-400 dark:bg-zinc-500"
                                )}
                            />
                            <span className="text-slate-700 dark:text-zinc-200">
                                {isCurrentMonth ? "Live Month" : "Archive"}
                            </span>
                        </span>
                        <span className="text-slate-400 dark:text-zinc-600">•</span>
                        <span className="text-slate-600 dark:text-zinc-300">{monthLabel}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Spending Analytics
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
                        Track daily velocity, category distribution, and monthly spending habits.
                    </p>
                </div>

                {/* Right Controls: Month Switcher & Export CSV */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <div
                        className="inline-flex items-center rounded-full bg-white/80 dark:bg-white/[0.06] backdrop-blur-xl border border-white/95 dark:border-white/[0.12] p-1 shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-none"
                        role="group"
                        aria-label="Month navigation"
                    >
                        <button
                            type="button"
                            onClick={() => handleMonthChange(subMonths(selectedMonth, 1))}
                            disabled={isLoadingMonth}
                            aria-label="Previous month"
                            className="p-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100/90 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => !isCurrentMonth && handleMonthChange(currentMonthStart)}
                            disabled={isCurrentMonth || isLoadingMonth}
                            title={isCurrentMonth ? "Current month" : "Jump to current month"}
                            className={cn(
                                "px-3 py-1 text-xs sm:text-[13px] font-semibold min-w-[96px] text-center flex items-center justify-center gap-1.5 transition-colors",
                                isCurrentMonth
                                    ? "text-slate-900 dark:text-white cursor-default"
                                    : "text-slate-700 hover:text-blue-600 dark:text-zinc-200 dark:hover:text-sky-400 cursor-pointer"
                            )}
                        >
                            {isLoadingMonth && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-sky-400" />
                            )}
                            <span>{shortMonthLabel}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleMonthChange(addMonths(selectedMonth, 1))}
                            disabled={isCurrentMonth || isLoadingMonth}
                            aria-label="Next month"
                            className="p-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100/90 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <a
                        href={exportHref}
                        download
                        className="px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold text-slate-800 hover:text-slate-950 bg-white/80 hover:bg-white border border-white/95 dark:text-zinc-100 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.11] dark:border-white/[0.12] backdrop-blur-xl transition-all cursor-pointer inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-none"
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
                        className="p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium bg-red-50/90 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorMessage("")}
                            aria-label="Dismiss error"
                            className="text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white transition-colors p-1 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top 4 Frosted KPI Summary Cards */}
            <div
                className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-200",
                    isLoadingMonth && "opacity-60 pointer-events-none"
                )}
            >
                {/* KPI 1: Monthly Total */}
                <div className={cn(GLASS_CARD, "rounded-[22px] p-5 flex flex-col justify-between gap-3")}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/12 dark:bg-blue-500/18 border border-blue-500/20 dark:border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                            Monthly Total
                        </span>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(analytics.totalSpent)}
                            </p>
                            <p className="text-xs mt-1.5 flex items-center gap-1 truncate">
                                {hasPrevComparison ? (
                                    <>
                                        <span
                                            className={cn(
                                                "font-semibold inline-flex items-center gap-0.5",
                                                isSpendingUp
                                                    ? "text-rose-600 dark:text-rose-400"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                            )}
                                        >
                                            {isSpendingUp ? "↑" : "↓"} {isSpendingUp ? "+" : "-"}
                                            {momAbs}%
                                        </span>
                                        <span className="text-slate-500 dark:text-zinc-400 truncate">
                                            vs {prevShortMonthLabel}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-slate-500 dark:text-zinc-400">
                                        {analytics.monthExpenses.length}{" "}
                                        {analytics.monthExpenses.length === 1 ? "transaction" : "transactions"}
                                    </span>
                                )}
                            </p>
                        </div>
                        <MiniSparkline id="monthly" color="#3B82F6" values={sparklines.total} />
                    </div>
                </div>

                {/* KPI 2: Daily Average */}
                <div className={cn(GLASS_CARD, "rounded-[22px] p-5 flex flex-col justify-between gap-3")}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/12 dark:bg-violet-500/18 border border-violet-500/20 dark:border-violet-400/25 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                            <CalendarDays className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                            Daily Average
                        </span>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(analytics.avgPerActiveDay)}
                            </p>
                            <p className="text-xs mt-1.5 flex items-center gap-1 truncate tabular-nums">
                                {avgAbs !== null ? (
                                    <>
                                        <span
                                            className={cn(
                                                "font-semibold inline-flex items-center gap-0.5",
                                                isAvgUp
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                            )}
                                        >
                                            {isAvgUp ? "↑" : "↓"} {isAvgUp ? "+" : "-"}
                                            {avgAbs}%
                                        </span>
                                        <span className="text-slate-500 dark:text-zinc-400 truncate">
                                            vs last month
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-slate-500 dark:text-zinc-400 truncate">
                                        {formatINR(analytics.avgPerElapsedDay)} overall/day
                                    </span>
                                )}
                            </p>
                        </div>
                        <MiniSparkline id="dailyavg" color="#8B5CF6" values={sparklines.avg} />
                    </div>
                </div>

                {/* KPI 3: Peak Spending Day */}
                <div className={cn(GLASS_CARD, "rounded-[22px] p-5 flex flex-col justify-between gap-3")}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/12 dark:bg-amber-500/18 border border-amber-500/20 dark:border-amber-400/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <Flame className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                            Peak Spending Day
                        </span>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {analytics.highestDay ? formatINR(analytics.highestDay.amount) : "₹0.00"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 truncate">
                                {analytics.highestDay
                                    ? format(parseISO(analytics.highestDay.date), "EEE, MMM d, yyyy")
                                    : "No activity recorded"}
                            </p>
                        </div>
                        <MiniSparkline id="peak" color="#F59E0B" values={sparklines.peak} />
                    </div>
                </div>

                {/* KPI 4: Top Category */}
                <div className={cn(GLASS_CARD, "rounded-[22px] p-5 flex flex-col justify-between gap-3")}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/12 dark:bg-emerald-500/18 border border-emerald-500/20 dark:border-emerald-400/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Layers className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                            Top Category
                        </span>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white truncate">
                                {analytics.topCategory ? analytics.topCategory.name : "—"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 tabular-nums truncate">
                                {analytics.topCategory && topCategoryShare
                                    ? `${topCategoryShare}% · ${formatINR(analytics.topCategory.value)}`
                                    : "No categories active"}
                            </p>
                        </div>
                        <MiniSparkline id="topcat" color="#10B981" values={sparklines.topCat} />
                    </div>
                </div>
            </div>

            {/* Sub-Navigation Tabs (Blue underline indicator + count badges) */}
            <div
                role="tablist"
                aria-label="Analytics sections"
                className="flex border-b border-slate-200/80 dark:border-white/[0.1] gap-6 sm:gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                                "relative pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none",
                                isActive
                                    ? "text-blue-600 dark:text-sky-400"
                                    : "text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-zinc-100"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {typeof tab.count === "number" && (
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums",
                                        isActive
                                            ? "bg-blue-100 text-blue-700 dark:bg-sky-500/20 dark:text-sky-300"
                                            : "bg-slate-200/75 text-slate-600 dark:bg-white/[0.08] dark:text-zinc-400"
                                    )}
                                >
                                    {tab.count}
                                </span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="analyticsTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-blue-600 dark:bg-sky-400"
                                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Panels */}
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
                            {/* Full-Width Daily Spending Trend */}
                            <DailyTrendChart
                                data={trendSeries}
                                monthLabel={trendPeriodLabel}
                                activeDays={trendActiveDays}
                                range={trendRange}
                                onRangeChange={handleRangeChange}
                                isLoadingRange={isLoadingRange}
                            />

                            {/* Middle Row: Donut Breakdown + Monthly Spending Heatmap */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                                <CategoryPieChart
                                    className="lg:col-span-6"
                                    data={analytics.categoryBreakdown}
                                    onSelectCategory={(catName) => {
                                        setSelectedCategoryFilter(catName);
                                        setActiveTab("transactions");
                                    }}
                                />
                                <CalendarHeatmap
                                    className="lg:col-span-6"
                                    data={analytics.activeDaysTrend}
                                    rawExpenses={analytics.monthExpenses}
                                    currentMonth={selectedMonth}
                                />
                            </div>

                            {/* Bottom Unified Card: Spending Insights + Recommendation Promo Card */}
                            <div className={cn(GLASS_CARD, "p-5 sm:p-6 space-y-5")}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start sm:items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/12 dark:bg-blue-500/15 border border-blue-500/20 dark:border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-none">
                                            <Lightbulb className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                                                Spending Insights
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                                Automated highlights derived from your {shortMonthLabel} ledger.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleOpenInsights}
                                        className="self-start sm:self-auto px-3.5 py-2 rounded-full text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/90 hover:bg-indigo-100/90 border border-indigo-200/80 dark:text-indigo-200 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 dark:border-indigo-400/25 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
                                        <span>AI Insights</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                                    {/* Left 7 Cols: 4 Insight Rows */}
                                    <div className="lg:col-span-7 space-y-3">
                                        {/* Row 1: Dominant Category */}
                                        <div className="rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/75 dark:border-white/[0.08] px-4 py-3.5 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-500/12 dark:bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                                                    <Home className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white">
                                                        Dominant Category
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                                                        {analytics.topCategory
                                                            ? `${analytics.topCategory.name} drives ${topCategoryShare}% of monthly spend.`
                                                            : "No category expenses logged yet."}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/12 text-xs font-semibold font-mono text-slate-900 dark:text-white tabular-nums shrink-0 shadow-2xs">
                                                {analytics.topCategory ? formatINR(analytics.topCategory.value) : "—"}
                                            </span>
                                        </div>

                                        {/* Row 2: Today vs Daily Avg (or Archive Pace) */}
                                        <div className="rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/75 dark:border-white/[0.08] px-4 py-3.5 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-500/12 dark:bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                                                    {isCurrentMonth &&
                                                    analytics.avgPerActiveDay > 0 &&
                                                    todaySpent > analytics.avgPerActiveDay ? (
                                                        <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white">
                                                        {isCurrentMonth ? "Today vs. Daily Avg" : "Daily Spend Pace"}
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                                                        {isCurrentMonth
                                                            ? analytics.avgPerActiveDay > 0
                                                                ? todaySpent > analytics.avgPerActiveDay
                                                                    ? `${((todaySpent / analytics.avgPerActiveDay - 1) * 100).toFixed(0)}% above your active-day average.`
                                                                    : "Within your usual daily pace."
                                                                : "No baseline established yet."
                                                            : `${formatINR(analytics.avgPerElapsedDay)} averaged across all ${analytics.daysInMonth} days.`}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-semibold font-mono tabular-nums shrink-0 border",
                                                    isCurrentMonth &&
                                                        analytics.avgPerActiveDay > 0 &&
                                                        todaySpent > analytics.avgPerActiveDay
                                                        ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/35 dark:text-amber-300"
                                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/35 dark:text-emerald-300"
                                                )}
                                            >
                                                {isCurrentMonth
                                                    ? formatINR(todaySpent)
                                                    : formatINR(analytics.avgPerActiveDay)}
                                            </span>
                                        </div>

                                        {/* Row 3: Heaviest Weekday */}
                                        <div className="rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/75 dark:border-white/[0.08] px-4 py-3.5 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-violet-500/12 dark:bg-violet-500/20 border border-violet-400/20 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                                    <CalendarDays className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white">
                                                        Heaviest Weekday
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                                                        {analytics.highestWeekday
                                                            ? `${analytics.highestWeekday.day}s account for the highest volume (${analytics.highestWeekday.count} ${analytics.highestWeekday.count === 1 ? "txn" : "txns"}).`
                                                            : "No weekday pattern yet."}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/12 text-xs font-semibold font-mono text-slate-900 dark:text-white tabular-nums shrink-0 shadow-2xs">
                                                {analytics.highestWeekday
                                                    ? formatINR(analytics.highestWeekday.amount)
                                                    : "—"}
                                            </span>
                                        </div>

                                        {/* Row 4: Tracking Coverage */}
                                        <div className="rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/75 dark:border-white/[0.08] px-4 py-3.5 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-sky-500/12 dark:bg-sky-500/20 border border-sky-400/20 flex items-center justify-center text-sky-600 dark:text-sky-300 shrink-0">
                                                    <Target className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white">
                                                        Tracking Coverage
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                                                        {analytics.activeDaysTrend.length} of{" "}
                                                        {analytics.elapsedDays} elapsed days had logged spend.
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/35 dark:text-emerald-300 text-xs font-semibold font-mono tabular-nums shrink-0">
                                                {trackingCoveragePct}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right 5 Cols: Atmospheric Gradient Highlight Card */}
                                    <div className="lg:col-span-5 rounded-[22px] relative overflow-hidden p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-indigo-100/80 via-sky-50/90 to-purple-100/80 dark:from-indigo-500/16 dark:via-blue-500/10 dark:to-purple-600/18 border border-white/95 dark:border-white/12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_8px_24px_rgba(79,70,229,0.08)] dark:shadow-none">
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 rounded-full bg-violet-400/25 blur-2xl dark:bg-violet-500/20"
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-sky-400/25 blur-2xl dark:bg-sky-500/20"
                                        />

                                        <div className="relative z-10 flex flex-col items-center max-w-xs space-y-3.5">
                                            <InsightBarsArtwork />

                                            <div className="space-y-1.5">
                                                <h4 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                                                    {hasPrevComparison && !isSpendingUp && Number(momAbs) >= 5
                                                        ? "Great Spending Control"
                                                        : "Keep Your Spending in Check"}
                                                </h4>
                                                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-zinc-300">
                                                    Your total spend is{" "}
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {formatINR(analytics.totalSpent)}
                                                    </span>
                                                    {hasPrevComparison ? (
                                                        <>
                                                            , which is{" "}
                                                            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                                                                {momAbs}% {isSpendingUp ? "higher" : "lower"}
                                                            </span>{" "}
                                                            than {prevShortMonthLabel}.
                                                        </>
                                                    ) : (
                                                        <>
                                                            {" "}
                                                            across {analytics.categoryBreakdown.length}{" "}
                                                            {analytics.categoryBreakdown.length === 1
                                                                ? "category"
                                                                : "categories"}{" "}
                                                            in {shortMonthLabel}.
                                                        </>
                                                    )}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleOpenInsights}
                                                className="mt-1 px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-semibold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_10px_24px_rgba(79,70,229,0.34)] hover:shadow-[0_12px_28px_rgba(79,70,229,0.45)] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
                                            >
                                                <span>View Recommendations</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
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
                            <div className={cn(GLASS_CARD, "overflow-hidden")}>
                                <div className="p-5 sm:p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                                            Category Breakdown
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                            Ranked spending share across all categories for {monthLabel}. Select a category to inspect its transactions.
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-slate-100/90 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/12 text-xs font-semibold text-slate-800 dark:text-zinc-200 font-mono tabular-nums self-start sm:self-auto">
                                        {formatINR(analytics.totalSpent)}
                                    </span>
                                </div>

                                {analytics.categoryBreakdown.length > 0 ? (
                                    <div className="divide-y divide-slate-200/70 dark:divide-white/[0.08]">
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
                                                    className="w-full text-left px-5 sm:px-6 py-4 hover:bg-white/60 dark:hover:bg-white/[0.04] transition-colors cursor-pointer space-y-2.5 group focus-visible:outline-none"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div
                                                                className={cn(
                                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/80 dark:border-white/10",
                                                                    bg
                                                                )}
                                                            >
                                                                <Icon className={cn("w-4 h-4", color)} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-slate-950 dark:text-white truncate">
                                                                        {category.name}
                                                                    </span>
                                                                    <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-300 bg-slate-100/90 dark:bg-white/[0.08] border border-slate-200/70 dark:border-white/10 px-2 py-0.5 rounded-full">
                                                                        {share.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 tabular-nums">
                                                                    {category.count > 0
                                                                        ? `${category.count} ${category.count === 1 ? "expense" : "expenses"} · avg ${formatINR(avgTxn)}`
                                                                        : "Aggregated category total"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-sm font-bold font-mono text-slate-950 dark:text-white tabular-nums">
                                                                {formatINR(category.value)}
                                                            </span>
                                                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-sky-400 transition-colors" />
                                                        </div>
                                                    </div>

                                                    <div className="h-1.5 w-full bg-slate-200/75 dark:bg-white/[0.08] rounded-full overflow-hidden">
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
                                    <div className="p-10 text-center text-xs text-slate-600 dark:text-zinc-400">
                                        No category data recorded for {monthLabel}.
                                    </div>
                                )}

                                <div className="px-5 sm:px-6 py-3 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                                    <span>Click any category row to filter its transactions</span>
                                    <span className="font-mono font-medium">
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
                            <div className={cn(GLASS_CARD, "overflow-hidden")}>
                                <div className="p-5 sm:p-6 pb-4">
                                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                                        Weekday Spend Distribution
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                        Compare how your spending distributes across days of the week in {monthLabel}.
                                    </p>
                                </div>

                                <div className="px-5 sm:px-6 pb-6">
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
                                                            <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 tabular-nums truncate max-w-full">
                                                                {w.amount > 0
                                                                    ? `₹${w.amount >= 1000 ? `${(w.amount / 1000).toFixed(1)}k` : Math.round(w.amount)}`
                                                                    : "—"}
                                                            </span>
                                                            <div className="w-full h-24 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/75 dark:border-white/[0.08] p-1 flex items-end">
                                                                <div
                                                                    className={cn(
                                                                        "w-full rounded-lg transition-all duration-300",
                                                                        isPeak
                                                                            ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                                                                            : "bg-slate-300/85 dark:bg-white/25"
                                                                    )}
                                                                    style={{
                                                                        height:
                                                                            w.amount > 0
                                                                                ? `${Math.max(10, pct)}%`
                                                                                : "0%",
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "text-[11px] font-semibold",
                                                                    isPeak
                                                                        ? "text-blue-600 dark:text-sky-400"
                                                                        : "text-slate-600 dark:text-zinc-400"
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
                            <div className={cn(GLASS_CARD, "overflow-hidden")}>
                                <div className="p-5 sm:p-6 pb-4 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                                                Monthly Expense Ledger
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                                Filter and rank every transaction included in {monthLabel}.
                                            </p>
                                        </div>

                                        <div className="inline-flex items-center p-1 rounded-full bg-slate-100/85 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.1] self-start sm:self-auto">
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
                                                            "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                                                            active
                                                                ? "bg-blue-600 text-white shadow-xs dark:bg-blue-500"
                                                                : "text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white"
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
                                            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search title or category..."
                                                aria-label="Search monthly transactions"
                                                className="w-full h-9 pl-9 pr-3.5 rounded-full text-sm bg-slate-50/90 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.12] text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCategoryFilter("all")}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all cursor-pointer",
                                                    selectedCategoryFilter === "all"
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                                                        : "bg-white/75 border-slate-200/80 text-slate-600 hover:text-slate-950 dark:bg-white/[0.05] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white"
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
                                                            "px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all cursor-pointer",
                                                            active
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                                                                : "bg-white/75 border-slate-200/80 text-slate-600 hover:text-slate-950 dark:bg-white/[0.05] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white"
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
                                    <div className="divide-y divide-slate-200/70 dark:divide-white/[0.08] max-h-[460px] overflow-y-auto">
                                        {filteredExpenses.map((expense, idx) => {
                                            const { icon: Icon, color, bg } =
                                                getCategoryStyles(expense.category);
                                            return (
                                                <div
                                                    key={`${expense.date}-${expense.title}-${idx}`}
                                                    className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-white/60 dark:hover:bg-white/[0.03] transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div
                                                            className={cn(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/80 dark:border-white/10",
                                                                bg
                                                            )}
                                                        >
                                                            <Icon className={cn("w-4 h-4", color)} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                                {expense.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
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

                                                    <span className="text-xs sm:text-sm font-bold font-mono text-slate-950 dark:text-white tabular-nums shrink-0">
                                                        {formatINR(expense.amount)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-6 py-12 text-center space-y-2">
                                        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300">
                                            No matching transactions
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                                            {analytics.monthExpenses.length === 0
                                                ? `No expenses logged in ${monthLabel}.`
                                                : "Try clearing your search or category filter."}
                                        </p>
                                    </div>
                                )}

                                <div className="px-5 sm:px-6 py-3 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                                    <span>
                                        Showing {filteredExpenses.length} of{" "}
                                        {analytics.monthExpenses.length} transactions
                                    </span>
                                    <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
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

            {/* AI Insights & Recommendations Modal */}
            <Dialog open={isInsightsOpen} onOpenChange={setIsInsightsOpen}>
                <DialogContent className="rounded-3xl bg-white/90 dark:bg-zinc-950/85 backdrop-blur-2xl border border-white/90 dark:border-white/15 shadow-2xl text-slate-900 dark:text-zinc-100 max-w-lg p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-slate-950 dark:text-white">
                            <span className="w-8 h-8 rounded-xl bg-indigo-500/12 border border-indigo-400/25 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                <Sparkles className="w-4 h-4" />
                            </span>
                            <span>Spending Recommendations</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400">
                            Personalized guidance based on your current month spending, category shares, and active budgets.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        {isLoadingInsights ? (
                            <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                                <span>Analyzing your ledger & budget thresholds...</span>
                            </div>
                        ) : insightsError ? (
                            <div className="p-4 rounded-2xl bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-700 dark:text-red-200">
                                {insightsError}
                            </div>
                        ) : (
                            <>
                                {insightsData?.recommendations?.length > 0 ? (
                                    insightsData.recommendations.map((rec, idx) => (
                                        <div
                                            key={`${rec.title}-${idx}`}
                                            className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 flex items-start gap-3"
                                        >
                                            <span className="text-lg leading-none mt-0.5">{rec.icon || "💡"}</span>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold text-slate-950 dark:text-white">
                                                    {rec.title}
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                                                    {rec.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-400/25 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200">
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        <span>
                                            Your spending is balanced with no urgent budget threshold alerts this month.
                                        </span>
                                    </div>
                                )}

                                {insightsData?.budgetAlerts?.length > 0 && (
                                    <div className="pt-1 space-y-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                            Active Budget Alerts
                                        </p>
                                        {insightsData.budgetAlerts.map((alert) => (
                                            <div
                                                key={alert.category}
                                                className="px-3.5 py-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-500/12 border border-amber-200/80 dark:border-amber-400/30 flex items-center justify-between text-xs"
                                            >
                                                <span className="font-semibold text-amber-900 dark:text-amber-200">
                                                    {alert.category}
                                                </span>
                                                <span className="font-mono text-amber-800 dark:text-amber-300 tabular-nums">
                                                    {formatINR(alert.spent)} / {formatINR(alert.budget)} ({alert.percentage}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 dark:border-white/10">
                        <Link
                            href="/budgets"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-white inline-flex items-center gap-1"
                        >
                            <span>Manage Budgets</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsInsightsOpen(false)}
                            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
