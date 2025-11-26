"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  ChefHat,
  ShoppingCart,
  CheckSquare,
  Baby
} from "lucide-react";
import { SECTIONS } from "@/lib/baby";
import type { User } from "@prisma/client";

interface QuickActionsCardProps {
  users: User[];
  onItemAdded: () => void;
}

export function QuickActionsCard({ users, onItemAdded }: QuickActionsCardProps) {
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [shoppingDialogOpen, setShoppingDialogOpen] = useState(false);
  const [babyDialogOpen, setBabyDialogOpen] = useState(false);

  const [mealData, setMealData] = useState({ label: "", notes: "" });
  const [taskData, setTaskData] = useState({ title: "", description: "", type: "GENERIC", assignedToUserId: "" });
  const [shoppingData, setShoppingData] = useState({ name: "", quantity: "", category: "", priority: "MEDIUM" });
  const [babyData, setBabyData] = useState({ title: "", section: SECTIONS[0] as string, itemType: "TASK" });

  const addMeal = async () => {
    if (!mealData.label.trim()) return;
    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          label: mealData.label.trim(),
          notes: mealData.notes.trim() || undefined,
        }),
      });
      if (response.ok) {
        setMealDialogOpen(false);
        setMealData({ label: "", notes: "" });
        onItemAdded();
      }
    } catch (error) {
      console.error("Failed to add meal:", error);
    }
  };

  const addTask = async () => {
    if (!taskData.title.trim()) return;
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskData.title.trim(),
          description: taskData.description.trim() || undefined,
          type: taskData.type,
          assignedToUserId: taskData.assignedToUserId === "unassigned" ? undefined : taskData.assignedToUserId || undefined,
        }),
      });
      if (response.ok) {
        setTaskDialogOpen(false);
        setTaskData({ title: "", description: "", type: "GENERIC", assignedToUserId: "" });
        onItemAdded();
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const addShoppingItem = async () => {
    if (!shoppingData.name.trim()) return;
    // For simplicity, add to the first available list or create one
    try {
      const listsResponse = await fetch("/api/shopping-lists");
      const lists = await listsResponse.json();
      let listId;

      if (lists.length > 0) {
        listId = lists[0].id;
      } else {
        // Create a default list
        const createResponse = await fetch("/api/shopping-lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Quick Shopping" }),
        });
        const newList = await createResponse.json();
        listId = newList.id;
      }

      const response = await fetch(`/api/shopping-lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: shoppingData.name.trim(),
          quantity: shoppingData.quantity.trim() || undefined,
          category: shoppingData.category.trim() || undefined,
          priority: shoppingData.priority,
        }),
      });
      if (response.ok) {
        setShoppingDialogOpen(false);
        setShoppingData({ name: "", quantity: "", category: "", priority: "MEDIUM" });
        onItemAdded();
      }
    } catch (error) {
      console.error("Failed to add shopping item:", error);
    }
  };

  const addBabyItem = async () => {
    if (!babyData.title.trim()) return;
    try {
      const response = await fetch("/api/baby-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: babyData.title.trim(),
          section: babyData.section,
          itemType: babyData.itemType,
        }),
      });
      if (response.ok) {
        setBabyDialogOpen(false);
        setBabyData({ title: "", section: SECTIONS[0], itemType: "TASK" });
        onItemAdded();
      }
    } catch (error) {
      console.error("Failed to add baby item:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="tonal"
                className="w-full h-auto p-5 flex flex-col items-center space-y-3 text-orange-600 hover:text-orange-700"
              >
                <ChefHat className="h-6 w-6" />
                <span className="text-sm font-semibold">Add Meal</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Quick Add Meal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meal-label">Meal</Label>
                  <Input
                    id="meal-label"
                    placeholder="What's for dinner?"
                    value={mealData.label}
                    onChange={(e) => setMealData(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="meal-notes">Notes (optional)</Label>
                  <Input
                    id="meal-notes"
                    placeholder="Any special notes?"
                    value={mealData.notes}
                    onChange={(e) => setMealData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => setMealDialogOpen(false)} className="sm:w-auto w-full">Cancel</Button>
                  <Button onClick={addMeal} className="sm:w-auto w-full">Add Meal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="tonal"
                className="w-full h-auto p-5 flex flex-col items-center space-y-3 text-blue-600 hover:text-blue-700"
              >
                <CheckSquare className="h-6 w-6" />
                <span className="text-sm font-semibold">Add Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Quick Add Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task</Label>
                  <Input
                    id="task-title"
                    placeholder="What needs to be done?"
                    value={taskData.title}
                    onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="task-assignee">Assign to</Label>
                  <Select value={taskData.assignedToUserId} onValueChange={(value) => setTaskData(prev => ({ ...prev, assignedToUserId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => setTaskDialogOpen(false)} className="sm:w-auto w-full">Cancel</Button>
                  <Button onClick={addTask} className="sm:w-auto w-full">Add Task</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={shoppingDialogOpen} onOpenChange={setShoppingDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="tonal"
                className="w-full h-auto p-5 flex flex-col items-center space-y-3 text-green-600 hover:text-green-700"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm font-semibold">Add Shopping</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Quick Add Shopping Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="shopping-name">Item</Label>
                    <Input
                      id="shopping-name"
                      placeholder="What to buy?"
                      value={shoppingData.name}
                      onChange={(e) => setShoppingData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shopping-quantity">Quantity</Label>
                    <Input
                      id="shopping-quantity"
                      placeholder="How much?"
                      value={shoppingData.quantity}
                      onChange={(e) => setShoppingData(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => setShoppingDialogOpen(false)} className="sm:w-auto w-full">Cancel</Button>
                  <Button onClick={addShoppingItem} className="sm:w-auto w-full">Add Item</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={babyDialogOpen} onOpenChange={setBabyDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="tonal"
                className="w-full h-auto p-5 flex flex-col items-center space-y-3 text-purple-600 hover:text-purple-700"
              >
                <Baby className="h-6 w-6" />
                <span className="text-sm font-semibold">Add Baby Item</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Quick Add Baby Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="baby-title">Item</Label>
                  <Input
                    id="baby-title"
                    placeholder="What baby item?"
                    value={babyData.title}
                    onChange={(e) => setBabyData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="baby-section">Category</Label>
                  <Select value={babyData.section} onValueChange={(value) => setBabyData(prev => ({ ...prev, section: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map(section => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => setBabyDialogOpen(false)} className="sm:w-auto w-full">Cancel</Button>
                  <Button onClick={addBabyItem} className="sm:w-auto w-full">Add Item</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
