"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("ExpenseMate Global Root Error:", error);
    }, [error]);

    return (
        <html lang="en">
            <body className="min-h-screen bg-[#030712] text-zinc-100 flex items-center justify-center p-4 font-sans antialiased">
                <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0d1224]/85 backdrop-blur-2xl border border-white/10 shadow-2xl text-center space-y-5">
                    <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)]">
                        <AlertOctagon className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            Application Error
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                            A critical error occurred while rendering the application root. Please reload or restart the application.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="w-full px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#0A84FF] hover:bg-[#0071E3] text-white shadow-[0_4px_16px_rgba(10,132,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reload Application</span>
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}

