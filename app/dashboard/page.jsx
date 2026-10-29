import { getDashboardData, getBudgetsAndInsightsData, getSavingsGoalsData } from "@/lib/data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardClient from "./DashboardClient";

export const metadata = {
    title: "Dashboard",
    description: "Your personal financial workspace with live insights, budget guardrails, and activity heatmaps.",
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 sm:p-10">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-4 text-2xl shadow-xl shadow-black/40">
                    🔒
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Session Required</h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
                    Please sign in to access your personal financial workspace, live heatmaps, and budget guardrails.
                </p>
                <Link href="/login">
                    <Button className="bg-[#0A84FF] hover:bg-[#0071E3] text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-[#0A84FF]/25 cursor-pointer">
                        Sign In to ExpenseMate
                    </Button>
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
