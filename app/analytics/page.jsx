import { getAnalyticsData } from "@/lib/data";
import AnalyticsClient from "./AnalyticsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    if (!data) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>Please log in to view analytics.</p>
                <Link href="/login">
                    <Button className="mt-4">Login</Button>
                </Link>
            </div>
        );
    }

    return <AnalyticsClient initialData={data} />;
}
