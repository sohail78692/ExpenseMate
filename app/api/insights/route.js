import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import mongoose from 'mongoose';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // Get current month spending
        const currentMonthExpenses = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: currentMonthStart, $lte: currentMonthEnd },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get last month spending
        const lastMonthExpenses = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: lastMonthStart, $lte: lastMonthEnd },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        // Get top spending categories
        const topCategories = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: currentMonthStart, $lte: currentMonthEnd },
                },
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
            { $limit: 3 },
        ]);

        // Get budget alerts
        const budgets = await Budget.find({
            user: session.user.id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
        });

        const categorySpending = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: currentMonthStart, $lte: currentMonthEnd },
                },
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const spendingMap = {};
        categorySpending.forEach(item => {
            spendingMap[item._id] = item.total;
        });

        const budgetAlerts = budgets.filter(budget => {
            const spent = spendingMap[budget.category] || 0;
            const percentage = (spent / budget.amount) * 100;
            return percentage >= budget.alertThreshold;
        }).map(budget => ({
            category: budget.category,
            budget: budget.amount,
            spent: spendingMap[budget.category] || 0,
            percentage: ((spendingMap[budget.category] || 0) / budget.amount * 100).toFixed(1),
        }));

        // Calculate insights
        const currentTotal = currentMonthExpenses[0]?.total || 0;
        const lastTotal = lastMonthExpenses[0]?.total || 0;
        const changePercentage = lastTotal > 0
            ? (((currentTotal - lastTotal) / lastTotal) * 100).toFixed(1)
            : 0;

        const insights = {
            monthlyComparison: {
                current: currentTotal,
                last: lastTotal,
                change: changePercentage,
                trend: currentTotal > lastTotal ? 'up' : 'down',
            },
            topCategories: topCategories.map(cat => ({
                category: cat._id,
                amount: cat.total,
                count: cat.count,
            })),
            budgetAlerts,
            averagePerDay: (currentTotal / new Date().getDate()).toFixed(2),
            totalTransactions: currentMonthExpenses[0]?.count || 0,
            recommendations: generateRecommendations(currentTotal, lastTotal, topCategories, budgetAlerts),
        };

        return NextResponse.json(insights, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error fetching insights:", error);
        return NextResponse.json({ message: "Error fetching insights" }, { status: 500 });
    }
}

function generateRecommendations(currentTotal, lastTotal, topCategories, budgetAlerts) {
    const recommendations = [];

    // Spending trend recommendation
    if (currentTotal > lastTotal * 1.2) {
        recommendations.push({
            type: 'warning',
            title: 'High Spending Alert',
            message: `Your spending is 20% higher than last month. Consider reviewing your expenses.`,
            icon: '⚠️',
        });
    } else if (currentTotal < lastTotal * 0.8) {
        recommendations.push({
            type: 'success',
            title: 'Great Job!',
            message: `You've reduced your spending by ${(((lastTotal - currentTotal) / lastTotal) * 100).toFixed(0)}% compared to last month.`,
            icon: '🎉',
        });
    }

    // Budget alerts recommendation
    if (budgetAlerts.length > 0) {
        recommendations.push({
            type: 'alert',
            title: 'Budget Limit Approaching',
            message: `You're approaching or exceeding budget limits in ${budgetAlerts.length} ${budgetAlerts.length === 1 ? 'category' : 'categories'}.`,
            icon: '🔔',
        });
    }

    // Top category recommendation
    if (topCategories.length > 0) {
        const topCat = topCategories[0];
        recommendations.push({
            type: 'info',
            title: 'Top Spending Category',
            message: `${topCat._id} is your highest expense category this month with ₹${topCat.total.toFixed(2)}.`,
            icon: '📊',
        });
    }

    return recommendations;
}
