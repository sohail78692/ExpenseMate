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

        // 1. Total Spent this Month
        const totalSpentResult = await Expense.aggregate([
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
        ]);
        const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

        // 2. Spent Today
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        const todaySpentResult = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(session.user.id),
                    date: { $gte: todayStart, $lte: todayEnd },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);
        const todaySpent = todaySpentResult.length > 0 ? todaySpentResult[0].total : 0;

        // 3. Highest Category
        const categoryStats = await Expense.aggregate([
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
        ]);
        const highestCategory = categoryStats.length > 0 ? categoryStats[0] : null;

        // 4. Daily Trend (for Line Chart)
        const dailyTrend = await Expense.aggregate([
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
        ]);
        const formattedDailyTrend = dailyTrend.map(item => ({ date: item._id, amount: item.amount }));

        // 5. Category Breakdown (for Pie Chart)
        const categoryBreakdown = categoryStats.map(item => ({ name: item._id, value: item.total }));

        // 6. Heatmap Data (All time or wider range? Let's do current month for now as requested, or maybe last 3 months)
        // For heatmap, usually we want more than just one month, but let's stick to the requested "Calendar grid showing days of current month"
        // Actually, the prompt says "Calendar Heatmap showing total expenses per day".
        // Let's fetch data for the current month for the heatmap as well, using the same dailyTrend data but maybe formatted differently if needed.
        // The heatmap component expects an array of objects with date and amount.
        // We can reuse formattedDailyTrend for the current month.

        // Fetch raw expenses for client-side timezone handling
        const rawExpenses = await Expense.find({
            user: new mongoose.Types.ObjectId(session.user.id),
            date: { $gte: start, $lte: end },
        }).select("date amount title category").sort({ date: 1 });

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


