"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    AlertTriangle,
    Check,
    Loader2,
    Wallet,
    ShieldCheck,
    ShieldAlert,
    Calendar,
    Sparkles,
    Info,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCategoryStyles } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Entertainment",
    "Health",
    "Shopping",
    "Other",
    "Total",
];

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

const budgetNewGlassStyles = `
@property --bnew-angle-1 {
  syntax: "<angle>";
  inherits: false;
  initial-value: -75deg;
}
@property --bnew-angle-2 {
  syntax: "<angle>";
  inherits: false;
  initial-value: -45deg;
}

@keyframes bnew-sheen {
  0% {
    transform: translateX(-140%) skewX(-18deg);
    opacity: 0;
  }
  20% {
    opacity: 0.85;
  }
  50% {
    opacity: 0.85;
  }
  100% {
    transform: translateX(160%) skewX(-18deg);
    opacity: 0;
  }
}

.bnew-glass-sheen {
  position: absolute;
  inset: -1px;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
}

.bnew-glass-sheen::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 55%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0) 10%,
    rgba(255, 255, 255, 0.45) 50%,
    rgba(255, 255, 255, 0) 90%,
    transparent 100%
  );
  filter: blur(2px);
  transform: translateX(-140%) skewX(-18deg);
  opacity: 0;
}

.bnew-glass-btn:hover .bnew-glass-sheen::after {
  animation: bnew-sheen 1.35s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.bnew-glass-btn {
  position: relative;
  isolation: isolate;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  text-decoration: none;
}

.bnew-glass-btn:active {
  transform: scale(0.975);
}

.bnew-glass-btn-accent {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.96) 0%, rgba(139, 92, 246, 0.94) 50%, rgba(217, 70, 239, 0.92) 100%);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow:
    0 8px 24px -4px rgba(124, 58, 237, 0.5),
    0 2px 6px -1px rgba(124, 58, 237, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.6),
    inset 0 -1px 2px rgba(0, 0, 0, 0.25);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.bnew-glass-btn-accent:hover {
  background: linear-gradient(135deg, rgba(109, 112, 255, 0.98) 0%, rgba(149, 102, 255, 0.96) 50%, rgba(227, 80, 249, 0.94) 100%);
  border-color: rgba(255, 255, 255, 0.45);
  box-shadow:
    0 12px 30px -4px rgba(124, 58, 237, 0.65),
    0 4px 10px -2px rgba(124, 58, 237, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.bnew-glass-btn-neutral {
  background: rgba(255, 255, 255, 0.75);
  color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    0 6px 18px -4px rgba(15, 23, 42, 0.08),
    0 2px 6px -1px rgba(15, 23, 42, 0.04),
    inset 0 1px 1px rgba(255, 255, 255, 0.95),
    inset 0 -1px 1px rgba(15, 23, 42, 0.05);
}

.dark .bnew-glass-btn-neutral {
  background: rgba(19, 24, 49, 0.65);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 24px -4px rgba(0, 0, 0, 0.5),
    0 2px 6px -1px rgba(0, 0, 0, 0.35),
    inset 0 1px 1px rgba(255, 255, 255, 0.12),
    inset 0 -1px 1px rgba(0, 0, 0, 0.4);
}

.bnew-glass-btn-neutral:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  border-color: rgba(255, 255, 255, 1);
  box-shadow:
    0 10px 24px -4px rgba(15, 23, 42, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.dark .bnew-glass-btn-neutral:hover {
  background: rgba(27, 34, 68, 0.85);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow:
    0 12px 28px -4px rgba(0, 0, 0, 0.65),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.bnew-glass-input {
  background: rgba(248, 250, 252, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow:
    inset 0 2px 4px rgba(15, 23, 42, 0.04),
    0 1px 2px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.dark .bnew-glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.05);
}

.bnew-glass-input:hover {
  border-color: rgba(148, 163, 184, 0.6);
}

.dark .bnew-glass-input:hover {
  border-color: rgba(255, 255, 255, 0.22);
}

.bnew-glass-input:focus,
.bnew-glass-input:focus-within {
  border-color: rgba(139, 92, 246, 0.7);
  box-shadow:
    0 0 0 3px rgba(139, 92, 246, 0.22),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.bnew-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow:
    0 16px 40px -12px rgba(30, 41, 59, 0.09),
    0 4px 12px -2px rgba(30, 41, 59, 0.04),
    inset 0 1px 1px rgba(255, 255, 255, 0.95);
}

.dark .bnew-card {
  background: rgba(13, 18, 36, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 22px 50px -14px rgba(0, 0, 0, 0.72),
    0 6px 18px -4px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
`;

export default function NewBudgetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState(() => ({
        category: "Food",
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        alertThreshold: 80,
    }));

    // Pre-fill month/year if navigated with query params
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const m = parseInt(params.get("month") || "", 10);
        const y = parseInt(params.get("year") || "", 10);
        if (m >= 1 && m <= 12 && y >= 2020 && y <= 2100) {
            setFormData((prev) => ({ ...prev, month: m, year: y }));
        }
    }, []);

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const preview = useMemo(() => {
        const amountNum = parseFloat(formData.amount) || 0;
        const thresholdNum = Math.min(100, Math.max(0, parseInt(formData.alertThreshold, 10) || 0));
        const alertAtAmount = (amountNum * thresholdNum) / 100;
        const selectedMonthObj = MONTHS.find((m) => m.value === Number(formData.month));
        const selectedMonthLabel = selectedMonthObj?.label || "Month";

        // Calculate days in selected month for estimated daily velocity
        const daysInSelectedMonth = new Date(formData.year, formData.month, 0).getDate();
        const dailySafeRate = amountNum > 0 ? amountNum / daysInSelectedMonth : 0;

        return {
            amountNum,
            thresholdNum,
            alertAtAmount,
            selectedMonthLabel,
            daysInSelectedMonth,
            dailySafeRate,
        };
    }, [formData.amount, formData.alertThreshold, formData.month, formData.year]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const amountNum = parseFloat(formData.amount);
        const thresholdNum = parseInt(formData.alertThreshold, 10);

        if (!formData.category) {
            setError("Please select a budget category.");
            return;
        }
        if (!Number.isFinite(amountNum) || amountNum <= 0) {
            setError("Budget amount must be greater than 0.");
            return;
        }
        if (!Number.isFinite(thresholdNum) || thresholdNum < 0 || thresholdNum > 100) {
            setError("Alert threshold must be between 0% and 100%.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/budgets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    category: formData.category,
                    amount: amountNum,
                    month: parseInt(formData.month, 10),
                    year: parseInt(formData.year, 10),
                    alertThreshold: thresholdNum,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create budget");
            }

            router.push("/budgets");
            router.refresh();
        } catch (err) {
            setError(err.message || "Failed to create budget");
            setLoading(false);
        }
    };

    const catStyle = getCategoryStyles(formData.category);
    const PreviewIcon = formData.category === "Total" ? Wallet : catStyle.icon;

    return (
        <div className="relative w-full space-y-6 pb-28 lg:pb-10 text-slate-900 dark:text-zinc-100">
            <style dangerouslySetInnerHTML={{ __html: budgetNewGlassStyles }} />

            {/* Soft Atmospheric Liquid-Glass Canvas Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/4 h-[540px] w-[540px] rounded-full bg-indigo-400/20 blur-[140px] dark:bg-indigo-600/18" />
                <div className="absolute top-12 -right-24 h-[520px] w-[520px] rounded-full bg-violet-400/20 blur-[140px] dark:bg-violet-600/18" />
                <div className="absolute -bottom-32 -left-24 h-[500px] w-[500px] rounded-full bg-sky-300/25 blur-[135px] dark:bg-blue-600/15" />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-2">
                        <Link
                            href="/budgets"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 hover:bg-white/95 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-white/90 dark:border-white/10 text-slate-700 dark:text-zinc-300 font-medium transition-all shadow-xs"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Budgets &amp; Insights</span>
                        </Link>
                        <span className="text-slate-400 dark:text-zinc-600">/</span>
                        <span className="text-slate-900 dark:text-zinc-200 font-semibold">New Budget</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                        Create{" "}
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 dark:from-sky-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                            Monthly Budget
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-xl">
                        Set a reliable spending guardrail and early alert threshold for a category or your overall monthly spend.
                    </p>
                </div>

                <Link
                    href="/budgets"
                    className="bnew-glass-btn bnew-glass-btn-neutral px-4 py-2 text-xs self-start sm:self-auto"
                >
                    <div className="bnew-glass-sheen" />
                    <span>Cancel</span>
                </Link>
            </div>

            {error && (
                <div
                    role="alert"
                    className="p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium bg-red-50/95 border border-red-200/90 text-red-700 dark:bg-red-950/60 dark:border-red-500/35 dark:text-red-200 backdrop-blur-xl shadow-xs"
                >
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="lg:col-span-7 bnew-card overflow-hidden"
                >
                    <div className="p-6 sm:p-7 space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70 dark:border-white/[0.08]">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/20 border border-indigo-500/25 dark:border-indigo-400/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                    Budget Configuration
                                </h2>
                                <p className="text-xs text-slate-600 dark:text-zinc-400">
                                    One budget is allowed per category for a given month and year.
                                </p>
                            </div>
                        </div>

                        {/* Category & Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Category Selector */}
                            <div className="space-y-1.5">
                                <Label htmlFor="budget-category" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Category <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange("category", value)}
                                >
                                    <SelectTrigger
                                        id="budget-category"
                                        className="w-full h-11 rounded-2xl bnew-glass-input text-slate-900 dark:text-white text-sm"
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl bnew-card text-slate-900 dark:text-white">
                                        {CATEGORIES.map((category) => {
                                            const itemStyle = getCategoryStyles(category);
                                            const ItemIcon = category === "Total" ? Wallet : itemStyle.icon;
                                            return (
                                                <SelectItem key={category} value={category} className="py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={cn(
                                                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border",
                                                                category === "Total"
                                                                    ? "bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400"
                                                                    : cn(itemStyle.bg, itemStyle.border, itemStyle.color)
                                                            )}
                                                        >
                                                            <ItemIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="font-medium">
                                                            {category === "Total"
                                                                ? "Total (Overall Monthly Cap)"
                                                                : category}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Monthly Limit Amount */}
                            <div className="space-y-1.5">
                                <Label htmlFor="budget-amount" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Monthly Limit <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3 flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs pointer-events-none">
                                        ₹
                                    </div>
                                    <input
                                        id="budget-amount"
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        placeholder="8000"
                                        value={formData.amount}
                                        onChange={(e) => handleChange("amount", e.target.value)}
                                        required
                                        className="w-full h-11 pl-11 pr-4 rounded-2xl bnew-glass-input text-slate-900 dark:text-white font-mono text-sm font-semibold placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Month & Year Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="budget-month" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Target Month <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={formData.month.toString()}
                                    onValueChange={(value) => handleChange("month", parseInt(value, 10))}
                                >
                                    <SelectTrigger
                                        id="budget-month"
                                        className="w-full h-11 rounded-2xl bnew-glass-input text-slate-900 dark:text-white text-sm"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Calendar className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl bnew-card text-slate-900 dark:text-white">
                                        {MONTHS.map((month) => (
                                            <SelectItem key={month.value} value={month.value.toString()} className="py-2">
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="budget-year" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Target Year <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={formData.year.toString()}
                                    onValueChange={(value) => handleChange("year", parseInt(value, 10))}
                                >
                                    <SelectTrigger
                                        id="budget-year"
                                        className="w-full h-11 rounded-2xl bnew-glass-input text-slate-900 dark:text-white text-sm"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl bnew-card text-slate-900 dark:text-white">
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()} className="py-2 font-mono">
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Alert Threshold Section */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="budget-threshold" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        Alert Threshold (%) <span className="text-rose-500">*</span>
                                    </Label>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                        Trigger warning when spending reaches this ratio.
                                    </p>
                                </div>

                                {/* Preset Pills */}
                                <div className="flex items-center gap-1.5">
                                    {[70, 80, 90].map((preset) => {
                                        const active = Number(formData.alertThreshold) === preset;
                                        return (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => handleChange("alertThreshold", preset)}
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer",
                                                    active
                                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.35)] scale-105 border border-violet-400/40"
                                                        : "bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 dark:bg-white/[0.07] dark:hover:bg-white/[0.12] dark:text-zinc-300 border border-slate-200/80 dark:border-white/10"
                                                )}
                                            >
                                                {preset}%
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dual Input: Range Slider + Numeric Field */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={formData.alertThreshold}
                                    onChange={(e) => handleChange("alertThreshold", parseInt(e.target.value, 10))}
                                    className="w-full h-2 rounded-lg bg-slate-200 dark:bg-zinc-800 accent-indigo-600 cursor-pointer"
                                />
                                <div className="relative w-20 shrink-0">
                                    <input
                                        id="budget-threshold"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.alertThreshold}
                                        onChange={(e) => handleChange("alertThreshold", e.target.value)}
                                        required
                                        className="w-full h-10 px-3 pr-6 text-center font-mono font-bold text-sm rounded-xl bnew-glass-input text-slate-900 dark:text-white"
                                    />
                                    <span className="absolute right-2.5 top-2.5 text-xs font-mono text-slate-400 dark:text-zinc-500 pointer-events-none">
                                        %
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic explanation callout */}
                            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
                                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                    Alert warning fires when total spending reaches{" "}
                                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                                        {formatINR(preview.alertAtAmount)}
                                    </span>{" "}
                                    ({preview.thresholdNum}% of your {formatINR(preview.amountNum)} limit).
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="px-6 sm:px-7 py-4 bg-slate-50/80 dark:bg-white/[0.03] border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                            Applies to {preview.selectedMonthLabel} {formData.year}
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bnew-glass-btn bnew-glass-btn-accent px-6 py-2.5 text-xs shadow-md disabled:opacity-50"
                        >
                            <div className="bnew-glass-sheen" />
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating Guardrail...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Create Budget</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Live Guardrail Preview Card */}
                <div className="lg:col-span-5 bnew-card overflow-hidden">
                    <div className="p-6 sm:p-7 space-y-6 relative">
                        {/* 3D Decorative Shield Image */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-4 -right-4 w-28 h-28 opacity-75 dark:opacity-60 drop-shadow-[0_12px_24px_rgba(59,130,246,0.3)] transition-transform duration-500 hover:rotate-3"
                        >
                            <Image
                                src="/images/card-budget-shield.png"
                                alt="Budget Shield"
                                width={112}
                                height={112}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Card Header */}
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                <span>Guardrail Preview</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                                On Track
                            </span>
                        </div>

                        {/* Category & Period Identity */}
                        <div className="flex items-center gap-3.5 pt-1">
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs",
                                    formData.category === "Total"
                                        ? "bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400"
                                        : cn(catStyle.bg, catStyle.border, catStyle.color)
                                )}
                            >
                                <PreviewIcon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0 pr-12">
                                <h3 className="text-base font-bold text-slate-950 dark:text-white truncate">
                                    {formData.category === "Total"
                                        ? "Overall Monthly Cap"
                                        : `${formData.category} Budget`}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {preview.selectedMonthLabel} {formData.year}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Spending Progress Simulator */}
                        <div className="space-y-2.5 pt-2">
                            <div className="flex items-baseline justify-between font-mono tabular-nums">
                                <div className="space-y-0.5">
                                    <div className="text-[11px] font-sans font-medium text-slate-500 dark:text-zinc-400">
                                        Current Spent
                                    </div>
                                    <div className="text-xl font-extrabold text-slate-950 dark:text-white">
                                        ₹0.00
                                    </div>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <div className="text-[11px] font-sans font-medium text-slate-500 dark:text-zinc-400">
                                        Budget Limit
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                        {formatINR(preview.amountNum)}
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar with threshold marker */}
                            <div className="relative h-3 w-full rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden p-0.5 border border-slate-300/60 dark:border-white/10">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                                    style={{ width: "2%" }}
                                />
                                {preview.thresholdNum > 0 && preview.thresholdNum < 100 && (
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] z-10"
                                        style={{ left: `${preview.thresholdNum}%` }}
                                        title={`Alert Threshold: ${preview.thresholdNum}%`}
                                    />
                                )}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                                <span>0% spent</span>
                                <span>100% available</span>
                            </div>
                        </div>

                        {/* Breakdown Metrics */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08]">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">
                                    Alert Level ({preview.thresholdNum}%)
                                </span>
                                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                                    {formatINR(preview.alertAtAmount)}
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08]">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">
                                    Est. Safe Velocity
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-200">
                                    {formatINR(preview.dailySafeRate)}/day
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preview Card Footer */}
                    <div className="px-6 sm:px-7 py-3.5 bg-slate-50/80 dark:bg-white/[0.03] border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Proactive Guardrail Active</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-200">
                            {preview.daysInSelectedMonth} days
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
