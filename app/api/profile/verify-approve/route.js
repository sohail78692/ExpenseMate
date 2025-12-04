import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const token = searchParams.get("token");

        if (!userId || !token) {
            return new Response(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Request</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        .error { color: #f44336; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="error">❌ Invalid Request</h1>
                        <p>The verification link is invalid or expired.</p>
                    </div>
                </body>
                </html>
                `,
                { headers: { "Content-Type": "text/html" } }
            );
        }

        // Verify token
        const expectedToken = Buffer.from(userId).toString('base64');
        if (token !== expectedToken) {
            return new Response(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Token</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        .error { color: #f44336; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="error">❌ Invalid Token</h1>
                        <p>The verification token is invalid.</p>
                    </div>
                </body>
                </html>
                `,
                { headers: { "Content-Type": "text/html" } }
            );
        }

        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            return new Response(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>User Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        .error { color: #f44336; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="error">❌ User Not Found</h1>
                        <p>The user account could not be found.</p>
                    </div>
                </body>
                </html>
                `,
                { headers: { "Content-Type": "text/html" } }
            );
        }

        if (user.isVerified) {
            return new Response(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Already Verified</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        .info { color: #2196F3; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="info">ℹ️ Already Verified</h1>
                        <p>This account has already been verified.</p>
                        <p><strong>${user.name}</strong> (${user.email})</p>
                    </div>
                </body>
                </html>
                `,
                { headers: { "Content-Type": "text/html" } }
            );
        }

        // Update user verification status
        user.isVerified = true;
        await user.save();

        // Send confirmation email to user
        try {
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: '🎉 Your ExpenseMate Account is Verified!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4CAF50;">Account Verified Successfully!</h2>
                        <p>Hi ${user.name},</p>
                        <p>Great news! Your ExpenseMate account has been verified.</p>
                        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>✓ Verified Account Benefits:</strong></p>
                            <ul style="margin: 10px 0;">
                                <li>Full access to all features</li>
                                <li>Priority support</li>
                                <li>Verified badge on your profile</li>
                            </ul>
                        </div>
                        <p>You can now enjoy all the features of ExpenseMate!</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXTAUTH_URL}/profile" 
                               style="background-color: #4CAF50; 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px;
                                      display: inline-block;
                                      font-weight: bold;">
                                View Your Profile
                            </a>
                        </div>
                        <p>Thank you for using ExpenseMate!</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 11px;">
                            This is an automated email from ExpenseMate.
                        </p>
                    </div>
                `,
            });
        } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
        }

        return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Account Verified</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        margin: 0; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container { 
                        background: white; 
                        padding: 40px; 
                        border-radius: 10px; 
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
                        text-align: center;
                        max-width: 500px;
                    }
                    .success { color: #4CAF50; }
                    .checkmark {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        display: block;
                        stroke-width: 2;
                        stroke: #4CAF50;
                        stroke-miterlimit: 10;
                        margin: 10px auto;
                        box-shadow: inset 0px 0px 0px #4CAF50;
                        animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                    }
                    .checkmark__circle {
                        stroke-dasharray: 166;
                        stroke-dashoffset: 166;
                        stroke-width: 2;
                        stroke-miterlimit: 10;
                        stroke: #4CAF50;
                        fill: none;
                        animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                    }
                    .checkmark__check {
                        transform-origin: 50% 50%;
                        stroke-dasharray: 48;
                        stroke-dashoffset: 48;
                        animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                    }
                    @keyframes stroke {
                        100% { stroke-dashoffset: 0; }
                    }
                    @keyframes scale {
                        0%, 100% { transform: none; }
                        50% { transform: scale3d(1.1, 1.1, 1); }
                    }
                    @keyframes fill {
                        100% { box-shadow: inset 0px 0px 0px 30px #4CAF50; }
                    }
                    .user-info {
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                    <h1 class="success">✓ Account Verified!</h1>
                    <div class="user-info">
                        <p><strong>${user.name}</strong></p>
                        <p>${user.email}</p>
                    </div>
                    <p>The account has been successfully verified.</p>
                    <p>A confirmation email has been sent to the user.</p>
                </div>
            </body>
            </html>
            `,
            { headers: { "Content-Type": "text/html" } }
        );
    } catch (error) {
        console.error("Verification Approval Error:", error);
        return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                    .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                    .error { color: #f44336; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="error">❌ Error</h1>
                    <p>An error occurred while verifying the account.</p>
                    <p>Please try again later.</p>
                </div>
            </body>
            </html>
            `,
            { headers: { "Content-Type": "text/html" } }
        );
    }
}
