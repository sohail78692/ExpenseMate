"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingDown, TrendingUp, AlertCircle, Download, Trash2 } from "lucide-react";
import Link from "next/link";

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [budgetsRes, insightsRes] = await Promise.all([
                fetch("/api/budgets"),
                fetch("/api/insights"),
            ]);

            if (budgetsRes.ok) {
                const budgetsData = await budgetsRes.json();
                setBudgets(budgetsData.budgets || []);
            }

            if (insightsRes.ok) {
                const insightsData = await insightsRes.json();
                setInsights(insightsData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch("/api/export");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error exporting data:", error);
        }
    };

    const getBudgetColor = (percentage) => {
        if (percentage >= 100) return "text-red-500";
        if (percentage >= 80) return "text-orange-500";
        if (percentage >= 60) return "text-yellow-500";
        return "text-green-500";
    };

    const getProgressIndicatorColor = (percentage) => {
        if (percentage >= 100) return "bg-red-500";
        if (percentage >= 80) return "bg-orange-500";
        if (percentage >= 60) return "bg-yellow-500";
        return "bg-green-500";
    };

    const handleDeleteBudget = async (budgetId) => {
        if (!confirm("Are you sure you want to delete this budget?")) return;

        try {
            const res = await fetch(`/api/budgets/${budgetId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error deleting budget:", error);
        }
    };



    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Budgets & Insights</h1>
                    <p className="text-muted-foreground">Track your spending and stay within budget</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleExport} variant="outline" title="Export expenses to CSV" aria-label="Export expenses to CSV">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Link href="/budgets/new">
                        <Button title="Create new budget" aria-label="Create new budget">
                            <Plus className="mr-2 h-4 w-4" />
                            New Budget
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Insights Section */}
            {insights && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Comparison</CardTitle>
                            {insights.monthlyComparison.trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-green-500" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {insights.monthlyComparison.trend === 'up' ? '+' : '-'}
                                {Math.abs(insights.monthlyComparison.change)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                vs last month (₹{insights.monthlyComparison.last.toFixed(2)})
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Daily Spending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{insights.averagePerDay}</div>
                            <p className="text-xs text-muted-foreground">
                                {insights.totalTransactions} transactions this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
                            {insights.budgetAlerts.length > 0 && (
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{insights.budgetAlerts.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {insights.budgetAlerts.length === 0 ? 'All budgets on track' : 'Categories over threshold'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recommendations */}
            {insights && insights.recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Insights & Recommendations</CardTitle>
                        <CardDescription>AI-powered suggestions to improve your finances</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {insights.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                                <span className="text-2xl">{rec.icon}</span>
                                <div className="flex-1">
                                    <h4 className="font-semibold">{rec.title}</h4>
                                    <p className="text-sm text-muted-foreground">{rec.message}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Budgets List */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Budgets</CardTitle>
                    <CardDescription>Track your spending against set budgets</CardDescription>
                </CardHeader>
                <CardContent>
                    {budgets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No budgets set yet</p>
                            <Link href="/budgets/new">
                                <Button variant="link" className="mt-2">Create your first budget</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map((budget) => (
                                <div key={budget._id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{budget.category}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDeleteBudget(budget._id)}
                                                    title="Delete budget"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                ₹{budget.spent.toFixed(2)} of ₹{budget.amount.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className={`text-right ${getBudgetColor(budget.percentage)}`}>
                                            <p className="font-bold">{budget.percentage}%</p>
                                            <p className="text-sm">
                                                {budget.remaining >= 0 ? '₹' + budget.remaining.toFixed(2) + ' left' : 'Over budget'}
                                            </p>
                                        </div>
                                    </div>
                                    <Progress
                                        value={Math.min(budget.percentage, 100)}
                                        className="h-2"
                                        indicatorClassName={getProgressIndicatorColor(budget.percentage)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
