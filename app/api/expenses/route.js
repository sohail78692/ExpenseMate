import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const expenses = await Expense.find({ user: session.user.id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Expense.countDocuments({ user: session.user.id });

        return NextResponse.json({ expenses, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching expenses" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { title, amount, category, date, note } = await request.json();

        await dbConnect();

        const expense = await Expense.create({
            user: session.user.id,
            title,
            amount,
            category,
            date,
            note,
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error creating expense" }, { status: 500 });
    }
}
