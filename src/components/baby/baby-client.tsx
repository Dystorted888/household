"use client";

import { useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Plus, ShoppingCart, CheckSquare, Menu } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { BABY_SECTIONS } from "@/lib/baby/sections";
import { CreateBabyItemModal } from "./create-baby-item-modal";
import type { BabyChecklistItem, User } from "@prisma/client";

interface BabyClientProps {
  initialItems: (BabyChecklistItem & { assignedTo?: User })[];
}

export function BabyClient({ initialItems }: BabyClientProps) {
  const [items, setItems] = useState(initialItems);
  const [activeSection, setActiveSection] = useState<string>(BABY_SECTIONS[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshItems = async () => {
    try {
      const response = await fetch("/api/baby-items");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to refresh baby items:", error);
    }
  };

  const filteredItems = items.filter(item => item.section === activeSection);

  const updateItemStatus = async (
    itemId: string,
    status: "TODO" | "IN_PROGRESS" | "DONE"
  ) => {
    try {
      const response = await fetch(`/api/baby-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, status } : item
        ));
      }
    } catch (error) {
      console.error("Failed to update baby item:", error);
    }
  };

  const addToShoppingList = async (itemId: string) => {
    try {
      // For now, we'll just show a placeholder - in a real implementation
      // you'd have a modal to select which shopping list
      alert("Add to shopping list functionality would open a list selector here");
    } catch (error) {
      console.error("Failed to add to shopping list:", error);
    }
  };

  const createLinkedTask = async (itemId: string) => {
    try {
      const response = await fetch(`/api/baby-items/${itemId}/create-task`, {
        method: "POST",
      });

      if (response.ok) {
        const task = await response.json();
        alert(`Task created: ${task.title}`);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      TODO: "secondary",
      IN_PROGRESS: "default",
      DONE: "outline",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status.replace("_", " ")}</Badge>;
  };

  const getSectionStats = (section: string) => {
    const sectionItems = items.filter(item => item.section === section);
    const completed = sectionItems.filter(item => item.status === "DONE").length;
    return { total: sectionItems.length, completed };
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
              <h1 className="text-lg font-semibold text-on-surface">Baby Preparation</h1>
              <p className="text-xs text-on-surface-variant hidden sm:block">
                Complete checklist for baby's arrival - track progress across all categories
              </p>
            </div>
          </div>
          <CreateBabyItemModal onItemCreated={refreshItems} />
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {BABY_SECTIONS.map((section) => {
                const { total, completed } = getSectionStats(section);
                return (
                  <TabsTrigger key={section} value={section} className="text-xs">
                    {section}
                    {total > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {completed}/{total}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {BABY_SECTIONS.map((section) => (
              <TabsContent key={section} value={section} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Baby className="h-4 w-4" />
                      <span>{section} Preparation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredItems.length > 0 ? (
                      <div className="space-y-3">
                        {filteredItems.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3 rounded-lg border p-3">
                            <Checkbox
                              checked={item.status === "DONE"}
                              onCheckedChange={(checked) =>
                                updateItemStatus(item.id, checked ? "DONE" : "TODO")
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={item.status === "DONE" ? "line-through text-zinc-500" : ""}>
                                  {item.title}
                                </span>
                                {getStatusBadge(item.status)}
                                <Badge variant="outline">{item.itemType}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm text-zinc-600">
                                <div className="flex items-center space-x-4">
                                  {item.dueDate && (
                                    <span>Due: {format(item.dueDate, "MMM d, yyyy")}</span>
                                  )}
                                  {item.assignedTo && (
                                    <span>Assigned: {item.assignedTo.name}</span>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  {item.itemType === "PURCHASE" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addToShoppingList(item.id)}
                                    >
                                      <ShoppingCart className="h-3 w-3 mr-1" />
                                      Shop
                                    </Button>
                                  )}
                                  {item.itemType === "TASK" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => createLinkedTask(item.id)}
                                    >
                                      <CheckSquare className="h-3 w-3 mr-1" />
                                      Task
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-6 text-center text-zinc-500">
                        <Baby className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No items in {section} yet</p>
                        <p className="text-sm mt-1">Add preparation items to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </ProtectedPage>
  );
}
