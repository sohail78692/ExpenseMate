"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
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
        <div className="min-h-screen bg-[#030712] text-zinc-100 relative overflow-x-hidden selection:bg-[#0A84FF] selection:text-white font-sans antialiased">
            {/* Ambient Background Radial Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-b from-[#0A84FF]/14 via-[#5E5CE6]/6 to-transparent blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute top-[35%] -left-48 w-[520px] h-[520px] bg-[#64D2FF]/6 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute top-[65%] -right-48 w-[520px] h-[520px] bg-[#0A84FF]/6 blur-[150px] rounded-full pointer-events-none" />
                {/* Subtle Grid Accent */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            </div>

            <div className={`relative z-10 flex min-h-screen ${isAuthPage ? "w-full" : ""}`}>
                {!isAuthPage && <Sidebar />}
                <main className={`flex-1 min-w-0 ${!isAuthPage ? "p-3 sm:p-6 lg:p-8 pb-28 md:pb-8" : "w-full min-h-screen"}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
