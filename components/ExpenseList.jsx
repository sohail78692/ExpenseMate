"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, ShoppingBag, Coffee, Utensils, Car, Zap, Home, Film, HeartPulse, Briefcase, MoreHorizontal, Smartphone, Gift } from "lucide-react";
import { format } from "date-fns";
import ExpenseForm from "./ExpenseForm";
import { Badge } from "@/components/ui/badge";

const getCategoryStyles = (category) => {
    const styles = {
        Food: { icon: Utensils, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        Dining: { icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        Transport: { icon: Car, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        Shopping: { icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
        Utilities: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        Housing: { icon: Home, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
        Entertainment: { icon: Film, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        Health: { icon: HeartPulse, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
        Work: { icon: Briefcase, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
        Electronics: { icon: Smartphone, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
        Gifts: { icon: Gift, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    };

    const defaultStyle = { icon: MoreHorizontal, color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20" };

    // Case insensitive matching
    const key = Object.keys(styles).find(k => k.toLowerCase() === category?.toLowerCase());
    return styles[key] || defaultStyle;
};

export default function ExpenseList() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState(null);

    useEffect(() => {
        const fetchExpenses = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/expenses?page=${page}&limit=10`);
                if (res.status === 401) {
                    // User is not authenticated
                    setExpenses([]);
                    setTotalPages(1);
                    return;
                }
                const data = await res.json();
                setExpenses(data.expenses || []);
                setTotalPages(data.totalPages || 1);
            } catch (error) {
                console.error("Error fetching expenses:", error);
                setExpenses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [page]);

    const handleAddExpense = (newExpense) => {
        setExpenses((prev) => [newExpense, ...prev]);
    };

    const handleUpdateExpense = (updatedExpense) => {
        setExpenses((prev) => prev.map((exp) => (exp._id === updatedExpense._id ? updatedExpense : exp)));
        setExpenseToEdit(null);
    };

    const handleDeleteExpense = async (id) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            try {
                await fetch(`/api/expenses/${id}`, { method: "DELETE" });
                setExpenses((prev) => prev.filter((exp) => exp._id !== id));
            } catch (error) {
                console.error("Error deleting expense:", error);
            }
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

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Expenses</h2>
                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                        Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : !expenses || expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No expenses found. Add one to get started!
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => {
                                const { icon: Icon, color, bg, border } = getCategoryStyles(expense.category);
                                return (
                                    <TableRow key={expense._id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium text-muted-foreground">
                                            {format(new Date(expense.date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="font-medium">{expense.title}</TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${bg} ${border} ${color} text-xs font-medium`}>
                                                <Icon className="h-3.5 w-3.5" />
                                                {expense.category}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">₹{expense.amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-500" onClick={() => openEditModal(expense)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDeleteExpense(expense._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : !expenses || expenses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No expenses found.</div>
                ) : (
                    expenses.map((expense) => {
                        const { icon: Icon, color, bg, border } = getCategoryStyles(expense.category);
                        return (
                            <div key={expense._id} className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">{expense.title}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            {format(new Date(expense.date), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-bold text-lg">₹{expense.amount.toFixed(2)}</p>
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${bg} ${border} ${color} text-xs font-medium`}>
                                            <Icon className="h-3 w-3" />
                                            {expense.category}
                                        </div>
                                    </div>
                                </div>
                                {expense.note && (
                                    <p className="text-sm text-muted-foreground">{expense.note}</p>
                                )}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => openEditModal(expense)}
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-red-500 hover:text-red-600"
                                        onClick={() => handleDeleteExpense(expense._id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="flex justify-center space-x-2">
                <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <span className="flex items-center">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>

            <ExpenseForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                onExpenseAdded={handleAddExpense}
                expenseToEdit={expenseToEdit}
                onExpenseUpdated={handleUpdateExpense}
            />
        </div>
    );
}
