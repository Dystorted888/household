"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface CreateListModalProps {
  onListCreated: (listId: string) => void;
}

export function CreateListModal({ onListCreated }: CreateListModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const newList = await response.json();
        setOpen(false);
        setName("");
        onListCreated(newList.id);
      }
    } catch (error) {
      console.error("Failed to create shopping list:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Shopping List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">List Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Weekly Groceries, Pharmacy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create List</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
