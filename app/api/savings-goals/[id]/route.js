import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { currentAmount } = await request.json();

        await dbConnect();

        const SavingsGoal = (await import("@/models/SavingsGoal")).default;
        const goal = await SavingsGoal.findOne({ _id: id, user: session.user.id });

        if (!goal) {
            return NextResponse.json({ message: "Goal not found" }, { status: 404 });
        }

        goal.currentAmount = currentAmount;

        // Mark as completed if target reached
        if (currentAmount >= goal.targetAmount) {
            goal.isCompleted = true;
        }

        await goal.save();

        return NextResponse.json(goal, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error updating savings goal:", error);
        return NextResponse.json({ message: "Error updating savings goal" }, { status: 500 });
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

        const SavingsGoal = (await import("@/models/SavingsGoal")).default;
        const goal = await SavingsGoal.findOneAndDelete({ _id: id, user: session.user.id });

        if (!goal) {
            return NextResponse.json({ message: "Goal not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Goal deleted" }, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error deleting savings goal:", error);
        return NextResponse.json({ message: "Error deleting savings goal" }, { status: 500 });
    }
}
