import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { message: "No account found with this email address" },
                { status: 404 }
            );
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Save token to user
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send email
        try {
            // Get base URL from request or environment
            const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get('host')}`;
            await sendPasswordResetEmail(email, resetToken, baseUrl);
            console.log(`Password reset email sent to ${email}`);

            return NextResponse.json({
                message: "Password reset instructions have been sent to your email"
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);

            // Still log the token for development/testing
            console.log(`Password reset requested for ${email}`);
            console.log(`Reset token: ${resetToken}`);
            console.log(`Reset link: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

            return NextResponse.json(
                {
                    message: "Email service is not configured. Please contact support.",
                    // In development, include the link
                    ...(process.env.NODE_ENV === "development" && {
                        devLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
                    })
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { message: "Error processing your request" },
            { status: 500 }
        );
    }
}
