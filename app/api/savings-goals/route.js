import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SavingsGoal from "@/models/SavingsGoal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET - Get all savings goals
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const goals = await SavingsGoal.find({ user: session.user.id })
            .sort({ isCompleted: 1, deadline: 1 });

        const goalsWithProgress = goals.map(goal => ({
            ...goal.toObject(),
            progress: parseFloat(((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)),
            remaining: goal.targetAmount - goal.currentAmount,
            daysLeft: Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)),
        }));

        return NextResponse.json({ goals: goalsWithProgress }, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error fetching savings goals:", error);
        return NextResponse.json({ message: "Error fetching savings goals" }, { status: 500 });
    }
}

// POST - Create a new savings goal
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, targetAmount, currentAmount, deadline, category, icon } = await request.json();

        await dbConnect();

        const goal = await SavingsGoal.create({
            user: session.user.id,
            name,
            targetAmount,
            currentAmount: currentAmount || 0,
            deadline,
            category: category || 'Other',
            icon: icon || '🎯',
        });

        return NextResponse.json(goal, {
            status: 201,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error creating savings goal:", error);
        return NextResponse.json({ message: "Error creating savings goal" }, { status: 500 });
    }
}
