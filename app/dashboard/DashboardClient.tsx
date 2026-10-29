"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Wallet,
    Target,
    PieChart,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryStyles } from "@/lib/categoryStyles";

interface DashboardClientProps {
    initialData: {
        dashboard: {
            totalSpent: number;
            todaySpent: number;
            highestCategory: { _id: string; total: number } | null;
            dailyTrend: { _id: string; amount: number }[];
            recentExpenses: {
                _id: string;
                title: string;
                amount: number;
                category: string;
                date: string;
            }[];
        } | null;
        budgetsAndInsights: {
            budgets: {
                _id: string;
                category: string;
                amount: number;
                spent: number;
                remaining: number;
                percentage: number;
                alertThreshold: number;
            }[];
            insights: {
                monthlyComparison: {
                    current: number;
                    last: number;
                    change: string | number;
                    trend: "up" | "down";
                };
                topCategories: { category: string; amount: number; count: number }[];
                budgetAlerts: { category: string; budget: number; spent: number; percentage: string }[];
                recommendations: {
                    type: string;
                    title: string;
                    message: string;
                    icon: string;
                }[];
            };
        } | null;
        savings: {
            goals: {
                _id: string;
                title: string;
                targetAmount: number;
                currentAmount: number;
                progress: number;
                remaining: number;
                daysLeft: number;
                deadline: string;
            }[];
        } | null;
        user: {
            name?: string;
            email?: string;
        } | null;
    };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"feed" | "budgets" | "heatmap">("feed");
    const [buttonRipples, setButtonRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const { dashboard, budgetsAndInsights, savings, user } = initialData;

    const totalSpent = dashboard?.totalSpent || 0;
    const todaySpent = dashboard?.todaySpent || 0;
    const highestCategory = dashboard?.highestCategory;
    const recentExpenses = dashboard?.recentExpenses || [];
    const dailyTrend = dashboard?.dailyTrend || [];

    const budgets = budgetsAndInsights?.budgets || [];
    const insights = budgetsAndInsights?.insights;
    const recommendations = insights?.recommendations || [];
    const savingsGoals = savings?.goals || [];

    // Calculate total budget and remaining across all budgets
    const totalBudget = budgets.reduce((acc, b) => acc + (b.category === "Total" ? b.amount : 0), 0) ||
        budgets.reduce((acc, b) => acc + b.amount, 0);
    const remainingBudget = totalBudget > 0 ? totalBudget - totalSpent : 0;
    const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : null;

    // Highest priority savings goal
    const primaryGoal = savingsGoals.length > 0 ? savingsGoals[0] : null;

    // Yesterday spending comparison
    const yesterday = dailyTrend.length > 1 ? dailyTrend[dailyTrend.length - 2]?.amount || 0 : 0;
    const todayChange = yesterday > 0 ? Number(((todaySpent - yesterday) / yesterday * 100).toFixed(1)) : 0;

    // Current month calendar generation for Activity Heatmap
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    const currentMonthName = format(now, "MMMM");
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

    // Map daily spending to days of month
    const spendingMap: { [day: number]: number } = {};
    let maxDailySpend = 0;
    dailyTrend.forEach((item) => {
        const parts = item._id.split("-");
        const dayNum = parseInt(parts[2], 10);
        if (!isNaN(dayNum)) {
            spendingMap[dayNum] = item.amount;
            if (item.amount > maxDailySpend) {
                maxDailySpend = item.amount;
            }
        }
    });

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setButtonRipples((prev) => [...prev.slice(-3), { x, y, id }]);
        setTimeout(() => {
            setButtonRipples((prev) => prev.filter((r) => r.id !== id));
        }, 650);
    };

    return (
        <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-6">
            {/* Top Header & Primary Action with Ocean Flow Animation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] text-xs font-semibold tracking-wide">
                            Live Workspace
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                            {format(now, "EEEE, MMMM d, yyyy")}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                        Welcome back, <span className="text-white font-medium">{user?.name || "Member"}</span>! Here&apos;s your financial snapshot and live budget guardrails.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/expenses">
                        <Button
                            size="lg"
                            onClick={handleButtonClick}
                            className="relative group overflow-hidden text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xl shadow-[#0071E3]/25 hover:shadow-[#0071E3]/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            {/* Ocean Flow Current Layer (inside button on hover) */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: "linear-gradient(90deg, #0071E3 0%, #00c6ff 50%, #0071E3 100%)",
                                    backgroundSize: "200% 100%",
                                    animation: "ocean-flow-inside 2.5s linear infinite",
                                }}
                            />

                            {/* Ocean Wave Crest (gentle liquid surge inside) */}
                            <div
                                className="absolute -inset-x-2 -bottom-2 h-full pointer-events-none opacity-30 mix-blend-screen"
                                style={{
                                    background: "radial-gradient(ellipse 65% 50% at 50% 100%, rgba(56, 189, 248, 0.9), transparent 70%)",
                                    animation: "ocean-wave-crest 3.5s ease-in-out infinite alternate",
                                }}
                            />

                            {/* Ocean Wave Shimmer Sweep */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none" />

                            {/* Interactive Click Water Ripples */}
                            {buttonRipples.map((ripple) => (
                                <span
                                    key={ripple.id}
                                    className="absolute pointer-events-none rounded-full bg-cyan-200/50 animate-ocean-ripple"
                                    style={{
                                        left: ripple.x,
                                        top: ripple.y,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            ))}

                            <div className="relative z-10 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                <span>Add Expense</span>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Top iOS/macOS Widget Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
                {/* 1. This Month Spend Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1222]/85 backdrop-blur-xl border border-white/[0.08] hover:border-[#0A84FF]/40 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-medium">This Month&apos;s Spend</span>
                        {insights?.monthlyComparison ? (
                            <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    insights.monthlyComparison.trend === "up"
                                        ? "text-red-400 bg-red-500/10 border border-red-500/20"
                                        : "text-[#30D158] bg-[#30D158]/10 border border-[#30D158]/20"
                                }`}
                            >
                                {insights.monthlyComparison.trend === "up" ? (
                                    <>
                                        +{insights.monthlyComparison.change}% <TrendingUp className="w-3 h-3" />
                                    </>
                                ) : (
                                    <>
                                        {insights.monthlyComparison.change}% <TrendingDown className="w-3 h-3" />
                                    </>
                                )}
                            </span>
                        ) : (
                            <span className="text-xs text-[#0A84FF] font-semibold">Active</span>
                        )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                        ₹{totalSpent.toFixed(2)}
                    </div>
                    <div className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 flex items-center justify-between">
                        <span>Total spending in {currentMonthName}</span>
                        <span className="text-zinc-500 text-[10px]">Today: ₹{todaySpent.toFixed(2)}</span>
                    </div>
                </div>

                {/* 2. Budget Guardrails Status Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1222]/85 backdrop-blur-xl border border-white/[0.08] hover:border-[#0A84FF]/40 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-medium">Budget Status</span>
                        {budgetPct !== null ? (
                            <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    budgetPct > 100
                                        ? "text-red-400 bg-red-500/10 border border-red-500/20"
                                        : budgetPct > 80
                                        ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                                        : "text-[#30D158] bg-[#30D158]/10 border border-[#30D158]/20"
                                }`}
                            >
                                {budgetPct > 100 ? "Exceeded" : budgetPct > 80 ? `${budgetPct}% Used` : "On Track"}
                            </span>
                        ) : (
                            <Link href="/budgets" className="text-xs text-[#0A84FF] hover:underline font-medium">
                                Set Budget →
                            </Link>
                        )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                        {totalBudget > 0 ? `₹${remainingBudget.toFixed(2)}` : "₹0.00"}
                    </div>
                    <div className="text-[11px] sm:text-xs text-zinc-400 mt-1.5">
                        {totalBudget > 0
                            ? `Remaining of ₹${totalBudget.toFixed(2)} monthly budget`
                            : "No monthly budget limit set yet"}
                    </div>
                </div>

                {/* 3. Emergency / Savings Goal or Top Category Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1222]/85 backdrop-blur-xl border border-white/[0.08] hover:border-[#0A84FF]/40 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-medium">
                            {primaryGoal ? "Primary Goal" : "Top Spending Category"}
                        </span>
                        {primaryGoal ? (
                            <span className="text-[11px] text-[#64D2FF] font-semibold px-2 py-0.5 rounded-full bg-[#64D2FF]/10 border border-[#64D2FF]/20">
                                {primaryGoal.progress}% Complete
                            </span>
                        ) : highestCategory ? (
                            <span className="text-[11px] text-[#FF9F0A] font-semibold px-2 py-0.5 rounded-full bg-[#FF9F0A]/10 border border-[#FF9F0A]/20">
                                Top Category
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-500">None yet</span>
                        )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                        {primaryGoal
                            ? primaryGoal.title
                            : highestCategory
                            ? highestCategory._id
                            : "All Clear"}
                    </div>
                    <div className="text-[11px] sm:text-xs text-zinc-400 mt-1.5">
                        {primaryGoal
                            ? `₹${primaryGoal.currentAmount.toFixed(2)} of ₹${primaryGoal.targetAmount.toFixed(2)}`
                            : highestCategory
                            ? `₹${highestCategory.total.toFixed(2)} total spent this month`
                            : "Track your first expense to see trends"}
                    </div>
                </div>
            </div>

            {/* Smart Financial Recommendations / Guardrail Alerts (if any) */}
            {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {recommendations.slice(0, 2).map((rec, index) => (
                        <div
                            key={index}
                            className={`p-3.5 sm:p-4 rounded-2xl backdrop-blur-xl border flex items-start gap-3 transition-all ${
                                rec.type === "warning" || rec.type === "alert"
                                    ? "bg-red-500/[0.06] border-red-500/20 text-red-200"
                                    : rec.type === "success"
                                    ? "bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-200"
                                    : "bg-[#0A84FF]/[0.06] border-[#0A84FF]/20 text-blue-200"
                            }`}
                        >
                            <span className="text-xl sm:text-2xl shrink-0 p-1">{rec.icon}</span>
                            <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-semibold text-white">{rec.title}</h4>
                                <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5 leading-relaxed">
                                    {rec.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* THE SIGNATURE WORKSPACE CONTAINER (Apple macOS Window & Segmented Tabs) */}
            <div className="rounded-3xl bg-[#090e1d]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Workspace Top Window Bar */}
                <div className="p-3 sm:p-4.5 border-b border-white/[0.06] bg-[#0c1326]/60 flex flex-col xs:flex-row items-center justify-between gap-3">
                    {/* Window Control Dots */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] border border-red-600/30"></span>
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] border border-yellow-600/30"></span>
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F] border border-green-600/30"></span>
                        </div>
                        <span className="text-[11px] sm:text-xs font-semibold text-zinc-300 ml-2 tracking-wide flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] animate-pulse"></span>
                            ExpenseMate • Financial Workspace
                        </span>
                    </div>

                    {/* Segmented Workspace Controller Tabs */}
                    <div className="flex items-center bg-[#182035]/80 p-1 rounded-full border border-white/[0.08] text-[11px] sm:text-xs w-full xs:w-auto justify-center shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveWorkspaceTab("feed")}
                            className={`flex-1 xs:flex-initial px-3 sm:px-4 py-1.5 rounded-full font-medium transition-all text-center cursor-pointer ${
                                activeWorkspaceTab === "feed"
                                    ? "bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/25 font-semibold"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            Recent Feed
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveWorkspaceTab("budgets")}
                            className={`flex-1 xs:flex-initial px-3 sm:px-4 py-1.5 rounded-full font-medium transition-all text-center cursor-pointer ${
                                activeWorkspaceTab === "budgets"
                                    ? "bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/25 font-semibold"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            Budget Rings
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveWorkspaceTab("heatmap")}
                            className={`flex-1 xs:flex-initial px-3 sm:px-4 py-1.5 rounded-full font-medium transition-all text-center cursor-pointer ${
                                activeWorkspaceTab === "heatmap"
                                    ? "bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/25 font-semibold"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            Activity Heatmap
                        </button>
                    </div>
                </div>

                {/* Tab 1: Recent Feed */}
                {activeWorkspaceTab === "feed" && (
                    <div className="p-4 sm:p-6 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            <span>Description</span>
                            <span className="hidden sm:inline">Category</span>
                            <span className="hidden sm:inline">Date</span>
                            <span className="text-right">Amount</span>
                        </div>

                        {recentExpenses.length > 0 ? (
                            recentExpenses.map((expense) => {
                                const { icon: CategoryIcon, color, bg } = getCategoryStyles(expense.category);
                                return (
                                    <div
                                        key={expense._id}
                                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#11182c]/70 hover:bg-[#15203a] border border-white/[0.04] hover:border-white/[0.1] transition-all group"
                                    >
                                        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                                            <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${bg}`}>
                                                <CategoryIcon className={`w-4 h-4 ${color}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-xs sm:text-sm font-semibold text-white truncate block group-hover:text-[#64D2FF] transition-colors">
                                                    {expense.title}
                                                </span>
                                                <span className="text-[10px] sm:text-[11px] text-zinc-400 sm:hidden block truncate">
                                                    {expense.category} • {format(new Date(expense.date), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        </div>

                                        <span className="text-xs px-3 py-1 rounded-full bg-white/[0.06] text-zinc-300 font-medium hidden sm:inline shrink-0">
                                            {expense.category}
                                        </span>

                                        <span className="text-xs text-zinc-400 hidden sm:inline shrink-0">
                                            {format(new Date(expense.date), "MMM d, yyyy")}
                                        </span>

                                        <span className="text-xs sm:text-sm font-bold text-white font-mono shrink-0 ml-2">
                                            -₹{expense.amount.toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 sm:py-14 text-zinc-400 space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-xl">
                                    💳
                                </div>
                                <p className="text-sm font-medium text-zinc-300">No transactions recorded yet</p>
                                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                    Click &quot;Add Expense&quot; above to log your first transaction and start generating insights.
                                </p>
                                <Link href="/expenses" className="inline-block mt-2">
                                    <Button size="sm" variant="outline" className="rounded-full text-xs border-white/10 hover:bg-white/[0.08]">
                                        Log Expense
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <Link
                                href="/expenses"
                                className="inline-flex items-center gap-1.5 text-xs text-[#0A84FF] hover:text-[#64D2FF] font-semibold transition-colors"
                            >
                                <span>View all expenses</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Tab 2: Budget Rings & Category Guardrails */}
                {activeWorkspaceTab === "budgets" && (
                    <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 animate-in fade-in duration-200">
                        {budgets.length > 0 ? (
                            budgets.map((b) => {
                                const { icon: CategoryIcon, color, hex } = getCategoryStyles(b.category);
                                const isAlert = b.percentage >= (b.alertThreshold || 80);

                                return (
                                    <div
                                        key={b._id}
                                        className="p-3.5 sm:p-4 rounded-2xl bg-[#11182c]/70 border border-white/[0.05] hover:border-white/[0.1] transition-all"
                                    >
                                        <div className="flex justify-between items-center text-xs sm:text-sm mb-2 sm:mb-2.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <CategoryIcon className={`w-4 h-4 shrink-0 ${color}`} />
                                                <span className="font-semibold text-white truncate">{b.category}</span>
                                                {isAlert && (
                                                    <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full shrink-0">
                                                        Alert
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-[11px] sm:text-xs text-zinc-400 shrink-0 ml-2 font-mono">
                                                <span className="text-white font-bold">₹{b.spent.toFixed(2)}</span> of ₹{b.amount.toFixed(2)} ({b.percentage}%)
                                            </span>
                                        </div>

                                        <div className="w-full h-2 sm:h-2.5 rounded-full bg-white/10 overflow-hidden relative">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    b.percentage >= 100
                                                        ? "bg-red-500"
                                                        : b.percentage >= 80
                                                        ? "bg-amber-500"
                                                        : "bg-[#0A84FF]"
                                                }`}
                                                style={{ width: `${Math.min(100, b.percentage)}%`, backgroundColor: b.percentage < 80 ? hex : undefined }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 sm:py-14 text-zinc-400 space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-xl">
                                    🎯
                                </div>
                                <p className="text-sm font-medium text-zinc-300">No monthly budgets configured</p>
                                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                    Set monthly spending limits for categories like Food, Utilities, or Dining to get smart overspend alerts.
                                </p>
                                <Link href="/budgets" className="inline-block mt-2">
                                    <Button size="sm" className="bg-[#0A84FF] hover:bg-[#0071E3] text-white rounded-full text-xs font-semibold">
                                        Configure Budgets
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <Link
                                href="/budgets"
                                className="inline-flex items-center gap-1.5 text-xs text-[#0A84FF] hover:text-[#64D2FF] font-semibold transition-colors"
                            >
                                <span>Manage all budgets & alert thresholds</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Tab 3: Activity Heatmap */}
                {activeWorkspaceTab === "heatmap" && (
                    <div className="p-4 sm:p-6 animate-in fade-in duration-200">
                        <div className="text-xs sm:text-sm font-medium text-zinc-300 mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span>Daily Spending Intensity ({currentMonthName} {currentYear})</span>
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400">
                                <span>Low</span>
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-white/10" />
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-[#0A84FF]/30" />
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-[#0A84FF]/65" />
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-[#0A84FF]" />
                                <span>High</span>
                            </div>
                        </div>

                        {/* Day of Week Labels */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center text-[10px] sm:text-xs text-zinc-400 font-semibold">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, d) => (
                                <div key={d}>{day}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {/* Empty offset padding for days before 1st of month */}
                            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="h-9 sm:h-12 rounded-lg sm:rounded-xl opacity-20" />
                            ))}

                            {/* Actual days of month */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const dayNum = i + 1;
                                const spentOnDay = spendingMap[dayNum] || 0;
                                let intensity = 0;
                                if (spentOnDay > 0) {
                                    if (maxDailySpend > 0) {
                                        const ratio = spentOnDay / maxDailySpend;
                                        if (ratio > 0.66) intensity = 3;
                                        else if (ratio > 0.33) intensity = 2;
                                        else intensity = 1;
                                    } else {
                                        intensity = 1;
                                    }
                                }

                                const intensityClasses = [
                                    "bg-white/[0.04] border-white/[0.04] text-zinc-500",
                                    "bg-[#0A84FF]/25 border-[#0A84FF]/30 text-white",
                                    "bg-[#0A84FF]/60 border-[#0A84FF]/65 text-white font-semibold",
                                    "bg-[#0A84FF] border-[#64D2FF] text-white font-bold shadow-sm shadow-[#0A84FF]/30",
                                ];

                                return (
                                    <div
                                        key={dayNum}
                                        className={`h-9 sm:h-12 rounded-lg sm:rounded-xl flex flex-col items-center justify-center border p-0.5 sm:p-1 transition-all hover:scale-105 cursor-pointer ${intensityClasses[intensity]}`}
                                        title={`Day ${dayNum}: ₹${spentOnDay.toFixed(2)}`}
                                    >
                                        <span className="text-[9px] sm:text-[10px] leading-none opacity-70">
                                            {dayNum}
                                        </span>
                                        <span className="text-[9px] sm:text-[11px] leading-tight mt-0.5 font-mono truncate max-w-full px-0.5">
                                            {spentOnDay > 0 ? `₹${spentOnDay.toFixed(0)}` : "₹0"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Link
                                href="/analytics"
                                className="inline-flex items-center gap-1.5 text-xs text-[#0A84FF] hover:text-[#64D2FF] font-semibold transition-colors"
                            >
                                <span>Open full interactive analytics heatmap</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Action Navigation Cards (iOS Card Polish) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
                <Link
                    href="/analytics"
                    className="p-4 sm:p-5 rounded-2xl bg-[#0c1222]/85 backdrop-blur-xl border border-white/[0.08] hover:border-[#0A84FF]/40 hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] group cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2.5 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
                            <PieChart className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#64D2FF] transition-colors">
                        Visual Analytics
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Explore category breakdowns, historical trends, and spending patterns.
                    </p>
                </Link>

                <Link
                    href="/budgets"
                    className="p-4 sm:p-5 rounded-2xl bg-[#0c1222]/85 backdrop-blur-xl border border-white/[0.08] hover:border-[#0A84FF]/40 hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] group cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2.5 rounded-xl bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#30D158] transition-colors">
                        Budget Guardrails
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Set custom spending limits and trigger alerts before exceeding caps.
                    </p>
                </Link>

                <Link
                    href="/savings"
                    className="p-4 sm:p-5 rounded-2xl bg-[#0c1222]/85 backdrop-blur-xl border border-white/[0.08] hover:border-[#0A84FF]/40 hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] group cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2.5 rounded-xl bg-[#64D2FF]/15 text-[#64D2FF] border border-[#64D2FF]/30">
                            <Target className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#64D2FF] transition-colors">
                        Savings Goals
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Track progress toward emergency funds, gadgets, and personal milestones.
                    </p>
                </Link>
            </div>
        </div>
    );
}

