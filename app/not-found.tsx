import React from "react";
import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/85 dark:bg-[#0d1224]/80 backdrop-blur-2xl border border-white/95 dark:border-white/10 shadow-2xl text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                    <Compass className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider uppercase text-[#0A84FF]">
                        404 Not Found
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Page not found
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                        The requested page could not be located. It may have moved or no longer exists.
                    </p>
                </div>

                <div className="pt-2">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#0A84FF] hover:bg-[#0071E3] text-white shadow-[0_4px_16px_rgba(10,132,255,0.35)] transition-all"
                    >
                        <Home className="w-4 h-4" />
                        <span>Return to Dashboard</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

