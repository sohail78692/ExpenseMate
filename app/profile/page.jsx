import { getProfileData } from "@/lib/data";
import ProfileClient from "./ProfileClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
    const user = await getProfileData();

    if (!user) {
        // getProfileData checks session and returns null if not auth
        // But we can fallback to allowing redirect
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>Please log in to view profile.</p>
                <Link href="/login">
                    <Button className="mt-4">Login</Button>
                </Link>
            </div>
        );
    }

    return <ProfileClient initialUser={user} />;
}
