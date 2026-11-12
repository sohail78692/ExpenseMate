import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { fetchBudgetsAndInsightsForMonth } from "@/lib/data";

// GET - Get all budgets and insights for selected month
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
        const year = parseInt(searchParams.get("year")) || new Date().getFullYear();

        const data = await fetchBudgetsAndInsightsForMonth(session.user.id, month, year);

        return NextResponse.json(data, {
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
