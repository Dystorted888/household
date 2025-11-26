"use client";

import { useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ShoppingCart,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit2,
  Trash2,
  Menu
} from "lucide-react";
import Link from "next/link";
import { CreateListModal } from "./create-list-modal";
import type { ShoppingList, ShoppingItem } from "@prisma/client";

interface ShoppingClientProps {
  initialLists: ShoppingList[];
  initialItems: ShoppingItem[];
  activeListId: string | null;
}

export function ShoppingClient({ initialLists, initialItems, activeListId }: ShoppingClientProps) {
  const [lists, setLists] = useState(initialLists);
  const [activeList, setActiveList] = useState(activeListId);
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "",
    priority: "MEDIUM" as const,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "to-buy" | "bought">("all");

  const filteredItems = items.filter(item => {
    if (filter === "to-buy") return !item.isBought;
    if (filter === "bought") return item.isBought;
    return true;
  });

  const loadList = async (listId: string) => {
    try {
      const response = await fetch(`/api/shopping-lists/${listId}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setActiveList(listId);
      }
    } catch (error) {
      console.error("Failed to load list:", error);
    }
  };

  const refreshLists = async () => {
    try {
      const response = await fetch("/api/shopping-lists");
      if (response.ok) {
        const lists = await response.json();
        setLists(lists);
      }
    } catch (error) {
      console.error("Failed to refresh lists:", error);
    }
  };

  const handleListCreated = async (listId: string) => {
    await refreshLists();
    loadList(listId);
  };

  const addItem = async () => {
    if (!newItem.name.trim() || !activeList) return;

    try {
      const response = await fetch(`/api/shopping-lists/${activeList}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItem.name.trim(),
          quantity: newItem.quantity.trim() || undefined,
          category: newItem.category.trim() || undefined,
          priority: newItem.priority,
        }),
      });

      if (response.ok) {
        const item = await response.json();
        setItems(prev => [item, ...prev]);
        setNewItem({ name: "", quantity: "", category: "", priority: "MEDIUM" });
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const toggleItem = async (itemId: string, isBought: boolean) => {
    try {
      const response = await fetch(`/api/shopping-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBought }),
      });

      if (response.ok) {
        setItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, isBought, boughtAt: isBought ? new Date() : null } : item
        ));
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      HIGH: "destructive",
      MEDIUM: "default",
      LOW: "secondary",
    } as const;
    return <Badge variant={variants[priority as keyof typeof variants]}>{priority}</Badge>;
  };

  return (
    <ProtectedPage>
      <div className="flex min-h-screen flex-col bg-surface">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-surface px-4 py-4 shadow-sm gap-4">
          <div className="flex items-center space-x-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
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
              <h1 className="text-lg font-semibold text-on-surface">Shopping Lists</h1>
              <p className="text-xs text-on-surface-variant hidden sm:block">
                Organize shopping by lists, set priorities, track completion
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-x-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Share List
            </Button>
            <CreateListModal onListCreated={handleListCreated} />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lists Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Lists
                    <CreateListModal onListCreated={handleListCreated} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lists.map((list) => (
                    <Button
                      key={list.id}
                      variant={activeList === list.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => loadList(list.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {list.name}
                    </Button>
                  ))}
                  {lists.length === 0 && (
                    <p className="text-sm text-zinc-500 text-center py-4">
                      No shopping lists yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Items List */}
            <div className="lg:col-span-3">
              {activeList ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {lists.find(l => l.id === activeList)?.name || "Shopping List"}
                      </CardTitle>
                      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="to-buy">To Buy</TabsTrigger>
                          <TabsTrigger value="bought">Bought</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Item Form */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Item name"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                        className="flex-1"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Qty"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                          className="w-20 sm:w-20"
                        />
                        <Select
                          value={newItem.priority}
                          onValueChange={(value) => setNewItem(prev => ({ ...prev, priority: value as any }))}
                        >
                          <SelectTrigger className="w-24 sm:w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Med</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                          <Button onClick={addItem} disabled={!newItem.name.trim()} className="px-4 sm:px-4">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center space-x-3 rounded-lg border p-3 ${
                            item.isBought ? "bg-zinc-50 opacity-75" : "bg-white"
                          }`}
                        >
                          <Checkbox
                            checked={item.isBought}
                            onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={item.isBought ? "line-through text-zinc-500" : ""}>
                                {item.name}
                              </span>
                              {getPriorityBadge(item.priority)}
                            </div>
                            {(item.quantity || item.category) && (
                              <div className="text-xs text-zinc-500 mt-1">
                                {item.quantity && `${item.quantity}`}
                                {item.quantity && item.category && " • "}
                                {item.category}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredItems.length === 0 && (
                        <div className="text-center py-8 text-zinc-500">
                          {filter === "all" ? "No items in this list" :
                           filter === "to-buy" ? "All items bought! 🎉" :
                           "No bought items"}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
                      <h3 className="text-lg font-medium mb-2">No list selected</h3>
                      <p className="text-zinc-500 mb-4">Select a shopping list to get started</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedPage>
  );
}
