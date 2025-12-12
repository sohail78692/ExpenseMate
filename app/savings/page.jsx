import { getSavingsGoalsData } from "@/lib/data";
import SavingsGoalsClient from "./SavingsGoalsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SavingsGoalsPage() {
    const data = await getSavingsGoalsData();

    if (!data) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>Please log in to view savings goals.</p>
                <Link href="/login">
                    <Button className="mt-4">Login</Button>
                </Link>
            </div>
        );
    }

    return <SavingsGoalsClient initialGoals={data.goals} />;
}
