"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExpenseForm({ onExpenseAdded, expenseToEdit, onExpenseUpdated, isOpen, setIsOpen }) {
    const [title, setTitle] = useState(expenseToEdit ? expenseToEdit.title : "");
    const [amount, setAmount] = useState(expenseToEdit ? expenseToEdit.amount : "");
    const [category, setCategory] = useState(expenseToEdit ? expenseToEdit.category : "");
    const [date, setDate] = useState(expenseToEdit ? new Date(expenseToEdit.date) : new Date());
    const [note, setNote] = useState(expenseToEdit ? expenseToEdit.note : "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (expenseToEdit) {
                setTitle(expenseToEdit.title);
                setAmount(expenseToEdit.amount);
                setCategory(expenseToEdit.category);
                setDate(new Date(expenseToEdit.date));
                setNote(expenseToEdit.note || "");
            } else {
                setTitle("");
                setAmount("");
                setCategory("");
                setDate(new Date());
                setNote("");
            }
        }
    }, [expenseToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const expenseData = {
            title,
            amount: parseFloat(amount),
            category,
            date,
            note,
        };

        try {
            if (expenseToEdit) {
                const res = await fetch(`/api/expenses/${expenseToEdit._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseData),
                });
                if (res.ok) {
                    const updatedExpense = await res.json();
                    onExpenseUpdated(updatedExpense);
                    setIsOpen(false);
                }
            } else {
                const res = await fetch("/api/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseData),
                });
                if (res.ok) {
                    const newExpense = await res.json();
                    onExpenseAdded(newExpense);
                    setIsOpen(false);
                    // Reset form
                    setTitle("");
                    setAmount("");
                    setCategory("");
                    setDate(new Date());
                    setNote("");
                }
            }
        } catch (error) {
            console.error("Error saving expense:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{expenseToEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
                    <DialogDescription>
                        {expenseToEdit ? "Make changes to your expense here." : "Add a new daily expense here."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category
                        </Label>
                        <Select onValueChange={setCategory} defaultValue={category} required>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Transport">Transport</SelectItem>
                                <SelectItem value="Housing">Housing</SelectItem>
                                <SelectItem value="Utilities">Utilities</SelectItem>
                                <SelectItem value="Entertainment">Entertainment</SelectItem>
                                <SelectItem value="Health">Health</SelectItem>
                                <SelectItem value="Shopping">Shopping</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "col-span-3 justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note" className="text-right">
                            Note
                        </Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
