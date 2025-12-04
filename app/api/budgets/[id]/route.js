import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// DELETE - Delete a budget
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const budget = await Budget.findOneAndDelete({ _id: id, user: session.user.id });

        if (!budget) {
            return NextResponse.json({ message: "Budget not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Budget deleted" }, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    } catch (error) {
        console.error("Error deleting budget:", error);
        return NextResponse.json({ message: "Error deleting budget" }, { status: 500 });
    }
}
