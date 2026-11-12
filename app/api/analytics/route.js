import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { fetchUserAnalyticsData } from "@/lib/data";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get("date");
        const rangeParam = searchParams.get("range") || "1m";
        const parsedDate = dateParam ? new Date(dateParam) : new Date();
        const targetDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

        const payload = await fetchUserAnalyticsData(session.user.id, targetDate, rangeParam);

        return NextResponse.json(payload, {
            headers: { "Content-Type": "application/json; charset=utf-8" },
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ message: "Error fetching analytics" }, { status: 500 });
    }
}


