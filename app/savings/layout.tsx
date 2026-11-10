import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Savings Goals - ExpenseMate",
    description: "Plan targets, track progress, and reach your savings milestones",
};

export default function SavingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

