"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Check, Loader2, Wallet } from "lucide-react";
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

    // Pre-fill month/year if navigated from another month
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
        const selectedMonthLabel =
            MONTHS.find((m) => m.value === Number(formData.month))?.label || "Month";
        return {
            amountNum,
            thresholdNum,
            alertAtAmount,
            selectedMonthLabel,
        };
    }, [formData.amount, formData.alertThreshold, formData.month]);

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

    const glassCard =
        "rounded-[24px] bg-white/80 dark:bg-[#0d1224]/78 backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_18px_46px_-12px_rgba(0,0,0,0.68),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden";

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
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-1.5">
                        <Link
                            href="/budgets"
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Budgets &amp; Insights</span>
                        </Link>
                        <span className="text-slate-400 dark:text-zinc-600">/</span>
                        <span className="text-slate-900 dark:text-zinc-200 font-semibold">New Budget</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Create{" "}
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 dark:from-sky-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                            Monthly Budget
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
                        Set a spending cap and early warning threshold for a category or your entire month.
                    </p>
                </div>

                <Link
                    href="/budgets"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white/80 hover:bg-white border border-white/95 dark:text-zinc-200 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.11] dark:border-white/[0.12] backdrop-blur-xl transition-all self-start sm:self-auto shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
                >
                    Cancel
                </Link>
            </div>

            {error && (
                <div
                    role="alert"
                    className="p-3.5 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium bg-red-50/95 border border-red-200 text-red-700 dark:bg-red-950/60 dark:border-red-500/35 dark:text-red-200 backdrop-blur-xl"
                >
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className={cn("lg:col-span-7", glassCard)}
                >
                    <div className="p-6 space-y-5">
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                Budget Configuration
                            </h2>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                One budget is allowed per category for a given month and year.
                            </p>
                        </div>

                        {/* Category & Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="budget-category" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Category *
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange("category", value)}
                                >
                                    <SelectTrigger
                                        id="budget-category"
                                        className="w-full h-10 rounded-xl bg-slate-50/85 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/[0.12] text-slate-900 dark:text-white text-sm"
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white backdrop-blur-xl">
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category === "Total"
                                                    ? "Total (Overall Monthly Cap)"
                                                    : category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="budget-amount" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Monthly Limit (₹) *
                                </Label>
                                <input
                                    id="budget-amount"
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    placeholder="8000"
                                    value={formData.amount}
                                    onChange={(e) => handleChange("amount", e.target.value)}
                                    required
                                    className="w-full h-10 px-3.5 rounded-xl text-sm font-mono bg-slate-50/85 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/[0.12] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 hover:border-slate-300 dark:hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Month & Year */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="budget-month" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Month *
                                </Label>
                                <Select
                                    value={formData.month.toString()}
                                    onValueChange={(value) => handleChange("month", parseInt(value, 10))}
                                >
                                    <SelectTrigger
                                        id="budget-month"
                                        className="w-full h-10 rounded-xl bg-slate-50/85 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/[0.12] text-slate-900 dark:text-white text-sm"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white backdrop-blur-xl">
                                        {MONTHS.map((month) => (
                                            <SelectItem key={month.value} value={month.value.toString()}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="budget-year" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Year *
                                </Label>
                                <Select
                                    value={formData.year.toString()}
                                    onValueChange={(value) => handleChange("year", parseInt(value, 10))}
                                >
                                    <SelectTrigger
                                        id="budget-year"
                                        className="w-full h-10 rounded-xl bg-slate-50/85 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/[0.12] text-slate-900 dark:text-white text-sm"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white backdrop-blur-xl">
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Alert Threshold */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="budget-threshold" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Alert Threshold (%) *
                                </Label>
                                <div className="flex items-center gap-1.5">
                                    {[70, 80, 90].map((preset) => {
                                        const active = Number(formData.alertThreshold) === preset;
                                        return (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => handleChange("alertThreshold", preset)}
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border transition-all cursor-pointer",
                                                    active
                                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white shadow-xs"
                                                        : "bg-slate-100/90 border-slate-200/80 text-slate-700 hover:text-slate-950 dark:bg-white/[0.06] dark:border-white/12 dark:text-zinc-300 dark:hover:text-white"
                                                )}
                                            >
                                                {preset}%
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <input
                                id="budget-threshold"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="80"
                                value={formData.alertThreshold}
                                onChange={(e) => handleChange("alertThreshold", e.target.value)}
                                required
                                className="w-full h-10 px-3.5 rounded-xl text-sm font-mono bg-slate-50/85 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/[0.12] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 hover:border-slate-300 dark:hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                Triggers a warning badge and insight alert once spending reaches{" "}
                                <span className="text-slate-900 dark:text-zinc-200 font-mono font-semibold">{preview.thresholdNum}%</span>{" "}
                                of your limit.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-3.5 bg-slate-50/75 dark:bg-white/[0.03] border-t border-slate-200/75 dark:border-white/[0.08] flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-600 dark:text-zinc-400">
                            Applies to {preview.selectedMonthLabel} {formData.year}
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 disabled:opacity-50 shadow-[0_8px_22px_rgba(124,58,237,0.35)] transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                            {loading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{loading ? "Creating..." : "Create Budget"}</span>
                        </button>
                    </div>
                </form>

                {/* Live Guardrail Preview Card */}
                <div className={cn("lg:col-span-5", glassCard)}>
                    <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Guardrail Preview
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/35 dark:text-emerald-300 border text-[11px] font-semibold">
                                On Track
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] flex items-center justify-center shrink-0",
                                    formData.category === "Total" ? "bg-violet-500/12 dark:bg-violet-500/20" : catStyle.bg
                                )}
                            >
                                <PreviewIcon
                                    className={cn(
                                        "w-5 h-5",
                                        formData.category === "Total" ? "text-violet-600 dark:text-violet-300" : catStyle.color
                                    )}
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-bold text-slate-950 dark:text-white truncate">
                                    {formData.category === "Total"
                                        ? "Overall Monthly Budget"
                                        : formData.category}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">
                                    {preview.selectedMonthLabel} {formData.year}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between font-mono tabular-nums">
                                <span className="text-base font-bold text-slate-950 dark:text-white">
                                    ₹0.00
                                </span>
                                <span className="text-xs text-slate-500 dark:text-zinc-400">
                                    of {formatINR(preview.amountNum)}
                                </span>
                            </div>
                            <div className="relative h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden">
                                {preview.thresholdNum > 0 && preview.thresholdNum < 100 && (
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-slate-500/80 dark:bg-white/60"
                                        style={{ left: `${preview.thresholdNum}%` }}
                                        title={`Alert threshold: ${preview.thresholdNum}%`}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3.5 bg-slate-50/75 dark:bg-white/[0.03] border-t border-slate-200/75 dark:border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-zinc-400">Alert triggers at</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-zinc-200 tabular-nums">
                            {preview.thresholdNum}% ({formatINR(preview.alertAtAmount)})
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
