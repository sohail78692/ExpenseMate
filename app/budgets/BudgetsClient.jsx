"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    Plus,
    Download,
    Trash2,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Wallet,
    Sparkles,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Loader2,
    ArrowUpRight,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    Gauge,
    Bell,
    Info,
    Layers,
    Target,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon,
    LayoutGrid,
    List as ListIcon,
    MoreVertical,
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

const GLASS_CARD =
    "rounded-[24px] bg-white/80 dark:bg-[#0d1224]/78 backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_18px_46px_-12px_rgba(0,0,0,0.68),inset_0_1px_1px_rgba(255,255,255,0.08)]";

const GLASS_MODAL =
    "rounded-3xl bg-white/90 dark:bg-[#0b1022]/92 backdrop-blur-2xl border border-white/95 dark:border-white/[0.14] shadow-[0_24px_64px_rgba(15,23,42,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.78),inset_0_1px_1px_rgba(255,255,255,0.08)] text-slate-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto";

const BREAKDOWN_COLORS = {
    Housing: "#8B5CF6",
    Shopping: "#EC4899",
    Food: "#F59E0B",
    Utilities: "#06B6D4",
    Transport: "#3B82F6",
    Entertainment: "#A855F7",
    Health: "#EF4444",
    Other: "#94A3B8",
};

function getSliceColor(category) {
    if (!category) return BREAKDOWN_COLORS.Other;
    const match = Object.keys(BREAKDOWN_COLORS).find(
        (key) => key.toLowerCase() === category.toLowerCase()
    );
    if (match) return BREAKDOWN_COLORS[match];
    return getCategoryStyles(category).hex || BREAKDOWN_COLORS.Other;
}

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatCompactINR(value) {
    return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function getBudgetStatus(budget) {
    const pct = Number(budget.percentage || 0);
    const threshold = Number(budget.alertThreshold ?? 80);
    if (pct >= 100) {
        return {
            key: "over",
            label: "Over Limit",
            badgeClass:
                "bg-rose-50/95 border-rose-200/90 text-rose-700 dark:bg-rose-500/18 dark:border-rose-400/35 dark:text-rose-300",
            barClass: "bg-gradient-to-r from-rose-600 via-red-500 to-pink-400",
            textClass: "text-rose-600 dark:text-rose-400",
            sparkColor: "#F43F5E",
            glowClass: "bg-rose-400/18 dark:bg-rose-500/14",
        };
    }
    if (pct >= threshold) {
        return {
            key: "risk",
            label: "Near Limit",
            badgeClass:
                "bg-amber-50/95 border-amber-200/90 text-amber-700 dark:bg-amber-500/18 dark:border-amber-400/35 dark:text-amber-300",
            barClass: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300",
            textClass: "text-amber-600 dark:text-amber-300",
            sparkColor: "#F59E0B",
            glowClass: "bg-amber-400/18 dark:bg-amber-500/14",
        };
    }
    return {
        key: "healthy",
        label: "On Track",
        badgeClass:
            "bg-emerald-50/95 border-emerald-200/90 text-emerald-700 dark:bg-emerald-500/18 dark:border-emerald-400/35 dark:text-emerald-300",
        barClass: "bg-gradient-to-r from-emerald-500 via-teal-400 to-green-400",
        textClass: "text-emerald-600 dark:text-emerald-400",
        sparkColor: "#10B981",
        glowClass: "bg-emerald-400/16 dark:bg-emerald-500/12",
    };
}

function getRecommendationTheme(type) {
    if (type === "warning") {
        return {
            Icon: AlertTriangle,
            DecorIcon: BarChart3,
            cardClass:
                "bg-gradient-to-br from-rose-50/90 via-white/75 to-rose-50/40 border-rose-200/80 dark:from-rose-500/[0.14] dark:via-[#151326]/85 dark:to-rose-950/30 dark:border-rose-500/25",
            pillClass:
                "bg-rose-100/90 border-rose-200/80 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-300",
            decorColor: "text-rose-500/35 dark:text-rose-400/45",
        };
    }
    if (type === "alert") {
        return {
            Icon: Bell,
            DecorIcon: TrendingUp,
            cardClass:
                "bg-gradient-to-br from-amber-50/90 via-white/75 to-amber-50/40 border-amber-200/80 dark:from-amber-500/[0.13] dark:via-[#161526]/85 dark:to-amber-950/25 dark:border-amber-500/25",
            pillClass:
                "bg-amber-100/90 border-amber-200/80 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-300",
            decorColor: "text-amber-500/35 dark:text-amber-400/45",
        };
    }
    if (type === "success") {
        return {
            Icon: TrendingDown,
            DecorIcon: Check,
            cardClass:
                "bg-gradient-to-br from-emerald-50/90 via-white/75 to-emerald-50/40 border-emerald-200/80 dark:from-emerald-500/[0.13] dark:via-[#101c26]/85 dark:to-emerald-950/25 dark:border-emerald-500/25",
            pillClass:
                "bg-emerald-100/90 border-emerald-200/80 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/30 dark:text-emerald-300",
            decorColor: "text-emerald-500/35 dark:text-emerald-400/45",
        };
    }
    return {
        Icon: Info,
        DecorIcon: Layers,
        cardClass:
            "bg-gradient-to-br from-sky-50/90 via-white/75 to-indigo-50/40 border-sky-200/80 dark:from-blue-500/[0.14] dark:via-[#11172d]/85 dark:to-indigo-950/30 dark:border-blue-400/25",
        pillClass:
            "bg-sky-100/90 border-sky-200/80 text-blue-700 dark:bg-sky-500/20 dark:border-sky-400/30 dark:text-sky-300",
        decorColor: "text-blue-500/35 dark:text-sky-400/45",
    };
}

/** Builds smooth decorative cubic Bezier curves for card sparklines. */
function buildSparklinePaths(values, width = 92, height = 34) {
    const pts = values && values.length >= 2 ? values : [20, 48, 34, 68, 52, 82];
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

function MiniWaveSparkline({ id, color, values, className }) {
    const { line, area } = useMemo(() => buildSparklinePaths(values), [values]);
    return (
        <svg
            viewBox="0 0 92 34"
            className={cn("w-20 sm:w-[92px] h-[34px] shrink-0 overflow-visible", className)}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={`budget-spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.34" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#budget-spark-${id})`} />
            <path
                d={line}
                fill="none"
                stroke={color}
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CircularBudgetRing({ percentage = 0, spent = 0, amount = 0, isLight }) {
    const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - pct / 100);
    const isOver = Number(percentage) >= 100;

    return (
        <div className="relative w-[164px] h-[164px] sm:w-[174px] sm:h-[174px] shrink-0 flex items-center justify-center mx-auto md:mx-0">
            <div
                aria-hidden="true"
                className={cn(
                    "absolute inset-4 rounded-full blur-2xl opacity-55",
                    isOver
                        ? "bg-gradient-to-tr from-rose-500/30 via-red-400/20 to-amber-400/20"
                        : "bg-gradient-to-tr from-violet-500/25 via-indigo-400/20 to-sky-400/25"
                )}
            />
            <svg viewBox="0 0 160 160" className="relative w-full h-full -rotate-90" aria-hidden="true">
                <defs>
                    <linearGradient id="overall-budget-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isOver ? "#F43F5E" : "#38BDF8"} />
                        <stop offset="52%" stopColor={isOver ? "#EF4444" : "#6366F1"} />
                        <stop offset="100%" stopColor={isOver ? "#F59E0B" : "#A855F7"} />
                    </linearGradient>
                </defs>
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={isLight ? "rgba(148,163,184,0.22)" : "rgba(255,255,255,0.09)"}
                    strokeWidth="14"
                />
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="url(#overall-budget-ring-grad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5">
                <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums">
                    {percentage}%
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 font-mono tabular-nums mt-0.5 truncate max-w-full">
                    {formatINR(spent)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono tabular-nums truncate max-w-full">
                    of {formatCompactINR(amount)}
                </span>
            </div>
        </div>
    );
}

function BreakdownTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0]?.payload;
    if (!entry) return null;
    const color = getSliceColor(entry.category);

    return (
        <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-white/15 px-3.5 py-2.5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-slate-950 dark:text-white">{entry.category}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-slate-500 dark:text-zinc-400">{entry.share}% of spend</span>
                <span className="font-mono font-bold text-slate-950 dark:text-white tabular-nums">
                    {formatINR(entry.amount)}
                </span>
            </div>
        </div>
    );
}

function TrendAreaTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0]?.payload;
    if (!pt) return null;

    return (
        <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-white/15 px-3.5 py-2 shadow-xl backdrop-blur-xl text-center">
            <p className="text-xs font-bold font-mono tabular-nums text-slate-950 dark:text-white">
                {formatINR(pt.amount)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{pt.label}</p>
        </div>
    );
}

export default function BudgetsClient({ initialBudgets, initialInsights }) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const [budgets, setBudgets] = useState(initialBudgets || []);
    const [insights, setInsights] = useState(initialInsights || null);
    const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
    const [activeTab, setActiveTab] = useState("budgets");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("usage");
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
    const [trendRange, setTrendRange] = useState("month"); // "month" | "half"
    const [hoveredSliceIndex, setHoveredSliceIndex] = useState(null);
    const [isOverallMenuOpen, setIsOverallMenuOpen] = useState(false);
    const [isLoadingMonth, setIsLoadingMonth] = useState(false);

    // Feedback toast pill
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

    useEffect(() => {
        if (!isOverallMenuOpen) return;
        const handleOutside = (e) => {
            if (!e.target.closest("[data-overall-menu]")) {
                setIsOverallMenuOpen(false);
            }
        };
        const handleEsc = (e) => {
            if (e.key === "Escape") setIsOverallMenuOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOverallMenuOpen]);

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
            if (data.insights) {
                setInsights(data.insights);
            }
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

    const { totalBudget, categoryBudgets, liveAlerts, summary, sparklines } = useMemo(() => {
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
        const totalRemaining = totalBudgeted - totalTrackedSpend;
        const overallUsagePct =
            totalBudgeted > 0
                ? parseFloat(((totalTrackedSpend / totalBudgeted) * 100).toFixed(1))
                : 0;

        const alerts = normalized.filter((b) => b.percentage >= b.alertThreshold);
        const overList = categoriesOnly.filter((b) => b.percentage >= 100);
        const overTotalCount = normalized.filter((b) => b.percentage >= 100).length;
        const withinCount = categoriesOnly.filter((b) => b.percentage < 100).length;
        const topOverCategory = [...overList].sort((a, b) => b.percentage - a.percentage)[0] || null;
        const onTrackAllCount = normalized.filter((b) => b.percentage < 100).length;

        const daysInSelectedMonth = getDaysInMonth(selectedMonth);
        const referenceToday = now || new Date();
        const remainingDays = isSameMonth(selectedMonth, referenceToday)
            ? Math.max(1, daysInSelectedMonth - referenceToday.getDate() + 1)
            : daysInSelectedMonth;

        const dailyAllowance =
            totalRemaining > 0 ? totalRemaining / remainingDays : 0;

        const capSeries = normalized.map((b) => b.amount);
        const pctSeries = normalized.map((b) => b.percentage);

        return {
            totalBudget: masterCap,
            categoryBudgets: categoriesOnly,
            liveAlerts: alerts.map((a) => ({
                category: a.category,
                budget: a.amount,
                spent: a.spent,
                percentage: a.percentage.toFixed(1),
            })),
            summary: {
                totalBudgeted,
                totalTrackedSpend,
                totalRemaining,
                overallUsagePct,
                alertsCount: alerts.length,
                overCount: overTotalCount,
                withinCount,
                onTrackAllCount,
                topOverCategory,
                remainingDays,
                dailyAllowance,
            },
            sparklines: {
                cap: capSeries.length >= 2 ? capSeries : [35, 62, 48, 84, 72],
                pct: pctSeries.length >= 2 ? pctSeries : [28, 54, 42, 76, 68],
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

    const breakdownData = useMemo(() => {
        if (insights?.categoryBreakdown && insights.categoryBreakdown.length > 0) {
            return insights.categoryBreakdown;
        }
        const totalCatSpend = categoryBudgets.reduce((s, b) => s + b.spent, 0);
        return categoryBudgets
            .filter((b) => b.spent > 0)
            .map((b) => ({
                category: b.category,
                amount: b.spent,
                share: totalCatSpend > 0 ? parseFloat(((b.spent / totalCatSpend) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [insights, categoryBudgets]);

    const dailyTrendData = useMemo(() => {
        const raw = insights?.dailyTrend || [];
        if (trendRange === "half" && raw.length > 15) {
            return raw.slice(-15);
        }
        return raw;
    }, [insights, trendRange]);

    const totalInsightsSpent = useMemo(() => {
        if (comparison && Number(comparison.current) > 0) return Number(comparison.current);
        return summary.totalTrackedSpend;
    }, [comparison, summary.totalTrackedSpend]);

    const displayRecommendations = useMemo(() => {
        if (insights?.recommendations && insights.recommendations.length > 0) {
            return insights.recommendations;
        }
        if (categoryBudgets.length > 0) {
            return [
                {
                    type: summary.overCount > 0 ? "warning" : "success",
                    title: summary.overCount > 0 ? "Watch Overages" : "On Track So Far",
                    message:
                        summary.overCount > 0 && summary.topOverCategory
                            ? `${summary.topOverCategory.category} is at ${summary.topOverCategory.percentage}% of its monthly limit.`
                            : "All configured budget categories are currently within healthy limits.",
                },
                {
                    type: "info",
                    title: "Daily Spending Target",
                    message: `Aim for ${formatINR(summary.dailyAllowance)}/day across the remaining ${summary.remainingDays} days.`,
                },
            ];
        }
        return [];
    }, [insights, categoryBudgets.length, summary]);

    const tabs = [
        { id: "budgets", label: "Budgets", icon: Gauge, count: budgets.length },
        {
            id: "insights",
            label: "Insights",
            icon: Sparkles,
            count: liveAlerts.length + displayRecommendations.length,
        },
    ];

    const handleTabKeyDown = (e, currentIndex) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
    };

    const hoveredSlice =
        hoveredSliceIndex !== null && breakdownData[hoveredSliceIndex]
            ? breakdownData[hoveredSliceIndex]
            : null;

    // Overall Monthly Budget card values (prefer explicit Total cap, fall back to aggregated summary if categories exist)
    const spotlightCap = totalBudget ? totalBudget.amount : summary.totalBudgeted;
    const spotlightSpent = totalBudget ? totalBudget.spent : summary.totalTrackedSpend;
    const spotlightRemaining = totalBudget ? totalBudget.remaining : summary.totalRemaining;
    const spotlightPct = totalBudget ? totalBudget.percentage : summary.overallUsagePct;
    const spotlightThreshold = totalBudget ? totalBudget.alertThreshold : 80;
    const spotlightStatus = getBudgetStatus({
        percentage: spotlightPct,
        alertThreshold: spotlightThreshold,
    });

    return (
        <div className="relative w-full space-y-6 pb-28 lg:pb-10 text-slate-900 dark:text-zinc-100">
            {/* Soft Atmospheric Liquid-Glass Canvas Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-indigo-300/25 blur-[140px] dark:bg-indigo-600/16" />
                <div className="absolute top-12 -right-24 h-[500px] w-[500px] rounded-full bg-violet-300/25 blur-[140px] dark:bg-violet-600/16" />
                <div className="absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full bg-sky-300/25 blur-[135px] dark:bg-blue-600/14" />
                <div className="absolute bottom-8 right-1/3 h-[340px] w-[340px] rounded-full bg-emerald-200/20 blur-[120px] dark:bg-emerald-500/10" />
            </div>

            {/* Centered Floating Liquid-Glass Toast Notification */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-20 sm:top-22 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
                    >
                        <div
                            role={messageType === "error" ? "alert" : "status"}
                            aria-live="polite"
                            className={cn(
                                "pointer-events-auto relative overflow-hidden w-fit max-w-full rounded-full pl-2.5 pr-2 py-2 flex items-center gap-3 text-xs sm:text-[13px] font-medium backdrop-blur-2xl shadow-2xl border",
                                messageType === "success"
                                    ? "bg-white/92 border-white/95 text-slate-900 ring-1 ring-emerald-500/25 dark:bg-zinc-900/92 dark:border-white/15 dark:text-white dark:ring-emerald-400/25"
                                    : "bg-red-50/95 border-red-200 text-red-800 ring-1 ring-red-500/30 dark:bg-red-950/85 dark:border-red-500/30 dark:text-red-100"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border",
                                    messageType === "success"
                                        ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-300"
                                        : "bg-red-500/15 border-red-500/35 text-red-600 dark:bg-red-500/20 dark:border-red-400/40 dark:text-red-300"
                                )}
                            >
                                {messageType === "success" ? (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.25]" />
                                )}
                            </div>
                            <span className="truncate">{message}</span>
                            <button
                                type="button"
                                onClick={() => setMessage("")}
                                aria-label="Dismiss notification"
                                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Header with Action Bar + 3D Clipboard Illustration */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="relative z-10 min-w-0 flex-1 space-y-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1.5">
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        summary.alertsCount > 0
                                            ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                                            : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                                    )}
                                />
                                <span className="text-slate-700 dark:text-zinc-200">Budget Guardrails</span>
                            </span>
                            <span className="text-slate-400 dark:text-zinc-600">•</span>
                            <span className="text-slate-600 dark:text-zinc-300 tabular-nums">
                                {monthLabel}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                            Budgets &{" "}
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 dark:from-sky-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                                Insights
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-xl">
                            Set category spending caps, monitor threshold alerts, and control your monthly pace.
                        </p>
                    </div>

                    {/* Controls Bar: Month Switcher + Export CSV + New Budget */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                        {/* Frosted Month Switcher Pill */}
                        <div
                            className="inline-flex items-center rounded-full bg-white/80 dark:bg-white/[0.06] border border-white/95 dark:border-white/[0.12] backdrop-blur-xl p-1 shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
                            role="group"
                            aria-label="Budget month navigation"
                        >
                            <button
                                type="button"
                                onClick={() => handleMonthChange(subMonths(selectedMonth, 1))}
                                disabled={isLoadingMonth}
                                aria-label="Previous month"
                                className="p-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100/90 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => !isCurrentMonth && handleMonthChange(currentMonthStart)}
                                disabled={isCurrentMonth || isLoadingMonth}
                                title={isCurrentMonth ? "Current month" : "Jump to current month"}
                                className={cn(
                                    "px-2.5 py-0.5 text-xs font-semibold min-w-[92px] text-center flex items-center justify-center gap-1.5 transition-colors",
                                    isCurrentMonth
                                        ? "text-slate-900 dark:text-white cursor-default"
                                        : "text-slate-700 hover:text-slate-950 dark:text-zinc-200 dark:hover:text-white cursor-pointer"
                                )}
                            >
                                {isLoadingMonth && (
                                    <Loader2 className="w-3 h-3 animate-spin text-indigo-500 dark:text-indigo-400" />
                                )}
                                <span>{shortMonthLabel}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleMonthChange(addMonths(selectedMonth, 1))}
                                disabled={isLoadingMonth}
                                aria-label="Next month"
                                className="p-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100/90 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <a
                            href={exportHref}
                            download
                            className="px-3.5 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white/80 hover:bg-white border border-white/95 dark:text-zinc-200 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.11] dark:border-white/[0.12] backdrop-blur-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                        </a>

                        <Link
                            href={newBudgetHref}
                            className="px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 shadow-[0_8px_22px_rgba(124,58,237,0.35)] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        >
                            <Plus className="w-4 h-4 shrink-0" />
                            <span>New Budget</span>
                        </Link>
                    </div>
                </div>

                {/* Right-Aligned 3D Checklist & Coins Hero Illustration */}
                <div className="relative pointer-events-none select-none shrink-0 flex justify-center md:justify-end">
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-4 bottom-2 top-4 rounded-full bg-gradient-to-tr from-violet-500/22 via-indigo-400/20 to-sky-400/22 blur-2xl"
                    />
                    <Image
                        src="/images/budgets-hero-clipboard.png"
                        alt="Budget checklist with gold coins and upward growth bar chart"
                        width={1024}
                        height={576}
                        priority
                        className="relative w-52 sm:w-64 md:w-[270px] lg:w-[310px] h-auto object-contain drop-shadow-[0_14px_24px_rgba(79,70,229,0.22)]"
                    />
                </div>
            </div>

            {/* Top 4 Frosted KPI Summary Cards */}
            <div
                className={cn(
                    "relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-200",
                    isLoadingMonth && "opacity-60 pointer-events-none"
                )}
            >
                {/* KPI 1: Overall Budget Cap */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden rounded-[22px] p-5 flex flex-col justify-between gap-2.5 bg-gradient-to-br from-indigo-50/85 via-white/80 to-violet-50/40 dark:from-indigo-500/[0.12] dark:via-[#0d1224]/85 dark:to-violet-500/[0.06]"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-24 rounded-full bg-violet-400/20 dark:bg-violet-500/16 blur-2xl"
                    />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/15 dark:bg-violet-500/22 border border-violet-500/25 dark:border-violet-400/30 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                            {totalBudget ? "Overall Budget Cap" : "Allocated Budgets"}
                        </span>
                    </div>
                    <div className="relative z-10 pr-14 pt-0.5">
                        <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                            {formatINR(summary.totalBudgeted)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate tabular-nums">
                            {summary.totalBudgeted > 0
                                ? `${summary.overallUsagePct}% used · ${categoryBudgets.length} category ${categoryBudgets.length === 1 ? "cap" : "caps"}`
                                : "No budget cap configured"}
                        </p>
                    </div>
                    <div className="pointer-events-none absolute bottom-1 right-2 opacity-90">
                        <MiniWaveSparkline id="cap" color="#8B5CF6" values={sparklines.cap} />
                    </div>
                </div>

                {/* KPI 2: Monthly Comparison */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden rounded-[22px] p-5 flex flex-col justify-between gap-2.5 bg-gradient-to-br from-emerald-50/85 via-white/80 to-teal-50/40 dark:from-emerald-500/[0.11] dark:via-[#0d1224]/85 dark:to-teal-500/[0.06]"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-24 rounded-full bg-emerald-400/20 dark:bg-emerald-500/16 blur-2xl"
                    />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/22 border border-emerald-500/25 dark:border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                            {comparison && comparisonNumeric > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                            Monthly Comparison
                        </span>
                    </div>
                    <div className="relative z-10 pr-14 pt-0.5">
                        <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                            {comparison
                                ? comparison.last === 0
                                    ? formatINR(comparison.current)
                                    : `${comparisonNumeric > 0 ? "+" : ""}${comparisonNumeric}%`
                                : formatINR(summary.totalTrackedSpend)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate tabular-nums">
                            {comparison
                                ? comparison.last > 0
                                    ? `vs last month (${formatINR(comparison.last)})`
                                    : "Current month spend"
                                : `Tracked across ${shortMonthLabel}`}
                        </p>
                    </div>
                    <div className="pointer-events-none absolute bottom-1 right-2 opacity-90">
                        <MiniWaveSparkline id="comp" color="#10B981" values={sparklines.pct} />
                    </div>
                </div>

                {/* KPI 3: Avg. Daily Spending */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden rounded-[22px] p-5 flex flex-col justify-between gap-2.5 bg-gradient-to-br from-sky-50/85 via-white/80 to-blue-50/40 dark:from-blue-500/[0.11] dark:via-[#0d1224]/85 dark:to-sky-500/[0.06]"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-24 rounded-full bg-sky-400/20 dark:bg-blue-500/16 blur-2xl"
                    />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 dark:bg-blue-500/22 border border-blue-500/25 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-sky-300 shrink-0">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                            Avg. Daily Spending
                        </span>
                    </div>
                    <div className="relative z-10 pr-14 pt-0.5">
                        <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                            {insights
                                ? formatINR(insights.averagePerDay)
                                : formatINR(summary.dailyAllowance)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate tabular-nums">
                            {insights
                                ? `${insights.totalTransactions} ${insights.totalTransactions === 1 ? "transaction" : "transactions"} this month`
                                : "Suggested daily allowance"}
                        </p>
                    </div>
                    <div className="pointer-events-none absolute bottom-1 right-2 opacity-90">
                        <MiniWaveSparkline id="daily" color="#3B82F6" values={sparklines.cap} />
                    </div>
                </div>

                {/* KPI 4: Budget Alerts */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden rounded-[22px] p-5 flex flex-col justify-between gap-2.5",
                        summary.overCount > 0
                            ? "bg-gradient-to-br from-rose-50/85 via-white/80 to-red-50/40 dark:from-rose-500/[0.12] dark:via-[#0d1224]/85 dark:to-rose-950/20"
                            : summary.alertsCount > 0
                              ? "bg-gradient-to-br from-amber-50/85 via-white/80 to-orange-50/40 dark:from-amber-500/[0.12] dark:via-[#0d1224]/85 dark:to-amber-950/20"
                              : "bg-gradient-to-br from-emerald-50/85 via-white/80 to-teal-50/40 dark:from-emerald-500/[0.11] dark:via-[#0d1224]/85 dark:to-emerald-950/20"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className={cn(
                            "pointer-events-none absolute -bottom-8 -right-8 w-32 h-24 rounded-full blur-2xl",
                            summary.overCount > 0
                                ? "bg-rose-400/20 dark:bg-rose-500/16"
                                : summary.alertsCount > 0
                                  ? "bg-amber-400/20 dark:bg-amber-500/16"
                                  : "bg-emerald-400/20 dark:bg-emerald-500/14"
                        )}
                    />
                    <div className="flex items-center gap-3 relative z-10">
                        <div
                            className={cn(
                                "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                                summary.overCount > 0
                                    ? "bg-rose-500/15 border-rose-500/25 text-rose-600 dark:bg-rose-500/22 dark:border-rose-400/30 dark:text-rose-300"
                                    : summary.alertsCount > 0
                                      ? "bg-amber-500/15 border-amber-500/25 text-amber-600 dark:bg-amber-500/22 dark:border-amber-400/30 dark:text-amber-300"
                                      : "bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:bg-emerald-500/22 dark:border-emerald-400/30 dark:text-emerald-300"
                            )}
                        >
                            <Bell className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                            Budget Alerts
                        </span>
                    </div>
                    <div className="relative z-10 pr-14 pt-0.5">
                        <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums">
                            {summary.alertsCount}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate">
                            {summary.alertsCount === 0
                                ? "All budgets on track"
                                : summary.overCount > 0
                                  ? `${summary.overCount} over limit · ${summary.alertsCount} triggered`
                                  : `${summary.alertsCount} approaching limit`}
                        </p>
                    </div>
                    <div className="pointer-events-none absolute bottom-1 right-2 opacity-90">
                        <MiniWaveSparkline
                            id="alerts"
                            color={
                                summary.overCount > 0
                                    ? "#F43F5E"
                                    : summary.alertsCount > 0
                                      ? "#F59E0B"
                                      : "#10B981"
                            }
                            values={sparklines.pct}
                        />
                    </div>
                </div>
            </div>

            {/* Frosted Pill Sub-Navigation Tabs */}
            <div
                role="tablist"
                aria-label="Budget sections"
                className="flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                                "px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold flex items-center gap-2 whitespace-nowrap border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                                isActive
                                    ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 border-violet-500/80 text-white shadow-[0_8px_20px_rgba(124,58,237,0.34)]"
                                    : "bg-white/75 border-white/95 text-slate-700 hover:text-slate-950 hover:bg-white/90 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.09] backdrop-blur-xl shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    "px-1.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums",
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-200/80 text-slate-700 dark:bg-white/[0.1] dark:text-zinc-300"
                                )}
                            >
                                {tab.count}
                            </span>
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
                            className="space-y-5"
                        >
                            {/* Spotlight Overall Monthly Budget Card (shown when Total cap or any category cap exists) */}
                            {(totalBudget || categoryBudgets.length > 0) && (
                                <div className={cn(GLASS_CARD, "relative overflow-visible p-5 sm:p-6")}>
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        {/* Left Radial Progress Ring */}
                                        <CircularBudgetRing
                                            percentage={spotlightPct}
                                            spent={spotlightSpent}
                                            amount={spotlightCap}
                                            isLight={isLight}
                                        />

                                        {/* Right Header, Gradient Bar & 4 Sub-Tiles */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                                                            Overall Monthly Budget
                                                        </h2>
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                                                                spotlightStatus.badgeClass
                                                            )}
                                                        >
                                                            {spotlightStatus.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                                                        {totalBudget
                                                            ? `Tracks combined spending across all categories for ${monthLabel}.`
                                                            : `Aggregated from ${categoryBudgets.length} category ${categoryBudgets.length === 1 ? "cap" : "caps"} in ${monthLabel}.`}
                                                    </p>
                                                </div>

                                                <div className="relative shrink-0" data-overall-menu>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsOverallMenuOpen((p) => !p)}
                                                        aria-label="Overall monthly budget options"
                                                        aria-expanded={isOverallMenuOpen}
                                                        className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {isOverallMenuOpen && (
                                                        <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-xl py-1.5 z-30">
                                                            <Link
                                                                href={newBudgetHref}
                                                                onClick={() => setIsOverallMenuOpen(false)}
                                                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:text-zinc-200 dark:hover:bg-white/10 flex items-center gap-2"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                                <span>{totalBudget ? "Add Category Cap" : "Set Total Monthly Cap"}</span>
                                                            </Link>
                                                            {totalBudget && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setIsOverallMenuOpen(false);
                                                                        setBudgetToDelete(totalBudget);
                                                                    }}
                                                                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/15 flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    <span>Delete Overall Cap</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Combined Progress Bar */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-end gap-1.5 text-xs sm:text-[13px] font-mono tabular-nums">
                                                    <span className="font-bold text-slate-950 dark:text-white">
                                                        {formatINR(spotlightSpent)}
                                                    </span>
                                                    <span className="text-slate-500 dark:text-zinc-400">
                                                        / {formatINR(spotlightCap)}
                                                    </span>
                                                </div>
                                                <div
                                                    className="relative h-3 w-full rounded-full bg-slate-200/75 dark:bg-white/[0.08] overflow-hidden"
                                                    role="progressbar"
                                                    aria-valuenow={Math.min(100, spotlightPct)}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label="Overall Monthly Budget usage"
                                                >
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            spotlightPct >= 100
                                                                ? "bg-gradient-to-r from-rose-500 via-red-500 to-amber-400"
                                                                : "bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500"
                                                        )}
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, spotlightPct))}%`,
                                                        }}
                                                    />
                                                    {spotlightThreshold > 0 && spotlightThreshold < 100 && (
                                                        <div
                                                            className="absolute top-0 bottom-0 w-0.5 bg-white/80 dark:bg-white/60"
                                                            style={{ left: `${spotlightThreshold}%` }}
                                                            title={`Alert threshold: ${spotlightThreshold}%`}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* 4 Sub-Stat Frosted Tiles */}
                                            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 pt-0.5">
                                                <div className="rounded-2xl bg-slate-50/85 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] px-3.5 py-2.5 flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-500/12 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                                                        <Layers className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-[13px] font-bold font-mono tabular-nums text-slate-950 dark:text-white truncate">
                                                            {spotlightRemaining >= 0
                                                                ? formatINR(spotlightRemaining)
                                                                : formatINR(Math.abs(spotlightRemaining))}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                            {spotlightRemaining >= 0 ? "Remaining" : "Over Budget"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl bg-slate-50/85 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] px-3.5 py-2.5 flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-amber-500/12 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                                        <Target className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-[13px] font-bold font-mono tabular-nums text-slate-950 dark:text-white truncate">
                                                            {spotlightThreshold}%
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                            Alert Threshold
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl bg-slate-50/85 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] px-3.5 py-2.5 flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-violet-500/12 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-[13px] font-bold font-mono tabular-nums text-slate-950 dark:text-white truncate">
                                                            {categoryBudgets.length}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                            Category Caps
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl bg-slate-50/85 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] px-3.5 py-2.5 flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/12 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                        <TrendingUp className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-[13px] font-bold font-mono tabular-nums text-slate-950 dark:text-white truncate">
                                                            {formatINR(summary.dailyAllowance)}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                            Daily Pace Left
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Filter Pills + Sort Select + View Toggle Toolbar */}
                            {categoryBudgets.length > 0 && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                                                        "px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer",
                                                        active
                                                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)]"
                                                            : "bg-white/75 border-white/95 text-slate-600 hover:text-slate-950 dark:bg-white/[0.05] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white backdrop-blur-md"
                                                    )}
                                                >
                                                    {filter.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                        <div className="relative">
                                            <select
                                                aria-label="Sort category budgets"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="appearance-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-white/[0.06] border border-white/95 dark:border-white/12 text-slate-800 dark:text-zinc-200 backdrop-blur-md shadow-[0_2px_8px_rgba(15,23,42,0.04)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                                            >
                                                <option value="usage" className="bg-white dark:bg-zinc-900">
                                                    Highest %
                                                </option>
                                                <option value="remaining" className="bg-white dark:bg-zinc-900">
                                                    Remaining
                                                </option>
                                                <option value="name" className="bg-white dark:bg-zinc-900">
                                                    A–Z
                                                </option>
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                                        </div>

                                        <div className="inline-flex items-center p-1 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-white/95 dark:border-white/[0.1] backdrop-blur-md">
                                            <button
                                                type="button"
                                                onClick={() => setViewMode("grid")}
                                                aria-label="Grid view"
                                                aria-pressed={viewMode === "grid"}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                                                    viewMode === "grid"
                                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs"
                                                        : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                                                )}
                                            >
                                                <LayoutGrid className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode("list")}
                                                aria-label="List view"
                                                aria-pressed={viewMode === "list"}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                                                    viewMode === "list"
                                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs"
                                                        : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                                                )}
                                            >
                                                <ListIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Category Budgets Cards / Empty States */}
                            {budgets.length === 0 ? (
                                <div className={cn(GLASS_CARD, "p-10 text-center space-y-4")}>
                                    <Image
                                        src="/images/budgets-hero-clipboard.png"
                                        alt=""
                                        width={1024}
                                        height={576}
                                        className="w-36 h-auto object-contain mx-auto opacity-85"
                                    />
                                    <div className="space-y-1">
                                        <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                            No budgets set for {monthLabel}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                                            Create category spending limits or an overall monthly cap to track expenses before you overspend.
                                        </p>
                                    </div>
                                    <Link
                                        href={newBudgetHref}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Create your first budget</span>
                                    </Link>
                                </div>
                            ) : visibleCategoryBudgets.length === 0 && categoryBudgets.length > 0 ? (
                                <div className={cn(GLASS_CARD, "p-10 text-center space-y-2.5")}>
                                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                        No category budgets match this filter
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("all")}
                                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
                                    >
                                        Show all category budgets
                                    </button>
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                    {visibleCategoryBudgets.map((budget) => {
                                        const status = getBudgetStatus(budget);
                                        const { icon: Icon, color, bg } = getCategoryStyles(budget.category);
                                        const cardSeries = [
                                            Math.max(10, budget.alertThreshold * 0.4),
                                            Math.max(15, budget.percentage * 0.65),
                                            Math.max(18, budget.alertThreshold * 0.72),
                                            Math.max(12, budget.percentage),
                                        ];

                                        return (
                                            <div
                                                key={budget._id}
                                                className={cn(
                                                    GLASS_CARD,
                                                    "relative overflow-hidden rounded-[22px] p-5 space-y-4 transition-all hover:shadow-[0_14px_38px_-12px_rgba(30,41,59,0.14)] dark:hover:border-white/[0.18]"
                                                )}
                                            >
                                                {/* Ambient Status Corner Glow */}
                                                <div
                                                    aria-hidden="true"
                                                    className={cn(
                                                        "pointer-events-none absolute -top-10 right-6 w-36 h-24 rounded-full blur-2xl",
                                                        status.glowClass
                                                    )}
                                                />

                                                {/* Top Header Row + Decorative Status Wave + Trash */}
                                                <div className="relative z-10 flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div
                                                            className={cn(
                                                                "w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] flex items-center justify-center shrink-0",
                                                                bg
                                                            )}
                                                        >
                                                            <Icon className={cn("w-5 h-5", color)} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white truncate">
                                                                {budget.category}
                                                            </h3>
                                                            <span
                                                                className={cn(
                                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border mt-1",
                                                                    status.badgeClass
                                                                )}
                                                            >
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2 shrink-0">
                                                        <div className="hidden xs:block pointer-events-none opacity-85 pt-1">
                                                            <MiniWaveSparkline
                                                                id={`cat-${budget._id}`}
                                                                color={status.sparkColor}
                                                                values={cardSeries}
                                                                className="w-20 h-7"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setBudgetToDelete(budget)}
                                                            aria-label={`Delete ${budget.category} budget`}
                                                            title="Delete budget"
                                                            className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Amounts + Progress Bar */}
                                                <div className="relative z-10 space-y-2">
                                                    <div className="flex items-baseline justify-between gap-2 font-mono tabular-nums">
                                                        <div className="flex items-baseline gap-1.5 truncate">
                                                            <span className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
                                                                {formatINR(budget.spent)}
                                                            </span>
                                                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                                                                / {formatINR(budget.amount)}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "text-xs sm:text-sm font-bold shrink-0",
                                                                status.textClass
                                                            )}
                                                        >
                                                            {budget.percentage}%
                                                        </span>
                                                    </div>

                                                    <div
                                                        className="relative h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden"
                                                        role="progressbar"
                                                        aria-valuenow={Math.min(100, budget.percentage)}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                        aria-label={`${budget.category} budget usage`}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                status.barClass
                                                            )}
                                                            style={{
                                                                width: `${Math.min(100, Math.max(0, budget.percentage))}%`,
                                                            }}
                                                        />
                                                        {budget.alertThreshold > 0 &&
                                                            budget.alertThreshold < 100 && (
                                                                <div
                                                                    className="absolute top-0 bottom-0 w-0.5 bg-white/80 dark:bg-white/60"
                                                                    style={{
                                                                        left: `${budget.alertThreshold}%`,
                                                                    }}
                                                                    title={`Alert threshold: ${budget.alertThreshold}%`}
                                                                />
                                                            )}
                                                    </div>
                                                </div>

                                                {/* Bottom Metadata Row */}
                                                <div className="relative z-10 flex items-center justify-between gap-2 text-xs pt-0.5">
                                                    <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                                                        <Bell className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                                        <span>
                                                            Alert at{" "}
                                                            <strong className="font-mono text-slate-700 dark:text-zinc-200">
                                                                {budget.alertThreshold}%
                                                            </strong>
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "font-mono font-semibold tabular-nums",
                                                            budget.remaining >= 0
                                                                ? "text-slate-700 dark:text-zinc-200"
                                                                : "text-rose-600 dark:text-rose-400"
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
                            ) : (
                                /* Compact List View */
                                <div className={cn(GLASS_CARD, "overflow-hidden divide-y divide-slate-200/70 dark:divide-white/[0.08]")}>
                                    {visibleCategoryBudgets.map((budget) => {
                                        const status = getBudgetStatus(budget);
                                        const { icon: Icon, color, bg } = getCategoryStyles(budget.category);
                                        return (
                                            <div
                                                key={budget._id}
                                                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/60 dark:hover:bg-white/[0.03] transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-[180px] sm:w-1/4">
                                                    <div
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl border border-slate-200/80 dark:border-white/[0.12] flex items-center justify-center shrink-0",
                                                            bg
                                                        )}
                                                    >
                                                        <Icon className={cn("w-4 h-4", color)} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-slate-950 dark:text-white truncate">
                                                            {budget.category}
                                                        </h3>
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-0.5",
                                                                status.badgeClass
                                                            )}
                                                        >
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex items-baseline justify-between gap-2 text-xs font-mono tabular-nums">
                                                        <span>
                                                            <strong className="text-slate-950 dark:text-white">
                                                                {formatINR(budget.spent)}
                                                            </strong>{" "}
                                                            <span className="text-slate-500 dark:text-zinc-400">
                                                                / {formatINR(budget.amount)}
                                                            </span>
                                                        </span>
                                                        <span className={cn("font-bold", status.textClass)}>
                                                            {budget.percentage}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full", status.barClass)}
                                                            style={{
                                                                width: `${Math.min(100, Math.max(0, budget.percentage))}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                                    <span
                                                        className={cn(
                                                            "text-xs font-mono font-semibold tabular-nums",
                                                            budget.remaining >= 0
                                                                ? "text-slate-700 dark:text-zinc-300"
                                                                : "text-rose-600 dark:text-rose-400"
                                                        )}
                                                    >
                                                        {budget.remaining >= 0
                                                            ? `${formatINR(budget.remaining)} left`
                                                            : `${formatINR(Math.abs(budget.remaining))} over`}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setBudgetToDelete(budget)}
                                                        aria-label={`Delete ${budget.category} budget`}
                                                        className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Bottom Budget Insights Strip */}
                            {budgets.length > 0 && (
                                <div className={cn(GLASS_CARD, "p-5 sm:p-6 space-y-4")}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-violet-500/12 dark:bg-violet-500/20 border border-violet-500/25 dark:border-violet-400/25 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                                <Sparkles className="w-4.5 h-4.5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                                    Budget Insights
                                                </h3>
                                                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                                    Smart insights to help you stay within your monthly budget.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("insights")}
                                            className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white/85 hover:bg-white border border-slate-200/80 dark:text-zinc-200 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:border-white/[0.12] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>View Detailed Insights</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {/* Insight Tile 1: On Track */}
                                        <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/[0.1] border border-emerald-200/75 dark:border-emerald-400/20 p-3.5 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-950 dark:text-white">
                                                    On Track
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                                {summary.withinCount} of {categoryBudgets.length}{" "}
                                                {categoryBudgets.length === 1 ? "category is" : "categories are"} within budget.
                                            </p>
                                        </div>

                                        {/* Insight Tile 2: Over Budget */}
                                        <div
                                            className={cn(
                                                "rounded-2xl border p-3.5 space-y-2",
                                                summary.topOverCategory
                                                    ? "bg-rose-50/80 dark:bg-rose-500/[0.1] border-rose-200/75 dark:border-rose-400/20"
                                                    : "bg-slate-50/80 dark:bg-white/[0.04] border-slate-200/75 dark:border-white/[0.08]"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0",
                                                        summary.topOverCategory
                                                            ? "bg-rose-500/15 border-rose-500/25 text-rose-600 dark:text-rose-400"
                                                            : "bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                                                    )}
                                                >
                                                    {summary.topOverCategory ? (
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-slate-950 dark:text-white">
                                                    Over Budget
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                                {summary.topOverCategory
                                                    ? `${summary.topOverCategory.category} is ${summary.topOverCategory.percentage}% (${formatINR(Math.abs(summary.topOverCategory.remaining))} over).`
                                                    : "No categories have exceeded their monthly cap."}
                                            </p>
                                        </div>

                                        {/* Insight Tile 3: Daily Pace */}
                                        <div className="rounded-2xl bg-sky-50/80 dark:bg-blue-500/[0.1] border border-sky-200/75 dark:border-blue-400/20 p-3.5 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-950 dark:text-white">
                                                    Daily Pace
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                                You can spend {formatINR(summary.dailyAllowance)} per day to stay on track.
                                            </p>
                                        </div>

                                        {/* Insight Tile 4: Tip */}
                                        <div className="rounded-2xl bg-violet-50/80 dark:bg-violet-500/[0.1] border border-violet-200/75 dark:border-violet-400/20 p-3.5 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                                    <Target className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-950 dark:text-white">
                                                    Tip
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                                {summary.topOverCategory
                                                    ? `Reduce ${summary.topOverCategory.category} by ~${formatINR(Math.abs(summary.topOverCategory.remaining))} to get back on track.`
                                                    : "Keep daily spending below your allowance to grow monthly savings."}
                                            </p>
                                        </div>
                                    </div>
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
                            className="space-y-5"
                        >
                            {/* 1. Spending Recommendations */}
                            <div className={cn(GLASS_CARD, "p-5 sm:p-6 space-y-4")}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/15 dark:bg-indigo-500/22 border border-indigo-500/25 dark:border-indigo-400/25 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                                            <Sparkles className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                                Spending Recommendations
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                                Automated signals derived from your monthly spending activity and budget thresholds.
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/analytics"
                                        className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white/85 hover:bg-white border border-slate-200/80 dark:text-zinc-200 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:border-white/[0.12] transition-all inline-flex items-center gap-1.5 shrink-0"
                                    >
                                        <span>Open Analytics</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                {displayRecommendations.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                        {displayRecommendations.map((rec, index) => {
                                            const theme = getRecommendationTheme(rec.type);
                                            const BadgeIcon = theme.Icon;
                                            const DecorIcon = theme.DecorIcon;
                                            return (
                                                <div
                                                    key={`${rec.type}-${index}`}
                                                    className={cn(
                                                        "relative overflow-hidden rounded-2xl border p-4 flex flex-col justify-between gap-3 min-h-[124px]",
                                                        theme.cardClass
                                                    )}
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                                                                theme.pillClass
                                                            )}
                                                        >
                                                            <BadgeIcon className="w-3 h-3 shrink-0" />
                                                            <span>{rec.title}</span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-end justify-between gap-3">
                                                        <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                                                            {rec.message}
                                                        </p>
                                                        <DecorIcon
                                                            className={cn("w-8 h-8 shrink-0", theme.decorColor)}
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                                        No recommendations yet — add expenses and budgets to generate spending insights.
                                    </div>
                                )}
                            </div>

                            {/* 2. Triggered Alerts & Top Categories Split */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                                {/* Triggered Alerts */}
                                <div className={cn(GLASS_CARD, "lg:col-span-6 p-5 sm:p-6 flex flex-col gap-4")}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-violet-500/15 dark:bg-violet-500/22 border border-violet-500/25 dark:border-violet-400/25 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                            <Bell className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                                Triggered Alerts
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                                Budgets at or above their configured alert threshold.
                                            </p>
                                        </div>
                                    </div>

                                    {liveAlerts.length > 0 ? (
                                        <div className="divide-y divide-slate-200/70 dark:divide-white/[0.08]">
                                            {liveAlerts.map((alert, idx) => {
                                                const pctNum = parseFloat(alert.percentage);
                                                const isOver = pctNum >= 100;
                                                const { icon: CatIcon, color, bg } = getCategoryStyles(
                                                    alert.category
                                                );
                                                return (
                                                    <div
                                                        key={`${alert.category}-${idx}`}
                                                        className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div
                                                                className={cn(
                                                                    "w-9 h-9 rounded-xl border border-slate-200/80 dark:border-white/[0.1] flex items-center justify-center shrink-0",
                                                                    alert.category === "Total"
                                                                        ? "bg-violet-500/12 dark:bg-violet-500/20"
                                                                        : bg
                                                                )}
                                                            >
                                                                {alert.category === "Total" ? (
                                                                    <Wallet className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                                                                ) : (
                                                                    <CatIcon className={cn("w-4 h-4", color)} />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs sm:text-sm font-semibold text-slate-950 dark:text-white truncate">
                                                                    {alert.category}
                                                                </p>
                                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono tabular-nums">
                                                                    {formatINR(alert.spent)} / {formatINR(alert.budget)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <span
                                                            className={cn(
                                                                "px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border tabular-nums shrink-0",
                                                                isOver
                                                                    ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/35 dark:text-rose-300"
                                                                    : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/35 dark:text-amber-300"
                                                            )}
                                                        >
                                                            {alert.percentage}%
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="my-auto py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                                            All active budgets are below their alert thresholds.
                                        </div>
                                    )}
                                </div>

                                {/* Top Categories This Month */}
                                <div className={cn(GLASS_CARD, "lg:col-span-6 p-5 sm:p-6 flex flex-col gap-4")}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/15 dark:bg-indigo-500/22 border border-indigo-500/25 dark:border-indigo-400/25 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                                            <BarChart3 className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                                Top Categories This Month
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                                Your highest spending categories for {shortMonthLabel}.
                                            </p>
                                        </div>
                                    </div>

                                    {insights?.topCategories && insights.topCategories.length > 0 ? (
                                        <div className="divide-y divide-slate-200/70 dark:divide-white/[0.08]">
                                            {insights.topCategories.map((cat, idx) => {
                                                const { icon: Icon, color, bg } = getCategoryStyles(
                                                    cat.category
                                                );
                                                return (
                                                    <div
                                                        key={cat.category}
                                                        className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className="w-6 h-6 rounded-full bg-indigo-500/12 dark:bg-indigo-500/22 border border-indigo-500/25 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                                                                {idx + 1}
                                                            </span>
                                                            <div
                                                                className={cn(
                                                                    "w-9 h-9 rounded-xl border border-slate-200/80 dark:border-white/[0.1] flex items-center justify-center shrink-0",
                                                                    bg
                                                                )}
                                                            >
                                                                <Icon className={cn("w-4 h-4", color)} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs sm:text-sm font-semibold text-slate-950 dark:text-white truncate">
                                                                    {cat.category}
                                                                </p>
                                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                                    {cat.count}{" "}
                                                                    {cat.count === 1 ? "expense" : "expenses"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-950 dark:text-white tabular-nums shrink-0">
                                                            {formatINR(cat.amount)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="my-auto py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                                            Log expenses in {shortMonthLabel} to see your top categories.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Spending Breakdown & Daily Spending Trend */}
                            <div className={cn(GLASS_CARD, "p-5 sm:p-6 space-y-5")}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/15 dark:bg-blue-500/22 border border-blue-500/25 dark:border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-sky-300 shrink-0">
                                            <PieChartIcon className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                                Spending Breakdown &amp; Trends
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                                A deeper look at your spending patterns and category distribution.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative self-start sm:self-auto shrink-0">
                                        <select
                                            aria-label="Trend time window"
                                            value={trendRange}
                                            onChange={(e) => setTrendRange(e.target.value)}
                                            className="appearance-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/12 text-slate-800 dark:text-zinc-200 backdrop-blur-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                                        >
                                            <option value="month" className="bg-white dark:bg-zinc-900">
                                                This Month
                                            </option>
                                            <option value="half" className="bg-white dark:bg-zinc-900">
                                                Last 15 Days
                                            </option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                    {/* Left: Category Donut + Share Legend */}
                                    <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-5">
                                        {breakdownData.length > 0 ? (
                                            <>
                                                <div className="relative h-[190px] w-[190px] shrink-0">
                                                    {hasMounted && (
                                                        <ResponsiveContainer
                                                            width="100%"
                                                            height="100%"
                                                            minWidth={0}
                                                            minHeight={0}
                                                            initialDimension={{ width: 190, height: 190 }}
                                                        >
                                                            <PieChart>
                                                                <Pie
                                                                    data={breakdownData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={58}
                                                                    outerRadius={84}
                                                                    paddingAngle={breakdownData.length > 1 ? 2.5 : 0}
                                                                    cornerRadius={3}
                                                                    dataKey="amount"
                                                                    onMouseEnter={(_, idx) =>
                                                                        setHoveredSliceIndex(idx)
                                                                    }
                                                                    onMouseLeave={() => setHoveredSliceIndex(null)}
                                                                >
                                                                    {breakdownData.map((entry, idx) => {
                                                                        const isDimmed =
                                                                            hoveredSliceIndex !== null &&
                                                                            hoveredSliceIndex !== idx;
                                                                        return (
                                                                            <Cell
                                                                                key={`slice-${entry.category}`}
                                                                                fill={getSliceColor(entry.category)}
                                                                                stroke={
                                                                                    isLight
                                                                                        ? "rgba(255,255,255,0.9)"
                                                                                        : "rgba(13,18,36,0.9)"
                                                                                }
                                                                                strokeWidth={2}
                                                                                fillOpacity={isDimmed ? 0.35 : 1}
                                                                                className="transition-opacity duration-200 outline-none"
                                                                            />
                                                                        );
                                                                    })}
                                                                </Pie>
                                                                <Tooltip content={<BreakdownTooltip />} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    )}

                                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                                        <span className="text-sm font-bold text-slate-950 dark:text-white font-mono tabular-nums">
                                                            {formatCompactINR(
                                                                hoveredSlice
                                                                    ? hoveredSlice.amount
                                                                    : totalInsightsSpent
                                                            )}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate max-w-[100px]">
                                                            {hoveredSlice ? hoveredSlice.category : "Total Spent"}
                                                        </span>
                                                        {summary.totalBudgeted > 0 && !hoveredSlice && (
                                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums">
                                                                {summary.overallUsagePct}% of{" "}
                                                                {formatCompactINR(summary.totalBudgeted)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 w-full min-w-0 space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
                                                    {breakdownData.map((entry, idx) => {
                                                        const isHovered = hoveredSliceIndex === idx;
                                                        return (
                                                            <div
                                                                key={entry.category}
                                                                onMouseEnter={() => setHoveredSliceIndex(idx)}
                                                                onMouseLeave={() => setHoveredSliceIndex(null)}
                                                                className={cn(
                                                                    "flex items-center justify-between gap-3 text-xs py-1.5 px-2.5 rounded-xl transition-colors",
                                                                    isHovered
                                                                        ? "bg-slate-100/90 dark:bg-white/[0.08]"
                                                                        : "hover:bg-slate-100/60 dark:hover:bg-white/[0.04]"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <span
                                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                        style={{
                                                                            backgroundColor: getSliceColor(
                                                                                entry.category
                                                                            ),
                                                                        }}
                                                                    />
                                                                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                                                                        {entry.category}
                                                                    </span>
                                                                </div>
                                                                <span className="font-mono font-semibold text-slate-700 dark:text-zinc-300 tabular-nums shrink-0">
                                                                    {entry.share}%
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
                                                No expense distribution data available for {shortMonthLabel}.
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Smooth Violet Daily Spending Trend Area Chart */}
                                    <div className="lg:col-span-6 rounded-2xl bg-slate-50/75 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08] p-4 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                Daily Spending Trend
                                            </span>
                                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                                                {shortMonthLabel}
                                            </span>
                                        </div>
                                        <div className="h-[175px] w-full">
                                            {hasMounted && dailyTrendData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart
                                                        data={dailyTrendData}
                                                        margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                                                    >
                                                        <defs>
                                                            <linearGradient
                                                                id="budgetDailyTrendFill"
                                                                x1="0"
                                                                y1="0"
                                                                x2="0"
                                                                y2="1"
                                                            >
                                                                <stop
                                                                    offset="0%"
                                                                    stopColor="#A855F7"
                                                                    stopOpacity={isLight ? 0.32 : 0.48}
                                                                />
                                                                <stop
                                                                    offset="100%"
                                                                    stopColor="#A855F7"
                                                                    stopOpacity={0.0}
                                                                />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            vertical={false}
                                                            stroke={
                                                                isLight
                                                                    ? "rgba(148,163,184,0.22)"
                                                                    : "rgba(255,255,255,0.06)"
                                                            }
                                                        />
                                                        <XAxis
                                                            dataKey="label"
                                                            tick={{
                                                                fontSize: 10,
                                                                fill: isLight ? "#64748B" : "#A1A1AA",
                                                            }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            interval="preserveStartEnd"
                                                            minTickGap={28}
                                                        />
                                                        <YAxis hide domain={[0, "auto"]} />
                                                        <Tooltip content={<TrendAreaTooltip />} />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="amount"
                                                            stroke="#A855F7"
                                                            strokeWidth={2.5}
                                                            fill="url(#budgetDailyTrendFill)"
                                                            activeDot={{
                                                                r: 5,
                                                                fill: "#A855F7",
                                                                stroke: "#FFFFFF",
                                                                strokeWidth: 2,
                                                            }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-zinc-400">
                                                    No daily trend data for {shortMonthLabel}.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Bottom Key Takeaways Bar */}
                            <div
                                className={cn(
                                    GLASS_CARD,
                                    "p-4 sm:p-5 bg-gradient-to-r from-indigo-500/[0.06] via-white/80 to-violet-500/[0.06] dark:from-indigo-500/[0.12] dark:via-[#0d1224]/85 dark:to-violet-500/[0.1] flex flex-col xl:flex-row xl:items-center justify-between gap-4"
                                )}
                            >
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-violet-500/15 dark:bg-violet-500/22 border border-violet-500/25 dark:border-violet-400/25 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                        <Sparkles className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                            Key Takeaways
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                            Quick insights from your {monthLabel} budget.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                                    <div className="rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-white/95 dark:border-white/[0.1] px-3.5 py-2.5 flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                                                comparisonNumeric > 0
                                                    ? "bg-rose-500/12 border-rose-500/25 text-rose-600 dark:text-rose-400"
                                                    : "bg-emerald-500/12 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                                            )}
                                        >
                                            {comparisonNumeric > 0 ? (
                                                <ArrowUp className="w-4 h-4" />
                                            ) : (
                                                <ArrowDown className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p
                                                className={cn(
                                                    "text-xs sm:text-sm font-bold font-mono tabular-nums truncate",
                                                    comparisonNumeric > 0
                                                        ? "text-rose-600 dark:text-rose-400"
                                                        : "text-emerald-600 dark:text-emerald-400"
                                                )}
                                            >
                                                {comparison && comparison.last > 0
                                                    ? `${comparisonNumeric > 0 ? "+" : ""}${comparisonNumeric}%`
                                                    : formatINR(totalInsightsSpent)}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                {comparison && comparison.last > 0
                                                    ? "vs previous period"
                                                    : "total tracked spend"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-white/95 dark:border-white/[0.1] px-3.5 py-2.5 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-violet-500/12 border border-violet-500/25 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                            <Wallet className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-950 dark:text-white truncate">
                                                {formatINR(Math.abs(summary.totalRemaining))}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                {summary.totalRemaining >= 0
                                                    ? "remaining budget"
                                                    : "over monthly budget"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-white/95 dark:border-white/[0.1] px-3.5 py-2.5 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-500/12 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-sky-300 shrink-0">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-950 dark:text-white truncate">
                                                {summary.onTrackAllCount} of {budgets.length}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                budgets on track
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* DELETE BUDGET LIQUID-GLASS MODAL (Light & Dark Mode) */}
            <Dialog
                open={Boolean(budgetToDelete)}
                onOpenChange={(open) => !open && setBudgetToDelete(null)}
            >
                <DialogContent className={cn(GLASS_MODAL, "max-w-md p-5 sm:p-6")}>
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </span>
                            <span>Delete Budget</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                            Remove the{" "}
                            <span className="text-slate-950 dark:text-white font-semibold">
                                {budgetToDelete?.category}
                            </span>{" "}
                            budget ({formatINR(budgetToDelete?.amount)}) for {monthLabel}? Your logged expenses will not be affected.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 pt-3">
                        <button
                            type="button"
                            onClick={() => setBudgetToDelete(null)}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 dark:text-zinc-300 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:border-white/[0.12] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 shadow-[0_6px_18px_rgba(225,29,72,0.35)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                        >
                            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>{isDeleting ? "Deleting..." : "Delete Budget"}</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
