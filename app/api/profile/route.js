import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";


// GET - Get user profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id).select('-password');

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ message: "Error fetching profile" }, { status: 500 });
    }
}

// PUT - Update user profile
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, phone, profileImage, language, currency } = await request.json();

        await dbConnect();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                name,
                phone,
                profileImage,
                language,
                currency,
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ message: "Error updating profile" }, { status: 500 });
    }
}
