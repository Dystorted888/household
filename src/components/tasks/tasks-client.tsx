"use client";

import { useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CheckSquare, Calendar, RotateCcw, User as UserIcon, Menu } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { TaskFormDialog } from "./create-task-modal";
import type { Task, RecurringTask, TaskType, User } from "@prisma/client";

type TaskWithUser = Task & { assignedTo?: User | null };
type TaskStatusFilter = "all" | "TODO" | "IN_PROGRESS" | "DONE";
type TaskTypeFilter = "all" | TaskType;

interface TasksClientProps {
  initialTodayTasks: (Task & { assignedTo?: User | null })[];
  initialWeekTasks: (Task & { assignedTo?: User | null })[];
  initialRecurringTasks: (RecurringTask & { assignedTo?: User | null })[];
  users: User[];
}

export function TasksClient({
  initialTodayTasks,
  initialWeekTasks,
  initialRecurringTasks,
  users
}: TasksClientProps) {
  const [todayTasks, setTodayTasks] = useState(initialTodayTasks);
  const [weekTasks, setWeekTasks] = useState(initialWeekTasks);
  const [recurringTasks, setRecurringTasks] = useState(initialRecurringTasks);

  const [filter, setFilter] = useState<{
    status: TaskStatusFilter;
    type: TaskTypeFilter;
    assignee: string;
  }>({
    status: "all",
    type: "all",
    assignee: "all",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshTasks = async () => {
    try {
      const [todayRes, weekRes, recurringRes] = await Promise.all([
        fetch("/api/tasks?filter=today"),
        fetch("/api/tasks?filter=week"),
        fetch("/api/recurring-tasks")
      ]);

      if (todayRes.ok) {
        const todayData = await todayRes.json();
        setTodayTasks(todayData);
      }
      if (weekRes.ok) {
        const weekData = await weekRes.json();
        setWeekTasks(weekData);
      }
      if (recurringRes.ok) {
        const recurringData = await recurringRes.json();
        setRecurringTasks(recurringData);
      }
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    }
  };

  const filterTasks = (tasks: TaskWithUser[]) => {
    return tasks.filter(task => {
      if (filter.status !== "all" && task.status !== filter.status) return false;
      if (filter.type !== "all" && task.type !== filter.type) return false;
      if (filter.assignee !== "all" && task.assignedToUserId !== filter.assignee) return false;
      return true;
    });
  };

  const updateTaskStatus = async (taskId: string, status: "TODO" | "IN_PROGRESS" | "DONE") => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        setTodayTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, status } : task
        ));
        setWeekTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, status } : task
        ));
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const completeRecurringTask = async (recurringTaskId: string) => {
    try {
      const response = await fetch(`/api/recurring-tasks/${recurringTaskId}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh the recurring tasks list
        const updatedTasks = await fetch("/api/recurring-tasks").then(r => r.json());
        setRecurringTasks(updatedTasks);
      }
    } catch (error) {
      console.error("Failed to complete recurring task:", error);
    }
  };

  const TaskCard = ({
    task,
    showDate = false,
    onStatusChange,
  }: {
    task: Task & { assignedTo?: User | null };
    showDate?: boolean;
    onStatusChange: (status: "TODO" | "IN_PROGRESS" | "DONE") => void;
  }) => (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={task.status === "DONE"}
          onCheckedChange={(checked) =>
            onStatusChange(checked ? "DONE" : "TODO")
          }
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={task.status === "DONE" ? "line-through text-zinc-500" : ""}>
              {task.title}
            </span>
            <Badge variant="outline">{task.type}</Badge>
            {task.assignedTo && (
              <Badge variant="secondary">
                <UserIcon className="h-3 w-3 mr-1" />
                {task.assignedTo.name}
              </Badge>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-zinc-600 mt-1">{task.description}</p>
          )}
          {showDate && task.dueDate && (
            <p className="text-xs text-zinc-500 mt-1">
              Due: {format(task.dueDate, "MMM d, yyyy")}
            </p>
          )}
        </div>
      </div>
      <TaskFormDialog
        users={users}
        task={task}
        onSuccess={refreshTasks}
        trigger={
          <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-zinc-900">
            Edit
          </Button>
        }
      />
    </div>
  );

  const RecurringTaskCard = ({
    task
  }: {
    task: RecurringTask & { assignedTo?: User | null };
  }) => (
    <div className="flex items-start justify-between rounded-lg border p-3">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span>{task.title}</span>
          <Badge variant="outline">{task.frequency}</Badge>
          {task.assignedTo && (
            <Badge variant="secondary">
              <UserIcon className="h-3 w-3 mr-1" />
              {task.assignedTo.name}
            </Badge>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-zinc-600 mt-1">{task.description}</p>
        )}
        <p className="text-xs text-zinc-500 mt-1">
          Next: {format(task.nextOccurrenceAt, "MMM d, yyyy")}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => completeRecurringTask(task.id)}
      >
        <CheckSquare className="h-4 w-4 mr-1" />
        Complete
      </Button>
    </div>
  );

  return (
    <ProtectedPage>
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <header className="flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-on-surface">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col space-y-4 mt-6">
                  <Link href="/" className="text-lg font-medium text-zinc-600 hover:text-zinc-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/meals" className="text-lg font-medium text-zinc-600 hover:text-zinc-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Meals</Link>
                  <Link href="/shopping" className="text-lg font-medium text-zinc-600 hover:text-zinc-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Shopping</Link>
                  <Link href="/tasks" className="text-lg font-medium text-zinc-600 hover:text-zinc-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Tasks</Link>
                  <Link href="/baby" className="text-lg font-medium text-zinc-600 hover:text-zinc-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Baby</Link>
                  <Link href="/settings" className="text-lg font-medium text-zinc-600 hover:text-zinc-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                ← Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Tasks & Chores</h1>
              <p className="text-xs text-zinc-500 hidden sm:block">
                Organize household tasks, assign responsibilities, track progress
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
              <Select
                value={filter.status}
                onValueChange={(value) =>
                  setFilter(prev => ({ ...prev, status: value as TaskStatusFilter }))
                }
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter.type}
                onValueChange={(value) =>
                  setFilter(prev => ({ ...prev, type: value as TaskTypeFilter }))
                }
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GENERIC">General</SelectItem>
                  <SelectItem value="HOUSE">House</SelectItem>
                  <SelectItem value="BABY">Baby</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filter.assignee} onValueChange={(value) => setFilter(prev => ({ ...prev, assignee: value }))}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All People</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TaskFormDialog users={users} onSuccess={refreshTasks} />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 sm:px-6 py-6">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Today&apos;s Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayTasks.length > 0 ? (
                    <div className="space-y-3">
                      {filterTasks(todayTasks).map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={(status) => updateTaskStatus(task.id, status)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-zinc-500">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tasks due today</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>This Week&apos;s Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weekTasks.length > 0 ? (
                    <div className="space-y-3">
                      {filterTasks(weekTasks).map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          showDate={true}
                          onStatusChange={(status) => updateTaskStatus(task.id, status)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-zinc-500">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tasks this week</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>Recurring Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recurringTasks.length > 0 ? (
                    <div className="space-y-3">
                      {recurringTasks.map((task) => (
                        <RecurringTaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-zinc-500">
                      <RotateCcw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recurring tasks</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedPage>
  );
}
