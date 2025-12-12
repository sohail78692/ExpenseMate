"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DailyTrendChart from "@/components/charts/DailyTrendChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { getCategoryStyles } from "@/lib/categoryStyles";
import { format } from "date-fns";

export default function AnalyticsClient({ initialData }) {
    const data = initialData;

    // Process rawExpenses to create dailyTrend respecting local timezone
    const processedDailyTrend = useMemo(() => {
        if (!data) return [];
        // Use rawExpenses if available for correct local timezone grouping
        if (data.rawExpenses && data.rawExpenses.length > 0) {

            // Get current month boundaries in local timezone
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const map = {};
            data.rawExpenses.forEach(item => {
                const localDate = new Date(item.date);
                const dateStr = format(localDate, "yyyy-MM-dd");

                // Only include expenses from the current month in local timezone
                if (localDate.getMonth() === currentMonth && localDate.getFullYear() === currentYear) {
                    map[dateStr] = (map[dateStr] || 0) + item.amount;
                }
            });
            const result = Object.entries(map)
                .map(([date, amount]) => ({ date, amount }))
                .sort((a, b) => a.date.localeCompare(b.date));
            return result;
        }
        // Fallback to server-side dailyTrend if rawExpenses not available
        return data.dailyTrend || [];
    }, [data]);

    if (!data) {
        return <div className="p-8">Error loading data.</div>;
    }

    // Recalculate total from processedDailyTrend for timezone accuracy
    const correctedTotalSpent = processedDailyTrend.reduce((sum, item) => sum + item.amount, 0);

    // Calculate average daily spending
    const avgDailySpending = processedDailyTrend.length > 0
        ? correctedTotalSpent / processedDailyTrend.length
        : 0;

    // Find highest spending day
    const highestDay = processedDailyTrend.length > 0
        ? processedDailyTrend.reduce((max, item) => item.amount > max.amount ? item : max, processedDailyTrend[0])
        : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Detailed insights into your spending patterns</p>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{correctedTotalSpent.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Current month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{avgDailySpending.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Per day this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Highest Day</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{highestDay ? highestDay.amount.toFixed(2) : "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {highestDay ? highestDay.date : "No data"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.categoryBreakdown ? data.categoryBreakdown.length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Active categories</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-7">
                <DailyTrendChart data={processedDailyTrend} />
                <CategoryPieChart data={data.categoryBreakdown || []} />
            </div>

            {/* Category Breakdown Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                            data.categoryBreakdown.map((category, index) => {
                                const percentage = correctedTotalSpent > 0
                                    ? (category.value / correctedTotalSpent * 100).toFixed(1)
                                    : 0;
                                const { icon: Icon, color, bg, hex } = getCategoryStyles(category.name);

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center`}>
                                                    <Icon className={`h-4 w-4 ${color}`} />
                                                </div>
                                                <div className="font-medium">{category.name}</div>
                                                <span className="text-sm text-muted-foreground">
                                                    {percentage}%
                                                </span>
                                            </div>
                                            <div className="font-bold">₹{category.value.toFixed(2)}</div>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all"
                                                style={{ width: `${percentage}%`, backgroundColor: hex }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No category data available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Heatmap */}
            <CalendarHeatmap data={processedDailyTrend} />

            {/* Insights Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Spending Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold">Top Spending Category</h4>
                        <p className="text-muted-foreground">
                            {data.highestCategory
                                ? `You spent the most on ${data.highestCategory._id} (₹${data.highestCategory.total.toFixed(2)})`
                                : "No spending data available yet"}
                        </p>
                    </div>

                    {avgDailySpending > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Daily Spending Pattern</h4>
                            <p className="text-muted-foreground">
                                Your average daily spending is ₹{avgDailySpending.toFixed(2)}.
                                {data.todaySpent > avgDailySpending
                                    ? ` Today you're spending ${((data.todaySpent / avgDailySpending - 1) * 100).toFixed(0)}% more than average.`
                                    : ` You're on track with your usual spending pattern.`}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="font-semibold">Monthly Progress</h4>
                        <p className="text-muted-foreground">
                            You have tracked {processedDailyTrend.length} days of expenses this month.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
