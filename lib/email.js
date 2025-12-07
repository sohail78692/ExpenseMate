import nodemailer from "nodemailer";

// Create transporter using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Send password reset email
export const sendPasswordResetEmail = async (to, resetToken, baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000') => {
    const transporter = createTransporter();

    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"ExpenseMate" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🔐 Password Reset Request - ExpenseMate",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #1f2937;
                        background-color: #f3f4f6;
                    }
                    .email-wrapper {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 50px 40px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .header::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                        animation: pulse 15s infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 0.5; }
                        50% { transform: scale(1.1); opacity: 0.8; }
                    }
                    .header h1 {
                        margin: 0;
                        color: #ffffff;
                        font-size: 36px;
                        font-weight: 700;
                        letter-spacing: -0.5px;
                        position: relative;
                        z-index: 1;
                    }
                    .header p {
                        margin: 10px 0 0;
                        color: rgba(255, 255, 255, 0.95);
                        font-size: 18px;
                        font-weight: 500;
                        position: relative;
                        z-index: 1;
                    }
                    .lock-icon {
                        width: 60px;
                        height: 60px;
                        margin: 0 auto 20px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .content {
                        padding: 50px 40px;
                        background: #ffffff;
                    }
                    .greeting {
                        font-size: 24px;
                        font-weight: 600;
                        color: #1f2937;
                        margin: 0 0 20px;
                    }
                    .message {
                        font-size: 16px;
                        color: #4b5563;
                        margin: 0 0 30px;
                        line-height: 1.7;
                    }
                    .button-wrapper {
                        text-align: center;
                        margin: 40px 0;
                    }
                    .reset-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #ffffff;
                        text-decoration: none;
                        padding: 16px 48px;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 16px;
                        box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
                        transition: all 0.3s ease;
                    }
                    .reset-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 15px 30px -5px rgba(102, 126, 234, 0.5);
                    }
                    .divider {
                        margin: 30px 0;
                        text-align: center;
                        position: relative;
                    }
                    .divider::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 0;
                        right: 0;
                        height: 1px;
                        background: linear-gradient(to right, transparent, #e5e7eb, transparent);
                    }
                    .divider span {
                        background: #ffffff;
                        padding: 0 15px;
                        color: #9ca3af;
                        font-size: 14px;
                        position: relative;
                        z-index: 1;
                    }
                    .link-box {
                        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                        padding: 20px;
                        border-radius: 12px;
                        border: 2px dashed #d1d5db;
                        margin: 20px 0;
                    }
                    .link-box p {
                        margin: 0 0 10px;
                        font-size: 14px;
                        color: #6b7280;
                        font-weight: 500;
                    }
                    .reset-link {
                        display: block;
                        color: #667eea;
                        word-break: break-all;
                        font-size: 13px;
                        text-decoration: none;
                        font-family: 'Courier New', monospace;
                    }
                    .warning-box {
                        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                        border-left: 4px solid #f59e0b;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 30px 0;
                        display: flex;
                        align-items: start;
                        gap: 15px;
                    }
                    .warning-icon {
                        font-size: 24px;
                        flex-shrink: 0;
                    }
                    .warning-content {
                        flex: 1;
                    }
                    .warning-content strong {
                        display: block;
                        color: #92400e;
                        font-size: 15px;
                        margin-bottom: 5px;
                    }
                    .warning-content p {
                        margin: 0;
                        color: #78350f;
                        font-size: 14px;
                        line-height: 1.6;
                    }
                    .info-box {
                        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                        padding: 20px;
                        border-radius: 12px;
                        margin: 30px 0;
                        border-left: 4px solid #3b82f6;
                    }
                    .info-box p {
                        margin: 0;
                        color: #1e40af;
                        font-size: 14px;
                        line-height: 1.6;
                    }
                    .footer {
                        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                        padding: 40px;
                        text-align: center;
                    }
                    .footer p {
                        margin: 0 0 10px;
                        color: #9ca3af;
                        font-size: 14px;
                    }
                    .footer p:last-child {
                        margin: 0;
                        color: #6b7280;
                        font-size: 13px;
                    }
                    .footer a {
                        color: #a78bfa;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="email-wrapper">
                    <!-- Header -->
                    <div class="header">
                        <div class="lock-icon">🔐</div>
                        <h1>ExpenseMate</h1>
                        <p>Password Reset Request</p>
                    </div>
                    
                    <!-- Content -->
                    <div class="content">
                        <h2 class="greeting">Hello there! 👋</h2>
                        
                        <p class="message">
                            We received a request to reset the password for your ExpenseMate account. 
                            No worries, it happens to the best of us!
                        </p>
                        
                        <p class="message">
                            Click the button below to create a new password:
                        </p>
                        
                        <!-- Reset Button -->
                        <div class="button-wrapper">
                            <a href="${resetUrl}" class="reset-button">
                                Reset My Password
                            </a>
                        </div>
                        
                        <!-- Divider -->
                        <div class="divider">
                            <span>Or use this link</span>
                        </div>
                        
                        <!-- Link Box -->
                        <div class="link-box">
                            <p>Copy and paste this URL into your browser:</p>
                            <a href="${resetUrl}" class="reset-link">${resetUrl}</a>
                        </div>
                        
                        <!-- Warning Box -->
                        <div class="warning-box">
                            <div class="warning-icon">⏰</div>
                            <div class="warning-content">
                                <strong>Important - Time Sensitive!</strong>
                                <p>This password reset link will expire in 1 hour for security reasons. If it expires, you'll need to request a new one.</p>
                            </div>
                        </div>
                        
                        <!-- Info Box -->
                        <div class="info-box">
                            <p>
                                <strong>ℹ️ Didn't request this?</strong><br>
                                No problem! You can safely ignore this email. Your password will remain unchanged and your account is secure.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p>This is an automated email from ExpenseMate.</p>
                        <p>Please do not reply to this email.</p>
                        <p style="margin-top: 20px;">&copy; 2025 ExpenseMate. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
ExpenseMate - Password Reset Request

Hello!

We received a request to reset the password for your ExpenseMate account.

Click this link to reset your password:
${resetUrl}

⏰ IMPORTANT: This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
This is an automated email from ExpenseMate.
© 2025 ExpenseMate. All rights reserved.
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        console.log("Email sent to:", to);
        console.log("Email from:", process.env.EMAIL_USER);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error response:", error.response);
        console.error("Recipient:", to);
        console.error("Sender:", process.env.EMAIL_USER);
        console.error("Full error:", error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
