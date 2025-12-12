import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import mongoose from 'mongoose';

export async function getDashboardData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await dbConnect();

    const targetDate = new Date();
    const start = startOfMonth(targetDate);
    start.setDate(start.getDate() - 1);
    const end = endOfMonth(targetDate);
    end.setDate(end.getDate() + 1);

    const [
        totalSpentResult,
        todaySpentResult,
        categoryStats,
        dailyTrend,
        recentExpenses
    ] = await Promise.all([
        // 1. Total Spent this Month
        Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]),
        // 2. Spent Today
        Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]),
        // 3. Highest Category
        Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                },
            },
            { $sort: { total: -1 } },
        ]),
        // 4. Daily Trend
        Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    amount: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        // 5. Recent Expenses (Limit 5)
        Expense.find({ user: session.user.id })
            .sort({ date: -1 })
            .limit(5)
            .lean()
    ]);

    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;
    const todaySpent = todaySpentResult.length > 0 ? todaySpentResult[0].total : 0;
    const highestCategory = categoryStats.length > 0 ? categoryStats[0] : null;

    // Serialize recent expenses
    const serializedRecentExpenses = recentExpenses.map(expense => ({
        ...expense,
        _id: expense._id.toString(),
        date: expense.date.toISOString(),
        user: expense.user.toString()
    }));

    return {
        totalSpent,
        todaySpent,
        highestCategory,
        dailyTrend,
        recentExpenses: serializedRecentExpenses
    };
}

export async function getExpenses({ page = 1, limit = 10 } = {}) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await dbConnect();

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
        Expense.find({ user: session.user.id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Expense.countDocuments({ user: session.user.id })
    ]);

    const serializedExpenses = expenses.map(expense => ({
        ...expense,
        _id: expense._id.toString(),
        date: expense.date.toISOString(),
        user: expense.user.toString()
    }));

    return {
        expenses: serializedExpenses,
        total,
        totalPages: Math.ceil(total / limit)
    };
}

