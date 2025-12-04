import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analytics - ExpenseMate",
    description: "Detailed insights into your spending patterns and trends",
};

export default function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
