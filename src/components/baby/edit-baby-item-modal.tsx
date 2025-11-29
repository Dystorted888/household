"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PencilLine } from "lucide-react";
import { BABY_SECTIONS } from "@/lib/baby/sections";
import type { BabyChecklistItem, BabyItemType, User } from "@prisma/client";

interface EditBabyItemModalProps {
  users: User[];
  item: BabyChecklistItem & { assignedTo?: User | null };
  onSuccess: () => void | Promise<void>;
  trigger?: React.ReactNode;
}

const toDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export function EditBabyItemModal({ users, item, onSuccess, trigger }: EditBabyItemModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => ({
    title: item.title,
    section: item.section,
    itemType: item.itemType,
    assignedToUserId: item.assignedToUserId || "unassigned",
    dueDate: toDateInput(item.dueDate),
  }));

  useEffect(() => {
    if (!open) return;

    if (open && item) {
      setFormData({
        title: item.title,
        section: item.section,
        itemType: item.itemType,
        assignedToUserId: item.assignedToUserId || "unassigned",
        dueDate: toDateInput(item.dueDate),
      });
    }
  }, [open, item]);

  const defaultTrigger = useMemo(
    () => (
      <Button variant="ghost" size="sm">
        <PencilLine className="h-4 w-4 mr-2" />
        Edit
      </Button>
    ),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        section: formData.section,
        itemType: formData.itemType,
        assignedToUserId: formData.assignedToUserId === "unassigned" ? null : formData.assignedToUserId,
        dueDate: formData.dueDate || null,
      };

      const response = await fetch(`/api/baby-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setOpen(false);
        setSubmitting(false);
        await onSuccess();
      } else {
        console.error("Failed to save baby item:", await response.text());
      }
    } catch (error) {
      console.error("Failed to save baby item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Baby Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done or purchased?"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, section: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BABY_SECTIONS.map((section) => (
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
                onValueChange={(value) => setFormData((prev) => ({ ...prev, itemType: value as BabyItemType }))}
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
            <Label htmlFor="assignee">Assign to</Label>
            <Select
              value={formData.assignedToUserId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, assignedToUserId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="sm:w-auto w-full">
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

