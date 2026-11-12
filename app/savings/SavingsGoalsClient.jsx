"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
    Plus,
    Target,
    Calendar,
    TrendingUp,
    Trash2,
    CheckCircle2,
    Clock,
    Layers,
    PiggyBank,
    Check,
    AlertTriangle,
    X,
    Loader2,
    ArrowUpRight,
    Sparkles,
    LayoutGrid,
    List as ListIcon,
    MoreVertical,
    ChevronDown,
    Trophy,
    PieChart as PieChartIcon,
    Wallet,
    Lightbulb,
    BarChart3,
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SAVINGS_CATEGORY_COLORS = {
    House: "#8B5CF6",
    "Emergency Fund": "#10B981",
    Electronics: "#3B82F6",
    Investment: "#F59E0B",
    Vacation: "#EC4899",
    Car: "#06B6D4",
    Education: "#6366F1",
    Wedding: "#F43F5E",
    Retirement: "#14B8A6",
    Purchase: "#F97316",
    Other: "#94A3B8",
};

function getSavingsCategoryColor(category) {
    if (!category) return SAVINGS_CATEGORY_COLORS.Other;
    const match = Object.keys(SAVINGS_CATEGORY_COLORS).find(
        (key) => key.toLowerCase() === category.toLowerCase()
    );
    return match ? SAVINGS_CATEGORY_COLORS[match] : SAVINGS_CATEGORY_COLORS.Other;
}

const SAVINGS_CATEGORY_CARD_THEMES = {
    Electronics: {
        iconTile: "bg-sky-500/12 border-sky-200/80 dark:bg-sky-500/18 dark:border-sky-400/25",
        badge: "bg-sky-50 border-sky-200/80 text-blue-700 dark:bg-sky-500/15 dark:border-sky-400/25 dark:text-sky-300",
        bar: "bg-gradient-to-r from-blue-600 to-sky-500",
    },
    Vacation: {
        iconTile: "bg-violet-500/12 border-violet-200/80 dark:bg-violet-500/18 dark:border-violet-400/25",
        badge: "bg-violet-50 border-violet-200/80 text-violet-700 dark:bg-violet-500/15 dark:border-violet-400/25 dark:text-violet-300",
        bar: "bg-gradient-to-r from-violet-600 to-purple-500",
    },
    "Emergency Fund": {
        iconTile: "bg-amber-500/12 border-amber-200/80 dark:bg-amber-500/18 dark:border-amber-400/25",
        badge: "bg-emerald-50 border-emerald-200/80 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-400/25 dark:text-emerald-300",
        bar: "bg-gradient-to-r from-emerald-500 to-green-400",
    },
    Investment: {
        iconTile: "bg-blue-500/12 border-blue-200/80 dark:bg-blue-500/18 dark:border-blue-400/25",
        badge: "bg-amber-50 border-amber-200/80 text-amber-700 dark:bg-amber-500/15 dark:border-amber-400/25 dark:text-amber-300",
        bar: "bg-gradient-to-r from-orange-500 to-amber-400",
    },
    House: {
        iconTile: "bg-emerald-500/12 border-emerald-200/80 dark:bg-emerald-500/18 dark:border-emerald-400/25",
        badge: "bg-blue-50 border-blue-200/80 text-blue-700 dark:bg-blue-500/15 dark:border-blue-400/25 dark:text-sky-300",
        bar: "bg-gradient-to-r from-blue-600 to-indigo-500",
    },
    Car: {
        iconTile: "bg-blue-500/12 border-blue-200/80 dark:bg-blue-500/18 dark:border-blue-400/25",
        badge: "bg-blue-50 border-blue-200/80 text-blue-700 dark:bg-blue-500/15 dark:border-blue-400/25 dark:text-sky-300",
        bar: "bg-gradient-to-r from-blue-600 to-cyan-500",
    },
    Education: {
        iconTile: "bg-amber-500/12 border-amber-200/80 dark:bg-amber-500/18 dark:border-amber-400/25",
        badge: "bg-amber-50 border-amber-200/80 text-amber-700 dark:bg-amber-500/15 dark:border-amber-400/25 dark:text-amber-300",
        bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
    },
    Wedding: {
        iconTile: "bg-rose-500/12 border-rose-200/80 dark:bg-rose-500/18 dark:border-rose-400/25",
        badge: "bg-rose-50 border-rose-200/80 text-rose-700 dark:bg-rose-500/15 dark:border-rose-400/25 dark:text-rose-300",
        bar: "bg-gradient-to-r from-rose-500 to-pink-500",
    },
    Retirement: {
        iconTile: "bg-teal-500/12 border-teal-200/80 dark:bg-teal-500/18 dark:border-teal-400/25",
        badge: "bg-teal-50 border-teal-200/80 text-teal-700 dark:bg-teal-500/15 dark:border-teal-400/25 dark:text-teal-300",
        bar: "bg-gradient-to-r from-teal-500 to-emerald-400",
    },
    Purchase: {
        iconTile: "bg-orange-500/12 border-orange-200/80 dark:bg-orange-500/18 dark:border-orange-400/25",
        badge: "bg-orange-50 border-orange-200/80 text-orange-700 dark:bg-orange-500/15 dark:border-orange-400/25 dark:text-orange-300",
        bar: "bg-gradient-to-r from-orange-500 to-rose-400",
    },
    Other: {
        iconTile: "bg-slate-500/10 border-slate-200/80 dark:bg-white/[0.08] dark:border-white/15",
        badge: "bg-slate-100 border-slate-200/80 text-slate-700 dark:bg-white/[0.08] dark:border-white/12 dark:text-zinc-300",
        bar: "bg-gradient-to-r from-indigo-500 to-blue-500",
    },
};

function getSavingsCardTheme(category) {
    if (!category) return SAVINGS_CATEGORY_CARD_THEMES.Other;
    const match = Object.keys(SAVINGS_CATEGORY_CARD_THEMES).find(
        (key) => key.toLowerCase() === category.toLowerCase()
    );
    return match ? SAVINGS_CATEGORY_CARD_THEMES[match] : SAVINGS_CATEGORY_CARD_THEMES.Other;
}

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatCompactWholeINR(value) {
    return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function getMonthlyPace(remaining, daysLeft) {
    if (remaining <= 0) return 0;
    if (daysLeft <= 0) return remaining;
    const monthsLeft = Math.max(daysLeft / 30.4375, 1);
    return remaining / monthsLeft;
}

function getGoalSpanMonths(createdAt, deadline) {
    const start = createdAt ? new Date(createdAt).getTime() : Date.now();
    const end = deadline ? new Date(deadline).getTime() : start;
    const diffDays = Math.max(30, (end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays / 30.4375);
}

/** Builds a smooth decorative SVG path from normalized numeric values. */
function buildSparklinePaths(values, width = 88, height = 34) {
    const pts = values && values.length >= 2 ? values : [0.2, 0.45, 0.35, 0.7, 0.55, 0.85];
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
                <linearGradient id={`savings-spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#savings-spark-${id})`} />
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

function MiniCompletionRing({ percent = 0 }) {
    const pct = Math.max(0, Math.min(100, Number(percent) || 0));
    const r = 20;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct / 100);
    return (
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90" aria-hidden="true">
                <circle
                    cx="24"
                    cy="24"
                    r={r}
                    fill="none"
                    className="stroke-slate-200/80 dark:stroke-white/[0.1]"
                    strokeWidth="4.5"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={r}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                />
            </svg>
            <span className="absolute text-[10px] font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {Math.round(pct)}%
            </span>
        </div>
    );
}

function AllocationTooltip({ active, payload, total }) {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0]?.payload;
    if (!entry) return null;
    const share = total > 0 ? ((entry.target / total) * 100).toFixed(1) : "0.0";
    const color = getSavingsCategoryColor(entry.name);

    return (
        <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-white/15 px-3.5 py-2.5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-slate-950 dark:text-white">{entry.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-slate-500 dark:text-zinc-400">{share}% of targets</span>
                <span className="font-mono font-semibold text-slate-950 dark:text-white tabular-nums">
                    {formatINR(entry.target)}
                </span>
            </div>
        </div>
    );
}

function FundingPaceGauge({
    requiredPace,
    currentPace,
    periodUnit = "month",
    paceRatioPct = 0,
    isLight,
}) {
    const ratio = requiredPace > 0 ? Math.min(1, Math.max(0, currentPace / requiredPace)) : 1;
    // Semi-circle arc from (26, 112) to (194, 112), r = 84
    const radius = 84;
    const arcLength = Math.PI * radius;
    const dashOffset = arcLength * (1 - ratio);
    const isOnTrack = requiredPace <= 0 || currentPace >= requiredPace;

    return (
        <div className="relative w-full max-w-[236px] mx-auto flex flex-col items-center">
            <svg viewBox="0 0 220 128" className="w-full h-auto overflow-visible" aria-hidden="true">
                <defs>
                    <linearGradient id="pace-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="65%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#6EE7B7" />
                    </linearGradient>
                </defs>
                {/* Track */}
                <path
                    d={`M 26 112 A ${radius} ${radius} 0 0 1 194 112`}
                    fill="none"
                    stroke={isLight ? "rgba(148,163,184,0.22)" : "rgba(255,255,255,0.1)"}
                    strokeWidth="18"
                    strokeLinecap="round"
                />
                {/* Filled Progress Arc */}
                <path
                    d={`M 26 112 A ${radius} ${radius} 0 0 1 194 112`}
                    fill="none"
                    stroke="url(#pace-gauge-grad)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeDasharray={arcLength}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-500"
                />
            </svg>
            <div className="-mt-13 text-center px-2">
                <p className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums">
                    {formatINR(currentPace)}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    per {periodUnit}
                </p>
                <div className="mt-2.5 flex justify-center">
                    <span
                        className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border tabular-nums",
                            isOnTrack
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/35 dark:text-emerald-300"
                                : "bg-emerald-50 border-emerald-200/80 text-emerald-700 dark:bg-emerald-500/18 dark:border-emerald-400/30 dark:text-emerald-300"
                        )}
                    >
                        {paceRatioPct.toFixed(1)}% of required pace
                    </span>
                </div>
            </div>
        </div>
    );
}

const GLASS_CARD =
    "rounded-[24px] bg-white/78 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_16px_42px_-12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]";

const GLASS_MODAL =
    "rounded-3xl bg-white/88 dark:bg-[#0b1120]/90 backdrop-blur-2xl border border-white/95 dark:border-white/[0.14] shadow-[0_24px_64px_rgba(15,23,42,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.08)] text-slate-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto";

export default function SavingsGoalsClient({ initialGoals }) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const [goals, setGoals] = useState(initialGoals || []);
    const [activeTab, setActiveTab] = useState("active");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("deadline");
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
    const [completedCategoryFilter, setCompletedCategoryFilter] = useState("all");
    const [completedSortBy, setCompletedSortBy] = useState("recent"); // "recent" | "amount" | "days"
    const [completedViewMode, setCompletedViewMode] = useState("grid"); // "grid" | "list"
    const [openMenuGoalId, setOpenMenuGoalId] = useState(null);
    const [hoveredAllocIndex, setHoveredAllocIndex] = useState(null);
    const [allocMetricMode, setAllocMetricMode] = useState("amount"); // "amount" | "percent"
    const [pacePeriod, setPacePeriod] = useState("monthly"); // "monthly" | "weekly" | "yearly"

    // Feedback toast pill state
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    // Update Progress dialog state
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [updateMode, setUpdateMode] = useState("deposit"); // "deposit" | "set"
    const [amountInput, setAmountInput] = useState("");
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const [dialogError, setDialogError] = useState("");

    // Delete Confirmation dialog state
    const [goalToDelete, setGoalToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(""), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    useEffect(() => {
        if (!openMenuGoalId) return;
        const handleOutside = (e) => {
            if (!e.target.closest("[data-goal-menu]")) {
                setOpenMenuGoalId(null);
            }
        };
        const handleEsc = (e) => {
            if (e.key === "Escape") setOpenMenuGoalId(null);
        };
        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [openMenuGoalId]);

    const { activeGoals, completedGoals, stats, categories, allCategories, allocation, sparklines } = useMemo(() => {
        const normalized = (goals || []).map((g) => {
            const target = Number(g.targetAmount || 0);
            const current = Number(g.currentAmount || 0);
            const progress = target > 0 ? parseFloat(((current / target) * 100).toFixed(1)) : 0;
            const remaining = Math.max(0, target - current);
            return {
                ...g,
                targetAmount: target,
                currentAmount: current,
                progress,
                remaining,
            };
        });

        const active = normalized.filter((g) => !g.isCompleted);
        const completed = normalized.filter((g) => g.isCompleted);

        const activeSaved = active.reduce((sum, g) => sum + g.currentAmount, 0);
        const activeTarget = active.reduce((sum, g) => sum + g.targetAmount, 0);
        const activeRemaining = Math.max(0, activeTarget - activeSaved);
        const overallPct =
            activeTarget > 0 ? ((activeSaved / activeTarget) * 100).toFixed(1) : "0.0";

        const totalMonthlyPace = active.reduce(
            (sum, g) => sum + getMonthlyPace(g.remaining, g.daysLeft),
            0
        );

        const estimatedCurrentPace = active.reduce((sum, g) => {
            const spanMonths = getGoalSpanMonths(g.createdAt, g.deadline);
            return sum + g.currentAmount / spanMonths;
        }, 0);

        const paceGap = Math.max(0, totalMonthlyPace - estimatedCurrentPace);
        const paceRatioPct =
            totalMonthlyPace > 0
                ? (estimatedCurrentPace / totalMonthlyPace) * 100
                : 100;
        const requiredMonthsToComplete =
            activeRemaining > 0 && totalMonthlyPace > 0
                ? Math.max(1, Math.round(activeRemaining / totalMonthlyPace))
                : 0;
        const projectedMonthsToComplete =
            activeRemaining > 0 && estimatedCurrentPace > 0
                ? Math.max(1, Math.round(activeRemaining / estimatedCurrentPace))
                : null;
        const projectionDelayMonths =
            projectedMonthsToComplete !== null && requiredMonthsToComplete > 0
                ? Math.max(0, projectedMonthsToComplete - requiredMonthsToComplete)
                : null;

        const onTrackCount = active.filter((g) => {
            if (g.progress >= 100) return true;
            if (g.daysLeft < 0) return false;
            const start = g.createdAt ? new Date(g.createdAt).getTime() : Date.now();
            const end = new Date(g.deadline).getTime();
            const totalSpan = Math.max(1, end - start);
            const elapsed = Math.max(0, Date.now() - start);
            const expectedPct = Math.min(100, (elapsed / totalSpan) * 100);
            return g.progress >= Math.max(25, expectedPct);
        }).length;

        const completedSaved = completed.reduce((sum, g) => sum + g.currentAmount, 0);
        const completedShare =
            normalized.length > 0 ? ((completed.length / normalized.length) * 100).toFixed(1) : "0.0";

        const completionDurations = completed
            .filter((g) => g.createdAt && (g.updatedAt || g.deadline))
            .map((g) => {
                const start = new Date(g.createdAt).getTime();
                const done = new Date(g.updatedAt || g.deadline).getTime();
                return Math.max(1, Math.round(Math.abs(done - start) / (1000 * 60 * 60 * 24)));
            });
        const avgCompletionDays =
            completionDurations.length > 0
                ? Math.round(
                      completionDurations.reduce((a, b) => a + b, 0) / completionDurations.length
                  )
                : null;

        const nearestGoal =
            active.length > 0
                ? [...active].sort((a, b) => a.daysLeft - b.daysLeft)[0]
                : null;

        // Category allocation across all goals
        const catMap = {};
        normalized.forEach((g) => {
            const cat = g.category || "Other";
            if (!catMap[cat]) {
                catMap[cat] = { name: cat, saved: 0, target: 0, count: 0 };
            }
            catMap[cat].saved += g.currentAmount;
            catMap[cat].target += g.targetAmount;
            catMap[cat].count += 1;
        });

        const totalAllTarget = normalized.reduce((sum, g) => sum + g.targetAmount, 0);
        const allocationList = Object.values(catMap)
            .sort((a, b) => b.target - a.target)
            .map((item) => ({
                ...item,
                color: getSavingsCategoryColor(item.name),
                share: totalAllTarget > 0 ? (item.target / totalAllTarget) * 100 : 0,
                fundedPct: item.target > 0 ? (item.saved / item.target) * 100 : 0,
            }));

        const uniqueCategories = Array.from(
            new Set(active.map((g) => g.category || "Other"))
        );

        const allGoalCategories = Array.from(
            new Set(normalized.map((g) => g.category || "Other"))
        );

        const savedSeries = active.map((g) => g.currentAmount);
        const remSeries = active.map((g) => g.remaining);
        const paceSeries = active.map((g) => getMonthlyPace(g.remaining, g.daysLeft));
        const pctSeries = active.map((g) => g.progress);
        const completedSeries = completed.map((g) => g.currentAmount);

        return {
            activeGoals: active,
            completedGoals: completed,
            categories: uniqueCategories,
            allCategories: allGoalCategories,
            allocation: allocationList,
            stats: {
                activeSaved,
                activeTarget,
                activeRemaining,
                totalAllTarget,
                overallPct,
                totalMonthlyPace,
                estimatedCurrentPace,
                paceGap,
                paceRatioPct,
                requiredMonthsToComplete,
                projectedMonthsToComplete,
                projectionDelayMonths,
                onTrackCount,
                completedSaved,
                completedShare,
                avgCompletionDays,
                nearestGoal,
            },
            sparklines: {
                saved: savedSeries.length >= 2 ? savedSeries : [20, 45, 38, 65, 82],
                remaining: remSeries.length >= 2 ? remSeries : [85, 65, 72, 48, 35],
                pace: paceSeries.length >= 2 ? paceSeries : [30, 52, 40, 68, 58],
                deadline: pctSeries.length >= 2 ? pctSeries : [15, 35, 55, 70, 88],
                achieved: completedSeries.length >= 2 ? completedSeries : [25, 42, 36, 68, 92],
            },
        };
    }, [goals]);

    const visibleActiveGoals = useMemo(() => {
        const filtered = activeGoals.filter(
            (g) =>
                categoryFilter === "all" ||
                (g.category || "Other").toLowerCase() === categoryFilter.toLowerCase()
        );

        return [...filtered].sort((a, b) => {
            if (sortBy === "progress") return b.progress - a.progress;
            if (sortBy === "remaining") return b.remaining - a.remaining;
            return a.daysLeft - b.daysLeft;
        });
    }, [activeGoals, categoryFilter, sortBy]);

    const visibleCompletedGoals = useMemo(() => {
        const filtered = completedGoals.filter(
            (g) =>
                completedCategoryFilter === "all" ||
                (g.category || "Other").toLowerCase() === completedCategoryFilter.toLowerCase()
        );

        const getDays = (g) => {
            const done = new Date(g.updatedAt || g.deadline).getTime();
            const start = g.createdAt ? new Date(g.createdAt).getTime() : done;
            return Math.max(1, Math.round(Math.abs(done - start) / (1000 * 60 * 60 * 24)));
        };

        return [...filtered].sort((a, b) => {
            if (completedSortBy === "amount") return b.currentAmount - a.currentAmount;
            if (completedSortBy === "days") return getDays(a) - getDays(b);
            return (
                new Date(b.updatedAt || b.deadline).getTime() -
                new Date(a.updatedAt || a.deadline).getTime()
            );
        });
    }, [completedGoals, completedCategoryFilter, completedSortBy]);

    const openUpdateDialog = (goal) => {
        setSelectedGoal(goal);
        setUpdateMode("deposit");
        setAmountInput("");
        setDialogError("");
        setIsUpdateDialogOpen(true);
    };

    const parsedInput = parseFloat(amountInput);
    const projectedBalance = useMemo(() => {
        if (!selectedGoal) return 0;
        const val = Number.isFinite(parsedInput) ? parsedInput : 0;
        if (updateMode === "deposit") {
            return Math.max(0, selectedGoal.currentAmount + val);
        }
        return Math.max(0, val);
    }, [selectedGoal, parsedInput, updateMode]);

    const projectedProgress =
        selectedGoal && selectedGoal.targetAmount > 0
            ? Math.min(100, (projectedBalance / selectedGoal.targetAmount) * 100)
            : 0;

    const handleSaveProgress = async (e) => {
        e?.preventDefault();
        if (!selectedGoal) return;

        if (!Number.isFinite(parsedInput) || parsedInput < 0) {
            setDialogError("Please enter a valid non-negative amount.");
            return;
        }
        if (updateMode === "deposit" && parsedInput === 0) {
            setDialogError("Enter a deposit amount greater than 0.");
            return;
        }

        const nextAmount = projectedBalance;
        setIsSavingProgress(true);
        setDialogError("");

        try {
            const res = await fetch(`/api/savings-goals/${selectedGoal._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentAmount: nextAmount }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to update savings goal");
            }

            const updatedGoal = await res.json();
            const isNowCompleted = Boolean(
                updatedGoal.isCompleted ?? nextAmount >= selectedGoal.targetAmount
            );

            setGoals((prev) =>
                prev.map((g) => {
                    if (g._id !== selectedGoal._id) return g;
                    return {
                        ...g,
                        currentAmount: nextAmount,
                        isCompleted: isNowCompleted,
                        updatedAt: updatedGoal.updatedAt || new Date().toISOString(),
                        progress:
                            g.targetAmount > 0
                                ? parseFloat(((nextAmount / g.targetAmount) * 100).toFixed(1))
                                : 0,
                        remaining: Math.max(0, g.targetAmount - nextAmount),
                    };
                })
            );

            setIsUpdateDialogOpen(false);
            setMessage(
                isNowCompleted
                    ? `Goal "${selectedGoal.name}" completed!`
                    : `Updated "${selectedGoal.name}" to ${formatINR(nextAmount)}`
            );
            setMessageType("success");
            router.refresh();
        } catch (error) {
            setDialogError(error.message || "Error updating progress");
        } finally {
            setIsSavingProgress(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!goalToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/savings-goals/${goalToDelete._id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to delete savings goal");
            }

            const deletedName = goalToDelete.name;
            setGoals((prev) => prev.filter((g) => g._id !== goalToDelete._id));
            setGoalToDelete(null);
            setMessage(`Deleted "${deletedName}"`);
            setMessageType("success");
            router.refresh();
        } catch (error) {
            setGoalToDelete(null);
            setMessage(error.message || "Error deleting savings goal");
            setMessageType("error");
        } finally {
            setIsDeleting(false);
        }
    };

    const getUrgencyBadge = (daysLeft) => {
        if (daysLeft < 0) {
            return {
                label: `${Math.abs(daysLeft)}d overdue`,
                className:
                    "bg-rose-50/90 border-rose-200/80 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/35 dark:text-rose-200",
            };
        }
        if (daysLeft <= 30) {
            return {
                label: `${daysLeft}d left`,
                className:
                    "bg-amber-50/90 border-amber-200/80 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/35 dark:text-amber-200",
            };
        }
        return {
            label: `${daysLeft}d left`,
            className:
                "bg-slate-100/90 border-slate-200/80 text-slate-600 dark:bg-white/[0.08] dark:border-white/12 dark:text-zinc-300",
        };
    };

    const tabs = [
        { id: "active", label: "Active Goals", icon: Target, count: activeGoals.length },
        { id: "completed", label: "Completed", icon: CheckCircle2, count: completedGoals.length },
        { id: "planner", label: "Allocation & Pace", icon: Layers, count: allocation.length },
    ];

    const handleTabKeyDown = (e, currentIndex) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
    };

    const activeAllocSlice =
        hoveredAllocIndex !== null && allocation[hoveredAllocIndex]
            ? allocation[hoveredAllocIndex]
            : null;

    const pacePeriodMultiplier =
        pacePeriod === "weekly" ? 12 / 52 : pacePeriod === "yearly" ? 12 : 1;
    const pacePeriodUnit =
        pacePeriod === "weekly" ? "week" : pacePeriod === "yearly" ? "year" : "month";
    const periodRequiredPace = stats.totalMonthlyPace * pacePeriodMultiplier;
    const periodCurrentPace = stats.estimatedCurrentPace * pacePeriodMultiplier;
    const periodPaceGap = stats.paceGap * pacePeriodMultiplier;

    const maxAllocShare =
        allocation.length > 0 ? Math.max(...allocation.map((item) => item.share), 1) : 100;

    const reallocLow =
        stats.paceGap > 0
            ? Math.max(500, Math.round((stats.paceGap * 0.13) / 500) * 500)
            : 0;
    const reallocHigh =
        stats.paceGap > 0
            ? Math.max(reallocLow + 1000, Math.round((stats.paceGap * 0.26) / 500) * 500)
            : 0;
    const timelineDelay = stats.projectionDelayMonths || 0;
    const extendLower = Math.max(1, timelineDelay - 2);
    const extendText =
        timelineDelay <= 1
            ? "1 – 2 months"
            : `${extendLower} – ${timelineDelay} months`;

    return (
        <div
            ref={containerRef}
            className="relative w-full space-y-6 pb-28 lg:pb-10 text-slate-900 dark:text-zinc-100"
        >
            {/* Soft Atmospheric Liquid-Glass Canvas Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-emerald-200/30 blur-[135px] dark:bg-emerald-500/10" />
                <div className="absolute top-12 -right-24 h-[500px] w-[500px] rounded-full bg-sky-300/30 blur-[140px] dark:bg-blue-500/14" />
                <div className="absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full bg-indigo-300/25 blur-[135px] dark:bg-indigo-600/12" />
                <div className="absolute bottom-8 right-1/3 h-[340px] w-[340px] rounded-full bg-violet-200/25 blur-[120px] dark:bg-violet-500/10" />
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
                                    ? "bg-white/90 border-white/95 text-slate-900 ring-1 ring-emerald-500/25 dark:bg-zinc-900/90 dark:border-white/15 dark:text-white dark:ring-emerald-400/25"
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

            {/* Header Section with 3D Hero Illustration tucked beside + New Goal */}
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1 pb-1 md:pb-3">
                <div className="relative z-10 min-w-0 md:max-w-[340px] lg:max-w-lg">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                            <span className="text-slate-700 dark:text-zinc-200">Savings Tracker</span>
                        </span>
                        <span className="text-slate-400 dark:text-zinc-600">•</span>
                        <span className="text-slate-600 dark:text-zinc-300 tabular-nums">
                            {activeGoals.length} active · {completedGoals.length} completed
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Savings Goals
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
                        Plan targets, log deposits, and monitor funding pace toward your milestones.
                    </p>
                </div>

                {/* Illustration + Primary CTA Row */}
                <div className="flex items-end justify-between md:justify-end gap-3 shrink-0">
                    <div className="relative md:absolute md:right-36 lg:right-40 xl:right-44 md:-bottom-4 pointer-events-none select-none z-0">
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-4 bottom-2 top-6 rounded-full bg-gradient-to-tr from-blue-400/20 via-indigo-300/18 to-emerald-300/20 blur-xl dark:from-blue-500/18 dark:to-emerald-500/12"
                        />
                        <Image
                            src="/images/savings-hero-jar.png"
                            alt="Savings jar with coins and rising growth bars"
                            width={1011}
                            height={512}
                            priority
                            className="relative w-40 sm:w-52 md:w-[220px] lg:w-[265px] xl:w-[285px] h-auto object-contain drop-shadow-[0_10px_18px_rgba(37,99,235,0.14)]"
                        />
                    </div>

                    <Link
                        href="/savings/new"
                        className="relative z-10 px-4 py-2.5 rounded-full text-xs sm:text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 shadow-[0_8px_20px_rgba(15,23,42,0.22)] dark:shadow-[0_8px_22px_rgba(37,99,235,0.35)] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>New Goal</span>
                    </Link>
                </div>
            </div>

            {/* Top 4 Frosted KPI Cards */}
            {activeTab === "completed" ? (
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Completed KPI 1: Total Completed */}
                    <div className={cn(GLASS_CARD, "relative overflow-hidden rounded-[22px] p-5 flex items-center justify-between gap-3")}>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-36 h-24 rounded-full bg-emerald-400/18 dark:bg-emerald-500/12 blur-2xl"
                        />
                        <div className="relative z-10 flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/12 dark:bg-emerald-500/18 border border-emerald-500/20 dark:border-emerald-400/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                                    Total Completed
                                </p>
                                <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums mt-0.5">
                                    {completedGoals.length}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate tabular-nums">
                                    {stats.completedShare}% of all goals
                                </p>
                            </div>
                        </div>
                        <div className="relative z-10 w-11 h-11 rounded-2xl bg-emerald-500/12 dark:bg-emerald-500/18 border border-emerald-500/20 dark:border-emerald-400/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Trophy className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Completed KPI 2: Amount Achieved */}
                    <div className={cn(GLASS_CARD, "relative overflow-hidden rounded-[22px] p-5 flex items-center justify-between gap-3")}>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-36 h-24 rounded-full bg-sky-400/16 dark:bg-blue-500/12 blur-2xl"
                        />
                        <div className="relative z-10 flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/12 dark:bg-blue-500/18 border border-blue-500/20 dark:border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0 mt-0.5">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                                    Amount Achieved
                                </p>
                                <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums mt-0.5 truncate">
                                    {formatINR(stats.completedSaved)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate">
                                    Across completed goals
                                </p>
                            </div>
                        </div>
                        <div className="relative z-10 w-10 h-10 rounded-full border-2 border-blue-500/75 dark:border-sky-400/75 bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                            <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                        </div>
                    </div>

                    {/* Completed KPI 3: Avg. Time to Complete */}
                    <div className={cn(GLASS_CARD, "relative overflow-hidden rounded-[22px] p-5 flex items-center justify-between gap-3")}>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-36 h-24 rounded-full bg-violet-400/16 dark:bg-violet-500/12 blur-2xl"
                        />
                        <div className="relative z-10 flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/12 dark:bg-indigo-500/18 border border-indigo-500/20 dark:border-indigo-400/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                                    Avg. Time to Complete
                                </p>
                                <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums mt-0.5">
                                    {stats.avgCompletionDays !== null
                                        ? `${stats.avgCompletionDays} ${stats.avgCompletionDays === 1 ? "day" : "days"}`
                                        : "—"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate">
                                    Per goal (completed)
                                </p>
                            </div>
                        </div>
                        <div className="relative z-10 w-10 h-10 rounded-full bg-indigo-500/12 dark:bg-indigo-500/18 border border-indigo-400/35 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                            <Clock className="w-4.5 h-4.5" />
                        </div>
                    </div>

                    {/* Completed KPI 4: Completion Rate */}
                    <div className={cn(GLASS_CARD, "relative overflow-hidden rounded-[22px] p-5 flex items-center justify-between gap-3")}>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-36 h-24 rounded-full bg-rose-400/14 dark:bg-rose-500/10 blur-2xl"
                        />
                        <div className="relative z-10 flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/12 dark:bg-rose-500/18 border border-rose-500/20 dark:border-rose-400/25 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                                <Target className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                                    Completion Rate
                                </p>
                                <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums mt-0.5">
                                    {stats.completedShare}%
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate tabular-nums">
                                    {completedGoals.length} of {goals.length} goals completed
                                </p>
                            </div>
                        </div>
                        <MiniCompletionRing percent={parseFloat(stats.completedShare)} />
                    </div>
                </div>
            ) : activeTab === "planner" ? (
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 xl:gap-3.5">
                    {/* Planner KPI 1: Total Target */}
                    <div
                        className={cn(
                            GLASS_CARD,
                            "relative overflow-hidden rounded-[22px] p-3.5 xl:p-4 flex flex-col justify-between gap-1.5 bg-gradient-to-br from-emerald-50/85 via-white/80 to-emerald-50/35 dark:from-emerald-500/[0.08] dark:via-white/[0.04] dark:to-transparent"
                        )}
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-28 h-20 rounded-full bg-emerald-400/20 dark:bg-emerald-500/14 blur-2xl"
                        />
                        <div className="flex items-center gap-2 relative z-10 min-w-0">
                            <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/25 dark:border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Layers className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            </div>
                            <span className="text-[11px] xl:text-xs font-medium text-slate-600 dark:text-zinc-300 truncate">
                                Total Target
                            </span>
                        </div>
                        <div className="relative z-10 pt-1">
                            <p className="text-[15px] lg:text-[15px] xl:text-[18px] font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(stats.totalAllTarget)}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 pr-12 truncate">
                                Across all goals
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-1.5 flex items-end gap-0.5 opacity-85 scale-75 xl:scale-90 origin-bottom-right">
                            <div className="mb-1.5 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Target className="w-3 h-3" />
                            </div>
                            <MiniSparkline id="planner-target" color="#10B981" values={sparklines.saved} />
                        </div>
                    </div>

                    {/* Planner KPI 2: Total Allocated */}
                    <div
                        className={cn(
                            GLASS_CARD,
                            "relative overflow-hidden rounded-[22px] p-3.5 xl:p-4 flex flex-col justify-between gap-1.5 bg-gradient-to-br from-sky-50/85 via-white/80 to-blue-50/35 dark:from-blue-500/[0.08] dark:via-white/[0.04] dark:to-transparent"
                        )}
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-28 h-20 rounded-full bg-sky-400/20 dark:bg-blue-500/14 blur-2xl"
                        />
                        <div className="flex items-center gap-2 relative z-10 min-w-0">
                            <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-xl bg-blue-500/15 dark:bg-blue-500/20 border border-blue-500/25 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                                <Layers className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            </div>
                            <span className="text-[11px] xl:text-xs font-medium text-slate-600 dark:text-zinc-300 truncate">
                                Total Allocated
                            </span>
                        </div>
                        <div className="relative z-10 pt-1">
                            <p className="text-[15px] lg:text-[15px] xl:text-[18px] font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(stats.totalAllTarget)}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 pr-12 truncate">
                                Across {allocation.length}{" "}
                                {allocation.length === 1 ? "category" : "categories"}
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-1.5 opacity-85 scale-75 xl:scale-90 origin-bottom-right">
                            <MiniSparkline
                                id="planner-alloc"
                                color="#3B82F6"
                                values={sparklines.remaining}
                            />
                        </div>
                    </div>

                    {/* Planner KPI 3: Required Monthly Pace */}
                    <div
                        className={cn(
                            GLASS_CARD,
                            "relative overflow-hidden rounded-[22px] p-3.5 xl:p-4 flex flex-col justify-between gap-1.5 bg-gradient-to-br from-violet-50/85 via-white/80 to-indigo-50/35 dark:from-violet-500/[0.08] dark:via-white/[0.04] dark:to-transparent"
                        )}
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-28 h-20 rounded-full bg-violet-400/20 dark:bg-violet-500/14 blur-2xl"
                        />
                        <div className="flex items-center gap-2 relative z-10 min-w-0">
                            <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-xl bg-violet-500/15 dark:bg-violet-500/20 border border-violet-500/25 dark:border-violet-400/30 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                <Calendar className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            </div>
                            <span className="text-[11px] xl:text-xs font-medium text-slate-600 dark:text-zinc-300 truncate">
                                Required Monthly Pace
                            </span>
                        </div>
                        <div className="relative z-10 pt-1">
                            <p className="text-[15px] lg:text-[15px] xl:text-[18px] font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(stats.totalMonthlyPace)}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 pr-12 truncate">
                                To stay on track
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-1.5 opacity-85 scale-75 xl:scale-90 origin-bottom-right">
                            <MiniSparkline
                                id="planner-req-pace"
                                color="#8B5CF6"
                                values={sparklines.pace}
                            />
                        </div>
                    </div>

                    {/* Planner KPI 4: Current Monthly Save */}
                    <div
                        className={cn(
                            GLASS_CARD,
                            "relative overflow-hidden rounded-[22px] p-3.5 xl:p-4 flex flex-col justify-between gap-1.5 bg-gradient-to-br from-amber-50/85 via-white/80 to-orange-50/35 dark:from-amber-500/[0.08] dark:via-white/[0.04] dark:to-transparent"
                        )}
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-28 h-20 rounded-full bg-amber-400/20 dark:bg-amber-500/14 blur-2xl"
                        />
                        <div className="flex items-center gap-2 relative z-10 min-w-0">
                            <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/25 dark:border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <Clock className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            </div>
                            <span className="text-[11px] xl:text-xs font-medium text-slate-600 dark:text-zinc-300 truncate">
                                Current Monthly Save
                            </span>
                        </div>
                        <div className="relative z-10 pt-1">
                            <p className="text-[15px] lg:text-[15px] xl:text-[18px] font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(stats.estimatedCurrentPace)}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 pr-12 truncate tabular-nums">
                                {stats.paceRatioPct.toFixed(1)}% of required pace
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-1.5 opacity-85 scale-75 xl:scale-90 origin-bottom-right">
                            <MiniSparkline
                                id="planner-cur-save"
                                color="#F59E0B"
                                values={sparklines.deadline}
                            />
                        </div>
                    </div>

                    {/* Planner KPI 5: Pace Gap */}
                    <div
                        className={cn(
                            GLASS_CARD,
                            "sm:col-span-2 lg:col-span-1 relative overflow-hidden rounded-[22px] p-3.5 xl:p-4 flex flex-col justify-between gap-1.5",
                            stats.paceGap > 0
                                ? "bg-gradient-to-br from-rose-50/85 via-white/80 to-red-50/35 dark:from-rose-500/[0.08] dark:via-white/[0.04] dark:to-transparent"
                                : "bg-gradient-to-br from-emerald-50/85 via-white/80 to-teal-50/35 dark:from-emerald-500/[0.08] dark:via-white/[0.04] dark:to-transparent"
                        )}
                    >
                        <div
                            aria-hidden="true"
                            className={cn(
                                "pointer-events-none absolute -bottom-8 -right-8 w-28 h-20 rounded-full blur-2xl",
                                stats.paceGap > 0
                                    ? "bg-rose-400/20 dark:bg-rose-500/14"
                                    : "bg-emerald-400/20 dark:bg-emerald-500/14"
                            )}
                        />
                        <div className="flex items-center gap-2 relative z-10 min-w-0">
                            <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/25 dark:border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <TrendingUp className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            </div>
                            <span className="text-[11px] xl:text-xs font-medium text-slate-600 dark:text-zinc-300 truncate">
                                Pace Gap
                            </span>
                        </div>
                        <div className="relative z-10 pt-1">
                            <p className="text-[15px] lg:text-[15px] xl:text-[18px] font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(stats.paceGap)}
                            </p>
                            <p
                                className={cn(
                                    "text-[11px] font-medium mt-0.5 pr-12 truncate",
                                    stats.paceGap > 0
                                        ? "text-rose-600 dark:text-rose-400"
                                        : "text-emerald-600 dark:text-emerald-400"
                                )}
                            >
                                {stats.paceGap > 0
                                    ? "Per month to meet goals"
                                    : "On track across goals"}
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-1.5 opacity-85 scale-75 xl:scale-90 origin-bottom-right">
                            <MiniSparkline
                                id="planner-gap"
                                color={stats.paceGap > 0 ? "#F43F5E" : "#10B981"}
                                values={sparklines.achieved}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI 1: Always Total Saved */}
                    <div className={cn(GLASS_CARD, "relative overflow-hidden rounded-[22px] p-5 flex flex-col justify-between gap-2.5")}>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-24 rounded-full bg-emerald-400/15 dark:bg-emerald-500/12 blur-2xl"
                        />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/12 dark:bg-emerald-500/18 border border-emerald-500/20 dark:border-emerald-400/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <PiggyBank className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                                Total Saved
                            </span>
                        </div>
                        <div className="relative z-10 pr-16 sm:pr-14">
                            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(stats.activeSaved)}
                            </p>
                            <p className="text-xs mt-1 truncate tabular-nums">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    ↑ {stats.overallPct}%
                                </span>{" "}
                                <span className="text-slate-500 dark:text-zinc-400">
                                    of {formatINR(stats.activeTarget)}
                                </span>
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-2 opacity-90">
                            <MiniSparkline id="saved" color="#10B981" values={sparklines.saved} />
                        </div>
                    </div>

                    {/* KPI 2: Remaining Gap */}
                    <div className={cn(GLASS_CARD, "relative overflow-hidden rounded-[22px] p-5 flex flex-col justify-between gap-2.5")}>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-24 rounded-full bg-sky-400/15 dark:bg-blue-500/12 blur-2xl"
                        />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/12 dark:bg-indigo-500/18 border border-indigo-500/20 dark:border-indigo-400/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Layers className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                                Remaining Gap
                            </span>
                        </div>
                        <div className="relative z-10 pr-16 sm:pr-14">
                            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(stats.activeRemaining)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate">
                                Across {activeGoals.length} active{" "}
                                {activeGoals.length === 1 ? "goal" : "goals"}
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-2 opacity-90">
                            <MiniSparkline id="remaining" color="#3B82F6" values={sparklines.remaining} />
                        </div>
                    </div>

                    {/* KPI 3: Required Pace */}
                    <div className={cn(GLASS_CARD, "relative overflow-hidden rounded-[22px] p-5 flex flex-col justify-between gap-2.5")}>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-24 rounded-full bg-violet-400/15 dark:bg-violet-500/12 blur-2xl"
                        />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/12 dark:bg-violet-500/18 border border-violet-500/20 dark:border-violet-400/25 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                <Target className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                                Required Pace
                            </span>
                        </div>
                        <div className="relative z-10 pr-16 sm:pr-14">
                            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                {formatINR(stats.totalMonthlyPace)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate">
                                Est. monthly deposit
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-2 opacity-90">
                            <MiniSparkline id="pace" color="#8B5CF6" values={sparklines.pace} />
                        </div>
                    </div>

                    {/* KPI 4: Next Deadline (Active Goals) */}
                    <div className={cn(GLASS_CARD, "relative overflow-hidden rounded-[22px] p-5 flex flex-col justify-between gap-2.5")}>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-24 rounded-full bg-amber-400/16 dark:bg-amber-500/12 blur-2xl"
                        />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/12 dark:bg-amber-500/18 border border-amber-500/20 dark:border-amber-400/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-zinc-300">
                                Next Deadline
                            </span>
                        </div>
                        <div className="relative z-10 min-w-0 pr-14">
                            <p className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white truncate">
                                {stats.nearestGoal ? stats.nearestGoal.name : "—"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate tabular-nums">
                                {stats.nearestGoal
                                    ? stats.nearestGoal.daysLeft >= 0
                                        ? `${stats.nearestGoal.daysLeft} days left · ${format(new Date(stats.nearestGoal.deadline), "MMM d")}`
                                        : `${Math.abs(stats.nearestGoal.daysLeft)} days overdue`
                                    : "No upcoming deadlines"}
                            </p>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-2 opacity-90">
                            <MiniSparkline id="deadline" color="#F59E0B" values={sparklines.deadline} />
                        </div>
                    </div>
                </div>
            )}

            {/* Frosted Pill Sub-Navigation Tabs */}
            <div
                role="tablist"
                aria-label="Savings sections"
                className="flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {tabs.map((tab, idx) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            id={`savings-tab-${tab.id}`}
                            role="tab"
                            type="button"
                            aria-selected={isActive}
                            aria-controls={`savings-panel-${tab.id}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => setActiveTab(tab.id)}
                            onKeyDown={(e) => handleTabKeyDown(e, idx)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold flex items-center gap-2 whitespace-nowrap border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-blue-500 border-blue-500 text-white shadow-[0_8px_20px_rgba(37,99,235,0.34)]"
                                    : "bg-white/75 border-white/95 text-slate-700 hover:text-slate-950 hover:bg-white/90 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.09] backdrop-blur-xl shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums",
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-200/80 text-slate-600 dark:bg-white/[0.08] dark:text-zinc-400"
                                )}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Panels */}
            <AnimatePresence mode="wait">
                {/* TAB 1: ACTIVE GOALS */}
                {activeTab === "active" && (
                    <motion.div
                        key="active"
                        id="savings-panel-active"
                        role="tabpanel"
                        aria-labelledby="savings-tab-active"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-5"
                    >
                        {/* Category Pills + Sort & Grid/List Toolbar */}
                        {activeGoals.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setCategoryFilter("all")}
                                        className={cn(
                                            "px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer",
                                            categoryFilter === "all"
                                                ? "bg-slate-900 border-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.2)] dark:bg-white dark:border-white dark:text-slate-950"
                                                : "bg-white/75 border-white/95 text-slate-600 hover:text-slate-950 dark:bg-white/[0.05] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white backdrop-blur-md"
                                        )}
                                    >
                                        All
                                    </button>
                                    {categories.map((cat) => {
                                        const active = categoryFilter.toLowerCase() === cat.toLowerCase();
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategoryFilter(active ? "all" : cat)}
                                                className={cn(
                                                    "px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all cursor-pointer",
                                                    active
                                                        ? "bg-slate-900 border-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.2)] dark:bg-white dark:border-white dark:text-slate-950"
                                                        : "bg-white/75 border-white/95 text-slate-600 hover:text-slate-950 dark:bg-white/[0.05] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white backdrop-blur-md"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Sort Select + View Mode Toggle */}
                                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                    <div className="relative">
                                        <select
                                            aria-label="Sort savings goals"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-white/[0.06] border border-white/95 dark:border-white/12 text-slate-800 dark:text-zinc-200 backdrop-blur-md shadow-[0_2px_8px_rgba(15,23,42,0.04)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        >
                                            <option value="deadline" className="bg-white dark:bg-zinc-900">
                                                Soonest
                                            </option>
                                            <option value="progress" className="bg-white dark:bg-zinc-900">
                                                Progress
                                            </option>
                                            <option value="remaining" className="bg-white dark:bg-zinc-900">
                                                Remaining
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
                                                    ? "bg-blue-600 text-white shadow-xs dark:bg-blue-500"
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
                                                    ? "bg-blue-600 text-white shadow-xs dark:bg-blue-500"
                                                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                                            )}
                                        >
                                            <ListIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeGoals.length === 0 ? (
                            <div className={cn(GLASS_CARD, "p-10 sm:p-12 text-center space-y-4")}>
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/12 dark:bg-blue-500/18 border border-blue-500/20 dark:border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-sky-400 mx-auto">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                                        No active savings goals
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
                                        Set up your first savings target to track deposits, deadlines, and recommended monthly pace.
                                    </p>
                                </div>
                                <Link
                                    href="/savings/new"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition-all whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create your first goal</span>
                                </Link>
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                {visibleActiveGoals.map((goal) => {
                                    const urgency = getUrgencyBadge(goal.daysLeft);
                                    const cardTheme = getSavingsCardTheme(goal.category);
                                    const isMenuOpen = openMenuGoalId === goal._id;

                                    return (
                                        <div
                                            key={goal._id}
                                            className={cn(
                                                GLASS_CARD,
                                                "rounded-[22px] relative p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-[0_14px_38px_-12px_rgba(30,41,59,0.12)] dark:hover:border-white/[0.18]"
                                            )}
                                        >
                                            {/* Goal Card Header */}
                                            <div className="flex items-start justify-between gap-2.5">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={cn(
                                                            "w-11 h-11 rounded-2xl border shadow-xs flex items-center justify-center text-xl shrink-0",
                                                            cardTheme.iconTile
                                                        )}
                                                    >
                                                        {goal.icon || "🎯"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm sm:text-[15px] font-bold tracking-tight text-slate-950 dark:text-white truncate">
                                                            {goal.name}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                            <span
                                                                className={cn(
                                                                    "px-2 py-0.5 rounded-full border text-[11px] font-medium",
                                                                    cardTheme.badge
                                                                )}
                                                            >
                                                                {goal.category || "Other"}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
                                                                    urgency.className
                                                                )}
                                                            >
                                                                <Calendar className="w-2.5 h-2.5" />
                                                                <span>{urgency.label}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Compact Three-Dots Action Menu */}
                                                <div className="relative shrink-0" data-goal-menu>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setOpenMenuGoalId(isMenuOpen ? null : goal._id)
                                                        }
                                                        aria-label={`Actions for ${goal.name}`}
                                                        aria-expanded={isMenuOpen}
                                                        className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {isMenuOpen && (
                                                        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-xl py-1.5 z-30">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setOpenMenuGoalId(null);
                                                                    openUpdateDialog(goal);
                                                                }}
                                                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:text-zinc-200 dark:hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                                                                <span>Update Progress</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setOpenMenuGoalId(null);
                                                                    setGoalToDelete(goal);
                                                                }}
                                                                className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/15 flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                <span>Delete Goal</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress Numbers & Gradient Bar */}
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                    <div className="flex flex-wrap items-baseline gap-1 font-mono tabular-nums min-w-0">
                                                        <span className="text-base font-bold text-slate-950 dark:text-white">
                                                            {formatINR(goal.currentAmount)}
                                                        </span>
                                                        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
                                                            / {formatINR(goal.targetAmount)}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                                        {goal.progress}%
                                                    </span>
                                                </div>

                                                <div
                                                    className="h-2 w-full rounded-full bg-slate-200/75 dark:bg-white/[0.08] overflow-hidden"
                                                    role="progressbar"
                                                    aria-valuenow={Math.min(100, goal.progress)}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label={`${goal.name} progress`}
                                                >
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-300",
                                                            cardTheme.bar
                                                        )}
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, goal.progress))}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Clean Bottom Action Row */}
                                            <div className="flex items-center justify-between gap-3 pt-0.5">
                                                <span className="text-xs text-slate-600 dark:text-zinc-400 inline-flex items-center gap-1.5 truncate">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                                                    <span>
                                                        Due{" "}
                                                        <span className="text-slate-900 dark:text-zinc-200 font-medium">
                                                            {format(new Date(goal.deadline), "MMM d, yyyy")}
                                                        </span>
                                                    </span>
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => openUpdateDialog(goal)}
                                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-800 hover:text-white bg-slate-100/90 hover:bg-blue-600 border border-slate-200/85 hover:border-blue-600 dark:text-zinc-100 dark:bg-white/[0.08] dark:hover:bg-blue-500 dark:border-white/15 dark:hover:border-blue-500 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                >
                                                    Update Progress
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* List View */
                            <div className={cn(GLASS_CARD, "overflow-hidden divide-y divide-slate-200/70 dark:divide-white/[0.08]")}>
                                {visibleActiveGoals.map((goal) => {
                                    const urgency = getUrgencyBadge(goal.daysLeft);
                                    const monthlyPace = getMonthlyPace(goal.remaining, goal.daysLeft);
                                    const cardTheme = getSavingsCardTheme(goal.category);
                                    return (
                                        <div
                                            key={goal._id}
                                            className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/60 dark:hover:bg-white/[0.03] transition-colors"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0 lg:w-1/3">
                                                <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0", cardTheme.iconTile)}>
                                                    {goal.icon || "🎯"}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white truncate">
                                                        {goal.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                        <span className={cn("px-2 py-0.5 rounded-full border text-[11px] font-medium", cardTheme.badge)}>
                                                            {goal.category || "Other"}
                                                        </span>
                                                        <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border", urgency.className)}>
                                                            {urgency.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex items-baseline justify-between gap-2 text-xs font-mono tabular-nums">
                                                    <span>
                                                        <strong className="text-slate-950 dark:text-white">
                                                            {formatINR(goal.currentAmount)}
                                                        </strong>{" "}
                                                        <span className="text-slate-500 dark:text-zinc-400">
                                                            / {formatINR(goal.targetAmount)}
                                                        </span>
                                                    </span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        {goal.progress}%
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-slate-200/75 dark:bg-white/[0.08] overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", cardTheme.bar)}
                                                        style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                                                    <span>Due {format(new Date(goal.deadline), "MMM d, yyyy")}</span>
                                                    <span>~{formatINR(monthlyPace)}/mo pace</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => openUpdateDialog(goal)}
                                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-800 hover:text-white bg-white/95 hover:bg-blue-600 border border-slate-200/85 dark:text-zinc-100 dark:bg-white/[0.08] dark:hover:bg-blue-500 dark:border-white/15 transition-all cursor-pointer whitespace-nowrap"
                                                >
                                                    Update Progress
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setGoalToDelete(goal)}
                                                    aria-label={`Delete ${goal.name}`}
                                                    className="p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB 2: COMPLETED GOALS (Filter Bar + Celebration Card + 4-Tile Milestone Cards) */}
                {activeTab === "completed" && (
                    <motion.div
                        key="completed"
                        id="savings-panel-completed"
                        role="tabpanel"
                        aria-labelledby="savings-tab-completed"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-5"
                    >
                        {/* Category Pills + Sort By + View Toggle Toolbar */}
                        {completedGoals.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setCompletedCategoryFilter("all")}
                                        className={cn(
                                            "px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer",
                                            completedCategoryFilter === "all"
                                                ? "bg-slate-900 border-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.2)] dark:bg-white dark:border-white dark:text-slate-950"
                                                : "bg-white/75 border-white/95 text-slate-600 hover:text-slate-950 dark:bg-white/[0.05] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white backdrop-blur-md"
                                        )}
                                    >
                                        All
                                    </button>
                                    {allCategories.map((cat) => {
                                        const active =
                                            completedCategoryFilter.toLowerCase() === cat.toLowerCase();
                                        return (
                                            <button
                                                key={`completed-cat-${cat}`}
                                                type="button"
                                                onClick={() => setCompletedCategoryFilter(active ? "all" : cat)}
                                                className={cn(
                                                    "px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all cursor-pointer",
                                                    active
                                                        ? "bg-slate-900 border-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.2)] dark:bg-white dark:border-white dark:text-slate-950"
                                                        : "bg-white/75 border-white/95 text-slate-600 hover:text-slate-950 dark:bg-white/[0.05] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white backdrop-blur-md"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                    <div className="relative">
                                        <select
                                            aria-label="Sort completed savings goals"
                                            value={completedSortBy}
                                            onChange={(e) => setCompletedSortBy(e.target.value)}
                                            className="appearance-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-white/[0.06] border border-white/95 dark:border-white/12 text-slate-800 dark:text-zinc-200 backdrop-blur-md shadow-[0_2px_8px_rgba(15,23,42,0.04)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        >
                                            <option value="recent" className="bg-white dark:bg-zinc-900">
                                                Sort by: Completion Date
                                            </option>
                                            <option value="amount" className="bg-white dark:bg-zinc-900">
                                                Sort by: Amount Achieved
                                            </option>
                                            <option value="days" className="bg-white dark:bg-zinc-900">
                                                Sort by: Fastest Time
                                            </option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                                    </div>

                                    <div className="inline-flex items-center p-1 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-white/95 dark:border-white/[0.1] backdrop-blur-md">
                                        <button
                                            type="button"
                                            onClick={() => setCompletedViewMode("grid")}
                                            aria-label="Completed grid view"
                                            aria-pressed={completedViewMode === "grid"}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors cursor-pointer",
                                                completedViewMode === "grid"
                                                    ? "bg-blue-600 text-white shadow-xs dark:bg-blue-500"
                                                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                                            )}
                                        >
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCompletedViewMode("list")}
                                            aria-label="Completed list view"
                                            aria-pressed={completedViewMode === "list"}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors cursor-pointer",
                                                completedViewMode === "list"
                                                    ? "bg-blue-600 text-white shadow-xs dark:bg-blue-500"
                                                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                                            )}
                                        >
                                            <ListIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {completedGoals.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                                {/* Left Standalone Frosted Trophy Hero Card */}
                                <div
                                    className={cn(
                                        GLASS_CARD,
                                        "lg:col-span-4 relative overflow-hidden p-6 sm:p-7 flex flex-col items-center justify-center text-center"
                                    )}
                                >
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -top-10 -left-10 w-44 h-44 rounded-full bg-indigo-300/25 dark:bg-indigo-500/14 blur-3xl"
                                    />
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-sky-300/25 dark:bg-blue-500/14 blur-3xl"
                                    />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <Image
                                            src="/images/goal-trophy.png"
                                            alt="Goal completed golden trophy with laurel wreath"
                                            width={1024}
                                            height={682}
                                            className="w-40 sm:w-48 h-auto object-contain mb-3 drop-shadow-[0_12px_22px_rgba(245,158,11,0.2)]"
                                        />
                                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                                            {completedGoals.length === 1
                                                ? "Goal Completed! 🎉"
                                                : `${completedGoals.length} Goals Completed! 🎉`}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 max-w-[230px] leading-relaxed">
                                            You&apos;ve successfully reached{" "}
                                            <span className="font-bold text-slate-950 dark:text-white">
                                                {completedGoals.length} savings{" "}
                                                {completedGoals.length === 1 ? "goal" : "goals"}
                                            </span>
                                            .
                                        </p>
                                    </div>
                                </div>

                                {/* Right Completed Goal Milestone Cards */}
                                <div className="lg:col-span-8 space-y-4">
                                    {visibleCompletedGoals.length === 0 ? (
                                        <div className={cn(GLASS_CARD, "h-full min-h-[220px] p-8 flex flex-col items-center justify-center text-center space-y-3")}>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                                No completed goals in {completedCategoryFilter}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setCompletedCategoryFilter("all")}
                                                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
                                            >
                                                Show all completed goals
                                            </button>
                                        </div>
                                    ) : completedViewMode === "list" ? (
                                        <div className={cn(GLASS_CARD, "overflow-hidden divide-y divide-slate-200/70 dark:divide-white/[0.08]")}>
                                            {visibleCompletedGoals.map((goal) => {
                                                const completedDate = goal.updatedAt || goal.deadline;
                                                const daysTaken =
                                                    goal.createdAt && completedDate
                                                        ? Math.max(
                                                              1,
                                                              Math.round(
                                                                  Math.abs(
                                                                      new Date(completedDate).getTime() -
                                                                          new Date(goal.createdAt).getTime()
                                                                  ) /
                                                                      (1000 * 60 * 60 * 24)
                                                              )
                                                          )
                                                        : 1;
                                                return (
                                                    <div
                                                        key={goal._id}
                                                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/60 dark:hover:bg-white/[0.03] transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-rose-500/12 dark:bg-rose-500/20 border border-rose-200/80 dark:border-rose-400/25 flex items-center justify-center text-lg shrink-0">
                                                                {goal.icon || "🎯"}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className="text-sm font-bold text-slate-950 dark:text-white truncate">
                                                                        {goal.name}
                                                                    </h4>
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/35 dark:text-emerald-300">
                                                                        <Check className="w-2.5 h-2.5 stroke-[2.75]" />
                                                                        Completed
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                                                    {goal.category || "Other"} • Completed{" "}
                                                                    {format(new Date(completedDate), "MMM d, yyyy")} • {daysTaken}{" "}
                                                                    {daysTaken === 1 ? "day" : "days"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                                            <span className="text-sm font-bold font-mono tabular-nums text-slate-950 dark:text-white">
                                                                {formatINR(goal.currentAmount)}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setGoalToDelete(goal)}
                                                                aria-label={`Delete ${goal.name}`}
                                                                className="p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        visibleCompletedGoals.map((goal) => {
                                            const completedDate = goal.updatedAt || goal.deadline;
                                            const daysTaken =
                                                goal.createdAt && completedDate
                                                    ? Math.max(
                                                          1,
                                                          Math.round(
                                                              Math.abs(
                                                                  new Date(completedDate).getTime() -
                                                                      new Date(goal.createdAt).getTime()
                                                              ) /
                                                                  (1000 * 60 * 60 * 24)
                                                          )
                                                      )
                                                    : 1;
                                            const monthsElapsed = Math.max(daysTaken / 30.4375, 1);
                                            const avgMonthlySave = goal.currentAmount / monthsElapsed;
                                            const isMenuOpen = openMenuGoalId === `completed-${goal._id}`;

                                            return (
                                                <div
                                                    key={goal._id}
                                                    className={cn(GLASS_CARD, "relative p-5 sm:p-6 space-y-5")}
                                                >
                                                    {/* Top Row */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3.5 min-w-0">
                                                            <div className="w-11 h-11 rounded-2xl bg-rose-500/12 dark:bg-rose-500/20 border border-rose-200/80 dark:border-rose-400/30 flex items-center justify-center text-xl shrink-0">
                                                                {goal.icon || "🎯"}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white truncate">
                                                                        {goal.name}
                                                                    </h4>
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/35 dark:text-emerald-300 border shrink-0">
                                                                        <Check className="w-3 h-3 stroke-[2.5]" />
                                                                        <span>Completed</span>
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                                                    {goal.category || "Other"} · Target date{" "}
                                                                    {format(new Date(goal.deadline), "MMM d, yyyy")}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                                                            <div className="text-left sm:text-right font-mono tabular-nums">
                                                                <p className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                                                    {formatINR(goal.currentAmount)}
                                                                </p>
                                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                                    of {formatINR(goal.targetAmount)}
                                                                </p>
                                                            </div>

                                                            <div className="relative" data-goal-menu>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setOpenMenuGoalId(
                                                                            isMenuOpen
                                                                                ? null
                                                                                : `completed-${goal._id}`
                                                                        )
                                                                    }
                                                                    aria-label={`Actions for ${goal.name}`}
                                                                    aria-expanded={isMenuOpen}
                                                                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>

                                                                {isMenuOpen && (
                                                                    <div className="absolute right-0 mt-1.5 w-40 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-xl py-1.5 z-30">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setOpenMenuGoalId(null);
                                                                                setGoalToDelete(goal);
                                                                            }}
                                                                            className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/15 flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                            <span>Delete Goal</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Full Emerald Progress Bar */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2.5 rounded-full bg-emerald-100/80 dark:bg-emerald-500/15 overflow-hidden">
                                                            <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]" />
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 tabular-nums">
                                                            100%
                                                        </span>
                                                    </div>

                                                    {/* 4 Milestone Stat Sub-Cards */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                                        <div className="rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] px-3.5 py-3 flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl bg-blue-500/12 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                                                                <Calendar className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                                    Completed On
                                                                </p>
                                                                <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                                                    {format(new Date(completedDate), "MMM d, yyyy")}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] px-3.5 py-3 flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl bg-violet-500/12 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                                                <Clock className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                                    Time Taken
                                                                </p>
                                                                <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tabular-nums truncate">
                                                                    {daysTaken} {daysTaken === 1 ? "day" : "days"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] px-3.5 py-3 flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl bg-sky-500/12 dark:bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                                                                <Layers className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                                    Total Deposits
                                                                </p>
                                                                <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white font-mono tabular-nums truncate">
                                                                    {formatINR(goal.currentAmount)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] px-3.5 py-3 flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/12 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                                <TrendingUp className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                                    Avg. Monthly Save
                                                                </p>
                                                                <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white font-mono tabular-nums truncate">
                                                                    {formatINR(avgMonthlySave)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={cn(GLASS_CARD, "p-10 text-center space-y-3")}>
                                <Image
                                    src="/images/goal-trophy.png"
                                    alt=""
                                    width={1024}
                                    height={682}
                                    className="w-32 h-auto object-contain mx-auto opacity-80 grayscale-[15%]"
                                />
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                    No completed goals yet
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                                    Once an active goal reaches 100% of its target, it will celebrate here.
                                </p>
                                <Link
                                    href="/savings/new"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-sky-400 dark:hover:text-white pt-1"
                                >
                                    <span>Start another goal</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB 3: ALLOCATION & PACE (Donut Chart + Semi-Circle Pace Gauge + Optimization Suggestions) */}
                {activeTab === "planner" && (
                    <motion.div
                        key="planner"
                        id="savings-panel-planner"
                        role="tabpanel"
                        aria-labelledby="savings-tab-planner"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                            {/* Left Card: Savings Allocation Donut + Category Bars */}
                            <div className={cn(GLASS_CARD, "lg:col-span-6 p-5 sm:p-6 flex flex-col justify-between gap-5")}>
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/12 dark:bg-blue-500/18 border border-blue-500/20 dark:border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                                            <PieChartIcon className="w-4.5 h-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-slate-950 dark:text-white">
                                                Savings Allocation
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 truncate">
                                                How your total target of {formatINR(stats.totalAllTarget)} is distributed.
                                            </p>
                                        </div>
                                    </div>

                                    {/* By Amount | By Percentage Segmented Pill Toggle */}
                                    <div
                                        role="group"
                                        aria-label="Allocation display metric"
                                        className="inline-flex items-center p-1 rounded-full bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.1] self-start shrink-0"
                                    >
                                        {[
                                            { id: "amount", label: "By Amount" },
                                            { id: "percent", label: "By Percentage" },
                                        ].map((opt) => {
                                            const active = allocMetricMode === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    aria-pressed={active}
                                                    onClick={() => setAllocMetricMode(opt.id)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap",
                                                        active
                                                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                                                            : "text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white"
                                                    )}
                                                >
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {allocation.length > 0 && stats.totalAllTarget > 0 ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 my-auto">
                                        {/* Recharts Donut */}
                                        <div className="relative h-[196px] w-[196px] shrink-0 mx-auto sm:mx-0">
                                            {hasMounted && (
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                    minWidth={0}
                                                    minHeight={0}
                                                    initialDimension={{ width: 196, height: 196 }}
                                                >
                                                    <PieChart>
                                                        <Pie
                                                            data={allocation}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={58}
                                                            outerRadius={86}
                                                            paddingAngle={allocation.length > 1 ? 2.5 : 0}
                                                            cornerRadius={3}
                                                            dataKey="target"
                                                            onMouseEnter={(_, idx) => setHoveredAllocIndex(idx)}
                                                            onMouseLeave={() => setHoveredAllocIndex(null)}
                                                        >
                                                            {allocation.map((entry, index) => {
                                                                const isDimmed =
                                                                    hoveredAllocIndex !== null &&
                                                                    hoveredAllocIndex !== index;
                                                                return (
                                                                    <Cell
                                                                        key={`alloc-slice-${entry.name}`}
                                                                        fill={entry.color}
                                                                        stroke={
                                                                            isLight
                                                                                ? "rgba(255,255,255,0.92)"
                                                                                : "rgba(15,23,42,0.88)"
                                                                        }
                                                                        strokeWidth={2}
                                                                        fillOpacity={isDimmed ? 0.35 : 1}
                                                                        className="transition-opacity duration-200 outline-none"
                                                                    />
                                                                );
                                                            })}
                                                        </Pie>
                                                        <Tooltip
                                                            content={<AllocationTooltip total={stats.totalAllTarget} />}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}

                                            {/* Centered Target Readout */}
                                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                                <span className="text-sm sm:text-base font-bold text-slate-950 dark:text-white font-mono tabular-nums">
                                                    {allocMetricMode === "amount"
                                                        ? formatCompactWholeINR(
                                                              activeAllocSlice
                                                                  ? activeAllocSlice.target
                                                                  : stats.totalAllTarget
                                                          )
                                                        : activeAllocSlice
                                                          ? `${activeAllocSlice.share.toFixed(1)}%`
                                                          : "100%"}
                                                </span>
                                                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate max-w-[105px] mt-0.5">
                                                    {activeAllocSlice
                                                        ? activeAllocSlice.name
                                                        : allocMetricMode === "amount"
                                                          ? "Total Target"
                                                          : "Allocated Share"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Aligned 4-Column Category Breakdown with Horizontal Progress Bars */}
                                        <div className="flex-1 w-full min-w-0 space-y-2 max-h-[240px] overflow-y-auto pr-1">
                                            {allocation.map((entry, index) => {
                                                const isHovered = hoveredAllocIndex === index;
                                                const barWidthPct = Math.max(
                                                    10,
                                                    Math.min(100, (entry.share / maxAllocShare) * 90)
                                                );
                                                return (
                                                    <div
                                                        key={entry.name}
                                                        onMouseEnter={() => setHoveredAllocIndex(index)}
                                                        onMouseLeave={() => setHoveredAllocIndex(null)}
                                                        className={cn(
                                                            "grid grid-cols-[minmax(86px,1.25fr)_42px_minmax(36px,1fr)_auto] items-center gap-2 text-xs py-1.5 px-2 rounded-xl transition-colors",
                                                            isHovered
                                                                ? "bg-slate-100/90 dark:bg-white/[0.08]"
                                                                : "hover:bg-slate-100/60 dark:hover:bg-white/[0.04]"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span
                                                                className="w-3 h-3 rounded-[4px] shrink-0"
                                                                style={{ backgroundColor: entry.color }}
                                                            />
                                                            <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                                                                {entry.name}
                                                            </span>
                                                        </div>

                                                        <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium text-right tabular-nums">
                                                            {allocMetricMode === "amount"
                                                                ? `${entry.share.toFixed(1)}%`
                                                                : `${Math.round(entry.fundedPct)}%`}
                                                        </span>

                                                        <div className="h-2.5 w-full rounded-full bg-slate-100/95 dark:bg-white/[0.08] overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${barWidthPct}%`,
                                                                    backgroundColor: entry.color,
                                                                }}
                                                            />
                                                        </div>

                                                        <span className="font-mono font-bold text-slate-950 dark:text-white text-xs text-right tabular-nums whitespace-nowrap">
                                                            {allocMetricMode === "amount"
                                                                ? formatCompactWholeINR(entry.target)
                                                                : `${entry.share.toFixed(1)}%`}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
                                        Create a savings goal to view category allocation.
                                    </div>
                                )}
                            </div>

                            {/* Right Card: Funding Pace Gauge, Pace Cards & Projection Banner */}
                            <div className={cn(GLASS_CARD, "lg:col-span-6 p-5 sm:p-6 flex flex-col justify-between gap-4")}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/12 dark:bg-blue-500/18 border border-blue-500/20 dark:border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                                            <Target className="w-4.5 h-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-slate-950 dark:text-white">
                                                Funding Pace
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                                Your required vs. current saving pace.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Period Selector Pill */}
                                    <div className="relative shrink-0">
                                        <select
                                            aria-label="Funding pace period"
                                            value={pacePeriod}
                                            onChange={(e) => setPacePeriod(e.target.value)}
                                            className="appearance-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-semibold bg-white/85 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/14 text-slate-800 dark:text-zinc-200 backdrop-blur-md shadow-[0_2px_8px_rgba(15,23,42,0.04)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        >
                                            <option value="monthly" className="bg-white dark:bg-zinc-900">
                                                Monthly
                                            </option>
                                            <option value="weekly" className="bg-white dark:bg-zinc-900">
                                                Weekly
                                            </option>
                                            <option value="yearly" className="bg-white dark:bg-zinc-900">
                                                Yearly
                                            </option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                {/* Gauge + 3 Tinted Pace Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                    <div className="sm:col-span-6 flex items-center justify-center py-1">
                                        <FundingPaceGauge
                                            requiredPace={periodRequiredPace}
                                            currentPace={periodCurrentPace}
                                            periodUnit={pacePeriodUnit}
                                            paceRatioPct={stats.paceRatioPct}
                                            isLight={isLight}
                                        />
                                    </div>

                                    <div className="sm:col-span-6 space-y-2.5">
                                        {/* Required Pace */}
                                        <div className="rounded-2xl bg-violet-50/85 dark:bg-violet-500/12 border border-violet-200/75 dark:border-violet-400/20 px-3.5 py-2.5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                                                    Required Pace
                                                </p>
                                                <p className="text-sm font-bold text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                                    {formatINR(periodRequiredPace)}{" "}
                                                    <span className="text-[11px] font-sans font-normal text-slate-500 dark:text-zinc-400">
                                                        / {pacePeriodUnit}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Current Pace */}
                                        <div className="rounded-2xl bg-emerald-50/85 dark:bg-emerald-500/12 border border-emerald-200/75 dark:border-emerald-400/20 px-3.5 py-2.5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <Wallet className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                                                    Current Pace
                                                </p>
                                                <p className="text-sm font-bold text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                                    {formatINR(periodCurrentPace)}{" "}
                                                    <span className="text-[11px] font-sans font-normal text-slate-500 dark:text-zinc-400">
                                                        / {pacePeriodUnit}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Pace Gap */}
                                        <div
                                            className={cn(
                                                "rounded-2xl px-3.5 py-2.5 flex items-center gap-3 border",
                                                periodPaceGap > 0
                                                    ? "bg-rose-50/85 dark:bg-rose-500/12 border-rose-200/75 dark:border-rose-400/20"
                                                    : "bg-emerald-50/85 dark:bg-emerald-500/12 border-emerald-200/75 dark:border-emerald-400/20"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-8 h-8 rounded-xl border flex items-center justify-center shrink-0",
                                                    periodPaceGap > 0
                                                        ? "bg-rose-500/15 border-rose-500/25 text-rose-600 dark:text-rose-400"
                                                        : "bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                                                )}
                                            >
                                                {periodPaceGap > 0 ? (
                                                    <AlertTriangle className="w-4 h-4" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                                                    Pace Gap
                                                </p>
                                                <p className="text-sm font-bold text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                                    {formatINR(periodPaceGap)}{" "}
                                                    <span className="text-[11px] font-sans font-normal text-slate-500 dark:text-zinc-400">
                                                        / {pacePeriodUnit}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Projection to Complete Banner */}
                                <div className="rounded-2xl bg-sky-50/85 dark:bg-sky-500/10 border border-sky-200/75 dark:border-sky-400/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/12 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-950 dark:text-white">
                                                Projection to Complete
                                            </p>
                                            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed mt-0.5">
                                                {stats.activeRemaining <= 0
                                                    ? "All active savings goals have reached 100% of their targets."
                                                    : stats.projectedMonthsToComplete !== null
                                                      ? `At your current pace, you'll reach all goals in ~${stats.projectedMonthsToComplete} ${stats.projectedMonthsToComplete === 1 ? "month" : "months"} (vs. ${stats.requiredMonthsToComplete} ${stats.requiredMonthsToComplete === 1 ? "month" : "months"} required).`
                                                      : `Add your first deposit to project completion against the ${stats.requiredMonthsToComplete}-month target.`}
                                            </p>
                                        </div>
                                    </div>

                                    {stats.projectionDelayMonths !== null && stats.projectionDelayMonths > 0 ? (
                                        <span className="self-start sm:self-center shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100/90 border border-rose-200/80 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-300 whitespace-nowrap tabular-nums">
                                            +{stats.projectionDelayMonths}{" "}
                                            {stats.projectionDelayMonths === 1 ? "month" : "months"}
                                        </span>
                                    ) : (
                                        <span className="self-start sm:self-center shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100/90 border border-emerald-200/80 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/30 dark:text-emerald-300 whitespace-nowrap">
                                            On schedule
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Full-Width Frosted Optimization Suggestions Bar */}
                        <div
                            className={cn(
                                GLASS_CARD,
                                "relative overflow-hidden p-4 sm:p-5 bg-gradient-to-r from-indigo-500/[0.06] via-white/80 to-violet-500/[0.06] dark:from-indigo-500/[0.1] dark:via-white/[0.04] dark:to-violet-500/[0.1] flex flex-col xl:flex-row xl:items-center justify-between gap-4"
                            )}
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-28 rounded-full bg-violet-400/18 dark:bg-violet-500/15 blur-2xl"
                            />

                            <div className="relative z-10 flex items-center gap-3.5 shrink-0">
                                <div className="w-11 h-11 rounded-full bg-white/90 dark:bg-white/[0.08] border border-violet-200/80 dark:border-violet-400/25 shadow-[0_6px_18px_rgba(139,92,246,0.18)] flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                        Optimization Suggestions
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                        {stats.paceGap > 0
                                            ? "Simple actions to stay on track and close your pace gap."
                                            : "Smart habits to keep your savings momentum on schedule."}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                                {/* Suggestion 1 */}
                                <div className="rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-white/95 dark:border-white/[0.1] px-3.5 py-2.5 flex items-center gap-3 shadow-[0_4px_14px_rgba(15,23,42,0.03)]">
                                    <div className="w-9 h-9 rounded-xl bg-violet-500/12 dark:bg-violet-500/20 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                        <BarChart3 className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                                            {stats.paceGap > 0
                                                ? "Increase monthly savings by"
                                                : "Monthly savings cushion"}
                                        </p>
                                        <p className="text-xs sm:text-[13px] font-bold text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                            {stats.paceGap > 0
                                                ? formatINR(stats.paceGap)
                                                : formatINR(
                                                      Math.max(
                                                          0,
                                                          stats.estimatedCurrentPace -
                                                              stats.totalMonthlyPace
                                                      )
                                                  )}
                                        </p>
                                    </div>
                                </div>

                                {/* Suggestion 2 */}
                                <div className="rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-white/95 dark:border-white/[0.1] px-3.5 py-2.5 flex items-center gap-3 shadow-[0_4px_14px_rgba(15,23,42,0.03)]">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/12 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                                            {stats.paceGap > 0
                                                ? "Reallocate from lower priority"
                                                : "Category distribution"}
                                        </p>
                                        <p className="text-xs sm:text-[13px] font-bold text-slate-950 dark:text-white font-mono tabular-nums truncate">
                                            {stats.paceGap > 0
                                                ? `(~${formatCompactWholeINR(reallocLow)} – ${formatCompactWholeINR(reallocHigh)})`
                                                : "Balanced across goals"}
                                        </p>
                                    </div>
                                </div>

                                {/* Suggestion 3 */}
                                <div className="rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-white/95 dark:border-white/[0.1] px-3.5 py-2.5 flex items-center gap-3 shadow-[0_4px_14px_rgba(15,23,42,0.03)]">
                                    <div className="w-9 h-9 rounded-xl bg-fuchsia-500/12 dark:bg-fuchsia-500/20 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-300 shrink-0">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                                            {stats.paceGap > 0
                                                ? "Consider extending timeline"
                                                : "Completion outlook"}
                                        </p>
                                        <p className="text-xs sm:text-[13px] font-bold text-slate-950 dark:text-white truncate">
                                            {stats.paceGap > 0
                                                ? `by ${extendText}`
                                                : "On or ahead of target"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UPDATE PROGRESS LIQUID-GLASS MODAL (Light & Dark Mode) */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent className={cn(GLASS_MODAL, "max-w-md p-5 sm:p-6")}>
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-blue-500/12 dark:bg-blue-500/18 border border-blue-500/20 dark:border-blue-400/25 flex items-center justify-center text-base shrink-0">
                                {selectedGoal?.icon || "🎯"}
                            </span>
                            <span>Update Progress</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                            Add a new deposit or set the total saved balance for{" "}
                            <span className="text-slate-900 dark:text-white font-semibold">{selectedGoal?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveProgress} className="space-y-4 py-1">
                        {/* Segmented Pill Mode Toggle */}
                        <div className="grid grid-cols-2 p-1 rounded-full bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.1]">
                            {[
                                { id: "deposit", label: "Add Deposit" },
                                { id: "set", label: "Set Total Balance" },
                            ].map((mode) => {
                                const active = updateMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => {
                                            setUpdateMode(mode.id);
                                            setDialogError("");
                                            setAmountInput(
                                                mode.id === "set" && selectedGoal
                                                    ? selectedGoal.currentAmount.toString()
                                                    : ""
                                            );
                                        }}
                                        className={cn(
                                            "py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                                            active
                                                ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] dark:bg-blue-500"
                                                : "text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white"
                                        )}
                                    >
                                        {mode.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="savings-amount-input" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                {updateMode === "deposit"
                                    ? "Deposit Amount (₹)"
                                    : "Total Saved Amount (₹)"}
                            </Label>
                            <input
                                id="savings-amount-input"
                                type="number"
                                step="0.01"
                                min="0"
                                value={amountInput}
                                onChange={(e) => {
                                    setAmountInput(e.target.value);
                                    setDialogError("");
                                }}
                                placeholder={updateMode === "deposit" ? "e.g. 2500" : "0.00"}
                                className="w-full h-11 px-3.5 rounded-2xl text-sm font-mono bg-slate-50/90 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/[0.14] text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                            />

                            {/* Quick Preset Pills in Deposit Mode */}
                            {updateMode === "deposit" && selectedGoal && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {[500, 1000, 5000].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => {
                                                const currentVal = parseFloat(amountInput) || 0;
                                                setAmountInput((currentVal + preset).toString());
                                                setDialogError("");
                                            }}
                                            className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 dark:bg-white/[0.07] dark:hover:bg-white/[0.12] dark:border-white/12 dark:text-zinc-200 transition-colors cursor-pointer"
                                        >
                                            +₹{preset.toLocaleString("en-IN")}
                                        </button>
                                    ))}
                                    {selectedGoal.remaining > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAmountInput(selectedGoal.remaining.toString());
                                                setDialogError("");
                                            }}
                                            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:border-emerald-400/35 dark:text-emerald-300 transition-colors cursor-pointer"
                                        >
                                            Fill remaining ({formatINR(selectedGoal.remaining)})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Live Projection Preview */}
                        {selectedGoal && (
                            <div className="rounded-2xl bg-slate-50/85 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <span className="text-slate-600 dark:text-zinc-400 inline-flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                                        <span>Projected balance</span>
                                    </span>
                                    <span className="font-mono font-bold text-slate-950 dark:text-white tabular-nums">
                                        {formatINR(projectedBalance)}{" "}
                                        <span className="text-slate-500 dark:text-zinc-400 font-normal">
                                            ({projectedProgress.toFixed(1)}%)
                                        </span>
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-200",
                                            projectedBalance >= selectedGoal.targetAmount
                                                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                : "bg-gradient-to-r from-blue-600 to-indigo-500"
                                        )}
                                        style={{ width: `${projectedProgress}%` }}
                                    />
                                </div>
                                {projectedBalance >= selectedGoal.targetAmount && (
                                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 pt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>This update reaches 100% and marks the goal completed.</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {dialogError && (
                            <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
                                {dialogError}
                            </p>
                        )}

                        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsUpdateDialogOpen(false)}
                                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 dark:text-zinc-300 dark:hover:text-white dark:bg-white/[0.07] dark:hover:bg-white/[0.12] dark:border-white/12 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSavingProgress}
                                className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_8px_20px_rgba(37,99,235,0.3)] disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                            >
                                {isSavingProgress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>{isSavingProgress ? "Saving..." : "Save Progress"}</span>
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE GOAL LIQUID-GLASS MODAL (Light & Dark Mode) */}
            <Dialog
                open={Boolean(goalToDelete)}
                onOpenChange={(open) => !open && setGoalToDelete(null)}
            >
                <DialogContent
                    className={cn(
                        GLASS_MODAL,
                        "border-rose-200/80 dark:border-rose-500/25 max-w-md p-5 sm:p-6"
                    )}
                >
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-rose-500/12 dark:bg-rose-500/20 border border-rose-500/25 dark:border-rose-400/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </span>
                            <span>Delete Savings Goal</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                            Are you sure you want to remove{" "}
                            <span className="text-slate-950 dark:text-white font-semibold">{goalToDelete?.name}</span>?
                            This permanently deletes this savings goal and its progress history.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={() => setGoalToDelete(null)}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 dark:text-zinc-300 dark:hover:text-white dark:bg-white/[0.07] dark:hover:bg-white/[0.12] dark:border-white/12 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_8px_20px_rgba(225,29,72,0.3)] disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>{isDeleting ? "Deleting..." : "Delete Goal"}</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
