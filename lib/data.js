import dbConnect from "@/lib/mongodb";
import Budget from "@/models/Budget";
import SavingsGoal from "@/models/SavingsGoal";
import User from "@/models/User";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from "date-fns";
import mongoose from 'mongoose';

// ... (existing getDashboardData and getExpenses - keeping them if needed or refactoring)

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

export async function getAnalyticsData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await dbConnect();

    const targetDate = new Date();
    // Expand date range for timezone safety
    const start = startOfMonth(targetDate);
    start.setDate(start.getDate() - 1);
    const end = endOfMonth(targetDate);
    end.setDate(end.getDate() + 1);

    const [
        totalSpentResult,
        todaySpentResult,
        categoryStats,
        dailyTrend,
        rawExpenses
    ] = await Promise.all([
        Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(session.user.id), date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(session.user.id), date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(session.user.id), date: { $gte: start, $lte: end } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
        ]),
        Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(session.user.id), date: { $gte: start, $lte: end } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, amount: { $sum: "$amount" } } },
            { $sort: { _id: 1 } },
        ]),
        Expense.find({
            user: new mongoose.Types.ObjectId(session.user.id),
            date: { $gte: start, $lte: end },
        }).select("date amount title category").sort({ date: 1 }).lean()
    ]);

    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;
    const todaySpent = todaySpentResult.length > 0 ? todaySpentResult[0].total : 0;
    const highestCategory = categoryStats.length > 0 ? categoryStats[0] : null;
    const formattedDailyTrend = dailyTrend.map(item => ({ date: item._id, amount: item.amount }));
    const categoryBreakdown = categoryStats.map(item => ({ name: item._id, value: item.total }));

    const serializedRawExpenses = rawExpenses.map(expense => ({
        ...expense,
        _id: expense._id.toString(),
        date: expense.date.toISOString(),
    }));

    return {
        totalSpent,
        todaySpent,
        highestCategory,
        dailyTrend: formattedDailyTrend,
        categoryBreakdown,
        heatmapData: formattedDailyTrend,
        rawExpenses: serializedRawExpenses,
    };
}

export async function getBudgetsAndInsightsData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await dbConnect();

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Insights Time Ranges
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [
        userBudgets,
        currentMonthExpenses,
        lastMonthExpenses,
        topCategories,
        categorySpending
    ] = await Promise.all([
        Budget.find({ user: session.user.id, month, year }).sort({ category: 1 }).lean(),
        Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(session.user.id), date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]),
        Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(session.user.id), date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(session.user.id), date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
            { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 3 },
        ]),
        Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(session.user.id), date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
        ]),
    ]);

    // Process Budgets
    const spendingMap = {};
    let totalSpending = 0;
    categorySpending.forEach(item => {
        spendingMap[item._id] = item.total;
        totalSpending += item.total;
    });

    const budgets = userBudgets.map(budget => {
        const spent = budget.category === 'Total' ? totalSpending : (spendingMap[budget.category] || 0);
        return {
            ...budget,
            _id: budget._id.toString(),
            user: budget.user.toString(),
            createdAt: budget.createdAt.toISOString(),
            updatedAt: budget.updatedAt.toISOString(),
            spent: spent,
            remaining: budget.amount - spent,
            percentage: parseFloat(((spent / budget.amount) * 100).toFixed(1)),
        };
    });

    // Process Insights
    const budgetAlerts = budgets.filter(budget => budget.percentage >= budget.alertThreshold).map(budget => ({
        category: budget.category,
        budget: budget.amount,
        spent: budget.spent,
        percentage: budget.percentage.toFixed(1),
    }));

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
        averagePerDay: (currentTotal / now.getDate()).toFixed(2),
        totalTransactions: currentMonthExpenses[0]?.count || 0,
        recommendations: generateRecommendations(currentTotal, lastTotal, topCategories, budgetAlerts),
    };

    return { budgets, insights };
}

function generateRecommendations(currentTotal, lastTotal, topCategories, budgetAlerts) {
    const recommendations = [];
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
    if (budgetAlerts.length > 0) {
        recommendations.push({
            type: 'alert',
            title: 'Budget Limit Approaching',
            message: `You're approaching or exceeding budget limits in ${budgetAlerts.length} ${budgetAlerts.length === 1 ? 'category' : 'categories'}.`,
            icon: '🔔',
        });
    }
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

export async function getSavingsGoalsData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await dbConnect();

    const goals = await SavingsGoal.find({ user: session.user.id })
        .sort({ isCompleted: 1, deadline: 1 })
        .lean();

    const goalsWithProgress = goals.map(goal => ({
        ...goal,
        _id: goal._id.toString(),
        user: goal.user.toString(),
        deadline: goal.deadline.toISOString(),
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        progress: parseFloat(((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)),
        remaining: goal.targetAmount - goal.currentAmount,
        daysLeft: Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)),
    }));

    return { goals: goalsWithProgress };
}

export async function getProfileData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await dbConnect();

    const user = await User.findById(session.user.id).select('-password').lean();

    if (!user) return null;

    return {
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}


