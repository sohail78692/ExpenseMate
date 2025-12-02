import { ShoppingBag, Coffee, Utensils, Car, Zap, Home, Film, HeartPulse, Briefcase, MoreHorizontal, Smartphone, Gift } from "lucide-react";

export const CATEGORY_STYLES = {
    Food: { icon: Utensils, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", hex: "#f97316" },
    Dining: { icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", hex: "#f59e0b" },
    Transport: { icon: Car, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", hex: "#3b82f6" },
    Shopping: { icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", hex: "#ec4899" },
    Utilities: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", hex: "#eab308" },
    Housing: { icon: Home, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", hex: "#6366f1" },
    Entertainment: { icon: Film, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", hex: "#a855f7" },
    Health: { icon: HeartPulse, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", hex: "#ef4444" },
    Work: { icon: Briefcase, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", hex: "#64748b" },
    Electronics: { icon: Smartphone, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20", hex: "#06b6d4" },
    Gifts: { icon: Gift, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", hex: "#f43f5e" },
};

export const DEFAULT_STYLE = { icon: MoreHorizontal, color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", hex: "#6b7280" };

export const getCategoryStyles = (category) => {
    if (!category) return DEFAULT_STYLE;
    const key = Object.keys(CATEGORY_STYLES).find(k => k.toLowerCase() === category.toLowerCase());
    return CATEGORY_STYLES[key] || DEFAULT_STYLE;
};
