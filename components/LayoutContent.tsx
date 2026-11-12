"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import React from "react";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname === "/" ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");

    return (
        <div className={`min-h-screen relative overflow-x-hidden selection:bg-[#0A84FF] selection:text-white font-sans antialiased transition-colors duration-300 ${isAuthPage ? "dark bg-[#030712] text-zinc-100" : "bg-zinc-50 dark:bg-[#030712] text-zinc-900 dark:text-zinc-100"}`}>
            {/* Ambient Background Radial Glows — dark mode only */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden dark:block hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-b from-[#0A84FF]/14 via-[#5E5CE6]/6 to-transparent blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute top-[35%] -left-48 w-[520px] h-[520px] bg-[#64D2FF]/6 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute top-[65%] -right-48 w-[520px] h-[520px] bg-[#0A84FF]/6 blur-[150px] rounded-full pointer-events-none" />
                {/* Subtle Grid Accent */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            </div>

            {/* Light mode subtle background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden block dark:hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-b from-[#0A84FF]/[0.06] via-[#5E5CE6]/[0.03] to-transparent blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute top-[35%] -left-48 w-[520px] h-[520px] bg-[#64D2FF]/[0.04] blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute top-[65%] -right-48 w-[520px] h-[520px] bg-[#0A84FF]/[0.04] blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            </div>

            <div className={`relative z-10 min-h-screen ${isAuthPage ? "w-full" : "flex flex-col"}`}>
                {!isAuthPage && <Navbar />}
                <main className={`flex-1 min-w-0 ${!isAuthPage ? "pt-22 sm:pt-24 lg:pt-24 pb-28 sm:pb-24 lg:pb-10 px-3.5 sm:px-6 lg:px-8 xl:px-10 w-full" : "w-full min-h-screen"}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
