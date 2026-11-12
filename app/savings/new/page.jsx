"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    AlertTriangle,
    Loader2,
    Check,
    Sparkles,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "Emergency Fund",
    "Vacation",
    "Car",
    "House",
    "Retirement",
    "Electronics",
    "Education",
    "Wedding",
    "Investment",
    "Purchase",
    "Other",
];

const ICONS = [
    { value: "🎯", label: "Target" },
    { value: "💰", label: "Money Bag" },
    { value: "🏠", label: "House" },
    { value: "🚗", label: "Car" },
    { value: "✈️", label: "Travel" },
    { value: "🎓", label: "Education" },
    { value: "💍", label: "Wedding" },
    { value: "💻", label: "Tech" },
    { value: "🏥", label: "Medical" },
];

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

const GLASS_CARD =
    "rounded-[24px] bg-white/78 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_16px_42px_-12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]";

const GLASS_INPUT =
    "w-full h-10 px-3.5 rounded-2xl text-sm bg-slate-50/90 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/[0.12] text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 hover:border-slate-300 dark:hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors";

export default function NewSavingsGoalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        deadline: "",
        category: "Emergency Fund",
        icon: "🎯",
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const preview = useMemo(() => {
        const target = parseFloat(formData.targetAmount) || 0;
        const current = parseFloat(formData.currentAmount) || 0;
        const remaining = Math.max(0, target - current);
        const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;

        let daysLeft = null;
        let monthlyPace = null;
        if (formData.deadline) {
            const parsedDate = new Date(`${formData.deadline}T00:00:00`);
            if (!Number.isNaN(parsedDate.getTime())) {
                daysLeft = differenceInCalendarDays(parsedDate, new Date());
                if (remaining > 0) {
                    const months = Math.max(daysLeft / 30.4375, 1);
                    monthlyPace = remaining / months;
                } else {
                    monthlyPace = 0;
                }
            }
        }

        return {
            target,
            current,
            remaining,
            progress,
            daysLeft,
            monthlyPace,
        };
    }, [formData.targetAmount, formData.currentAmount, formData.deadline]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const targetNum = parseFloat(formData.targetAmount);
        const currentNum = parseFloat(formData.currentAmount) || 0;

        if (!formData.name.trim()) {
            setError("Please enter a goal name.");
            return;
        }
        if (!Number.isFinite(targetNum) || targetNum <= 0) {
            setError("Target amount must be greater than 0.");
            return;
        }
        if (currentNum < 0) {
            setError("Current saved amount cannot be negative.");
            return;
        }
        if (!formData.deadline) {
            setError("Please select a target deadline.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/savings-goals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    targetAmount: targetNum,
                    currentAmount: currentNum,
                    deadline: formData.deadline,
                    category: formData.category || "Other",
                    icon: formData.icon || "🎯",
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create savings goal");
            }

            router.push("/savings");
            router.refresh();
        } catch (err) {
            setError(err.message || "Failed to create savings goal");
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full space-y-6 pb-28 lg:pb-10 text-slate-900 dark:text-zinc-100">
            {/* Soft Atmospheric Liquid-Glass Canvas Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-emerald-200/30 blur-[135px] dark:bg-emerald-500/10" />
                <div className="absolute top-12 -right-24 h-[500px] w-[500px] rounded-full bg-sky-300/30 blur-[140px] dark:bg-blue-500/14" />
                <div className="absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full bg-indigo-300/25 blur-[135px] dark:bg-indigo-600/12" />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 mb-1.5">
                        <Link
                            href="/savings"
                            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-sky-400 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Savings Goals</span>
                        </Link>
                        <span className="text-slate-400 dark:text-zinc-600">/</span>
                        <span className="text-slate-950 dark:text-white font-semibold">New Goal</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Create Savings Goal
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
                        Define your target amount, starting balance, and deadline to calculate your monthly pace.
                    </p>
                </div>

                <Link
                    href="/savings"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white/80 hover:bg-white border border-white/95 dark:text-zinc-200 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.11] dark:border-white/[0.12] backdrop-blur-xl transition-all self-start sm:self-auto shadow-xs whitespace-nowrap"
                >
                    Cancel
                </Link>
            </div>

            {error && (
                <div
                    role="alert"
                    className="p-3.5 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium bg-rose-50/95 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 backdrop-blur-xl"
                >
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className={cn(GLASS_CARD, "lg:col-span-7 overflow-hidden")}
                >
                    <div className="p-5 sm:p-6 space-y-5">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950 dark:text-white">Goal Details</h2>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                Configure the name, category, and financial target for your goal.
                            </p>
                        </div>

                        {/* Icon Picker Grid */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Goal Icon</Label>
                            <div className="flex flex-wrap gap-2">
                                {ICONS.map((icon) => {
                                    const active = formData.icon === icon.value;
                                    return (
                                        <button
                                            key={icon.value}
                                            type="button"
                                            onClick={() => handleChange("icon", icon.value)}
                                            title={icon.label}
                                            aria-label={icon.label}
                                            aria-pressed={active}
                                            className={cn(
                                                "w-10 h-10 rounded-2xl border text-lg flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                                active
                                                    ? "bg-blue-600/12 border-blue-500/60 dark:bg-sky-500/20 dark:border-sky-400/60 scale-105 shadow-xs"
                                                    : "bg-slate-50/85 border-slate-200/80 hover:border-slate-300 dark:bg-white/[0.05] dark:border-white/10 dark:hover:border-white/25"
                                            )}
                                        >
                                            {icon.value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Goal Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="goal-name" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                Goal Name *
                            </Label>
                            <input
                                id="goal-name"
                                type="text"
                                maxLength={100}
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g., Emergency Fund, Japan Trip"
                                required
                                className={GLASS_INPUT}
                            />
                        </div>

                        {/* Category & Deadline */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-category" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Category
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange("category", value)}
                                >
                                    <SelectTrigger
                                        id="goal-category"
                                        className="w-full h-10 rounded-2xl bg-slate-50/90 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/[0.12] text-slate-950 dark:text-white text-sm"
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 text-slate-950 dark:text-white">
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="goal-deadline" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Target Deadline *
                                </Label>
                                <input
                                    id="goal-deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => handleChange("deadline", e.target.value)}
                                    required
                                    className={cn(GLASS_INPUT, "[color-scheme:light] dark:[color-scheme:dark]")}
                                />
                            </div>
                        </div>

                        {/* Target & Current Amounts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-target" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Target Amount (₹) *
                                </Label>
                                <input
                                    id="goal-target"
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    placeholder="50000"
                                    value={formData.targetAmount}
                                    onChange={(e) => handleChange("targetAmount", e.target.value)}
                                    required
                                    className={cn(GLASS_INPUT, "font-mono")}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="goal-current" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                    Starting Saved (₹)
                                </Label>
                                <input
                                    id="goal-current"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0"
                                    value={formData.currentAmount}
                                    onChange={(e) => handleChange("currentAmount", e.target.value)}
                                    className={cn(GLASS_INPUT, "font-mono")}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            Max 100 characters for goal title.
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_8px_20px_rgba(37,99,235,0.3)] disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                            {loading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{loading ? "Creating..." : "Create Goal"}</span>
                        </button>
                    </div>
                </form>

                {/* Live Goal Card Preview */}
                <div className={cn(GLASS_CARD, "lg:col-span-5 overflow-hidden")}>
                    <div className="p-5 sm:p-6 space-y-5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                                <span>Live Preview</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100/90 dark:bg-white/[0.08] border border-slate-200/75 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                                {formData.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/95 to-slate-100/90 dark:from-white/12 dark:to-white/[0.04] border border-white/95 dark:border-white/15 shadow-xs flex items-center justify-center text-xl shrink-0">
                                {formData.icon}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-semibold tracking-tight text-slate-950 dark:text-white truncate">
                                    {formData.name.trim() || "Untitled Goal"}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {formData.deadline
                                            ? format(
                                                  new Date(`${formData.deadline}T00:00:00`),
                                                  "MMM d, yyyy"
                                              )
                                            : "No deadline selected"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono tabular-nums">
                                <span className="text-lg font-bold text-slate-950 dark:text-white">
                                    {formatINR(preview.current)}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-zinc-400">
                                    of {formatINR(preview.target)}
                                </span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-slate-200/75 dark:bg-white/[0.08] border border-white/80 dark:border-white/[0.06] overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-300",
                                        preview.progress >= 75
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                            : "bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500"
                                    )}
                                    style={{ width: `${preview.progress}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums">
                                <span>{preview.progress.toFixed(1)}% funded</span>
                                <span>{formatINR(preview.remaining)} left</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-zinc-400">Estimated pace</span>
                        <span className="font-mono font-bold text-slate-950 dark:text-white tabular-nums">
                            {preview.monthlyPace !== null
                                ? `${formatINR(preview.monthlyPace)}/mo`
                                : "Select deadline"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
