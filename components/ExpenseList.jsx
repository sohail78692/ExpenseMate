"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Pencil,
    Trash2,
    Plus,
    Download,
    Search,
    Receipt,
    IndianRupee,
    TrendingUp,
    Layers,
    ChevronLeft,
    ChevronRight,
    Check,
    AlertTriangle,
    X,
    Loader2,
    CalendarDays,
    CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import ExpenseForm from "./ExpenseForm";
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
];

function formatINR(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function ExpenseList({
    initialExpenses = [],
    initialTotal = 0,
    initialTotalAmount = 0,
    initialTotalPages = 1,
}) {
    const router = useRouter();
    const [expenses, setExpenses] = useState(initialExpenses);
    const [total, setTotal] = useState(initialTotal || initialExpenses.length);
    const [totalAmount, setTotalAmount] = useState(initialTotalAmount || 0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(Math.max(1, initialTotalPages || 1));
    const [loading, setLoading] = useState(false);

    // Filter & sort state
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date_desc");
    const [refreshKey, setRefreshKey] = useState(0);

    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Feedback banner state
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const isFirstRender = useRef(true);
    const fetchControllerRef = useRef(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setPage(1);
        }, 250);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Auto-dismiss notification banner
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(""), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    // Fetch expenses whenever pagination/filters/refreshKey change
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (fetchControllerRef.current) {
            fetchControllerRef.current.abort();
        }
        const controller = new AbortController();
        fetchControllerRef.current = controller;

        const fetchExpenses = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    limit: "10",
                    sort: sortBy,
                });
                if (categoryFilter !== "all") params.set("category", categoryFilter);
                if (debouncedSearch) params.set("search", debouncedSearch);

                const res = await fetch(`/api/expenses?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (res.status === 401) {
                    setExpenses([]);
                    setTotal(0);
                    setTotalAmount(0);
                    setTotalPages(1);
                    return;
                }
                if (!res.ok) {
                    throw new Error("Failed to load expenses");
                }

                const data = await res.json();
                setExpenses(data.expenses || []);
                setTotal(data.total ?? 0);
                setTotalAmount(data.totalAmount ?? 0);
                setTotalPages(Math.max(1, data.totalPages || 1));
            } catch (error) {
                if (error.name === "AbortError") return;
                setMessage(error.message || "Error fetching expenses");
                setMessageType("error");
            } finally {
                if (fetchControllerRef.current === controller) {
                    setLoading(false);
                }
            }
        };

        fetchExpenses();

        return () => {
            controller.abort();
        };
    }, [page, categoryFilter, debouncedSearch, sortBy, refreshKey]);

    const handleAddExpense = (newExpense) => {
        setMessage(`Added "${newExpense.title}" (${formatINR(newExpense.amount)})`);
        setMessageType("success");
        setPage(1);
        setRefreshKey((k) => k + 1);
        router.refresh();
    };

    const handleUpdateExpense = (updatedExpense) => {
        setExpenses((prev) =>
            prev.map((exp) => (exp._id === updatedExpense._id ? updatedExpense : exp))
        );
        setExpenseToEdit(null);
        setMessage(`Updated "${updatedExpense.title}"`);
        setMessageType("success");
        setRefreshKey((k) => k + 1);
        router.refresh();
    };

    const handleConfirmDelete = async () => {
        if (!expenseToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/expenses/${expenseToDelete._id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to delete expense");
            }

            const deletedTitle = expenseToDelete.title;
            setExpenseToDelete(null);
            setMessage(`Deleted "${deletedTitle}"`);
            setMessageType("success");

            if (expenses.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                setRefreshKey((k) => k + 1);
            }
            router.refresh();
        } catch (error) {
            setExpenseToDelete(null);
            setMessage(error.message || "Error deleting expense");
            setMessageType("error");
        } finally {
            setIsDeleting(false);
        }
    };

    const openAddModal = () => {
        setExpenseToEdit(null);
        setIsFormOpen(true);
    };

    const openEditModal = (expense) => {
        setExpenseToEdit(expense);
        setIsFormOpen(true);
    };

    const hasActiveFilters = categoryFilter !== "all" || Boolean(debouncedSearch);

    const viewStats = useMemo(() => {
        const pageSum = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const avgEntry = total > 0 ? totalAmount / total : 0;
        const largestOnPage =
            expenses.length > 0
                ? expenses.reduce(
                      (max, e) => (Number(e.amount) > Number(max.amount) ? e : max),
                      expenses[0]
                  )
                : null;

        const catTotals = {};
        expenses.forEach((e) => {
            const cat = e.category || "Other";
            catTotals[cat] = (catTotals[cat] || 0) + Number(e.amount || 0);
        });
        const topEntry = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0] || null;
        const topCategoryShare =
            topEntry && pageSum > 0 ? ((topEntry[1] / pageSum) * 100).toFixed(0) : null;

        return {
            pageSum,
            avgEntry,
            largestOnPage,
            topCategory: topEntry ? { name: topEntry[0], amount: topEntry[1] } : null,
            topCategoryShare,
        };
    }, [expenses, total, totalAmount]);

    const rangeStart = total === 0 ? 0 : (page - 1) * 10 + 1;
    const rangeEnd = Math.min(total, (page - 1) * 10 + expenses.length);

    return (
        <div className="w-full space-y-8 pb-8 text-zinc-900 dark:text-zinc-100">
            {/* Header: Linear / Vercel Monochromatic Minimalist Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                            Expense Ledger
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-600">•</span>
                        <span className="font-mono text-zinc-600 dark:text-zinc-300 tabular-nums">
                            {total} {total === 1 ? "entry" : "entries"}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                        Expenses
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Log daily spending, search transactions, and maintain an accurate financial ledger.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <a
                        href="/api/export"
                        download
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 shadow-xs dark:shadow-none"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </a>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 shadow-xs dark:shadow-none"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Expense</span>
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        role={messageType === "error" ? "alert" : "status"}
                        aria-live="polite"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={cn(
                            "p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border shadow-sm dark:shadow-none",
                            messageType === "success"
                                ? "bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200"
                                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            {messageType === "success" ? (
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                            <span>{message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMessage("")}
                            aria-label="Dismiss notification"
                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top 4 KPI Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            {hasActiveFilters ? "Filtered Total" : "Total Logged"}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <IndianRupee className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(totalAmount)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            Across {total} {total === 1 ? "matching expense" : "matching expenses"}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Current Page</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <Receipt className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(viewStats.pageSum)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {expenses.length} {expenses.length === 1 ? "item" : "items"} on page {page}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Average Entry</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-mono tabular-nums">
                            {formatINR(viewStats.avgEntry)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 truncate tabular-nums">
                            {viewStats.largestOnPage
                                ? `Peak on page: ${formatINR(viewStats.largestOnPage.amount)}`
                                : "No entries yet"}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between gap-3 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Top Category</span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <Layers className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white truncate">
                            {viewStats.topCategory ? viewStats.topCategory.name : "—"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 tabular-nums">
                            {viewStats.topCategory && viewStats.topCategoryShare
                                ? `${viewStats.topCategoryShare}% of page · ${formatINR(viewStats.topCategory.amount)}`
                                : "No category activity"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search, Sort & Category Filter Bar */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search expense title or notes..."
                            aria-label="Search expenses"
                            className="w-full h-9 pl-8 pr-8 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors shadow-xs dark:shadow-none"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput("")}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Select
                            value={sortBy}
                            onValueChange={(val) => {
                                setSortBy(val);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger
                                aria-label="Sort expenses"
                                className="h-9 w-full sm:w-[170px] rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs shadow-xs dark:shadow-none"
                            >
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                                <SelectItem value="date_desc">Newest First</SelectItem>
                                <SelectItem value="date_asc">Oldest First</SelectItem>
                                <SelectItem value="amount_desc">Highest Amount</SelectItem>
                                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setDebouncedSearch("");
                                    setCategoryFilter("all");
                                    setPage(1);
                                }}
                                className="h-9 px-3 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-white border border-zinc-200 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors cursor-pointer shrink-0 shadow-xs dark:shadow-none"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
                    <button
                        type="button"
                        onClick={() => {
                            setCategoryFilter("all");
                            setPage(1);
                        }}
                        className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap transition-colors cursor-pointer",
                            categoryFilter === "all"
                                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                        )}
                    >
                        All Categories
                    </button>
                    {CATEGORIES.map((cat) => {
                        const active = categoryFilter === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                    setCategoryFilter(active ? "all" : cat);
                                    setPage(1);
                                }}
                                className={cn(
                                    "px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap transition-colors cursor-pointer",
                                    active
                                        ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                        : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                )}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Expenses Ledger Card */}
            <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden transition-colors">
                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-600 dark:text-zinc-300" />
                        <span>Loading expenses...</span>
                    </div>
                ) : !expenses || expenses.length === 0 ? (
                    <div className="py-16 px-6 text-center space-y-4">
                        <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mx-auto">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-zinc-950 dark:text-white">
                                {hasActiveFilters ? "No matching expenses" : "No expenses logged yet"}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                                {hasActiveFilters
                                    ? "Try adjusting your search query or selecting a different category."
                                    : "Start tracking your spending by recording your first expense."}
                            </p>
                        </div>
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setDebouncedSearch("");
                                    setCategoryFilter("all");
                                    setPage(1);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                            >
                                Clear filters
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={openAddModal}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add your first expense</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/30 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                        <th className="py-3 px-6">Expense</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Method</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4 text-right">Amount</th>
                                        <th className="py-3 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 text-xs">
                                    {expenses.map((expense) => {
                                        const { icon: Icon, color, bg } = getCategoryStyles(
                                            expense.category
                                        );
                                        return (
                                            <tr
                                                key={expense._id}
                                                className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group"
                                            >
                                                <td className="py-3.5 px-6 max-w-[260px]">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div
                                                            className={cn(
                                                                "w-8 h-8 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center shrink-0",
                                                                bg
                                                            )}
                                                        >
                                                            <Icon className={cn("w-3.5 h-3.5", color)} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                                                                {expense.title}
                                                            </p>
                                                            {expense.note && (
                                                                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                                                                    {expense.note}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full"
                                                            style={{
                                                                backgroundColor: getCategoryStyles(
                                                                    expense.category
                                                                ).hex,
                                                            }}
                                                        />
                                                        {expense.category}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                                                    <span className="inline-flex items-center gap-1.5 text-[11px]">
                                                        <CreditCard className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                                                        {expense.paymentMethod || "Cash"}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-600 dark:text-zinc-400">
                                                    {format(new Date(expense.date), "MMM d, yyyy")}
                                                </td>

                                                <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-semibold text-sm text-zinc-950 dark:text-white tabular-nums">
                                                    {formatINR(expense.amount)}
                                                </td>

                                                <td className="py-3.5 px-6 whitespace-nowrap text-right">
                                                    <div className="inline-flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(expense)}
                                                            aria-label={`Edit ${expense.title}`}
                                                            title="Edit expense"
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpenseToDelete(expense)}
                                                            aria-label={`Delete ${expense.title}`}
                                                            title="Delete expense"
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
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

                        {/* Mobile Ledger View */}
                        <div className="md:hidden divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                            {expenses.map((expense) => {
                                const { icon: Icon, color, bg } = getCategoryStyles(
                                    expense.category
                                );
                                return (
                                    <div key={expense._id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div
                                                    className={cn(
                                                        "w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center shrink-0 mt-0.5",
                                                        bg
                                                    )}
                                                >
                                                    <Icon className={cn("w-4 h-4", color)} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                        {expense.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                                                        <span>{expense.category}</span>
                                                        <span>•</span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <CalendarDays className="w-3 h-3" />
                                                            {format(
                                                                new Date(expense.date),
                                                                "MMM d, yyyy"
                                                            )}
                                                        </span>
                                                        {expense.paymentMethod && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{expense.paymentMethod}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="text-sm font-semibold font-mono text-zinc-950 dark:text-white tabular-nums shrink-0">
                                                {formatINR(expense.amount)}
                                            </span>
                                        </div>

                                        {expense.note && (
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/70 rounded-lg px-3 py-2">
                                                {expense.note}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(expense)}
                                                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                                            >
                                                <Pencil className="w-3 h-3" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setExpenseToDelete(expense)}
                                                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-red-600 bg-zinc-100 hover:bg-red-50 border border-zinc-200 dark:text-zinc-400 dark:hover:text-red-400 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Pagination Footer Strip */}
                <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-zinc-500 tabular-nums">
                        {total > 0
                            ? `Showing ${rangeStart}–${rangeEnd} of ${total} · Page ${page} of ${totalPages}`
                            : "0 expenses"}
                    </span>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || loading}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || loading}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add / Edit Expense Modal */}
            <ExpenseForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                onExpenseAdded={handleAddExpense}
                expenseToEdit={expenseToEdit}
                onExpenseUpdated={handleUpdateExpense}
            />

            {/* Delete Confirmation Modal */}
            <Dialog
                open={Boolean(expenseToDelete)}
                onOpenChange={(open) => !open && setExpenseToDelete(null)}
            >
                <DialogContent className="rounded-2xl bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/60 text-zinc-900 dark:text-zinc-100 max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white">
                            Delete Expense
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            Permanently remove{" "}
                            <span className="text-zinc-900 dark:text-white font-medium">
                                {expenseToDelete?.title}
                            </span>{" "}
                            ({formatINR(expenseToDelete?.amount)}) from your expense ledger? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex items-center gap-2 pt-3">
                        <button
                            type="button"
                            onClick={() => setExpenseToDelete(null)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                            {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                            <span>{isDeleting ? "Deleting..." : "Delete Expense"}</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
