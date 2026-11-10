import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Budgets & Insights - ExpenseMate",
    description: "Set monthly spending caps, monitor threshold alerts, and review budget insights",
};

export default function BudgetsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

