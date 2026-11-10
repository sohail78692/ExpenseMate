import { getSavingsGoalsData } from "@/lib/data";
import SavingsGoalsClient from "./SavingsGoalsClient";
import Link from "next/link";
import { Lock } from "lucide-react";

export default async function SavingsGoalsPage() {
    const data = await getSavingsGoalsData();

    if (!data) {
        return (
            <div className="w-full max-w-md mx-auto mt-12 p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-4">
                <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mx-auto">
                    <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold text-white">Sign in required</h1>
                    <p className="text-xs sm:text-sm text-zinc-400">
                        Please sign in to your ExpenseMate account to manage your savings goals.
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

    return <SavingsGoalsClient initialGoals={data.goals} />;
}
