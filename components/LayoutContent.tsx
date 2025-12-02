"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import React from "react";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname === "/" ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            {!isAuthPage && <Sidebar />}
            <main className={`flex-1 ${!isAuthPage ? "p-4 md:p-8 mb-16 md:mb-0" : ""}`}>
                {children}
            </main>
        </div>
    );
}
