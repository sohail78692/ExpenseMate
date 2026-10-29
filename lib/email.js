import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

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

    // Ensure baseUrl has no trailing slash to prevent double slashes (e.g., http://localhost:3000//reset-password)
    const cleanBaseUrl = (baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${cleanBaseUrl}/reset-password?token=${resetToken}`;
    const currentYear = new Date().getFullYear();

    // Check for inline logo attachment
    const logoPath = path.join(process.cwd(), "public", "email-logo.png");
    const hasLogoFile = fs.existsSync(logoPath);

    const attachments = hasLogoFile
        ? [
              {
                  filename: "email-logo.png",
                  path: logoPath,
                  cid: "expense-mate-logo",
              },
          ]
        : [];

    const mailOptions = {
        from: `"ExpenseMate" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Reset your ExpenseMate password",
        html: `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="color-scheme" content="dark" />
                <meta name="supported-color-schemes" content="dark" />
                <title>Reset Your Password - ExpenseMate</title>
                <style type="text/css">
                    /* Client-specific Resets */
                    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
                    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #030712; }
                    
                    /* Hover effects for capable email clients */
                    .btn-hover:hover {
                        background-color: #0077ED !important;
                        box-shadow: 0 6px 24px rgba(10, 132, 255, 0.5) !important;
                    }
                    .link-hover:hover {
                        text-decoration: underline !important;
                        color: #64D2FF !important;
                    }

                    @media only screen and (max-width: 600px) {
                        .email-container {
                            width: 100% !important;
                            max-width: 100% !important;
                            border-radius: 16px !important;
                        }
                        .content-padding {
                            padding: 24px 18px 30px 18px !important;
                        }
                        .header-padding {
                            padding: 28px 18px 16px 18px !important;
                        }
                        .btn-link {
                            padding: 13px 28px !important;
                            font-size: 14px !important;
                        }
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f1f5f9;">
                
                <!-- Main Background Table -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030712; padding: 32px 10px 44px 10px;">
                    <tr>
                        <td align="center">
                            
                            <!-- Email Card Wrapper (max 540px) -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 540px; background-color: #090e1c; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(10, 132, 255, 0.08);">
                                
                                <!-- Top Accent Neon Lightbar -->
                                <tr>
                                    <td style="height: 4px; background: linear-gradient(90deg, #0A84FF 0%, #64D2FF 50%, #5E5CE6 100%); line-height: 4px; font-size: 1px;">&nbsp;</td>
                                </tr>

                                <!-- Header Area with Brand Identity -->
                                <tr>
                                    <td align="center" class="header-padding" style="padding: 36px 40px 22px 40px; background: radial-gradient(ellipse at 50% 0%, rgba(10, 132, 255, 0.16) 0%, transparent 75%);">
                                        
                                        <!-- Brand Identity Lockup: Icon + Typography -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 16px auto;">
                                            <tr>
                                                <td valign="middle" style="padding-right: 11px;">
                                                    ${
                                                        hasLogoFile
                                                            ? `<img src="cid:expense-mate-logo" alt="ExpenseMate" width="38" height="38" style="display: block; width: 38px; height: 38px; border-radius: 11px; box-shadow: 0 4px 16px rgba(10, 132, 255, 0.35); border: 0; outline: none;" />`
                                                            : `<div style="width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg, #0A84FF 0%, #0055B3 100%); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 16px rgba(10, 132, 255, 0.35); text-align: center; line-height: 38px; color: #ffffff; font-weight: bold; font-size: 18px;">E</div>`
                                                    }
                                                </td>
                                                <td valign="middle">
                                                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; font-size: 21px; font-weight: 700; letter-spacing: -0.5px; color: #ffffff; line-height: 1;">
                                                        Expense<span style="color: #0A84FF;">Mate</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Subtitle Pill Tag -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                                            <tr>
                                                <td align="center" style="padding: 4px 13px; background-color: rgba(10, 132, 255, 0.12); border: 1px solid rgba(10, 132, 255, 0.28); border-radius: 100px;">
                                                    <span style="color: #64D2FF; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: block; line-height: 14px;">
                                                        Security &bull; Password Recovery
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Content Body Area -->
                                <tr>
                                    <td class="content-padding" style="padding: 8px 40px 36px 40px;">
                                        
                                        <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.4px; text-align: center;">
                                            Reset your password
                                        </h1>

                                        <p style="margin: 0 0 28px 0; color: #94a3b8; font-size: 14px; line-height: 1.65; text-align: center;">
                                            We received a request to reset your ExpenseMate password. Click the secure button below to choose a new password and regain access to your financial workspace.
                                        </p>

                                        <!-- Primary Call to Action Button -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td align="center" style="padding: 10px 0 28px 0;">
                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                                                        <tr>
                                                            <td align="center" bgcolor="#0071E3" style="border-radius: 50px; background-color: #0071E3; background-image: linear-gradient(180deg, #0A84FF 0%, #0066CC 100%); box-shadow: 0 4px 18px rgba(10, 132, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.25);">
                                                                <a href="${resetUrl}" target="_blank" class="btn-hover btn-link" style="display: inline-block; padding: 14px 36px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 50px; letter-spacing: -0.2px; text-shadow: 0 1px 2px rgba(0,0,0,0.25); white-space: nowrap; line-height: 1.2; -webkit-text-size-adjust: none;">
                                                                    Reset Password &rarr;
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Expiry Notice (Obsidian Glass Box) -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 16px; margin-bottom: 22px;">
                                            <tr>
                                                <td style="padding: 16px 18px;">
                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td width="28" valign="top" style="font-size: 18px; line-height: 1.3; padding-right: 10px;">
                                                                ⏱️
                                                            </td>
                                                            <td style="color: #cbd5e1; font-size: 13px; line-height: 1.5;">
                                                                <strong style="color: #f8fafc; display: block; font-size: 13px; margin-bottom: 2px;">
                                                                    Expires in 60 minutes
                                                                </strong>
                                                                For your protection, this single-use security link is only valid for 1 hour. If it expires, you can request a new one at any time.
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Fallback Link Card -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050812; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; margin-bottom: 24px;">
                                            <tr>
                                                <td style="padding: 14px 16px;">
                                                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 500; color: #64748b;">
                                                        Having trouble with the button? Copy and paste this URL:
                                                    </p>
                                                    <a href="${resetUrl}" class="link-hover" style="color: #38bdf8; font-size: 12px; line-height: 1.5; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-decoration: none; word-break: break-all; display: block;">
                                                        ${resetUrl}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Did not request notice -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="24" valign="top" style="font-size: 15px; line-height: 1.3; padding-right: 8px;">
                                                    🛡️
                                                </td>
                                                <td style="color: #64748b; font-size: 12px; line-height: 1.6;">
                                                    <strong style="color: #94a3b8;">Didn&apos;t request this reset?</strong> No action is needed. You can safely ignore this email &mdash; your password remains unchanged and your account is secure.
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Subtle Divider -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px; margin-bottom: 20px;">
                                            <tr>
                                                <td style="border-top: 1px solid rgba(255, 255, 255, 0.06); height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td>
                                            </tr>
                                        </table>

                                        <!-- Footer Text -->
                                        <p style="margin: 0 0 6px 0; color: #64748b; font-size: 12px; text-align: center; font-weight: 500;">
                                            ExpenseMate &bull; Smarter Spending, Brighter Tomorrow
                                        </p>
                                        <p style="margin: 0; color: #475569; font-size: 11px; text-align: center;">
                                            This is an automated security transmission. Please do not reply directly.<br/>
                                            &copy; ${currentYear} ExpenseMate. All rights reserved.
                                        </p>

                                    </td>
                                </tr>

                            </table>
                            <!-- End Email Card Wrapper -->

                        </td>
                    </tr>
                </table>
                <!-- End Main Background Table -->

            </body>
            </html>
        `,
        attachments,
        text: `
ExpenseMate — Password Reset Request

Hello,

We received a request to reset your ExpenseMate password.

Use the link below to set a new password:
${resetUrl}

⏱️ IMPORTANT: This single-use link expires in 60 minutes for security reasons.

If you did not request this password reset, please ignore this email. Your credentials remain safe and unchanged.

---
ExpenseMate • Smarter Spending, Brighter Tomorrow
© ${currentYear} ExpenseMate. All rights reserved.
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

export const sendFeedbackEmail = async (feedbackData) => {
    const transporter = createTransporter();
    const { userName, userEmail, message, type } = feedbackData;
    const currentYear = new Date().getFullYear();

    const subject = type === "issue"
        ? `🚨 Issue Report from ${userName}`
        : `💬 Feedback from ${userName}`;

    const mailOptions = {
        from: `"ExpenseMate" <${process.env.EMAIL_USER}>`,
        to: "sohail786akh@gmail.com",
        replyTo: userEmail,
        subject: subject,
        html: `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${subject}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030712; padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #090e1c; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; overflow: hidden;">
                                <tr>
                                    <td style="height: 4px; background: linear-gradient(90deg, #0A84FF, #64D2FF); font-size: 1px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px 32px;">
                                        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px;">
                                            ${type === "issue" ? "🚨 Issue Report" : "💬 New Feedback"}
                                        </h2>
                                        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
                                            <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;"><strong style="color: #ffffff;">From:</strong> ${userName} (${userEmail})</p>
                                            <p style="margin: 0; font-size: 13px; color: #94a3b8;"><strong style="color: #ffffff;">Type:</strong> ${type}</p>
                                        </div>
                                        <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #cbd5e1;">Message Content:</p>
                                        <div style="background-color: #050812; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; color: #f1f5f9; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                                        <p style="margin: 24px 0 0 0; font-size: 11px; color: #64748b; text-align: center;">
                                            Sent via ExpenseMate Feedback System &bull; &copy; ${currentYear}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        text: `
${type === "issue" ? "ISSUE REPORT" : "FEEDBACK"}
------------------------------------------------
From: ${userName} (${userEmail})
Type: ${type}

Message:
${message}
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending feedback email:", error);
        throw new Error("Failed to send feedback email");
    }
};
