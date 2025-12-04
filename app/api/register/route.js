import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();

        await dbConnect();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return NextResponse.json({ message: "User registered successfully" }, { status: 201, headers: { "Content-Type": "application/json; charset=utf-8" } });
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json(
            { message: "An error occurred while registering the user" },
            { status: 500 }
        );
    }
}
