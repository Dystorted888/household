"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, ChefHat, Menu, RefreshCw } from "lucide-react";
import { format, formatDisplayDate } from "@/lib/dates";
import Link from "next/link";

interface MealEntry {
  id?: string;
  date: Date;
  dayOfWeek: string;
  mealType: string;
  label: string;
  status: "PLANNED" | "DONE";
  notes?: string;
}

interface MealsClientProps {
  initialMeals: {
    weekMeals: Array<{
      date: Date;
      dateKey: string;
      dayOfWeek: string;
      meal: MealEntry | null;
    }>;
    weekOffset: number;
    weekStart: Date;
    weekEnd: Date;
  };
}

export function MealsClient({ initialMeals }: MealsClientProps) {
  const [mealsData, setMealsData] = useState(initialMeals);
  const [editingMeal, setEditingMeal] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    label: "",
    notes: "",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMeals = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/meals?offset=${mealsData.weekOffset}`);
      if (response.ok) {
        const data = await response.json();
        setMealsData(data);
      }
    } catch (error) {
      console.error("Failed to refresh meals:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [mealsData.weekOffset]);

  // Auto-refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      refreshMeals();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshMeals]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMeals();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshMeals]);

  const navigateWeek = async (direction: "prev" | "next") => {
    const newOffset = mealsData.weekOffset + (direction === "next" ? 1 : -1);
    try {
      const response = await fetch(`/api/meals?offset=${newOffset}`);
      if (response.ok) {
        const data = await response.json();
        setMealsData(data);
      }
    } catch (error) {
      console.error("Failed to load week:", error);
    }
  };

  const startEditing = (meal: MealEntry | null, dateKey: string) => {
    setEditingMeal(dateKey);
    setEditForm({
      label: meal?.label || "",
      notes: meal?.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingMeal(null);
    setEditForm({ label: "", notes: "" });
  };

  const saveMeal = async (dateKey: string) => {
    if (!editForm.label.trim()) return;

    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateKey,
          label: editForm.label.trim(),
          notes: editForm.notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        await refreshMeals();
        cancelEditing();
      }
    } catch (error) {
      console.error("Failed to save meal:", error);
    }
  };

  const toggleMealStatus = async (mealId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "PLANNED" : "DONE";
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh to get the latest data from server
        await refreshMeals();
      }
    } catch (error) {
      console.error("Failed to update meal status:", error);
    }
  };

  const addIngredients = (meal: MealEntry) => {
    // This will be implemented when we add shopping integration
    console.log("Add ingredients for:", meal.label);
  };

  return (
    <ProtectedPage>
      <div className="flex min-h-screen flex-col bg-surface">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-surface px-4 py-4 shadow-sm gap-4">
          <div className="flex items-center space-x-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-on-surface">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigate to different sections of the household management app</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  <Link href="/" className="text-lg font-medium text-on-surface hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/meals" className="text-lg font-medium text-on-surface hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Meals</Link>
                  <Link href="/shopping" className="text-lg font-medium text-on-surface hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Shopping</Link>
                  <Link href="/tasks" className="text-lg font-medium text-on-surface hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Tasks</Link>
                  <Link href="/baby" className="text-lg font-medium text-on-surface hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Baby</Link>
                  <Link href="/settings" className="text-lg font-medium text-on-surface hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                ← Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-on-surface">Weekly Meal Planner</h1>
              <p className="text-xs text-on-surface-variant hidden sm:block">
                Plan your dinners for the week - easier than Excel!
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-on-surface min-w-[120px] text-center">
                {format(mealsData.weekStart, "MMM d")} - {format(mealsData.weekEnd, "MMM d")}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshMeals}
                disabled={isRefreshing}
                className="ml-2"
                title="Refresh meals"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <Button onClick={() => {/* Quick add meal */}} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          <div className="grid grid-cols-1 gap-4">
            {mealsData.weekMeals.map(({ date, dateKey, dayOfWeek, meal }) => (
              <Card key={dateKey}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {dayOfWeek}, {formatDisplayDate(date)}
                    </CardTitle>
                    {meal && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={meal.status === "DONE"}
                          onCheckedChange={() => toggleMealStatus(meal.id!, meal.status)}
                        />
                        <Badge variant={meal.status === "DONE" ? "default" : "secondary"}>
                          {meal.status === "DONE" ? "Done" : "Planned"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingMeal === dateKey ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="What are you cooking?"
                        value={editForm.label}
                        onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveMeal(dateKey);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        autoFocus
                      />
                      <Textarea
                        placeholder="Any notes? (optional)"
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => saveMeal(dateKey)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : meal ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{meal.label}</h3>
                          {meal.notes && (
                            <p className="text-sm text-zinc-600 mt-1">{meal.notes}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addIngredients(meal)}
                          className="ml-4"
                        >
                          <ChefHat className="h-4 w-4 mr-1" />
                          Add to shopping
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(meal, dateKey)}
                      >
                        Edit
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Button
                        variant="outline"
                        onClick={() => startEditing(null, dateKey)}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add meal</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </ProtectedPage>
  );
}
