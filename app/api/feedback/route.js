import { NextResponse } from "next/server";
import { sendFeedbackEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        // Basic protection: User should be logged in, though requirement says "any user", usually implies logged in users in profile section.
        // If the user is reporting from profile section, they are likely logged in.

        const body = await req.json();
        const { message, type } = body;

        if (!message) {
            return NextResponse.json(
                { message: "Message is required" },
                { status: 400 }
            );
        }

        const userName = session?.user?.name || body.userName || "Anonymous";
        const userEmail = session?.user?.email || body.userEmail || "anonymous@example.com";

        await sendFeedbackEmail({
            userName,
            userEmail,
            message,
            type: type || "feedback"
        });

        return NextResponse.json(
            { message: "Feedback sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Feedback API Error:", error);
        return NextResponse.json(
            { message: "Failed to send feedback" },
            { status: 500 }
        );
    }
}
