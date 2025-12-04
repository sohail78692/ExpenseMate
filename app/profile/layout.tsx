import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile Settings - ExpenseMate",
    description: "Manage your account settings and preferences",
};

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
