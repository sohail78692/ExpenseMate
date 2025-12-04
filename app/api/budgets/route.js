import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Budget from "@/models/Budget";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { startOfMonth, endOfMonth } from "date-fns";
import mongoose from "mongoose";

// GET - Get all budgets for current month
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
        const year = parseInt(searchParams.get("year")) || new Date().getFullYear();

        const budgets = await Budget.find({
            user: session.user.id,
            month,
            year
        }).sort({ category: 1 });

        // Get actual spending for each category
        const start = startOfMonth(new Date(year, month - 1));
        const end = endOfMonth(new Date(year, month - 1));

        const spending = await Expense.aggregate([
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
        ]);


        const spendingMap = {};
        let totalSpending = 0;
        spending.forEach(item => {
            spendingMap[item._id] = item.total;
            totalSpending += item.total;
        });

        const budgetsWithSpending = budgets.map(budget => {
            const spent = budget.category === 'Total' ? totalSpending : (spendingMap[budget.category] || 0);
            return {
                ...budget.toObject(),
                spent: spent,
                remaining: budget.amount - spent,
                percentage: parseFloat(((spent / budget.amount) * 100).toFixed(1)),
            };
        });

        return NextResponse.json({ budgets: budgetsWithSpending }, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error fetching budgets:", error);
        return NextResponse.json({ message: "Error fetching budgets" }, { status: 500 });
    }
}

// POST - Create a new budget
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { category, amount, month, year, alertThreshold } = await request.json();

        await dbConnect();

        const budget = await Budget.create({
            user: session.user.id,
            category,
            amount,
            month: month || new Date().getMonth() + 1,
            year: year || new Date().getFullYear(),
            alertThreshold: alertThreshold || 80,
        });

        return NextResponse.json(budget, {
            status: 201,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error creating budget:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: "Budget already exists for this category and month" }, { status: 400 });
        }
        return NextResponse.json({ message: "Error creating budget" }, { status: 500 });
    }
}
