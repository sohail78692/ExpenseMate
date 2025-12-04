"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, PieChart, User, LogOut, Wallet, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";


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

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground min-h-screen p-4 border-r border-sidebar-border">
                <div className="text-2xl font-bold mb-8 text-center">ExpenseMate</div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-2 p-3 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                                    pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent w-full justify-start"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar text-sidebar-foreground p-2 flex justify-around items-center z-50 border-t border-sidebar-border">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                pathname === item.href ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon className="h-6 w-6" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
