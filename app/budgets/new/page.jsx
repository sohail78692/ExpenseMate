"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
    'Food',
    'Transport',
    'Housing',
    'Utilities',
    'Entertainment',
    'Health',
    'Shopping',
    'Other',
    'Total'
];

export default function NewBudgetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        category: "",
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        alertThreshold: 80,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/budgets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    category: formData.category,
                    amount: parseFloat(formData.amount),
                    month: parseInt(formData.month),
                    year: parseInt(formData.year),
                    alertThreshold: parseInt(formData.alertThreshold),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to create budget");
            }

            router.push("/budgets");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Generate month options
    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];

    // Generate year options (current year and next 2 years)
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1, currentYear + 2];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/budgets">
                    <Button variant="ghost" size="icon" title="Back to budgets" aria-label="Back to budgets">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Create New Budget</h1>
                    <p className="text-muted-foreground">Set a spending limit for a category</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Budget Details</CardTitle>
                    <CardDescription>
                        Set a monthly budget to track your spending and get alerts when you&apos;re close to your limit
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleChange("category", value)}
                                required
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Budget Amount (₹) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => handleChange("amount", e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="month">Month *</Label>
                                <Select
                                    value={formData.month.toString()}
                                    onValueChange={(value) => handleChange("month", value)}
                                    required
                                >
                                    <SelectTrigger id="month">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month.value} value={month.value.toString()}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">Year *</Label>
                                <Select
                                    value={formData.year.toString()}
                                    onValueChange={(value) => handleChange("year", value)}
                                    required
                                >
                                    <SelectTrigger id="year">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alertThreshold">Alert Threshold (%) *</Label>
                            <Input
                                id="alertThreshold"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="80"
                                value={formData.alertThreshold}
                                onChange={(e) => handleChange("alertThreshold", e.target.value)}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                You&apos;ll be alerted when you reach this percentage of your budget
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? "Creating..." : "Create Budget"}
                            </Button>
                            <Link href="/budgets" className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
