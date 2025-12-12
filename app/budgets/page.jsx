import { getBudgetsAndInsightsData } from "@/lib/data";
import BudgetsClient from "./BudgetsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BudgetsPage() {
    const data = await getBudgetsAndInsightsData();

    if (!data) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>Please log in to view budgets.</p>
                <Link href="/login">
                    <Button className="mt-4">Login</Button>
                </Link>
            </div>
        );
    }

    return <BudgetsClient initialBudgets={data.budgets} initialInsights={data.insights} />;
}
