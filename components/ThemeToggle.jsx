"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme !== "light";

    const toggle = () => {
        setTheme(isDark ? "light" : "dark");
    };

    // Avoid hydration mismatch — render matching placeholder until mounted
    if (!mounted) {
        return (
            <div
                aria-hidden="true"
                className="w-12 sm:w-13 h-7.5 sm:h-8 rounded-full bg-zinc-200/70 dark:bg-white/[0.06] border border-zinc-300/70 dark:border-white/[0.1] shrink-0"
            />
        );
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={!isDark}
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
                "relative inline-flex items-center justify-between w-12 sm:w-13 h-7.5 sm:h-8 p-1 rounded-full shrink-0 transition-all duration-300 cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]",
                isDark
                    ? "bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]"
                    : "bg-zinc-200/80 hover:bg-zinc-200 border border-zinc-300/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
            )}
        >
            {/* Background track icons */}
            <span className="flex items-center justify-center w-5 h-5 z-10 pointer-events-none">
                <Sun
                    className={cn(
                        "w-3 h-3 transition-all duration-300",
                        !isDark ? "text-amber-500 scale-110" : "text-zinc-500 scale-90 opacity-60"
                    )}
                />
            </span>
            <span className="flex items-center justify-center w-5 h-5 z-10 pointer-events-none">
                <Moon
                    className={cn(
                        "w-3 h-3 transition-all duration-300",
                        isDark ? "text-[#64D2FF] scale-110" : "text-zinc-400 scale-90 opacity-70"
                    )}
                />
            </span>

            {/* Sliding thumb */}
            <span
                aria-hidden="true"
                className={cn(
                    "absolute top-1 left-1 w-5.5 sm:w-5.5 h-5.5 sm:h-6 rounded-full transition-transform duration-300 ease-out shadow-sm",
                    isDark
                        ? "translate-x-[18px] sm:translate-x-[22px] bg-[#0A84FF]/25 border border-[#64D2FF]/45 shadow-[0_0_10px_rgba(10,132,255,0.4)]"
                        : "translate-x-0 bg-white border border-amber-300/60 shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                )}
            />
        </button>
    );
}
