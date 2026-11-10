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

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 pb-16 text-zinc-100">
            {/* Header: Linear / Vercel Monochromatic Minimalist Style */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
                        <Link
                            href="/budgets"
                            className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Budgets & Insights</span>
                        </Link>
                        <span className="text-zinc-600">/</span>
                        <span className="text-zinc-200">New Budget</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                        Create Monthly Budget
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                        Set a spending cap and early warning threshold for a category or your entire month.
                    </p>
                </div>

                <Link
                    href="/budgets"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors self-start sm:self-auto"
                >
                    Cancel
                </Link>
            </div>

            {error && (
                <div
                    role="alert"
                    className="p-3.5 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium bg-red-950/40 border border-red-800 text-red-200"
                >
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="lg:col-span-7 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden"
                >
                    <div className="p-6 space-y-5">
                        <div>
                            <h2 className="text-sm font-medium text-white">Budget Configuration</h2>
                            <p className="text-xs text-zinc-400 mt-1">
                                One budget is allowed per category for a given month and year.
                            </p>
                        </div>

                        {/* Category & Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="budget-category" className="text-xs text-zinc-400">
                                    Category *
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange("category", value)}
                                >
                                    <SelectTrigger
                                        id="budget-category"
                                        className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm"
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-zinc-900 border border-zinc-800 text-white">
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
                                <Label htmlFor="budget-amount" className="text-xs text-zinc-400">
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
                                    className="w-full h-9 px-3 rounded-lg text-sm font-mono bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Month & Year */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="budget-month" className="text-xs text-zinc-400">
                                    Month *
                                </Label>
                                <Select
                                    value={formData.month.toString()}
                                    onValueChange={(value) => handleChange("month", parseInt(value, 10))}
                                >
                                    <SelectTrigger
                                        id="budget-month"
                                        className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                                        {MONTHS.map((month) => (
                                            <SelectItem key={month.value} value={month.value.toString()}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="budget-year" className="text-xs text-zinc-400">
                                    Year *
                                </Label>
                                <Select
                                    value={formData.year.toString()}
                                    onValueChange={(value) => handleChange("year", parseInt(value, 10))}
                                >
                                    <SelectTrigger
                                        id="budget-year"
                                        className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-zinc-900 border border-zinc-800 text-white">
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
                                <Label htmlFor="budget-threshold" className="text-xs text-zinc-400">
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
                                                    "px-2 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer",
                                                    active
                                                        ? "bg-zinc-800 border-zinc-500 text-white"
                                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
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
                                className="w-full h-9 px-3 rounded-lg text-sm font-mono bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                            />
                            <p className="text-[11px] text-zinc-500">
                                Triggers a warning badge and insight alert once spending reaches{" "}
                                <span className="text-zinc-300 font-mono">{preview.thresholdNum}%</span>{" "}
                                of your limit.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-800 flex items-center justify-between gap-3">
                        <span className="text-xs text-zinc-500">
                            Applies to {preview.selectedMonthLabel} {formData.year}
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
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
                <div className="lg:col-span-5 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                    <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                Guardrail Preview
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[11px] font-medium">
                                On track
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-xl border border-zinc-800/80 flex items-center justify-center shrink-0",
                                    formData.category === "Total" ? "bg-zinc-900" : catStyle.bg
                                )}
                            >
                                <PreviewIcon
                                    className={cn(
                                        "w-4 h-4",
                                        formData.category === "Total" ? "text-white" : catStyle.color
                                    )}
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-medium text-white truncate">
                                    {formData.category === "Total"
                                        ? "Overall Monthly Budget"
                                        : formData.category}
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    {preview.selectedMonthLabel} {formData.year}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between font-mono tabular-nums">
                                <span className="text-base font-semibold text-white">
                                    ₹0.00
                                </span>
                                <span className="text-xs text-zinc-500">
                                    of {formatINR(preview.amountNum)}
                                </span>
                            </div>
                            <div className="relative h-2 w-full rounded-full bg-zinc-900 border border-zinc-800/80 overflow-hidden">
                                {preview.thresholdNum > 0 && preview.thresholdNum < 100 && (
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-zinc-400/80"
                                        style={{ left: `${preview.thresholdNum}%` }}
                                        title={`Alert threshold: ${preview.thresholdNum}%`}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Alert triggers at</span>
                        <span className="font-mono text-zinc-300 tabular-nums">
                            {preview.thresholdNum}% ({formatINR(preview.alertAtAmount)})
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
