import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - ExpenseMate",
    description: "Your spending overview and recent expenses",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
