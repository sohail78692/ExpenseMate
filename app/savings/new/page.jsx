"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format, differenceInCalendarDays } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    AlertTriangle,
    Loader2,
    Check,
    Sparkles,
    Target,
    Clock,
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
    { value: "🌴", label: "Vacation" },
    { value: "🎁", label: "Gift" },
    { value: "🛡️", label: "Emergency" },
];

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

const savingsNewGlassStyles = `
@property --snew-angle-1 {
  syntax: "<angle>";
  inherits: false;
  initial-value: -75deg;
}
@property --snew-angle-2 {
  syntax: "<angle>";
  inherits: false;
  initial-value: -45deg;
}

@keyframes snew-sheen {
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

.snew-glass-sheen {
  position: absolute;
  inset: -1px;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
}

.snew-glass-sheen::after {
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

.snew-glass-btn:hover .snew-glass-sheen::after {
  animation: snew-sheen 1.35s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.snew-glass-btn {
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

.snew-glass-btn:active {
  transform: scale(0.975);
}

.snew-glass-btn-accent {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.96) 0%, rgba(14, 165, 233, 0.94) 55%, rgba(99, 102, 241, 0.92) 100%);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow:
    0 8px 24px -4px rgba(16, 185, 129, 0.45),
    0 2px 6px -1px rgba(14, 165, 233, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.6),
    inset 0 -1px 2px rgba(0, 0, 0, 0.25);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.snew-glass-btn-accent:hover {
  background: linear-gradient(135deg, rgba(20, 205, 145, 0.98) 0%, rgba(30, 180, 245, 0.96) 55%, rgba(115, 118, 255, 0.94) 100%);
  border-color: rgba(255, 255, 255, 0.45);
  box-shadow:
    0 12px 30px -4px rgba(16, 185, 129, 0.58),
    0 4px 10px -2px rgba(14, 165, 233, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.snew-glass-btn-neutral {
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

.dark .snew-glass-btn-neutral {
  background: rgba(19, 24, 49, 0.65);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 24px -4px rgba(0, 0, 0, 0.5),
    0 2px 6px -1px rgba(0, 0, 0, 0.35),
    inset 0 1px 1px rgba(255, 255, 255, 0.12),
    inset 0 -1px 1px rgba(0, 0, 0, 0.4);
}

.snew-glass-btn-neutral:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  border-color: rgba(255, 255, 255, 1);
  box-shadow:
    0 10px 24px -4px rgba(15, 23, 42, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.dark .snew-glass-btn-neutral:hover {
  background: rgba(27, 34, 68, 0.85);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow:
    0 12px 28px -4px rgba(0, 0, 0, 0.65),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.snew-glass-input {
  background: rgba(248, 250, 252, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow:
    inset 0 2px 4px rgba(15, 23, 42, 0.04),
    0 1px 2px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.dark .snew-glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.05);
}

.snew-glass-input:hover {
  border-color: rgba(148, 163, 184, 0.6);
}

.dark .snew-glass-input:hover {
  border-color: rgba(255, 255, 255, 0.22);
}

.snew-glass-input:focus,
.snew-glass-input:focus-within {
  border-color: rgba(16, 185, 129, 0.7);
  box-shadow:
    0 0 0 3px rgba(16, 185, 129, 0.22),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.snew-card {
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

.dark .snew-card {
  background: rgba(13, 18, 36, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 22px 50px -14px rgba(0, 0, 0, 0.72),
    0 6px 18px -4px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
`;

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
        let dailyPace = null;

        if (formData.deadline) {
            const parsedDate = new Date(`${formData.deadline}T00:00:00`);
            if (!Number.isNaN(parsedDate.getTime())) {
                daysLeft = differenceInCalendarDays(parsedDate, new Date());
                if (remaining > 0) {
                    const months = Math.max(daysLeft / 30.4375, 0.1);
                    monthlyPace = remaining / months;
                    dailyPace = daysLeft > 0 ? remaining / daysLeft : remaining;
                } else {
                    monthlyPace = 0;
                    dailyPace = 0;
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
            dailyPace,
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
            <style dangerouslySetInnerHTML={{ __html: savingsNewGlassStyles }} />

            {/* Soft Atmospheric Liquid-Glass Canvas Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/4 h-[540px] w-[540px] rounded-full bg-emerald-400/20 blur-[140px] dark:bg-emerald-500/14" />
                <div className="absolute top-12 -right-24 h-[520px] w-[520px] rounded-full bg-teal-400/20 blur-[140px] dark:bg-sky-500/14" />
                <div className="absolute -bottom-32 -left-24 h-[500px] w-[500px] rounded-full bg-indigo-300/25 blur-[135px] dark:bg-indigo-600/12" />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-2">
                        <Link
                            href="/savings"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 hover:bg-white/95 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-white/90 dark:border-white/10 text-slate-700 dark:text-zinc-300 font-medium transition-all shadow-xs"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Savings Goals</span>
                        </Link>
                        <span className="text-slate-400 dark:text-zinc-600">/</span>
                        <span className="text-slate-900 dark:text-zinc-200 font-semibold">New Goal</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                        Create{" "}
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 dark:from-emerald-400 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                            Savings Goal
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-xl">
                        Define your financial milestone, initial deposit, and target deadline to unlock automated pace tracking.
                    </p>
                </div>

                <Link
                    href="/savings"
                    className="snew-glass-btn snew-glass-btn-neutral px-4 py-2 text-xs self-start sm:self-auto"
                >
                    <div className="snew-glass-sheen" />
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
                    className="lg:col-span-7 snew-card overflow-hidden"
                >
                    <div className="p-6 sm:p-7 space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70 dark:border-white/[0.08]">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/20 border border-emerald-500/25 dark:border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                                    Milestone Specifications
                                </h2>
                                <p className="text-xs text-slate-600 dark:text-zinc-400">
                                    Set your target figure and timeline to automate pace recommendations.
                                </p>
                            </div>
                        </div>

                        {/* Icon Picker Grid */}
                        <div className="space-y-2.5">
                            <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                Goal Icon
                            </Label>
                            <div className="flex flex-wrap gap-2.5">
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
                                                "w-11 h-11 rounded-2xl border text-xl flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none",
                                                active
                                                    ? "bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border-emerald-500/60 dark:border-emerald-400/60 scale-110 shadow-[0_6px_16px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/30"
                                                    : "bg-slate-50/90 border-slate-200/80 hover:border-slate-300 dark:bg-white/[0.05] dark:border-white/10 dark:hover:border-white/25 hover:scale-105"
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
                            <Label htmlFor="goal-name" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                Goal Name <span className="text-rose-500">*</span>
                            </Label>
                            <input
                                id="goal-name"
                                type="text"
                                maxLength={100}
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g., Emergency Buffer, Tokyo Expedition, Down Payment"
                                required
                                className="w-full h-11 px-4 rounded-2xl snew-glass-input text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                            />
                        </div>

                        {/* Category & Deadline */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-category" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Category
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange("category", value)}
                                >
                                    <SelectTrigger
                                        id="goal-category"
                                        className="w-full h-11 rounded-2xl snew-glass-input text-slate-900 dark:text-white text-sm"
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl snew-card text-slate-900 dark:text-white">
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category} className="py-2 font-medium">
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="goal-deadline" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Target Deadline <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative flex items-center">
                                    <Calendar className="absolute left-3 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                                    <input
                                        id="goal-deadline"
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => handleChange("deadline", e.target.value)}
                                        required
                                        className="w-full h-11 pl-10 pr-4 rounded-2xl snew-glass-input text-slate-900 dark:text-white text-sm font-medium focus-visible:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Target & Current Amounts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-target" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Target Amount <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3 flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs pointer-events-none">
                                        ₹
                                    </div>
                                    <input
                                        id="goal-target"
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        placeholder="100000"
                                        value={formData.targetAmount}
                                        onChange={(e) => handleChange("targetAmount", e.target.value)}
                                        required
                                        className="w-full h-11 pl-11 pr-4 rounded-2xl snew-glass-input text-slate-900 dark:text-white font-mono text-sm font-semibold placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="goal-current" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Starting Saved (₹)
                                </Label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3 flex items-center justify-center w-6 h-6 rounded-lg bg-slate-500/15 border border-slate-500/20 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs pointer-events-none">
                                        ₹
                                    </div>
                                    <input
                                        id="goal-current"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0"
                                        value={formData.currentAmount}
                                        onChange={(e) => handleChange("currentAmount", e.target.value)}
                                        className="w-full h-11 pl-11 pr-4 rounded-2xl snew-glass-input text-slate-900 dark:text-white font-mono text-sm font-semibold placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="px-6 sm:px-7 py-4 bg-slate-50/80 dark:bg-white/[0.03] border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                            {preview.daysLeft !== null && preview.daysLeft > 0
                                ? `${preview.daysLeft} days to milestone`
                                : "Define target deadline"}
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="snew-glass-btn snew-glass-btn-accent px-6 py-2.5 text-xs shadow-md disabled:opacity-50"
                        >
                            <div className="snew-glass-sheen" />
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating Goal...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Create Goal</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Live Goal Card Preview */}
                <div className="lg:col-span-5 snew-card overflow-hidden">
                    <div className="p-6 sm:p-7 space-y-6 relative">
                        {/* 3D Decorative Coins Asset */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-4 -right-4 w-28 h-28 opacity-80 dark:opacity-65 drop-shadow-[0_12px_24px_rgba(16,185,129,0.3)] transition-transform duration-500 hover:rotate-3"
                        >
                            <Image
                                src="/images/card-savings-coins.png"
                                alt="Savings Coins"
                                width={112}
                                height={112}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Card Header */}
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                <span>Milestone Preview</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100/90 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-300 text-[11px] font-bold">
                                {formData.category}
                            </span>
                        </div>

                        {/* Goal Identity */}
                        <div className="flex items-center gap-3.5 pt-1">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/95 to-slate-100/90 dark:from-white/12 dark:to-white/[0.04] border border-white/95 dark:border-white/15 shadow-xs flex items-center justify-center text-2xl shrink-0">
                                {formData.icon}
                            </div>
                            <div className="min-w-0 pr-12">
                                <h3 className="text-base font-bold text-slate-950 dark:text-white truncate">
                                    {formData.name.trim() || "Untitled Goal"}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {formData.deadline
                                            ? format(
                                                  new Date(`${formData.deadline}T00:00:00`),
                                                  "MMM d, yyyy"
                                              )
                                            : "No deadline specified"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar & Balances */}
                        <div className="space-y-2.5 pt-2">
                            <div className="flex items-baseline justify-between font-mono tabular-nums">
                                <div className="space-y-0.5">
                                    <div className="text-[11px] font-sans font-medium text-slate-500 dark:text-zinc-400">
                                        Saved So Far
                                    </div>
                                    <div className="text-xl font-extrabold text-slate-950 dark:text-white">
                                        {formatINR(preview.current)}
                                    </div>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <div className="text-[11px] font-sans font-medium text-slate-500 dark:text-zinc-400">
                                        Target Goal
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                        {formatINR(preview.target)}
                                    </div>
                                </div>
                            </div>

                            {/* Gradient progress track */}
                            <div className="relative h-3 w-full rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden p-0.5 border border-slate-300/60 dark:border-white/10">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-300",
                                        preview.progress >= 75
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                            : "bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500"
                                    )}
                                    style={{ width: `${Math.max(2, Math.min(100, preview.progress))}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                                <span>{preview.progress.toFixed(1)}% funded</span>
                                <span>{formatINR(preview.remaining)} remaining</span>
                            </div>
                        </div>

                        {/* Pace Calculator Box */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08]">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">
                                    Recommended Pace
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {preview.monthlyPace !== null
                                        ? `${formatINR(preview.monthlyPace)}/mo`
                                        : "Set deadline"}
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08]">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">
                                    Daily Velocity
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-200">
                                    {preview.dailyPace !== null
                                        ? `${formatINR(preview.dailyPace)}/day`
                                        : "Set deadline"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preview Card Footer */}
                    <div className="px-6 sm:px-7 py-3.5 bg-slate-50/80 dark:bg-white/[0.03] border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-teal-500" />
                            <span>
                                {preview.daysLeft !== null && preview.daysLeft >= 0
                                    ? `${preview.daysLeft} calendar days remaining`
                                    : "Deadline will compute timeline"}
                            </span>
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-200">
                            {preview.progress >= 100 ? "Completed 🎉" : "In Progress"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
