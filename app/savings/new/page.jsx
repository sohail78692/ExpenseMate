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
        <div className="w-full space-y-8 pb-8 text-zinc-900 dark:text-zinc-100">
            {/* Header: Linear / Vercel Monochromatic Minimalist Style */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <Link
                            href="/savings"
                            className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Savings Goals</span>
                        </Link>
                        <span className="text-zinc-500 dark:text-zinc-600">/</span>
                        <span className="text-zinc-900 dark:text-zinc-200 font-medium">New Goal</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                        Create Savings Goal
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Define your target amount, starting balance, and deadline to calculate your monthly pace.
                    </p>
                </div>

                <Link
                    href="/savings"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white/95 hover:bg-slate-100 border border-slate-200/90 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors self-start sm:self-auto shadow-xs dark:shadow-none"
                >
                    Cancel
                </Link>
            </div>

            {error && (
                <div
                    role="alert"
                    className="p-3.5 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
                >
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="lg:col-span-7 rounded-2xl bg-white/95 dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_24px_-14px_rgba(15,23,42,0.08)] dark:shadow-none overflow-hidden"
                >
                    <div className="p-6 space-y-5">
                        <div>
                            <h2 className="text-sm font-medium text-zinc-950 dark:text-white">Goal Details</h2>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                Configure the name, category, and financial target for your goal.
                            </p>
                        </div>

                        {/* Icon Picker Grid */}
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-700 dark:text-zinc-400">Goal Icon</Label>
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
                                                "w-10 h-10 rounded-xl border text-lg flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                                                active
                                                    ? "bg-slate-200 border-slate-400 dark:bg-zinc-800 dark:border-zinc-400 scale-105"
                                                    : "bg-slate-50/80 border-slate-200 hover:border-slate-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
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
                            <Label htmlFor="goal-name" className="text-xs text-zinc-700 dark:text-zinc-400">
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
                                className="w-full h-9 px-3 rounded-lg text-sm bg-slate-50/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                            />
                        </div>

                        {/* Category & Deadline */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-category" className="text-xs text-zinc-700 dark:text-zinc-400">
                                    Category
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange("category", value)}
                                >
                                    <SelectTrigger
                                        id="goal-category"
                                        className="w-full h-9 rounded-lg bg-slate-50/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm"
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="goal-deadline" className="text-xs text-zinc-700 dark:text-zinc-400">
                                    Target Deadline *
                                </Label>
                                <input
                                    id="goal-deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => handleChange("deadline", e.target.value)}
                                    required
                                    className="w-full h-9 px-3 rounded-lg text-sm bg-slate-50/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Target & Current Amounts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-target" className="text-xs text-zinc-700 dark:text-zinc-400">
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
                                    className="w-full h-9 px-3 rounded-lg text-sm font-mono bg-slate-50/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="goal-current" className="text-xs text-zinc-700 dark:text-zinc-400">
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
                                    className="w-full h-9 px-3 rounded-lg text-sm font-mono bg-slate-50/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-slate-50/90 dark:bg-zinc-900/40 border-t border-slate-200/90 dark:border-zinc-800 flex items-center justify-between gap-3">
                        <span className="text-xs text-zinc-600 dark:text-zinc-500">
                            Max 100 characters for goal title.
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
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
                <div className="lg:col-span-5 rounded-2xl bg-white/95 dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_24px_-14px_rgba(15,23,42,0.08)] dark:shadow-none overflow-hidden">
                    <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
                                Live Preview
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-400">
                                {formData.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-xl shrink-0">
                                {formData.icon}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-medium text-zinc-950 dark:text-white truncate">
                                    {formData.name.trim() || "Untitled Goal"}
                                </h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
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

                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between font-mono tabular-nums">
                                <span className="text-base font-semibold text-zinc-950 dark:text-white">
                                    {formatINR(preview.current)}
                                </span>
                                <span className="text-xs text-zinc-600 dark:text-zinc-500">
                                    of {formatINR(preview.target)}
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-zinc-900 dark:bg-white transition-all duration-300"
                                    style={{ width: `${preview.progress}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-500 tabular-nums">
                                <span>{preview.progress.toFixed(1)}% funded</span>
                                <span>{formatINR(preview.remaining)} left</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-slate-50/90 dark:bg-zinc-900/40 border-t border-slate-200/90 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-zinc-600 dark:text-zinc-500">Estimated pace</span>
                        <span className="font-mono text-zinc-800 dark:text-zinc-300 tabular-nums">
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
