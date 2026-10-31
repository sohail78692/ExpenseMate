"use client";

import { useState, useRef, useEffect } from "react";
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
    ChevronDown,
    ShieldCheck
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expenses", label: "Expenses", icon: Receipt },
    { href: "/budgets", label: "Budgets", icon: Wallet },
    { href: "/savings", label: "Savings", icon: Target },
    { href: "/analytics", label: "Analytics", icon: PieChart },
    { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [customProfile, setCustomProfile] = useState({ name: null, image: null });
    const profileRef = useRef(null);

    // Listen for instant real-time profile updates across the app and load cached profile
    useEffect(() => {
        try {
            const cachedName = localStorage.getItem("user_profile_name");
            const cachedImage = localStorage.getItem("user_profile_avatar");
            if (cachedName || cachedImage) {
                setCustomProfile({
                    name: cachedName || null,
                    image: cachedImage || null,
                });
            }
        } catch (_) {}

        function handleProfileUpdate(event) {
            if (event.detail) {
                const newName = event.detail.name || null;
                const newImage = event.detail.image !== undefined ? event.detail.image : null;
                setCustomProfile({
                    name: newName,
                    image: newImage,
                });
                try {
                    if (newName) localStorage.setItem("user_profile_name", newName);
                    if (newImage) localStorage.setItem("user_profile_avatar", newImage);
                } catch (_) {}
            }
        }
        window.addEventListener("profile-updated", handleProfileUpdate);
        return () => window.removeEventListener("profile-updated", handleProfileUpdate);
    }, []);

    // Also fetch profile from DB once when authenticated to ensure synced avatar
    useEffect(() => {
        if (!session?.user) return;
        let isMounted = true;
        fetch("/api/profile")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!isMounted || !data) return;
                if (data.name || data.profileImage) {
                    setCustomProfile((prev) => ({
                        name: data.name || prev.name,
                        image: data.profileImage !== undefined ? data.profileImage : prev.image,
                    }));
                    try {
                        if (data.name) localStorage.setItem("user_profile_name", data.name);
                        if (data.profileImage) localStorage.setItem("user_profile_avatar", data.profileImage);
                    } catch (_) {}
                }
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, [session?.user?.id, session?.user?.email]);

    const userName = customProfile.name || session?.user?.name || "Member";
    const userEmail = session?.user?.email || "";
    const userImage = customProfile.image !== null ? customProfile.image : (session?.user?.image || "");
    const userInitials = (userName || "M")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    // Close profile dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setProfileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            {/* FLOATING TOP NAVBAR ISLAND */}
            <header className="fixed top-2.5 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none transition-all">
                <div className="w-full max-w-6xl rounded-2xl sm:rounded-full px-3.5 sm:px-5 h-[52px] sm:h-[58px] flex items-center justify-between pointer-events-auto transition-all shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_1.5px_0_rgba(255,255,255,0.25)] border border-white/[0.12] bg-[#070c18]/75 backdrop-blur-3xl">
                    {/* Brand Identity */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 sm:gap-2.5 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF] rounded-full"
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#0A84FF] via-[#0071E3] to-[#64D2FF] border border-white/35 flex items-center justify-center text-white shadow-md shadow-[#0A84FF]/30 group-hover:scale-105 transition-transform">
                            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                            Expense<span className="text-[#0A84FF] drop-shadow-[0_0_12px_rgba(10,132,255,0.6)]">Mate</span>
                        </span>
                    </Link>

                    {/* Navigation Links (Visible on Laptop & Desktop >= 1024px) */}
                    <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md shrink-0">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs xl:text-[13px] font-medium transition-all duration-200 active:scale-95 shrink-0",
                                        isActive
                                            ? "bg-gradient-to-r from-[#0A84FF]/30 via-[#0A84FF]/20 to-[#0A84FF]/35 text-white border border-[#0A84FF]/60 shadow-[0_0_18px_rgba(10,132,255,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.5)] font-semibold"
                                            : "text-zinc-400 hover:text-white hover:bg-white/[0.07] border border-transparent"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-3.5 h-3.5 transition-colors",
                                            isActive ? "text-[#64D2FF]" : "text-zinc-400"
                                        )}
                                    />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <span className="w-1 h-1 rounded-full bg-[#64D2FF] shadow-[0_0_6px_#64D2FF]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Action Cluster */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
                        {/* Pure Liquid Glass Profile Capsule showing Full Name */}
                        <div className="relative min-w-0 shrink" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className={cn(
                                    "flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer group focus:outline-none backdrop-blur-md min-w-0 max-w-[100px] xs:max-w-[130px] sm:max-w-[170px] md:max-w-[220px]",
                                    profileMenuOpen
                                        ? "bg-white/[0.12] border border-[#0A84FF]/60 shadow-[0_0_18px_rgba(10,132,255,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.4)]"
                                        : "bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.12] hover:border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_4px_16px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-95"
                                )}
                                aria-label="User profile menu"
                                aria-expanded={profileMenuOpen}
                            >
                                <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#0A84FF]/40 via-[#64D2FF]/30 to-white/10 border border-white/30 group-hover:border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center text-white font-bold text-[11px] sm:text-xs shrink-0 transition-transform group-hover:scale-105 overflow-hidden">
                                    {userImage ? (
                                        <img src={userImage} alt={userName} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        userInitials
                                    )}
                                </div>
                                <span className="text-xs sm:text-[13px] font-semibold text-white tracking-tight group-hover:text-zinc-100 truncate min-w-0">
                                    {userName}
                                </span>
                            </button>

                            {/* User Profile Glass Card Dropdown */}
                            {profileMenuOpen && (
                                <div className="absolute right-0 top-[calc(100%+10px)] w-60 sm:w-64 rounded-2xl bg-[#090e1c]/95 backdrop-blur-3xl border border-white/15 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                    {/* User details */}
                                    <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#64D2FF] text-white font-bold text-xs flex items-center justify-center ring-1 ring-white/25 shadow-md overflow-hidden shrink-0">
                                            {userImage ? (
                                                <img src={userImage} alt={userName} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                userInitials
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-white truncate">{userName}</p>
                                            <p className="text-[11px] text-zinc-400 truncate">{userEmail}</p>
                                        </div>
                                    </div>

                                    {/* Quick Links inside Profile Dropdown */}
                                    <div className="space-y-1 py-1 text-xs">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.07] transition-colors"
                                        >
                                            <User className="w-3.5 h-3.5 text-[#0A84FF]" />
                                            <span>Account Settings</span>
                                        </Link>
                                        <Link
                                            href="/budgets"
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.07] transition-colors"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
                                            <span>Budget Guardrails</span>
                                        </Link>
                                    </div>

                                    {/* Sign out */}
                                    <div className="pt-2 mt-1 border-t border-white/[0.08]">
                                        <button
                                            type="button"
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sign Out Quick Button (Always visible across all devices) */}
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] hover:bg-red-500/15 border border-white/[0.08] hover:border-red-500/30 text-zinc-400 hover:text-red-400 shrink-0 transition-all cursor-pointer active:scale-95 shadow-sm"
                            title="Sign Out"
                            aria-label="Sign Out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile / Tablet Bottom Floating Glass Dock (Visible on screens < 1024px) */}
            <nav className="glass-dock-panel lg:hidden fixed bottom-2.5 sm:bottom-4 inset-x-2.5 sm:inset-x-4 z-50 rounded-2xl sm:rounded-3xl px-1 sm:px-2 py-1 max-w-md mx-auto shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_1.5px_rgba(255,255,255,0.25)] border border-white/[0.14] bg-[#070c18]/85 backdrop-blur-3xl">
                <div className="grid grid-cols-6 items-center w-full">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 relative w-full group",
                                    isActive
                                        ? "text-white"
                                        : "text-zinc-400 hover:text-zinc-200"
                                )}
                            >
                                <div className={cn(
                                    "w-8.5 h-6.5 sm:w-9.5 sm:h-7 rounded-xl flex items-center justify-center transition-all duration-300",
                                    isActive
                                        ? "bg-gradient-to-tr from-[#0A84FF]/35 to-[#64D2FF]/20 border border-[#0A84FF]/60 text-[#64D2FF] shadow-[0_0_14px_rgba(10,132,255,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                                        : "text-zinc-400 group-hover:text-zinc-200 group-hover:bg-white/[0.05]"
                                )}>
                                    <Icon className={cn("h-4 w-4 transition-transform", isActive ? "text-[#64D2FF] scale-105" : "text-zinc-400")} />
                                </div>
                                <span className={cn(
                                    "text-[9px] sm:text-[10px] tracking-tight mt-0.5 truncate w-full text-center px-0.5 leading-tight transition-colors",
                                    isActive ? "font-semibold text-white drop-shadow-[0_0_6px_rgba(10,132,255,0.6)]" : "font-normal text-zinc-400"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
