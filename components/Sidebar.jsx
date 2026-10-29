"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Receipt,
    PieChart,
    User,
    LogOut,
    Wallet,
    Target,
    Plus,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expenses", label: "Expenses", icon: Receipt },
    { href: "/budgets", label: "Budgets", icon: Wallet },
    { href: "/savings", label: "Savings", icon: Target },
    { href: "/analytics", label: "Analytics", icon: PieChart },
    { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const userName = session?.user?.name || "Member";
    const userEmail = session?.user?.email || "";
    const userInitials = (userName || "M")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <>
            {/* Mobile Top App Bar */}
            <header className="md:hidden sticky top-0 z-40 w-full px-4 py-3 bg-[#080d1a]/80 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#0A84FF] to-[#0055B3] border border-white/25 flex items-center justify-center text-white shadow-md shadow-[#0A84FF]/25">
                        <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-base tracking-tight text-white">
                        Expense<span className="text-[#0A84FF]">Mate</span>
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        href="/expenses"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A84FF] hover:bg-[#0071E3] active:scale-95 text-xs font-semibold text-white shadow-md shadow-[#0A84FF]/25 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                    </Link>
                </div>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-[#070c18]/80 backdrop-blur-2xl border-r border-white/[0.08] p-5 shrink-0 select-none z-30">
                {/* Brand Header */}
                <div className="pb-6 border-b border-white/[0.06]">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#0A84FF] to-[#0055B3] border border-white/25 flex items-center justify-center text-white shadow-lg shadow-[#0A84FF]/25 group-hover:scale-105 transition-transform">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                                Expense<span className="text-[#0A84FF]">Mate</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 font-medium tracking-wide flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#0A84FF]" />
                                Financial Workspace
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-1.5 py-6 overflow-y-auto">
                    <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                        Navigation
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-[#0A84FF]/18 to-[#0A84FF]/5 text-white border border-[#0A84FF]/35 shadow-[0_0_20px_rgba(10,132,255,0.18)]"
                                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-4 w-4 transition-colors",
                                        isActive ? "text-[#0A84FF]" : "text-zinc-400 group-hover:text-white"
                                    )}
                                />
                                <span className="flex-1">{item.label}</span>
                                {isActive && (
                                    <span className="w-1.5 h-4 rounded-full bg-[#0A84FF] shadow-[0_0_8px_#0A84FF]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Profile & Logout Footer */}
                <div className="pt-4 border-t border-white/[0.06] space-y-3">
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.06] group"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#64D2FF] text-white font-bold text-xs flex items-center justify-center shadow-md shadow-[#0A84FF]/20 group-hover:scale-105 transition-transform">
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{userName}</p>
                            <p className="text-[11px] text-zinc-400 truncate">{userEmail}</p>
                        </div>
                    </Link>

                    <Button
                        variant="ghost"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full justify-start text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-xl h-9 px-3 transition-all cursor-pointer"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </aside>

            {/* Mobile Bottom Floating Glass Dock */}
            <nav className="md:hidden fixed bottom-3 inset-x-3 z-50 rounded-2xl bg-[#090e1c]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-2 py-1.5 flex justify-around items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center py-1 xs:py-1.5 px-1 xs:px-2 rounded-xl transition-all duration-200 active:scale-90 relative shrink-0",
                                isActive
                                    ? "text-[#0A84FF]"
                                    : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all",
                                isActive && "bg-[#0A84FF]/15 border border-[#0A84FF]/30 shadow-[0_0_12px_rgba(10,132,255,0.2)]"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-medium mt-0.5 tracking-tight">{item.label}</span>
                            {isActive && (
                                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#0A84FF] shadow-[0_0_6px_#0A84FF]" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
