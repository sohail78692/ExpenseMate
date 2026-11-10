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
        const { title, amount, category, date, note, paymentMethod } = await request.json();

        if (!title || !String(title).trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !category || !date) {
            return NextResponse.json(
                { message: "Please provide a valid title, positive amount, category, and date." },
                { status: 400 }
            );
        }

        await dbConnect();

        const expense = await Expense.findOne({ _id: id, user: session.user.id });

        if (!expense) {
            return NextResponse.json({ message: "Expense not found" }, { status: 404 });
        }

        expense.title = String(title).trim();
        expense.amount = Number(amount);
        expense.category = category;
        expense.date = date;
        expense.note = note ? String(note).trim() : "";
        if (paymentMethod) {
            expense.paymentMethod = paymentMethod;
        }

        await expense.save();

        return NextResponse.json(expense, {
            headers: { "Content-Type": "application/json; charset=utf-8" },
        });
    } catch (error) {
        console.error("Error updating expense:", error);
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

        return NextResponse.json(
            { message: "Expense deleted" },
            { headers: { "Content-Type": "application/json; charset=utf-8" } }
        );
    } catch (error) {
        console.error("Error deleting expense:", error);
        return NextResponse.json({ message: "Error deleting expense" }, { status: 500 });
    }
}
