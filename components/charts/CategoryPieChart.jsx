import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Map categories to specific hex colors matching the Tailwind classes used elsewhere
const CATEGORY_COLORS = {
    "Food": "#f97316", // orange-500
    "Dining": "#f59e0b", // amber-500
    "Transport": "#3b82f6", // blue-500
    "Shopping": "#ec4899", // pink-500
    "Utilities": "#eab308", // yellow-500
    "Housing": "#6366f1", // indigo-500
    "Entertainment": "#a855f7", // purple-500
    "Health": "#ef4444", // red-500
    "Work": "#64748b", // slate-500
    "Electronics": "#06b6d4", // cyan-500
    "Gifts": "#f43f5e", // rose-500
    "Other": "#6b7280", // gray-500
};

const DEFAULT_COLOR = "#6b7280";

export default function CategoryPieChart({ data }) {
    // Custom label renderer with better positioning
    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        // Position labels further outside the pie
        const radius = outerRadius + 30;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        // Only show label if percentage is significant enough
        if (percent < 0.05) return null;

        return (
            <text
                x={x}
                y={y}
                fill="currentColor"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-sm font-medium fill-muted-foreground"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const getColor = (name) => {
        return CATEGORY_COLORS[name] || CATEGORY_COLORS[Object.keys(CATEGORY_COLORS).find(k => k.toLowerCase() === name.toLowerCase())] || DEFAULT_COLOR;
    };

    return (
        <Card className="col-span-3 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={{
                                    stroke: 'currentColor',
                                    strokeWidth: 1,
                                    className: "stroke-muted-foreground"
                                }}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                                label={renderCustomizedLabel}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getColor(entry.name)}
                                        strokeWidth={2}
                                        stroke="hsl(var(--card))"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `₹${value.toFixed(2)}`}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--popover-foreground))'
                                }}
                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                    {data.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getColor(entry.name) }}
                            />
                            <span className="text-sm text-muted-foreground">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
