"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Target, Calendar, TrendingUp, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SavingsGoalsClient({ initialGoals }) {
    const [goals, setGoals] = useState(initialGoals || []);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [newAmount, setNewAmount] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const getDaysLeftColor = (days) => {
        if (days < 0) return "text-red-500";
        if (days < 30) return "text-orange-500";
        return "text-muted-foreground";
    };

    const handleUpdateClick = (goal) => {
        setSelectedGoal(goal);
        setNewAmount(goal.currentAmount.toString());
        setIsDialogOpen(true);
    };

    const handleSaveProgress = async () => {
        if (!selectedGoal) return;

        try {
            const res = await fetch(`/api/savings-goals/${selectedGoal._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentAmount: parseFloat(newAmount) }),
            });

            if (res.ok) {
                const updatedGoal = await res.json();

                // Optimistic Update
                setGoals(prev => prev.map(g => {
                    if (g._id === selectedGoal._id) {
                        // We need to re-calculate fields or just refresh from server?
                        // Updating local state requires duplicating the logic of progress calculation from server.
                        // Easier to refresh router for perfect sync, or update simple fields.
                        return {
                            ...g,
                            currentAmount: parseFloat(newAmount),
                            progress: parseFloat(((parseFloat(newAmount) / g.targetAmount) * 100).toFixed(1)),
                            remaining: g.targetAmount - parseFloat(newAmount)
                        };
                    }
                    return g;
                }));

                setIsDialogOpen(false);
                router.refresh();
            }
        } catch (error) {
            console.error("Error updating goal:", error);
        }
    };

    const handleDeleteGoal = async (goalId) => {
        if (!confirm("Are you sure you want to delete this goal?")) return;

        try {
            const res = await fetch(`/api/savings-goals/${goalId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setGoals(prev => prev.filter(g => g._id !== goalId));
                router.refresh();
            }
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    const activeGoals = goals.filter(g => !g.isCompleted);
    const completedGoals = goals.filter(g => g.isCompleted);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Savings Goals</h1>
                    <p className="text-muted-foreground">Track your progress toward financial goals</p>
                </div>
                <Link href="/savings/new">
                    <Button title="Create new savings goal" aria-label="Create new savings goal">
                        <Plus className="mr-2 h-4 w-4" />
                        New Goal
                    </Button>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeGoals.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {completedGoals.length} completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Target</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{activeGoals.reduce((sum, g) => sum + g.targetAmount, 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all active goals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            ₹{activeGoals.reduce((sum, g) => sum + g.currentAmount, 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {activeGoals.length > 0 ?
                                ((activeGoals.reduce((sum, g) => sum + g.currentAmount, 0) /
                                    activeGoals.reduce((sum, g) => sum + g.targetAmount, 0)) * 100).toFixed(1) + '% of target'
                                : 'No active goals'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Goals */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Goals</CardTitle>
                    <CardDescription>Your current savings targets</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeGoals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No active savings goals yet</p>
                            <Link href="/savings/new">
                                <Button variant="link" className="mt-2">Create your first goal</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activeGoals.map((goal) => (
                                <div key={goal._id} className="space-y-3 p-4 rounded-lg border">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{goal.icon}</span>
                                            <div>
                                                <h4 className="font-semibold text-lg">{goal.name}</h4>
                                                <p className="text-sm text-muted-foreground">{goal.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{goal.progress}%</p>
                                            <p className={`text-sm flex items-center gap-1 ${getDaysLeftColor(goal.daysLeft)}`}>
                                                <Calendar className="h-3 w-3" />
                                                {goal.daysLeft >= 0 ? `${goal.daysLeft} days left` : 'Overdue'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>₹{goal.currentAmount.toFixed(2)}</span>
                                            <span>₹{goal.targetAmount.toFixed(2)}</span>
                                        </div>
                                        <Progress
                                            value={Math.min(goal.progress, 100)}
                                            className="h-3"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            ₹{goal.remaining.toFixed(2)} remaining
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            Deadline: {format(new Date(goal.deadline), "MMM d, yyyy")}
                                        </p>
                                        <Button size="sm" variant="outline" onClick={() => handleUpdateClick(goal)}>Update Progress</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Completed Goals 🎉</CardTitle>
                        <CardDescription>Congratulations on achieving these goals!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {completedGoals.map((goal) => (
                                <div key={goal._id} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{goal.icon}</span>
                                        <div>
                                            <h4 className="font-semibold">{goal.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                ₹{goal.targetAmount.toFixed(2)} saved
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">✅</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                            onClick={() => handleDeleteGoal(goal._id)}
                                            title="Delete goal"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}


            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Progress</DialogTitle>
                        <DialogDescription>
                            Update the current amount saved for {selectedGoal?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Current Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveProgress}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
