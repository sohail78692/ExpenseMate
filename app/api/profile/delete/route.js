import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import SavingsGoal from "@/models/SavingsGoal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// DELETE - Delete user account and all associated data
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const userId = session.user.id;

        // Delete all user data in parallel
        await Promise.all([
            Expense.deleteMany({ user: userId }),
            Budget.deleteMany({ user: userId }),
            SavingsGoal.deleteMany({ user: userId }),
            User.findByIdAndDelete(userId)
        ]);

        return NextResponse.json({
            message: "Account and all associated data deleted successfully"
        }, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error deleting account:", error);
        return NextResponse.json({
            message: "Error deleting account"
        }, { status: 500 });
    }
}
