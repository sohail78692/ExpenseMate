import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Expenses - ExpenseMate",
    description: "Manage and track all your expenses",
};

export default function ExpensesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
