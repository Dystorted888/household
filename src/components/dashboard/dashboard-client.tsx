"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedPage } from "@/components/protected-page";
import { useAuth } from "@/context/auth-context";
import { TodayCard } from "./today-card";
import { ThisWeekCard } from "./this-week-card";
import { UrgentShoppingCard } from "./urgent-shopping-card";
import { BabyPrepCard } from "./baby-prep-card";
import { QuickActionsCard } from "./quick-actions-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import type { User } from "@prisma/client";

interface DashboardClientProps {
  initialData: {
    todaysMeal: any;
    todaysTasks: any[];
    urgentShopping: any[];
    weeklyMeals: any[];
    weeklyTaskStats: any;
    babyProgress: any;
  };
  users: User[];
  onRefresh?: () => void;
}

export function DashboardClient({ initialData, users, onRefresh }: DashboardClientProps) {
  const { profile } = useAuth();
  const [data, setData] = useState(initialData);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
      }
      onRefresh?.();
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: completed ? "DONE" : "TODO" }),
      });

      if (response.ok) {
        // Update local state
        setData(prev => ({
          ...prev,
          todaysTasks: prev.todaysTasks.map(task =>
            task.id === taskId
              ? { ...task, status: completed ? "DONE" : "TODO" }
              : task
          )
        }));
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleQuickAction = (action: string) => {
    // This will be enhanced when we implement the individual modules
    console.log("Quick action:", action);
  };

  return (
    <ProtectedPage>
      <div className="flex min-h-screen flex-col bg-zinc-50">
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
              <h1 className="text-lg font-semibold text-on-surface">Household Dashboard</h1>
              <p className="text-xs text-on-surface-variant hidden sm:block">
                Meals, shopping, tasks, and baby preparation in one place.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-x-4">
            <nav className="hidden md:flex space-x-6 text-sm">
              <Link href="/meals" className="text-on-surface hover:text-primary transition-colors">Meals</Link>
              <Link href="/shopping" className="text-on-surface hover:text-primary transition-colors">Shopping</Link>
              <Link href="/tasks" className="text-on-surface hover:text-primary transition-colors">Tasks</Link>
              <Link href="/baby" className="text-on-surface hover:text-primary transition-colors">Baby</Link>
              <Link href="/settings" className="text-on-surface hover:text-primary transition-colors">Settings</Link>
            </nav>
            <div className="rounded-full bg-surface-variant px-3 py-1 text-xs font-medium text-on-surface">
              Signed in as <span className="font-semibold">{profile || "Loading..."}</span>
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TodayCard
              todaysMeal={data.todaysMeal}
              todaysTasks={data.todaysTasks}
              onTaskToggle={handleTaskToggle}
            />
            <ThisWeekCard
              weeklyMeals={data.weeklyMeals}
              weeklyTaskStats={data.weeklyTaskStats}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <UrgentShoppingCard urgentItems={data.urgentShopping} />
            <BabyPrepCard babyProgress={data.babyProgress} />
            <QuickActionsCard users={users} onItemAdded={refreshData} />
          </div>
        </main>
      </div>
    </ProtectedPage>
  );
}
