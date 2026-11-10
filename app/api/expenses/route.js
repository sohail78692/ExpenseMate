import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit"), 10) || 10));
        const category = searchParams.get("category")?.trim();
        const search = searchParams.get("search")?.trim();
        const sort = searchParams.get("sort") || "date_desc";
        const skip = (page - 1) * limit;

        const filter = { user: new mongoose.Types.ObjectId(session.user.id) };

        if (category && category.toLowerCase() !== "all") {
            filter.category = category;
        }

        if (search) {
            const safePattern = new RegExp(escapeRegex(search), "i");
            filter.$or = [{ title: safePattern }, { note: safePattern }];
        }

        const sortMap = {
            date_desc: { date: -1, createdAt: -1 },
            date_asc: { date: 1, createdAt: 1 },
            amount_desc: { amount: -1, date: -1 },
            amount_asc: { amount: 1, date: -1 },
        };
        const sortOption = sortMap[sort] || sortMap.date_desc;

        const [expenses, total, totalAmountAgg] = await Promise.all([
            Expense.find(filter).sort(sortOption).skip(skip).limit(limit),
            Expense.countDocuments(filter),
            Expense.aggregate([
                { $match: filter },
                { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
            ]),
        ]);

        const totalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].totalAmount : 0;

        return NextResponse.json(
            {
                expenses,
                total,
                totalAmount,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
            { headers: { "Content-Type": "application/json; charset=utf-8" } }
        );
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json({ message: "Error fetching expenses" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { title, amount, category, date, note, paymentMethod } = await request.json();

        if (!title || !String(title).trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !category || !date) {
            return NextResponse.json(
                { message: "Please provide a valid title, positive amount, category, and date." },
                { status: 400 }
            );
        }

        await dbConnect();

        const expense = await Expense.create({
            user: session.user.id,
            title: String(title).trim(),
            amount: Number(amount),
            category,
            date,
            note: note ? String(note).trim() : "",
            paymentMethod: paymentMethod || "Cash",
        });

        return NextResponse.json(expense, {
            status: 201,
            headers: { "Content-Type": "application/json; charset=utf-8" },
        });
    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json({ message: "Error creating expense" }, { status: 500 });
    }
}
