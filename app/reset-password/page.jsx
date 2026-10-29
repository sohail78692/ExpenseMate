"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GlassButton, glassStyles } from "@/components/ui/sign-up";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";

export const dynamic = 'force-dynamic';

function ResetPasswordContent() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }

        if (!token) {
            setError("Invalid reset link. Please request a new password reset.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to reset password. Please try again.");
                setIsLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2500);
        } catch (err) {
            console.error("Reset password error:", err);
            setError("Something went wrong. Please try again later.");
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="relative z-10 w-full max-w-[390px] rounded-3xl border border-white/20 bg-black/25 backdrop-blur-xl p-6 sm:p-7 shadow-2xl overflow-hidden my-auto text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-serif font-light text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        Invalid Reset Link
                    </h2>
                    <p className="text-xs text-zinc-200/90 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                </div>
                <div className="pt-2">
                    <Link href="/forgot-password" className="block w-full">
                        <GlassButton size="default" className="w-full">
                            Request New Reset Link
                        </GlassButton>
                    </Link>
                </div>
                <div className="pt-2">
                    <Link
                        href="/login"
                        className="text-sky-300 hover:text-sky-200 active:scale-95 transition-transform inline-flex items-center gap-1.5 font-bold text-xs underline-offset-4 hover:underline drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Login</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full max-w-[390px] rounded-3xl border border-white/20 bg-black/25 backdrop-blur-xl p-6 sm:p-7 shadow-2xl overflow-hidden my-auto">
            <div className="w-full text-center space-y-1 mb-5">
                <h2 className="font-serif font-light text-2xl sm:text-3xl tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    Reset Password
                </h2>
                <p className="text-xs sm:text-sm font-medium text-zinc-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                    Enter your new password below to secure your account.
                </p>
            </div>

            {success ? (
                <div className="space-y-4 text-center py-2">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="font-semibold text-base text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                            Password Reset Successful!
                        </h3>
                        <p className="text-xs text-zinc-200/90 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                            Your password has been updated. Redirecting you to sign in...
                        </p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="w-full space-y-3.5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] pl-2">
                            New Password
                        </label>
                        <div className="glass-input-wrap w-full">
                            <div className="glass-input">
                                <span className="glass-input-text-area"></span>
                                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                    <Lock className="h-4 w-4 text-zinc-300" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="relative z-10 h-9 w-0 flex-grow bg-transparent text-white placeholder:text-zinc-300/80 focus:outline-none text-sm pr-2"
                                />
                                <button
                                    type="button"
                                    aria-label="Toggle password visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="relative z-10 pr-3 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] pl-2">
                            Confirm New Password
                        </label>
                        <div className="glass-input-wrap w-full">
                            <div className="glass-input">
                                <span className="glass-input-text-area"></span>
                                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                    <Lock className="h-4 w-4 text-zinc-300" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="relative z-10 h-9 w-0 flex-grow bg-transparent text-white placeholder:text-zinc-300/80 focus:outline-none text-sm pr-2"
                                />
                                <button
                                    type="button"
                                    aria-label="Toggle confirm password visibility"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="relative z-10 pr-3 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs shadow-lg">
                            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="leading-relaxed font-medium">{error}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <GlassButton
                            type="submit"
                            size="default"
                            disabled={isLoading}
                            className="w-full"
                            contentClassName="w-full flex items-center justify-center gap-2 font-semibold"
                        >
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Resetting Password...</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    <span>Reset Password</span>
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </GlassButton>
                    </div>
                </form>
            )}

            <div className="w-full text-center mt-5 pt-3 border-t border-white/10">
                <Link
                    href="/login"
                    className="text-sky-300 hover:text-sky-200 active:scale-95 transition-transform inline-flex items-center gap-1.5 font-bold text-xs underline-offset-4 hover:underline drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="dark bg-[#030712] text-white min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4">
            <style>{glassStyles}</style>

            <Link
                href="/"
                className="fixed top-4 left-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
            </Link>

            <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                </div>
            }>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
