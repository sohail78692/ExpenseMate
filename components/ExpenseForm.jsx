"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    AlertTriangle,
    Loader2,
    Check,
    Plus,
    Receipt,
    Banknote,
    QrCode,
    CreditCard,
    Landmark,
    Wallet,
} from "lucide-react";
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

const PAYMENT_METHODS = [
    { id: "Cash", label: "Cash", icon: Banknote },
    { id: "UPI", label: "UPI", icon: QrCode },
    { id: "Credit Card", label: "Credit Card", icon: CreditCard },
    { id: "Debit Card", label: "Debit Card", icon: CreditCard },
    { id: "Net Banking", label: "Net Banking", icon: Landmark },
    { id: "Other", label: "Other", icon: Wallet },
];

const expenseModalGlassStyles = `
@keyframes modal-sheen {
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

.modal-glass-sheen {
  position: absolute;
  inset: -1px;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
}

.modal-glass-sheen::after {
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

.modal-glass-btn:hover .modal-glass-sheen::after {
  animation: modal-sheen 1.35s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.modal-glass-btn {
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

.modal-glass-btn:active {
  transform: scale(0.975);
}

.modal-glass-btn-accent {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.96) 0%, rgba(139, 92, 246, 0.94) 50%, rgba(217, 70, 239, 0.92) 100%);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow:
    0 8px 24px -4px rgba(124, 58, 237, 0.5),
    0 2px 6px -1px rgba(124, 58, 237, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.6),
    inset 0 -1px 2px rgba(0, 0, 0, 0.25);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.modal-glass-btn-accent:hover {
  background: linear-gradient(135deg, rgba(109, 112, 255, 0.98) 0%, rgba(149, 102, 255, 0.96) 50%, rgba(227, 80, 249, 0.94) 100%);
  border-color: rgba(255, 255, 255, 0.45);
  box-shadow:
    0 12px 30px -4px rgba(124, 58, 237, 0.65),
    0 4px 10px -2px rgba(124, 58, 237, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.modal-glass-btn-neutral {
  background: rgba(255, 255, 255, 0.72);
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

.dark .modal-glass-btn-neutral {
  background: rgba(19, 24, 49, 0.65);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 24px -4px rgba(0, 0, 0, 0.5),
    0 2px 6px -1px rgba(0, 0, 0, 0.35),
    inset 0 1px 1px rgba(255, 255, 255, 0.12),
    inset 0 -1px 1px rgba(0, 0, 0, 0.4);
}

.modal-glass-btn-neutral:hover {
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  border-color: rgba(255, 255, 255, 1);
  box-shadow:
    0 10px 24px -4px rgba(15, 23, 42, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.dark .modal-glass-btn-neutral:hover {
  background: rgba(27, 34, 68, 0.85);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow:
    0 12px 28px -4px rgba(0, 0, 0, 0.65),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.modal-glass-input {
  background: rgba(248, 250, 252, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow:
    inset 0 2px 4px rgba(15, 23, 42, 0.04),
    0 1px 2px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.dark .modal-glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.05);
}

.modal-glass-input:hover {
  border-color: rgba(148, 163, 184, 0.6);
}

.dark .modal-glass-input:hover {
  border-color: rgba(255, 255, 255, 0.22);
}

.modal-glass-input:focus,
.modal-glass-input:focus-within {
  border-color: rgba(139, 92, 246, 0.7);
  box-shadow:
    0 0 0 3px rgba(139, 92, 246, 0.22),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
}
`;

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
            <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <style dangerouslySetInnerHTML={{ __html: expenseModalGlassStyles }} />

                {/* Atmospheric Glow Flare */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -left-20 w-64 h-64 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-600/20"
                />

                <DialogHeader className="relative z-10">
                    <div className="flex items-center gap-3.5 pb-1">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_6px_20px_rgba(124,58,237,0.4)] flex items-center justify-center shrink-0">
                            {expenseToEdit ? (
                                <Receipt className="w-5 h-5 stroke-[2.25]" />
                            ) : (
                                <Plus className="w-5 h-5 stroke-[2.5]" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                                {expenseToEdit ? "Edit Expense" : "Add Expense"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                {expenseToEdit
                                    ? "Update transaction details and save changes to your ledger."
                                    : "Record a new transaction in your ExpenseMate ledger."}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-4 pt-1">
                    {error && (
                        <div
                            role="alert"
                            className="p-3 rounded-2xl flex items-center gap-2.5 text-xs bg-red-50/90 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800/80 dark:text-red-300"
                        >
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="expense-title" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
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
                            className="modal-glass-input w-full h-11 px-3.5 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                        />
                    </div>

                    {/* Amount & Date in 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="expense-amount" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                Amount (₹) *
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-slate-500 dark:text-zinc-400 pointer-events-none select-none">
                                    ₹
                                </span>
                                <input
                                    id="expense-amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="modal-glass-input w-full h-11 pl-8 pr-3.5 rounded-2xl text-sm font-mono font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="expense-date" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                Date *
                            </Label>
                            <div className="relative">
                                <input
                                    id="expense-date"
                                    type="date"
                                    value={dateStr}
                                    onChange={(e) => setDateStr(e.target.value)}
                                    required
                                    className="modal-glass-input w-full h-11 px-3.5 rounded-2xl text-sm text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus-visible:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category & Payment Method in 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="expense-category" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                Category *
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger
                                    id="expense-category"
                                    className="modal-glass-input w-full h-11 rounded-2xl px-3.5 text-sm text-slate-900 dark:text-white border-slate-200/90 dark:border-white/[0.12] cursor-pointer"
                                >
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl bg-white/95 dark:bg-[#0c1228]/95 backdrop-blur-2xl border border-white/95 dark:border-white/[0.14] text-slate-900 dark:text-white shadow-2xl p-1.5">
                                    {CATEGORIES.map((cat) => {
                                        const catStyle = getCategoryStyles(cat);
                                        const CatIcon = catStyle.icon;
                                        return (
                                            <SelectItem key={cat} value={cat} className="cursor-pointer">
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0",
                                                            catStyle.bg,
                                                            catStyle.border,
                                                            catStyle.color
                                                        )}
                                                    >
                                                        <CatIcon className="w-3 h-3" />
                                                    </span>
                                                    <span>{cat}</span>
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="expense-payment" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                                Payment Method
                            </Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger
                                    id="expense-payment"
                                    className="modal-glass-input w-full h-11 rounded-2xl px-3.5 text-sm text-slate-900 dark:text-white border-slate-200/90 dark:border-white/[0.12] cursor-pointer"
                                >
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl bg-white/95 dark:bg-[#0c1228]/95 backdrop-blur-2xl border border-white/95 dark:border-white/[0.14] text-slate-900 dark:text-white shadow-2xl p-1.5">
                                    {PAYMENT_METHODS.map((method) => {
                                        const MethodIcon = method.icon;
                                        return (
                                            <SelectItem key={method.id} value={method.id} className="cursor-pointer">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0">
                                                        <MethodIcon className="w-3.5 h-3.5" />
                                                    </span>
                                                    <span>{method.label}</span>
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-1.5">
                        <Label htmlFor="expense-note" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                            Note <span className="text-slate-400 dark:text-zinc-500 font-normal">(optional)</span>
                        </Label>
                        <Textarea
                            id="expense-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Add context, merchant details, or tags..."
                            className="modal-glass-input w-full rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                        />
                    </div>

                    <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                            className="modal-glass-btn modal-glass-btn-neutral px-4.5 py-2 text-xs sm:text-[13px]"
                        >
                            <span aria-hidden="true" className="modal-glass-sheen" />
                            <span className="relative z-10">Cancel</span>
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="modal-glass-btn modal-glass-btn-accent px-5 py-2 text-xs sm:text-[13px] shadow-[0_8px_24px_rgba(124,58,237,0.45)]"
                        >
                            <span aria-hidden="true" className="modal-glass-sheen" />
                            <span className="relative z-10 inline-flex items-center gap-1.5">
                                {loading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                )}
                                <span>
                                    {loading
                                        ? "Saving..."
                                        : expenseToEdit
                                        ? "Save Changes"
                                        : "Add Expense"}
                                </span>
                            </span>
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
