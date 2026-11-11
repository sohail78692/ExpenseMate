import { getAnalyticsData } from "@/lib/data";
import AnalyticsClient from "./AnalyticsClient";
import Link from "next/link";
import { Lock } from "lucide-react";

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    if (!data) {
        return (
            <div className="w-full max-w-md mx-auto mt-12 p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs dark:shadow-none text-center space-y-4">
                <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 mx-auto">
                    <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold text-zinc-950 dark:text-white">Sign in required</h1>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        Please sign in to your ExpenseMate account to view spending analytics.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    return <AnalyticsClient initialData={data} />;
}
