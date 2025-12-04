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
    'Emergency Fund',
    'Vacation',
    'Car',
    'House',
    'Retirement',
    'Electronics',
    'Education',
    'Wedding',
    'Other'
];

const ICONS = [
    { value: '💰', label: 'Money Bag' },
    { value: '🏠', label: 'House' },
    { value: '🚗', label: 'Car' },
    { value: '✈️', label: 'Airplane' },
    { value: '🎓', label: 'Graduation Cap' },
    { value: '💍', label: 'Ring' },
    { value: '💻', label: 'Laptop' },
    { value: '🏥', label: 'Hospital' },
    { value: '🎯', label: 'Target' },
];

export default function NewSavingsGoalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        deadline: "",
        category: "",
        icon: "🎯",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/savings-goals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    targetAmount: parseFloat(formData.targetAmount) || 0,
                    currentAmount: parseFloat(formData.currentAmount) || 0,
                    deadline: formData.deadline,
                    category: formData.category,
                    icon: formData.icon,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to create savings goal");
            }

            router.push("/savings");
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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/savings">
                    <Button variant="ghost" size="icon" title="Back to savings" aria-label="Back to savings">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Create New Savings Goal</h1>
                    <p className="text-muted-foreground">Set a target for your financial dreams</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Goal Details</CardTitle>
                    <CardDescription>
                        Define what you&apos;re saving for and when you want to achieve it
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
                            <Label htmlFor="name">Goal Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., New Car, Europe Trip"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange("category", value)}
                                    required
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
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
                                <Label htmlFor="icon">Icon</Label>
                                <Select
                                    value={formData.icon}
                                    onValueChange={(value) => handleChange("icon", value)}
                                >
                                    <SelectTrigger id="icon">
                                        <SelectValue placeholder="Select icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ICONS.map((icon) => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                                <span className="mr-2">{icon.value}</span>
                                                {icon.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="targetAmount">Target Amount (₹) *</Label>
                                <Input
                                    id="targetAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.targetAmount}
                                    onChange={(e) => handleChange("targetAmount", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currentAmount">Current Saved (₹)</Label>
                                <Input
                                    id="currentAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.currentAmount}
                                    onChange={(e) => handleChange("currentAmount", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deadline">Target Date *</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => handleChange("deadline", e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? "Creating..." : "Create Goal"}
                            </Button>
                            <Link href="/savings" className="flex-1">
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
