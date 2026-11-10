"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { AlertTriangle, Loader2, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

const PAYMENT_METHODS = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Other",
];

function toDateInputValue(dateVal) {
    if (!dateVal) return format(new Date(), "yyyy-MM-dd");
    const parsed = new Date(dateVal);
    if (Number.isNaN(parsed.getTime())) return format(new Date(), "yyyy-MM-dd");
    return format(parsed, "yyyy-MM-dd");
}

export default function ExpenseForm({
    onExpenseAdded,
    expenseToEdit,
    onExpenseUpdated,
    isOpen,
    setIsOpen,
}) {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [dateStr, setDateStr] = useState(() => format(new Date(), "yyyy-MM-dd"));
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setError("");
        if (expenseToEdit) {
            setTitle(expenseToEdit.title || "");
            setAmount(
                expenseToEdit.amount !== undefined ? String(expenseToEdit.amount) : ""
            );
            setCategory(expenseToEdit.category || "Other");
            setPaymentMethod(expenseToEdit.paymentMethod || "Cash");
            setDateStr(toDateInputValue(expenseToEdit.date));
            setNote(expenseToEdit.note || "");
        } else {
            setTitle("");
            setAmount("");
            setCategory("Food");
            setPaymentMethod("UPI");
            setDateStr(format(new Date(), "yyyy-MM-dd"));
            setNote("");
        }
    }, [expenseToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const parsedAmount = parseFloat(amount);
        if (!title.trim()) {
            setError("Please enter an expense title.");
            return;
        }
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError("Amount must be greater than 0.");
            return;
        }
        if (!category) {
            setError("Please select a category.");
            return;
        }
        if (!dateStr) {
            setError("Please select a valid date.");
            return;
        }

        // Preserve local midday timestamp to avoid UTC date-boundary drift
        const localDate = new Date(`${dateStr}T12:00:00`);

        const expenseData = {
            title: title.trim(),
            amount: parsedAmount,
            category,
            paymentMethod,
            date: localDate.toISOString(),
            note: note.trim(),
        };

        setLoading(true);

        try {
            if (expenseToEdit) {
                const res = await fetch(`/api/expenses/${expenseToEdit._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseData),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Failed to update expense");
                }
                const updatedExpense = await res.json();
                onExpenseUpdated?.(updatedExpense);
                setIsOpen(false);
            } else {
                const res = await fetch("/api/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseData),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Failed to create expense");
                }
                const newExpense = await res.json();
                onExpenseAdded?.(newExpense);
                setIsOpen(false);
            }
        } catch (err) {
            setError(err.message || "Error saving expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 max-w-lg p-6">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-white">
                        {expenseToEdit ? "Edit Expense" : "Add Expense"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400 mt-1">
                        {expenseToEdit
                            ? "Update the transaction details and save changes to your ledger."
                            : "Record a new transaction in your ExpenseMate ledger."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {error && (
                        <div
                            role="alert"
                            className="p-3 rounded-xl flex items-center gap-2 text-xs bg-red-950/40 border border-red-800 text-red-200"
                        >
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="expense-title" className="text-xs text-zinc-400">
                            Title *
                        </Label>
                        <input
                            id="expense-title"
                            type="text"
                            maxLength={100}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Groceries, Metro Card, Coffee"
                            required
                            className="w-full h-9 px-3 rounded-lg text-sm bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="expense-amount" className="text-xs text-zinc-400">
                                Amount (₹) *
                            </Label>
                            <input
                                id="expense-amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full h-9 px-3 rounded-lg text-sm font-mono bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="expense-date" className="text-xs text-zinc-400">
                                Date *
                            </Label>
                            <input
                                id="expense-date"
                                type="date"
                                value={dateStr}
                                onChange={(e) => setDateStr(e.target.value)}
                                required
                                className="w-full h-9 px-3 rounded-lg text-sm bg-zinc-900 border border-zinc-800 text-white [color-scheme:dark] hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="expense-category" className="text-xs text-zinc-400">
                                Category *
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger
                                    id="expense-category"
                                    className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm"
                                >
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="expense-payment" className="text-xs text-zinc-400">
                                Payment Method
                            </Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger
                                    id="expense-payment"
                                    className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm"
                                >
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                                    {PAYMENT_METHODS.map((method) => (
                                        <SelectItem key={method} value={method}>
                                            {method}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="expense-note" className="text-xs text-zinc-400">
                            Note <span className="text-zinc-600">(optional)</span>
                        </Label>
                        <Textarea
                            id="expense-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Add context, merchant details, or tags..."
                            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 text-xs sm:text-sm"
                        />
                    </div>

                    <DialogFooter className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
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
                            <span>
                                {loading
                                    ? "Saving..."
                                    : expenseToEdit
                                    ? "Save Changes"
                                    : "Add Expense"}
                            </span>
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
