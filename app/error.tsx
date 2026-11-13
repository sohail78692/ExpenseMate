"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error details for diagnostics
        console.error("ExpenseMate Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/85 dark:bg-[#0d1224]/80 backdrop-blur-2xl border border-white/95 dark:border-white/10 shadow-2xl text-center space-y-5">
                {/* Ambient glow badge */}
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    <AlertTriangle className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Something went wrong
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                        An unexpected error occurred while loading this view. You can retry the operation or return to your dashboard.
                    </p>
                </div>

                {error?.digest && (
                    <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate">
                        Digest: {error.digest}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#0A84FF] hover:bg-[#0071E3] text-white shadow-[0_4px_16px_rgba(10,132,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Try Again</span>
                    </button>
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

