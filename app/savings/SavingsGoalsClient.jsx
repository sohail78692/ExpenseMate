"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
    IndianRupee,
    Check,
    AlertTriangle,
    X,
    Loader2,
    ArrowUpRight,
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

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function getMonthlyPace(remaining, daysLeft) {
    if (remaining <= 0) return 0;
    if (daysLeft <= 0) return remaining;
    const monthsLeft = Math.max(daysLeft / 30.4375, 1);
    return remaining / monthsLeft;
}

export default function SavingsGoalsClient({ initialGoals }) {
    const router = useRouter();
    const [goals, setGoals] = useState(initialGoals || []);
    const [activeTab, setActiveTab] = useState("active");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("deadline");

    // Feedback banner state
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

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(""), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    const { activeGoals, completedGoals, stats, categories, allocation } = useMemo(() => {
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
        const dueSoonCount = active.filter((g) => g.daysLeft >= 0 && g.daysLeft <= 30).length;
        const overdueCount = active.filter((g) => g.daysLeft < 0).length;
        const totalMonthlyPace = active.reduce(
            (sum, g) => sum + getMonthlyPace(g.remaining, g.daysLeft),
            0
        );

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
                share: totalAllTarget > 0 ? (item.target / totalAllTarget) * 100 : 0,
                fundedPct: item.target > 0 ? (item.saved / item.target) * 100 : 0,
            }));

        const uniqueCategories = Array.from(
            new Set(active.map((g) => g.category || "Other"))
        );

        return {
            activeGoals: active,
            completedGoals: completed,
            categories: uniqueCategories,
            allocation: allocationList,
            stats: {
                activeSaved,
                activeTarget,
                activeRemaining,
                overallPct,
                dueSoonCount,
                overdueCount,
                totalMonthlyPace,
                nearestGoal,
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
                className: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/60 dark:border-red-800/80 dark:text-red-400",
            };
        }
        if (daysLeft <= 30) {
            return {
                label: `${daysLeft}d left`,
                className: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-300",
            };
        }
        return {
            label: `${daysLeft}d left`,
            className: "bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400",
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

    return (
        <div className="w-full space-y-8 pb-8 text-zinc-900 dark:text-zinc-100">
            {/* Header: Linear / Vercel Monochromatic Minimalist Style */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                            Savings Tracker
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-600">•</span>
                        <span className="font-mono text-zinc-600 dark:text-zinc-300">
                            {activeGoals.length} active · {completedGoals.length} completed
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                        Savings Goals
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Plan targets, log deposits, and monitor funding pace toward your milestones.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/savings/new"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 shadow-xs dark:shadow-none"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Goal</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Saved</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <PiggyBank className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(stats.activeSaved)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {stats.overallPct}% of {formatINR(stats.activeTarget)} target
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Remaining Gap</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <IndianRupee className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(stats.activeRemaining)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Across {activeGoals.length} active {activeGoals.length === 1 ? "goal" : "goals"}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Required Pace</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(stats.totalMonthlyPace)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Estimated monthly deposit needed
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Next Deadline</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <Clock className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white truncate">
                            {stats.nearestGoal ? stats.nearestGoal.name : "—"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {stats.nearestGoal
                                ? stats.nearestGoal.daysLeft >= 0
                                    ? `${stats.nearestGoal.daysLeft} days left · ${format(new Date(stats.nearestGoal.deadline), "MMM d")}`
                                    : `${Math.abs(stats.nearestGoal.daysLeft)} days overdue`
                                : "No upcoming deadlines"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Horizontal Sub-Navigation Tabs */}
            <div
                role="tablist"
                aria-label="Savings views"
                className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                                    layoutId="savingsTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
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
                        {/* Filter & Sort Toolbar */}
                        {activeGoals.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setCategoryFilter("all")}
                                        className={cn(
                                            "px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap transition-colors cursor-pointer",
                                            categoryFilter === "all"
                                                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                                : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
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
                                                    "px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap transition-colors cursor-pointer",
                                                    active
                                                        ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                                        : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="inline-flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto shrink-0">
                                    {[
                                        { id: "deadline", label: "Soonest" },
                                        { id: "progress", label: "Progress" },
                                        { id: "remaining", label: "Remaining" },
                                    ].map((opt) => {
                                        const isSelected = sortBy === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setSortBy(opt.id)}
                                                aria-pressed={isSelected}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                                    isSelected
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

                        {activeGoals.length === 0 ? (
                            <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none p-12 text-center space-y-4">
                                <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mx-auto">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                        No active savings goals
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                                        Set up your first savings target to track deposits, deadlines, and recommended monthly pace.
                                    </p>
                                </div>
                                <Link
                                    href="/savings/new"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create your first goal</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {visibleActiveGoals.map((goal) => {
                                    const urgency = getUrgencyBadge(goal.daysLeft);
                                    const monthlyPace = getMonthlyPace(goal.remaining, goal.daysLeft);

                                    return (
                                        <div
                                            key={goal._id}
                                            className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden flex flex-col justify-between transition-colors"
                                        >
                                            <div className="p-6 space-y-5">
                                                {/* Goal Card Header */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xl shrink-0">
                                                            {goal.icon || "🎯"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm sm:text-base font-medium text-zinc-950 dark:text-white truncate">
                                                                {goal.name}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                                                                    {goal.category || "Other"}
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
                                                                        urgency.className
                                                                    )}
                                                                >
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>{urgency.label}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setGoalToDelete(goal)}
                                                        aria-label={`Delete ${goal.name}`}
                                                        title="Delete goal"
                                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Progress Numbers & Bar */}
                                                <div className="space-y-2.5">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                                                            <span className="text-lg font-semibold text-zinc-950 dark:text-white">
                                                                {formatINR(goal.currentAmount)}
                                                            </span>
                                                            <span className="text-xs text-zinc-500">
                                                                / {formatINR(goal.targetAmount)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                            {goal.progress}%
                                                        </span>
                                                    </div>

                                                    <div
                                                        className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden"
                                                        role="progressbar"
                                                        aria-valuenow={Math.min(100, goal.progress)}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                        aria-label={`${goal.name} progress`}
                                                    >
                                                        <div
                                                            className="h-full rounded-full bg-zinc-900 dark:bg-white transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(100, Math.max(0, goal.progress))}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px] text-zinc-500 tabular-nums">
                                                        <span>{formatINR(goal.remaining)} remaining</span>
                                                        <span>
                                                            {goal.remaining > 0
                                                                ? `~${formatINR(monthlyPace)}/mo pace`
                                                                : "Target met"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Linear / Vercel Footer Strip */}
                                            <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                                                <span className="text-xs text-zinc-500">
                                                    Due{" "}
                                                    <span className="text-zinc-800 dark:text-zinc-300 font-medium">
                                                        {format(new Date(goal.deadline), "MMM d, yyyy")}
                                                    </span>
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => openUpdateDialog(goal)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-800 bg-zinc-200/80 hover:bg-zinc-200 dark:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                                                >
                                                    Update Progress
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB 2: COMPLETED GOALS */}
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
                        className="space-y-6"
                    >
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                        Completed Milestones
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Savings goals where you reached 100% of your target amount.
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-emerald-600 dark:text-emerald-400 font-mono tabular-nums self-start sm:self-auto">
                                    {formatINR(
                                        completedGoals.reduce((sum, g) => sum + g.currentAmount, 0)
                                    )}{" "}
                                    achieved
                                </span>
                            </div>

                            {completedGoals.length > 0 ? (
                                <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                    {completedGoals.map((goal) => (
                                        <div
                                            key={goal._id}
                                            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xl shrink-0">
                                                    {goal.icon || "🎯"}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium text-zinc-950 dark:text-white truncate">
                                                            {goal.name}
                                                        </h4>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-400 border shrink-0">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                                                            Completed
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 mt-0.5">
                                                        {goal.category || "Other"} · Target date{" "}
                                                        {format(new Date(goal.deadline), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                                <div className="text-left sm:text-right font-mono tabular-nums">
                                                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                        {formatINR(goal.currentAmount)}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-500">
                                                        of {formatINR(goal.targetAmount)}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setGoalToDelete(goal)}
                                                    aria-label={`Delete ${goal.name}`}
                                                    title="Delete goal"
                                                    className="p-2 rounded-lg text-zinc-500 hover:text-red-600 bg-zinc-100 hover:bg-red-50 border border-zinc-200 dark:text-zinc-400 dark:hover:text-red-400 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center space-y-2">
                                    <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        No completed goals yet
                                    </p>
                                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                        Once an active goal reaches 100% of its target, it will automatically move here.
                                    </p>
                                </div>
                            )}

                            <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                <span>{completedGoals.length} milestones archived</span>
                                <Link
                                    href="/savings/new"
                                    className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white font-medium transition-colors"
                                >
                                    <span>Start another goal</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 3: ALLOCATION & PACE */}
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
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                    >
                        {/* Category Allocation */}
                        <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 pb-4">
                                <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                    Allocation by Category
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    How your total savings targets are distributed across categories.
                                </p>
                            </div>

                            {allocation.length > 0 ? (
                                <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                    {allocation.map((cat) => (
                                        <div key={cat.name} className="px-6 py-4 space-y-2.5">
                                            <div className="flex items-center justify-between gap-3 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-950 dark:text-white">
                                                        {cat.name}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                                                        {cat.count} {cat.count === 1 ? "goal" : "goals"}
                                                    </span>
                                                </div>
                                                <div className="font-mono tabular-nums text-right">
                                                    <span className="text-zinc-950 dark:text-white font-medium">
                                                        {formatINR(cat.saved)}
                                                    </span>
                                                    <span className="text-zinc-500">
                                                        {" "}
                                                        / {formatINR(cat.target)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                                                    style={{
                                                        width: `${Math.min(100, cat.fundedPct)}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-zinc-500 tabular-nums">
                                                <span>{cat.fundedPct.toFixed(1)}% funded</span>
                                                <span>{cat.share.toFixed(1)}% of all targets</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-6 py-10 text-center text-xs text-zinc-500">
                                    Create a savings goal to view category allocation.
                                </div>
                            )}
                        </div>

                        {/* Monthly Funding Plan */}
                        <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 pb-4">
                                <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                    Monthly Funding Plan
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Recommended monthly deposits for each active goal to meet its deadline.
                                </p>
                            </div>

                            {activeGoals.length > 0 ? (
                                <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                    {activeGoals.map((goal) => {
                                        const monthly = getMonthlyPace(goal.remaining, goal.daysLeft);
                                        return (
                                            <div
                                                key={goal._id}
                                                className="px-6 py-3.5 flex items-center justify-between gap-3 text-xs"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="text-base shrink-0">
                                                        {goal.icon || "🎯"}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-zinc-900 dark:text-zinc-200 truncate">
                                                            {goal.name}
                                                        </p>
                                                        <p className="text-[11px] text-zinc-500">
                                                            {goal.daysLeft >= 0
                                                                ? `${goal.daysLeft} days left · due ${format(new Date(goal.deadline), "MMM d")}`
                                                                : `Overdue · ${formatINR(goal.remaining)} left`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-mono font-medium text-zinc-950 dark:text-white tabular-nums shrink-0">
                                                    {formatINR(monthly)}/mo
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-6 py-10 text-center text-xs text-zinc-500">
                                    No active goals require monthly funding.
                                </div>
                            )}

                            <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Combined monthly pace</span>
                                <span className="font-mono font-semibold text-zinc-950 dark:text-white tabular-nums">
                                    {formatINR(stats.totalMonthlyPace)}/mo
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UPDATE PROGRESS DIALOG */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
                            <span>{selectedGoal?.icon || "🎯"}</span>
                            <span>Update Progress</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Add a new deposit or set the total saved balance for{" "}
                            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{selectedGoal?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveProgress} className="space-y-4 py-2">
                        {/* Mode Toggle */}
                        <div className="grid grid-cols-2 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
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
                                            "py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                            active
                                                ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white"
                                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                        )}
                                    >
                                        {mode.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="savings-amount-input" className="text-xs text-zinc-600 dark:text-zinc-400">
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
                                className="w-full h-10 px-3 rounded-lg text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
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
                                            className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 transition-colors cursor-pointer"
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
                                            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-950 dark:border-emerald-800/80 dark:text-emerald-400 transition-colors cursor-pointer"
                                        >
                                            Fill remaining ({formatINR(selectedGoal.remaining)})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Live Projection Preview */}
                        {selectedGoal && (
                            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500 dark:text-zinc-400">Projected balance</span>
                                    <span className="font-mono font-semibold text-zinc-950 dark:text-white tabular-nums">
                                        {formatINR(projectedBalance)}{" "}
                                        <span className="text-zinc-500 font-normal">
                                            ({projectedProgress.toFixed(1)}%)
                                        </span>
                                    </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-200",
                                            projectedBalance >= selectedGoal.targetAmount
                                                ? "bg-emerald-500 dark:bg-emerald-400"
                                                : "bg-zinc-900 dark:bg-white"
                                        )}
                                        style={{ width: `${projectedProgress}%` }}
                                    />
                                </div>
                                {projectedBalance >= selectedGoal.targetAmount && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>This update reaches 100% and marks the goal completed.</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {dialogError && (
                            <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                                {dialogError}
                            </p>
                        )}

                        <DialogFooter className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsUpdateDialogOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSavingProgress}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            >
                                {isSavingProgress && <Loader2 className="w-3 h-3 animate-spin" />}
                                <span>{isSavingProgress ? "Saving..." : "Save Progress"}</span>
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE GOAL CONFIRMATION DIALOG */}
            <Dialog
                open={Boolean(goalToDelete)}
                onOpenChange={(open) => !open && setGoalToDelete(null)}
            >
                <DialogContent className="rounded-2xl bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/60 text-zinc-900 dark:text-zinc-100 max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white">
                            Delete Savings Goal
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            Are you sure you want to remove{" "}
                            <span className="text-zinc-900 dark:text-white font-medium">{goalToDelete?.name}</span>?
                            This permanently deletes this savings goal and its progress history.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex items-center gap-2 pt-3">
                        <button
                            type="button"
                            onClick={() => setGoalToDelete(null)}
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
                            <span>{isDeleting ? "Deleting..." : "Delete Goal"}</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
