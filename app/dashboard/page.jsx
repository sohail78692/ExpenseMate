import { getDashboardData, getBudgetsAndInsightsData, getSavingsGoalsData } from "@/lib/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Lock } from "lucide-react";
import DashboardClient from "./DashboardClient";

export const metadata = {
    title: "Dashboard - ExpenseMate",
    description: "Your personal financial workspace with live insights, budget guardrails, and activity heatmaps.",
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div className="w-full max-w-md mx-auto mt-12 p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-4">
                <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mx-auto">
                    <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold text-white">Sign in required</h1>
                    <p className="text-xs sm:text-sm text-zinc-400">
                        Please sign in to access your personal financial workspace, budget guardrails, and activity heatmaps.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    const [dashboardData, budgetsData, savingsData] = await Promise.all([
        getDashboardData(),
        getBudgetsAndInsightsData(),
        getSavingsGoalsData(),
    ]);

    const serializedData = {
        dashboard: dashboardData ? JSON.parse(JSON.stringify(dashboardData)) : null,
        budgetsAndInsights: budgetsData ? JSON.parse(JSON.stringify(budgetsData)) : null,
        savings: savingsData ? JSON.parse(JSON.stringify(savingsData)) : null,
        user: session?.user
            ? {
                  name: session.user.name || undefined,
                  email: session.user.email || undefined,
              }
            : null,
    };

    return <DashboardClient initialData={serializedData} />;
}
