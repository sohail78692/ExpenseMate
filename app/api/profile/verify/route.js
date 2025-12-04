import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import nodemailer from "nodemailer";

const ADMIN_EMAIL = "sohail786akh@gmail.com";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({
                message: "Account is already verified"
            }, { status: 400 });
        }

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Generate verification link - use production URL or detect from request
        const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get('host')}`;
        const verificationLink = `${baseUrl}/api/profile/verify-approve?userId=${user._id}&token=${Buffer.from(user._id.toString()).toString('base64')}`;

        // Email to admin
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ADMIN_EMAIL,
            subject: `New Verification Request - ${user.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Account Verification Request</h2>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Name:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
                        <p><strong>Account Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p>Click the button below to verify this account:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #4CAF50; 
                                  color: white; 
                                  padding: 12px 30px; 
                                  text-decoration: none; 
                                  border-radius: 5px;
                                  display: inline-block;
                                  font-weight: bold;">
                            Verify Account
                        </a>
                    </div>
                    <p style="color: #666; font-size: 12px;">
                        Or copy and paste this link in your browser:<br>
                        <a href="${verificationLink}">${verificationLink}</a>
                    </p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 11px;">
                        This is an automated email from ExpenseMate. 
                        If you did not expect this email, please ignore it.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            message: "Verification request sent successfully! You will be notified once approved."
        });
    } catch (error) {
        console.error("Verification Request Error:", error);
        return NextResponse.json({
            message: "Error sending verification request"
        }, { status: 500 });
    }
}
