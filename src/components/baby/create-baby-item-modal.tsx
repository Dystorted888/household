"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { SECTIONS } from "@/lib/baby";

interface CreateBabyItemModalProps {
  onItemCreated: () => void;
}

export function CreateBabyItemModal({ onItemCreated }: CreateBabyItemModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    section: SECTIONS[0] as string,
    itemType: "TASK" as const,
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const response = await fetch("/api/baby-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          section: formData.section,
          itemType: formData.itemType,
          dueDate: formData.dueDate || undefined,
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          title: "",
          section: SECTIONS[0],
          itemType: "TASK",
          dueDate: "",
        });
        onItemCreated();
      }
    } catch (error) {
      console.error("Failed to create baby item:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Baby Preparation Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done or purchased?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemType">Type *</Label>
              <Select
                value={formData.itemType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, itemType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
