"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
    Plus,
    Download,
    Search,
    Trash2,
    Pencil,
    AlertTriangle,
    Wallet,
    Layers,
    TrendingUp,
    Crown,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    Calendar,
    CreditCard,
    Smartphone,
    Banknote,
    Landmark,
    Receipt,
    Loader2,
    RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExpenseForm from "./ExpenseForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    "All",
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Entertainment",
    "Health",
    "Shopping",
    "Other",
];

const GLASS_CARD =
    "rounded-[24px] bg-white/80 dark:bg-[#0d1224]/78 backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_10px_32px_-12px_rgba(30,41,59,0.08),0_2px_8px_-2px_rgba(30,41,59,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_18px_46px_-12px_rgba(0,0,0,0.68),inset_0_1px_1px_rgba(255,255,255,0.08)]";

const GLASS_MODAL =
    "rounded-3xl bg-white/92 dark:bg-[#0b1022]/94 backdrop-blur-2xl border border-white/95 dark:border-white/[0.14] shadow-[0_24px_64px_rgba(15,23,42,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.78),inset_0_1px_1px_rgba(255,255,255,0.08)] text-slate-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto";

function formatINR(num) {
    return (Number(num) || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function getPaymentMethodIcon(method) {
    const normalized = String(method || "").toLowerCase();
    if (normalized.includes("upi")) return Smartphone;
    if (normalized.includes("card")) return CreditCard;
    if (normalized.includes("bank") || normalized.includes("net")) return Landmark;
    if (normalized.includes("cash")) return Banknote;
    return Wallet;
}

/** Builds smooth decorative cubic Bezier curves for KPI sparklines. */
function buildSparklinePaths(values, width = 104, height = 36) {
    const pts = values && values.length >= 2 ? values : [24, 38, 32, 56, 48, 78];
    const max = Math.max(...pts, 1);
    const min = Math.min(...pts, 0);
    const span = max - min || 1;
    const padY = 4;
    const usableH = height - padY * 2;
    const stepX = width / Math.max(1, pts.length - 1);

    const coords = pts.map((v, i) => {
        const norm = (v - min) / span;
        const x = i * stepX;
        const y = height - padY - norm * usableH;
        return [x, y];
    });

    let line = `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const [x0, y0] = coords[i];
        const [x1, y1] = coords[i + 1];
        const cx = ((x0 + x1) / 2).toFixed(1);
        line += ` C ${cx} ${y0.toFixed(1)}, ${cx} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    const area = `${line} L ${width} ${height} L 0 ${height} Z`;
    return { line, area };
}

function MiniWaveSparkline({ id, color, values, className }) {
    const { line, area } = useMemo(() => buildSparklinePaths(values), [values]);
    return (
        <svg
            viewBox="0 0 104 36"
            className={cn("overflow-visible pointer-events-none select-none", className)}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.42" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${id})`} />
            <path
                d={line}
                fill="none"
                stroke={color}
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function ExpenseList({
    initialExpenses = [],
    initialTotal = 0,
    initialTotalAmount = 0,
    initialTotalPages = 1,
}) {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [total, setTotal] = useState(initialTotal);
    const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [page, setPage] = useState(1);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [sortOption, setSortOption] = useState("date_desc");
    const [isFetching, setIsFetching] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const searchInputRef = useRef(null);
    const toastTimeoutRef = useRef(null);
    const skipInitialFetchRef = useRef(true);
    const abortControllerRef = useRef(null);

    const showToast = useCallback((msg, type = "success") => {
        setMessage(msg);
        setMessageType(type);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setMessage(""), 4200);
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    // Ctrl+K / Cmd+K shortcut to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
        }, 250);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPage = useCallback(
        async (targetPage, targetSearch, targetCategory, targetSort) => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsFetching(true);
            try {
                const params = new URLSearchParams({
                    page: String(targetPage),
                    limit: "10",
                    sort: targetSort,
                });
                if (targetCategory && targetCategory !== "All") {
                    params.set("category", targetCategory);
                }
                if (targetSearch) {
                    params.set("search", targetSearch);
                }

                const res = await fetch(`/api/expenses?${params.toString()}`, {
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("Failed to load expenses");
                const data = await res.json();
                setExpenses(data.expenses || []);
                setTotal(data.total || 0);
                setTotalAmount(data.totalAmount || 0);
                setTotalPages(data.totalPages || 1);
            } catch (err) {
                if (err?.name !== "AbortError") {
                    showToast("Unable to load expenses. Please try again.", "error");
                }
            } finally {
                if (abortControllerRef.current === controller) {
                    setIsFetching(false);
                }
            }
        },
        [showToast]
    );

    useEffect(() => {
        if (skipInitialFetchRef.current) {
            skipInitialFetchRef.current = false;
            if (
                page === 1 &&
                debouncedSearch === "" &&
                categoryFilter === "All" &&
                sortOption === "date_desc"
            ) {
                return;
            }
        }
        fetchPage(page, debouncedSearch, categoryFilter, sortOption);
    }, [page, debouncedSearch, categoryFilter, sortOption, fetchPage]);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        if (page !== 1) setPage(1);
    };

    const handleCategoryChange = (cat) => {
        setCategoryFilter(cat);
        if (page !== 1) setPage(1);
    };

    const handleSortChange = (val) => {
        setSortOption(val);
        if (page !== 1) setPage(1);
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setDebouncedSearch("");
        setCategoryFilter("All");
        setSortOption("date_desc");
        setPage(1);
    };

    const openAddModal = () => {
        setExpenseToEdit(null);
        setIsFormOpen(true);
    };

    const openEditModal = (expense) => {
        setExpenseToEdit(expense);
        setIsFormOpen(true);
    };

    const handleAddExpense = () => {
        showToast("Expense logged successfully.");
        if (page !== 1) {
            setPage(1);
        } else {
            fetchPage(1, debouncedSearch, categoryFilter, sortOption);
        }
    };

    const handleUpdateExpense = () => {
        showToast("Expense updated.");
        fetchPage(page, debouncedSearch, categoryFilter, sortOption);
    };

    const handleDeleteConfirmed = async () => {
        if (!expenseToDelete) return;
        const targetId = expenseToDelete._id;
        setDeletingId(targetId);

        try {
            const res = await fetch(`/api/expenses/${targetId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete expense");

            setExpenseToDelete(null);
            showToast("Expense deleted from ledger.");

            const targetPage = expenses.length === 1 && page > 1 ? page - 1 : page;
            if (targetPage !== page) {
                setPage(targetPage);
            } else {
                fetchPage(targetPage, debouncedSearch, categoryFilter, sortOption);
            }
        } catch {
            showToast("Failed to delete expense.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const pageSummary = useMemo(() => {
        if (!expenses || expenses.length === 0) {
            return {
                pageSum: 0,
                topCategory: "",
                topCategoryAmount: 0,
                topShare: 0,
                highestAmount: 0,
                amountSeries: [18, 42, 34, 62, 54, 78],
                avgSeries: [24, 34, 42, 50, 58, 66],
                catSeries: [20, 32, 48, 60, 76],
            };
        }

        let pageSum = 0;
        let highestAmount = 0;
        const byCat = {};

        for (const item of expenses) {
            const amt = Number(item.amount) || 0;
            pageSum += amt;
            if (amt > highestAmount) highestAmount = amt;
            const cat = item.category || "Other";
            byCat[cat] = (byCat[cat] || 0) + amt;
        }

        let topCategory = "";
        let topCategoryAmount = 0;
        for (const [cat, amt] of Object.entries(byCat)) {
            if (amt > topCategoryAmount) {
                topCategory = cat;
                topCategoryAmount = amt;
            }
        }
        const topShare = pageSum > 0 ? Math.round((topCategoryAmount / pageSum) * 100) : 0;

        // Build subtle sparkline data from visible items
        const rawAmounts = [...expenses]
            .slice(0, 8)
            .reverse()
            .map((e) => Math.max(Number(e.amount) || 0, 1));
        const amountSeries =
            rawAmounts.length >= 2 ? rawAmounts : [22, 45, 36, 68, 58, 84];

        const avgSeries = amountSeries.map((_, idx) => {
            const sub = amountSeries.slice(0, idx + 1);
            return sub.reduce((a, b) => a + b, 0) / sub.length;
        });

        const catTotals = Object.values(byCat).sort((a, b) => a - b);
        const catSeries =
            catTotals.length >= 2 ? catTotals : [20, 35, 52, 68, 86];

        return {
            pageSum,
            topCategory,
            topCategoryAmount,
            topShare,
            highestAmount,
            amountSeries,
            avgSeries,
            catSeries,
        };
    }, [expenses]);

    const averageExpense = total > 0 ? totalAmount / total : 0;
    const isFiltered =
        Boolean(debouncedSearch) || categoryFilter !== "All" || sortOption !== "date_desc";
    const startIndex = total === 0 ? 0 : (page - 1) * 10 + 1;
    const endIndex = Math.min(total, page * 10);

    return (
        <div className="relative w-full space-y-6 pb-28 lg:pb-10 text-slate-900 dark:text-zinc-100">
            {/* Soft Atmospheric Liquid-Glass Canvas Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-indigo-300/25 blur-[140px] dark:bg-indigo-600/18" />
                <div className="absolute top-10 -right-24 h-[500px] w-[500px] rounded-full bg-violet-300/25 blur-[140px] dark:bg-violet-600/18" />
                <div className="absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full bg-sky-300/25 blur-[135px] dark:bg-blue-600/14" />
                <div className="absolute bottom-6 right-1/4 h-[360px] w-[360px] rounded-full bg-fuchsia-200/20 blur-[120px] dark:bg-fuchsia-500/10" />
            </div>

            {/* Centered Floating Liquid-Glass Toast Notification */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-20 sm:top-22 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
                    >
                        <div
                            role={messageType === "error" ? "alert" : "status"}
                            aria-live="polite"
                            className={cn(
                                "pointer-events-auto relative overflow-hidden w-fit max-w-full rounded-full pl-2.5 pr-2 py-2 flex items-center gap-3 text-xs sm:text-[13px] font-medium backdrop-blur-2xl shadow-2xl border",
                                messageType === "success"
                                    ? "bg-white/92 border-white/95 text-slate-900 ring-1 ring-emerald-500/25 dark:bg-zinc-900/92 dark:border-white/15 dark:text-white dark:ring-emerald-400/25"
                                    : "bg-red-50/95 border-red-200 text-red-800 ring-1 ring-red-500/30 dark:bg-red-950/85 dark:border-red-500/30 dark:text-red-100"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border",
                                    messageType === "success"
                                        ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-300"
                                        : "bg-red-500/15 border-red-500/35 text-red-600 dark:bg-red-500/20 dark:border-red-400/40 dark:text-red-300"
                                )}
                            >
                                {messageType === "success" ? (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.25]" />
                                )}
                            </div>
                            <span className="truncate">{message}</span>
                            <button
                                type="button"
                                onClick={() => setMessage("")}
                                aria-label="Dismiss notification"
                                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Header with Action Pills + 3D Receipt/Card/Coins Illustration */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="relative z-10 min-w-0 flex-1 space-y-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1.5">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                                <span className="font-semibold text-slate-800 dark:text-zinc-100">
                                    Expense Ledger
                                </span>
                            </span>
                            <span className="text-slate-400 dark:text-zinc-600">•</span>
                            <span className="text-slate-600 dark:text-zinc-400 tabular-nums">
                                {total} {total === 1 ? "entry" : "entries"}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.08] bg-gradient-to-r from-slate-950 via-indigo-800 to-violet-600 dark:from-white dark:via-indigo-200 dark:to-violet-400 bg-clip-text text-transparent">
                            Expenses
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 max-w-xl">
                            Log daily spending, search transactions, and maintain an accurate financial ledger.
                        </p>
                    </div>

                    {/* Hero Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                        <a
                            href="/api/export"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-[13px] font-medium bg-white/85 hover:bg-white text-slate-700 hover:text-slate-950 border border-white/95 dark:bg-[#131831]/80 dark:hover:bg-[#192040] dark:text-zinc-200 dark:hover:text-white dark:border-white/[0.12] backdrop-blur-xl shadow-[0_6px_18px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.4)] transition-all cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                        </a>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs sm:text-[13px] font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 hover:brightness-110 text-white shadow-[0_8px_24px_-4px_rgba(124,58,237,0.55)] hover:shadow-[0_12px_28px_-4px_rgba(124,58,237,0.7)] transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.25]" />
                            <span>Add Expense</span>
                        </button>
                    </div>
                </div>

                {/* Right-Aligned Hero Illustration */}
                <div className="relative flex justify-center md:justify-end items-center shrink-0">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 scale-110 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.22),rgba(59,130,246,0.1)_55%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.34),rgba(59,130,246,0.14)_55%,transparent_75%)] blur-2xl pointer-events-none"
                    />
                    <Image
                        src="/images/expenses-hero-receipt.png"
                        alt="3D expense receipt, credit card, and gold coins illustration"
                        width={1024}
                        height={591}
                        priority
                        className="relative z-10 w-[220px] sm:w-[270px] lg:w-[320px] xl:w-[340px] h-auto object-contain drop-shadow-[0_14px_30px_rgba(79,70,229,0.2)] dark:drop-shadow-[0_18px_38px_rgba(124,58,237,0.38)] select-none pointer-events-none"
                    />
                </div>
            </div>

            {/* 4 Gradient-Tinted KPI Cards with Mini Wave Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Logged (Violet) */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-5 flex flex-col justify-between min-h-[144px] bg-gradient-to-br from-violet-50/90 via-white/85 to-indigo-50/60 dark:from-violet-600/[0.2] dark:via-[#11152c]/88 dark:to-indigo-950/35 dark:border-violet-400/25"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-violet-400/20 blur-2xl dark:bg-violet-500/20"
                    />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_6px_16px_rgba(99,102,241,0.4)] flex items-center justify-center">
                            <Wallet className="w-[18px] h-[18px]" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-3.5 pr-16">
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-300/90">
                            Total Logged
                        </p>
                        <p className="text-2xl xl:text-[26px] font-bold tracking-tight text-slate-950 dark:text-white tabular-nums mt-0.5 truncate">
                            ₹{formatINR(totalAmount)}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-1 truncate">
                            Across {total} matching {total === 1 ? "expense" : "expenses"}
                        </p>
                    </div>

                    <MiniWaveSparkline
                        id="kpi-grad-total"
                        color="#8B5CF6"
                        values={pageSummary.amountSeries}
                        className="absolute bottom-2.5 right-3 w-[96px] h-[34px] opacity-95"
                    />
                </div>

                {/* Card 2: Current Page (Emerald) */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-5 flex flex-col justify-between min-h-[144px] bg-gradient-to-br from-emerald-50/90 via-white/85 to-teal-50/60 dark:from-emerald-500/[0.17] dark:via-[#0d1926]/88 dark:to-teal-950/30 dark:border-emerald-400/25"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl dark:bg-emerald-500/18"
                    />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_6px_16px_rgba(16,185,129,0.38)] flex items-center justify-center">
                            <Layers className="w-[18px] h-[18px]" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-3.5 pr-16">
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-300/90">
                            Current Page
                        </p>
                        <p className="text-2xl xl:text-[26px] font-bold tracking-tight text-slate-950 dark:text-white tabular-nums mt-0.5 truncate">
                            ₹{formatINR(pageSummary.pageSum)}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-1 truncate">
                            {expenses.length} {expenses.length === 1 ? "item" : "items"} on page {page}
                        </p>
                    </div>

                    <MiniWaveSparkline
                        id="kpi-grad-page"
                        color="#10B981"
                        values={pageSummary.amountSeries}
                        className="absolute bottom-2.5 right-3 w-[96px] h-[34px] opacity-95"
                    />
                </div>

                {/* Card 3: Average Entry (Blue) */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-5 flex flex-col justify-between min-h-[144px] bg-gradient-to-br from-sky-50/90 via-white/85 to-blue-50/60 dark:from-blue-500/[0.17] dark:via-[#0e162a]/88 dark:to-sky-950/30 dark:border-blue-400/25"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl dark:bg-blue-500/18"
                    />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-[0_6px_16px_rgba(59,130,246,0.38)] flex items-center justify-center">
                            <TrendingUp className="w-[18px] h-[18px]" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-3.5 pr-16">
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-300/90">
                            Average Entry
                        </p>
                        <p className="text-2xl xl:text-[26px] font-bold tracking-tight text-slate-950 dark:text-white tabular-nums mt-0.5 truncate">
                            ₹{formatINR(averageExpense)}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-1 truncate">
                            Peak on page: ₹{formatINR(pageSummary.highestAmount)}
                        </p>
                    </div>

                    <MiniWaveSparkline
                        id="kpi-grad-avg"
                        color="#3B82F6"
                        values={pageSummary.avgSeries}
                        className="absolute bottom-2.5 right-3 w-[96px] h-[34px] opacity-95"
                    />
                </div>

                {/* Card 4: Top Category (Pink/Rose) */}
                <div
                    className={cn(
                        GLASS_CARD,
                        "relative overflow-hidden p-5 flex flex-col justify-between min-h-[144px] bg-gradient-to-br from-pink-50/90 via-white/85 to-rose-50/60 dark:from-pink-500/[0.17] dark:via-[#191128]/88 dark:to-rose-950/30 dark:border-pink-400/25"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-pink-400/20 blur-2xl dark:bg-pink-500/18"
                    />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-[0_6px_16px_rgba(236,72,153,0.38)] flex items-center justify-center">
                            <Crown className="w-[18px] h-[18px]" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-3.5 pr-16">
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-300/90">
                            Top Category
                        </p>
                        <p className="text-2xl xl:text-[26px] font-bold tracking-tight text-slate-950 dark:text-white mt-0.5 truncate">
                            {pageSummary.topCategory || "—"}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-1 truncate">
                            {pageSummary.topCategory
                                ? `${pageSummary.topShare}% of page · ₹${formatINR(pageSummary.topCategoryAmount)}`
                                : "No entries on this page"}
                        </p>
                    </div>

                    <MiniWaveSparkline
                        id="kpi-grad-top"
                        color="#EC4899"
                        values={pageSummary.catSeries}
                        className="absolute bottom-2.5 right-3 w-[96px] h-[34px] opacity-95"
                    />
                </div>
            </div>

            {/* Search + Sort Bar + Category Filter Pills */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search Input Pill */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search expense title or notes..."
                            aria-label="Search expenses by title or notes"
                            className="w-full h-11 pl-11 pr-24 rounded-2xl bg-white/80 dark:bg-[#0d1224]/78 backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_6px_20px_-8px_rgba(30,41,59,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.06)] text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 transition-all"
                        />

                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            {searchTerm ? (
                                <button
                                    type="button"
                                    onClick={() => handleSearchChange("")}
                                    aria-label="Clear search"
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <div className="hidden sm:flex items-center gap-1 pointer-events-none select-none">
                                    <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100/90 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.12] text-slate-500 dark:text-zinc-400">
                                        Ctrl
                                    </kbd>
                                    <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100/90 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.12] text-slate-500 dark:text-zinc-400">
                                        K
                                    </kbd>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sort Select + Optional Reset */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Select value={sortOption} onValueChange={handleSortChange}>
                            <SelectTrigger
                                aria-label="Sort expenses"
                                className="w-full sm:w-[196px] h-11 rounded-2xl bg-white/80 dark:bg-[#0d1224]/78 backdrop-blur-2xl border border-white/95 dark:border-white/[0.11] shadow-[0_6px_20px_-8px_rgba(30,41,59,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.06)] text-xs sm:text-[13px] font-medium text-slate-800 dark:text-zinc-100 px-3.5 cursor-pointer"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className="text-slate-400 dark:text-zinc-400 font-semibold">₹</span>
                                    <SelectValue placeholder="Sort by" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl bg-white/95 dark:bg-[#0d1326]/95 backdrop-blur-2xl border border-white/95 dark:border-white/[0.12] text-slate-900 dark:text-zinc-100 shadow-2xl">
                                <SelectItem value="date_desc">Newest First</SelectItem>
                                <SelectItem value="date_asc">Oldest First</SelectItem>
                                <SelectItem value="amount_desc">Highest Amount</SelectItem>
                                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                            </SelectContent>
                        </Select>

                        {isFiltered && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                title="Reset filters"
                                aria-label="Reset all filters"
                                className="h-11 px-3.5 rounded-2xl inline-flex items-center gap-1.5 text-xs font-medium bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 border border-white/95 dark:bg-[#0d1224]/78 dark:hover:bg-[#151c36] dark:text-zinc-300 dark:hover:text-white dark:border-white/[0.11] backdrop-blur-2xl transition-colors cursor-pointer shrink-0"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Reset</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter Pills Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
                    {CATEGORIES.map((cat) => {
                        const isActive = categoryFilter === cat;
                        const style = cat === "All" ? null : getCategoryStyles(cat);
                        const CatIcon = cat === "All" ? LayoutGrid : style.icon;

                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryChange(cat)}
                                className={cn(
                                    "shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border",
                                    isActive
                                        ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white border-transparent shadow-[0_6px_20px_-4px_rgba(124,58,237,0.58)]"
                                        : "bg-white/75 hover:bg-white text-slate-700 hover:text-slate-950 border-white/95 dark:bg-[#10152b]/78 dark:hover:bg-[#171f3e] dark:text-zinc-300 dark:hover:text-white dark:border-white/[0.1]"
                                )}
                            >
                                <CatIcon
                                    className={cn(
                                        "w-3.5 h-3.5 shrink-0",
                                        isActive
                                            ? "text-white"
                                            : style
                                            ? style.color
                                            : "text-slate-500 dark:text-zinc-400"
                                    )}
                                />
                                <span>{cat === "All" ? "All Categories" : cat}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Frosted Glass Expense Ledger Container */}
            <div className={cn(GLASS_CARD, "relative overflow-hidden")}>
                {/* Subtle Ambient Bottom Edge Glow (Dark & Light) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-violet-500/[0.06] via-indigo-500/[0.02] to-transparent dark:from-violet-500/[0.1] dark:via-indigo-500/[0.03]"
                />

                {/* Fetching Indicator Strip */}
                {isFetching && (
                    <div className="px-5 py-2 border-b border-slate-200/70 dark:border-white/[0.08] bg-violet-50/70 dark:bg-violet-500/10 flex items-center gap-2 text-xs text-violet-700 dark:text-violet-300">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating ledger...</span>
                    </div>
                )}

                {expenses.length === 0 ? (
                    <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                {isFiltered ? "No matching expenses found" : "Your expense ledger is empty"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                                {isFiltered
                                    ? "Try clearing your search or switching category filters to see more transactions."
                                    : "Log your first expense to start tracking spending, methods, and categories."}
                            </p>
                        </div>
                        {isFiltered ? (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white/90 hover:bg-white text-slate-800 border border-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] dark:text-white dark:border-white/[0.12] transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Clear Filters</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={openAddModal}
                                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-[0_8px_22px_-4px_rgba(124,58,237,0.5)] hover:brightness-110 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add First Expense</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto relative z-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/75 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.025] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                        <th className="py-3.5 pl-6 pr-3">Expense</th>
                                        <th className="py-3.5 px-3">Category</th>
                                        <th className="py-3.5 px-3">Method</th>
                                        <th className="py-3.5 px-3">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 opacity-80" />
                                                <span>Date</span>
                                            </span>
                                        </th>
                                        <th className="py-3.5 px-3 text-right">Amount</th>
                                        <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.06]">
                                    {expenses.map((expense) => {
                                        const catStyle = getCategoryStyles(expense.category);
                                        const CatIcon = catStyle.icon;
                                        const MethodIcon = getPaymentMethodIcon(expense.paymentMethod);

                                        return (
                                            <tr
                                                key={expense._id}
                                                className="group hover:bg-slate-50/75 dark:hover:bg-white/[0.03] transition-colors"
                                            >
                                                {/* Expense Title & Note */}
                                                <td className="py-3.5 pl-6 pr-3 max-w-[300px]">
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div
                                                            className={cn(
                                                                "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                                                                catStyle.bg,
                                                                catStyle.border,
                                                                catStyle.color
                                                            )}
                                                        >
                                                            <CatIcon className="w-[18px] h-[18px]" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white truncate">
                                                                {expense.title}
                                                            </p>
                                                            {expense.note && (
                                                                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                                                    {expense.note}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category Pill with Colored Dot */}
                                                <td className="py-3.5 px-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100/85 border border-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-zinc-200">
                                                        <span
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: catStyle.hex }}
                                                        />
                                                        <span>{expense.category}</span>
                                                    </span>
                                                </td>

                                                {/* Payment Method */}
                                                <td className="py-3.5 px-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-2 text-xs sm:text-[13px] text-slate-600 dark:text-zinc-300">
                                                        <MethodIcon className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 shrink-0" />
                                                        <span>{expense.paymentMethod || "Cash"}</span>
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="py-3.5 px-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-2 text-xs sm:text-[13px] text-slate-600 dark:text-zinc-300 tabular-nums">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 shrink-0" />
                                                        <span>
                                                            {expense.date
                                                                ? format(new Date(expense.date), "MMM d, yyyy")
                                                                : "—"}
                                                        </span>
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                                    <span className="text-[13.5px] font-bold text-slate-950 dark:text-white tabular-nums">
                                                        ₹{formatINR(expense.amount)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(expense)}
                                                            aria-label={`Edit ${expense.title}`}
                                                            title="Edit expense"
                                                            className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-300 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpenseToDelete(expense)}
                                                            aria-label={`Delete ${expense.title}`}
                                                            title="Delete expense"
                                                            className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List View */}
                        <div className="md:hidden divide-y divide-slate-200/60 dark:divide-white/[0.06] relative z-10">
                            {expenses.map((expense) => {
                                const catStyle = getCategoryStyles(expense.category);
                                const CatIcon = catStyle.icon;
                                const MethodIcon = getPaymentMethodIcon(expense.paymentMethod);

                                return (
                                    <div key={expense._id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                                                        catStyle.bg,
                                                        catStyle.border,
                                                        catStyle.color
                                                    )}
                                                >
                                                    <CatIcon className="w-[18px] h-[18px]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                        {expense.title}
                                                    </p>
                                                    {expense.note && (
                                                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                                            {expense.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-950 dark:text-white tabular-nums shrink-0">
                                                ₹{formatINR(expense.amount)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-0.5">
                                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-300">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium bg-slate-100/90 border border-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-zinc-200">
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: catStyle.hex }}
                                                    />
                                                    <span>{expense.category}</span>
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <MethodIcon className="w-3 h-3 text-slate-400" />
                                                    <span>{expense.paymentMethod || "Cash"}</span>
                                                </span>
                                                <span className="inline-flex items-center gap-1 tabular-nums">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    <span>
                                                        {expense.date
                                                            ? format(new Date(expense.date), "MMM d, yyyy")
                                                            : "—"}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="inline-flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(expense)}
                                                    aria-label={`Edit ${expense.title}`}
                                                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-300 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpenseToDelete(expense)}
                                                    aria-label={`Delete ${expense.title}`}
                                                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Pagination Footer Strip */}
                <div className="relative z-10 border-t border-slate-200/75 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-600 dark:text-zinc-400 tabular-nums">
                        Showing <span className="font-semibold text-slate-900 dark:text-white">{startIndex}–{endIndex}</span> of{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">{total}</span> · Page{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || isFetching}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/85 hover:bg-white text-slate-700 border border-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] dark:text-zinc-200 dark:border-white/[0.12] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isFetching}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-[0_6px_18px_-4px_rgba(124,58,237,0.55)] hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add / Edit Expense Dialog */}
            <ExpenseForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                onExpenseAdded={handleAddExpense}
                expenseToEdit={expenseToEdit}
                onExpenseUpdated={handleUpdateExpense}
            />

            {/* Liquid-Glass Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(expenseToDelete)}
                onOpenChange={(open) => {
                    if (!open && !deletingId) setExpenseToDelete(null);
                }}
            >
                <DialogContent className={cn(GLASS_MODAL, "max-w-md p-6")}>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                <Trash2 className="w-[18px] h-[18px]" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold text-slate-950 dark:text-white">
                                    Delete Expense
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                    This action cannot be undone and removes the transaction from your ledger.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {expenseToDelete && (
                        <div className="my-2 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.09] flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {expenseToDelete.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                    {expenseToDelete.category}
                                    {expenseToDelete.date
                                        ? ` · ${format(new Date(expenseToDelete.date), "MMM d, yyyy")}`
                                        : ""}
                                </p>
                            </div>
                            <span className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                                ₹{formatINR(expenseToDelete.amount)}
                            </span>
                        </div>
                    )}

                    <DialogFooter className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setExpenseToDelete(null)}
                            disabled={Boolean(deletingId)}
                            className="px-4 py-2 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-zinc-200 dark:border-white/[0.12] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteConfirmed}
                            disabled={Boolean(deletingId)}
                            className="px-4.5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white shadow-[0_8px_20px_-4px_rgba(225,29,72,0.5)] disabled:opacity-50 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            {deletingId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>{deletingId ? "Deleting..." : "Delete Expense"}</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
