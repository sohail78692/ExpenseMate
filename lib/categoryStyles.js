import { ShoppingBag, Coffee, Utensils, Car, Zap, Home, Film, HeartPulse, Briefcase, MoreHorizontal, Smartphone, Gift } from "lucide-react";

export const CATEGORY_STYLES = {
    Food: { icon: Utensils, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/12 dark:bg-orange-500/10", border: "border-orange-500/25 dark:border-orange-500/20", hex: "#f97316" },
    Dining: { icon: Coffee, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/12 dark:bg-amber-500/10", border: "border-amber-500/25 dark:border-amber-500/20", hex: "#f59e0b" },
    Transport: { icon: Car, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/12 dark:bg-blue-500/10", border: "border-blue-500/25 dark:border-blue-500/20", hex: "#3b82f6" },
    Shopping: { icon: ShoppingBag, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/12 dark:bg-pink-500/10", border: "border-pink-500/25 dark:border-pink-500/20", hex: "#ec4899" },
    Utilities: { icon: Zap, color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-500/14 dark:bg-yellow-500/10", border: "border-yellow-500/30 dark:border-yellow-500/20", hex: "#eab308" },
    Housing: { icon: Home, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/12 dark:bg-indigo-500/10", border: "border-indigo-500/25 dark:border-indigo-500/20", hex: "#6366f1" },
    Entertainment: { icon: Film, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/12 dark:bg-purple-500/10", border: "border-purple-500/25 dark:border-purple-500/20", hex: "#a855f7" },
    Health: { icon: HeartPulse, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/12 dark:bg-red-500/10", border: "border-red-500/25 dark:border-red-500/20", hex: "#ef4444" },
    Work: { icon: Briefcase, color: "text-slate-700 dark:text-slate-400", bg: "bg-slate-500/12 dark:bg-slate-500/10", border: "border-slate-500/25 dark:border-slate-500/20", hex: "#64748b" },
    Electronics: { icon: Smartphone, color: "text-cyan-700 dark:text-cyan-400", bg: "bg-cyan-500/12 dark:bg-cyan-500/10", border: "border-cyan-500/25 dark:border-cyan-500/20", hex: "#06b6d4" },
    Gifts: { icon: Gift, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/12 dark:bg-rose-500/10", border: "border-rose-500/25 dark:border-rose-500/20", hex: "#f43f5e" },
};

export const DEFAULT_STYLE = { icon: MoreHorizontal, color: "text-zinc-700 dark:text-zinc-400", bg: "bg-zinc-500/12 dark:bg-gray-500/10", border: "border-zinc-500/25 dark:border-gray-500/20", hex: "#6b7280" };

export const getCategoryStyles = (category) => {
    if (!category) return DEFAULT_STYLE;
    const key = Object.keys(CATEGORY_STYLES).find(k => k.toLowerCase() === category.toLowerCase());
    return CATEGORY_STYLES[key] || DEFAULT_STYLE;
};
