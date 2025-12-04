import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { format } from "date-fns";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const query = { user: session.user.id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const expenses = await Expense.find(query).sort({ date: -1 });

        // Convert to CSV format
        const csvHeader = "Date,Title,Category,Amount,Payment Method,Tags,Note\n";
        const csvRows = expenses.map(expense => {
            const date = format(new Date(expense.date), "yyyy-MM-dd");
            const tags = expense.tags ? expense.tags.join("; ") : "";
            const note = expense.note ? expense.note.replace(/,/g, ";") : "";
            return `${date},"${expense.title}","${expense.category}",${expense.amount},"${expense.paymentMethod || 'Cash'}","${tags}","${note}"`;
        }).join("\n");

        const csv = csvHeader + csvRows;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="expenses_${format(new Date(), "yyyy-MM-dd")}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting expenses:", error);
        return NextResponse.json({ message: "Error exporting expenses" }, { status: 500 });
    }
}
