import ExpenseList from "@/components/ExpenseList";
import { getExpenses } from "@/lib/data";

export default async function ExpensesPage() {
    // Determine the page number (could be from searchParams eventually, but starts at 1)
    const page = 1;
    const data = await getExpenses({ page, limit: 10 });

    // Fallback if data fetch fails or user unauthorized (though data.js handles it return null)
    const initialExpenses = data ? data.expenses : [];
    const initialTotalPages = data ? data.totalPages : 1;

    return (
        <div className="container mx-auto py-10">
            <ExpenseList
                initialExpenses={initialExpenses}
                initialTotalPages={initialTotalPages}
            />
        </div>
    );
}
