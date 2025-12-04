"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Something went wrong. Please try again.");
                setIsLoading(false);
                return;
            }

            setSuccess(true);
            setEmail("");
        } catch (error) {
            console.error("Error:", error);
            setError("Unable to send reset instructions. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
            <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-white/10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white">Forgot Password?</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your email address and we&apos;ll send you instructions to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-200 mb-1">Check your email!</p>
                                    <p className="text-sm text-green-200/80">
                                        We&apos;ve sent password reset instructions to your email address.
                                        Please check your inbox and follow the link to reset your password.
                                    </p>
                                </div>
                            </div>
                            <div className="text-center text-sm text-slate-400">
                                <p>Didn&apos;t receive the email? Check your spam folder or try again.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-200">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Instructions"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        href="/login"
                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
