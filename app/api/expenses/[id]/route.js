import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { title, amount, category, date, note } = await request.json();

        await dbConnect();

        const expense = await Expense.findOne({ _id: id, user: session.user.id });

        if (!expense) {
            return NextResponse.json({ message: "Expense not found" }, { status: 404 });
        }

        expense.title = title;
        expense.amount = amount;
        expense.category = category;
        expense.date = date;
        expense.note = note;

        await expense.save();

        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ message: "Error updating expense" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const expense = await Expense.findOneAndDelete({ _id: id, user: session.user.id });

        if (!expense) {
            return NextResponse.json({ message: "Expense not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Expense deleted" });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting expense" }, { status: 500 });
    }
}
