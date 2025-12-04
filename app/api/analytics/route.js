import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get("date");
        const targetDate = dateParam ? new Date(dateParam) : new Date();

        const start = startOfMonth(targetDate);
        const end = endOfMonth(targetDate);

        // Run independent aggregations in parallel for better performance
        const [
            totalSpentResult,
            todaySpentResult,
            categoryStats,
            dailyTrend,
            rawExpenses
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
            // 4. Daily Trend (for Line Chart)
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
            // 5. Raw Expenses
            Expense.find({
                user: new mongoose.Types.ObjectId(session.user.id),
                date: { $gte: start, $lte: end },
            }).select("date amount title category").sort({ date: 1 })
        ]);

        const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;
        const todaySpent = todaySpentResult.length > 0 ? todaySpentResult[0].total : 0;
        const highestCategory = categoryStats.length > 0 ? categoryStats[0] : null;
        const formattedDailyTrend = dailyTrend.map(item => ({ date: item._id, amount: item.amount }));
        const categoryBreakdown = categoryStats.map(item => ({ name: item._id, value: item.total }));

        return NextResponse.json({
            totalSpent,
            todaySpent,
            highestCategory,
            dailyTrend: formattedDailyTrend,
            categoryBreakdown,
            heatmapData: formattedDailyTrend, // Keep for backward compat if needed, but we'll use rawExpenses
            rawExpenses,
        }, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ message: "Error fetching analytics" }, { status: 500 });
    }
}


