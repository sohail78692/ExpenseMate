"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getCategoryStyles } from "@/lib/categoryStyles";

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch analytics data
                const analyticsRes = await fetch("/api/analytics");
                if (analyticsRes.status === 401) {
                    setData({
                        totalSpent: 0,
                        todaySpent: 0,
                        highestCategory: null,
                        dailyTrend: [],
                        categoryBreakdown: [],
                        heatmapData: []
                    });
                } else {
                    const analyticsData = await analyticsRes.json();
                    setData(analyticsData);
                }

                // Fetch recent expenses
                const expensesRes = await fetch("/api/expenses?page=1&limit=5");
                if (expensesRes.status !== 401) {
                    const expensesData = await expensesRes.json();
                    setRecentExpenses(expensesData.expenses || []);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    if (!data) {
        return <div className="p-8">Error loading data.</div>;
    }

    // Calculate yesterday's spending for comparison
    const yesterday = data.dailyTrend && data.dailyTrend.length > 1
        ? data.dailyTrend[data.dailyTrend.length - 2]?.amount || 0
        : 0;

    const todayChange = yesterday > 0
        ? ((data.todaySpent - yesterday) / yesterday * 100).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here&apos;s your spending overview</p>
                </div>
                <Link href="/expenses">
                    <Button>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Expense
                    </Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(data.totalSpent || 0).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total spending in {new Date().toLocaleDateString('en-US', { month: 'long' })}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(data.todaySpent || 0).toFixed(2)}</div>
                        <div className="flex items-center text-xs">
                            {todayChange > 0 ? (
                                <>
                                    <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                                    <span className="text-red-500">{todayChange}% from yesterday</span>
                                </>
                            ) : todayChange < 0 ? (
                                <>
                                    <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                                    <span className="text-green-500">{Math.abs(todayChange)}% from yesterday</span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">Same as yesterday</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.highestCategory ? data.highestCategory._id : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.highestCategory ? `₹${data.highestCategory.total.toFixed(2)}` : "₹0.00"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Expenses */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Expenses</CardTitle>
                    <Link href="/expenses">
                        <Button variant="ghost" size="sm" title="View all expenses" aria-label="View all expenses">
                            View All
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentExpenses.length > 0 ? (
                        <div className="space-y-4">
                            {recentExpenses.map((expense) => {
                                const { icon: Icon, color, bg } = getCategoryStyles(expense.category);
                                return (
                                    <div key={expense._id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>
                                                <Icon className={`h-5 w-5 ${color}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium">{expense.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(expense.date), "MMM d, yyyy")} • {expense.category}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₹{expense.amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No expenses yet</p>
                            <Link href="/expenses">
                                <Button variant="link" className="mt-2">Add your first expense</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href="/analytics">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                View Detailed Analytics
                                <ArrowUpRight className="h-5 w-5" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                See charts, trends, and insights about your spending patterns
                            </p>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href="/expenses">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Manage Expenses
                                <ArrowUpRight className="h-5 w-5" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Add, edit, or delete your expense records
                            </p>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
