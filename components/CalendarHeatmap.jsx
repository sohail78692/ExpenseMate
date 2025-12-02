"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from "date-fns";

export default function CalendarHeatmap({ data, currentMonth = new Date() }) {
    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const getColor = (amount) => {
        if (amount === 0) return "bg-gray-100 dark:bg-gray-800";
        if (amount <= 200) return "bg-green-200 dark:bg-green-900";
        if (amount <= 500) return "bg-yellow-200 dark:bg-yellow-900";
        if (amount <= 1000) return "bg-orange-200 dark:bg-orange-900";
        return "bg-red-200 dark:bg-red-900";
    };

    // Create a map for easy lookup
    const dataMap = {};
    data.forEach((item) => {
        dataMap[format(new Date(item.date), "yyyy-MM-dd")] = item.amount;
    });

    // Calculate empty cells for start of month
    const startDay = getDay(startOfMonth(currentMonth));
    const emptyDays = Array(startDay).fill(null);

    return (
        <Card className="col-span-7">
            <CardHeader>
                <CardTitle>Monthly Spending Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                    {emptyDays.map((_, i) => (
                        <div key={`empty-${i}`} className="h-10 w-10" />
                    ))}
                    {days.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const amount = dataMap[dateStr] || 0;
                        return (
                            <TooltipProvider key={dateStr}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div
                                            className={`h-10 w-10 rounded-md flex items-center justify-center text-xs cursor-pointer ${getColor(
                                                amount
                                            )}`}
                                        >
                                            {format(day, "d")}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{dateStr}</p>
                                        <p>₹{amount.toFixed(2)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
