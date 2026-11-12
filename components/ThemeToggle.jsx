"use client";

import * as React from "react";
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

    // Avoid hydration mismatch — render matching frosted glass placeholder until mounted
    if (!mounted) {
        return (
            <div
                aria-hidden="true"
                className="w-13 sm:w-15 h-7 sm:h-8 rounded-full backdrop-blur-xl bg-sky-200/70 dark:bg-white/[0.06] border border-sky-300/60 dark:border-white/20 shrink-0"
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
                "group relative flex items-center w-13 sm:w-15 h-7 sm:h-8 p-[3px] rounded-full overflow-hidden shrink-0 border backdrop-blur-xl backdrop-saturate-200 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]",
                isDark
                    ? "border-white/20 hover:border-white/30 bg-gradient-to-b from-[#0C142B]/90 via-[#132043]/85 to-[#1B2F60]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1.5px_3px_rgba(0,0,0,0.65),0_2px_10px_rgba(0,0,0,0.4)]"
                    : "border-sky-400/55 hover:border-sky-500/70 bg-gradient-to-b from-[#5EC2FF]/90 via-[#7AD0FF]/85 to-[#A8E4FF]/90 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85),inset_0_-1.5px_3px_rgba(2,132,199,0.2),0_2px_10px_rgba(56,189,248,0.25)]"
            )}
        >
            {/* Subtle full-capsule glass glaze (follows outer curve seamlessly, no hard edges) */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-transparent to-black/10"
            />

            {/* Crisp SVG night sky stars (left half) */}
            <svg
                aria-hidden="true"
                viewBox="0 0 26 24"
                fill="none"
                className={cn(
                    "pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 w-5.5 sm:w-6 h-5 sm:h-6 transition-all duration-300",
                    isDark ? "opacity-100 scale-100" : "opacity-0 scale-75"
                )}
            >
                {/* 4-point sparkle star */}
                <path
                    d="M9 6.5L9.75 9.25L12.5 10L9.75 10.75L9 13.5L8.25 10.75L5.5 10L8.25 9.25L9 6.5Z"
                    fill="#E0F2FE"
                />
                <circle cx="17.5" cy="7" r="1" fill="#FFFFFF" fillOpacity="0.85" />
                <circle cx="15" cy="16" r="1.2" fill="#BAE6FD" fillOpacity="0.9" />
                <circle cx="5.5" cy="16.5" r="0.75" fill="#FFFFFF" fillOpacity="0.65" />
            </svg>

            {/* Unified seamless SVG cloud silhouette (right half) */}
            <svg
                aria-hidden="true"
                viewBox="0 0 28 18"
                fill="none"
                className={cn(
                    "pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-5.5 sm:w-6.5 h-3.5 sm:h-4 transition-all duration-300 drop-shadow-[0_1px_2px_rgba(14,116,144,0.18)]",
                    isDark ? "opacity-0 translate-x-1" : "opacity-95 translate-x-0"
                )}
            >
                <path
                    d="M7.5 15H21.2C23.57 15 25.5 13.12 25.5 10.8C25.5 8.63 23.81 6.84 21.65 6.62C21.02 3.84 18.51 1.75 15.5 1.75C12.22 1.75 9.52 4.24 9.21 7.42C8.92 7.34 8.62 7.3 8.3 7.3C6.15 7.3 4.4 9.03 4.4 11.15C4.4 13.28 6.15 15 7.5 15Z"
                    fill="white"
                />
            </svg>

            {/* 3D Liquid-Glass Celestial Orb (Moon / Sun) */}
            <span
                aria-hidden="true"
                className={cn(
                    "relative z-10 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isDark
                        ? "translate-x-6 sm:translate-x-7 bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(71,85,105,0.35),0_2px_6px_rgba(0,0,0,0.45),0_0_10px_rgba(224,242,254,0.35)]"
                        : "translate-x-0 bg-gradient-to-br from-[#FFF3B0] via-[#FDB813] to-[#F97316] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(194,65,12,0.35),0_2px_6px_rgba(245,158,11,0.45),0_0_10px_rgba(253,224,71,0.65)]"
                )}
            >
                {/* Radial specular glass highlight on top-left curve of the orb */}
                <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.75),transparent_58%)]" />

                {/* Subtle lunar craters (Moon state only) */}
                <span
                    className={cn(
                        "absolute top-1.5 left-1 sm:top-2 sm:left-1.5 w-1.5 h-1.5 rounded-full bg-slate-400/40 shadow-[inset_0_0.5px_1px_rgba(51,65,85,0.3)] transition-opacity duration-300",
                        isDark ? "opacity-100" : "opacity-0"
                    )}
                />
                <span
                    className={cn(
                        "absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-1 h-1 rounded-full bg-slate-400/35 shadow-[inset_0_0.5px_1px_rgba(51,65,85,0.25)] transition-opacity duration-300",
                        isDark ? "opacity-100" : "opacity-0"
                    )}
                />
            </span>
        </button>
    );
}
