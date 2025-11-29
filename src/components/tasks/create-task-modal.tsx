"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckSquare, PencilLine } from "lucide-react";
import type { Task, TaskType, User } from "@prisma/client";

interface TaskFormDialogProps {
  users: User[];
  onSuccess: () => void | Promise<void>;
  task?: (Task & { assignedTo?: User | null }) | null;
  trigger?: React.ReactNode;
}

const emptyFormState = {
  title: "",
  description: "",
  type: "GENERIC" as TaskType | "GENERIC",
  assignedToUserId: "unassigned",
  dueDate: "",
};

const toDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export function TaskFormDialog({ users, onSuccess, task, trigger }: TaskFormDialogProps) {
  const isEditMode = Boolean(task);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(() =>
    task
      ? {
          title: task.title,
          description: task.description ?? "",
          type: task.type,
          assignedToUserId: task.assignedToUserId || "unassigned",
          dueDate: toDateInput(task.dueDate),
        }
      : emptyFormState
  );

  useEffect(() => {
    if (!open && !isEditMode) {
      setFormData(emptyFormState);
      return;
    }

    if (open && task) {
      setFormData({
        title: task.title,
        description: task.description ?? "",
        type: task.type,
        assignedToUserId: task.assignedToUserId || "unassigned",
        dueDate: toDateInput(task.dueDate),
      });
    }
  }, [open, isEditMode, task]);

  const dialogTitle = isEditMode ? "Edit Task" : "Create New Task";
  const submitLabel = isEditMode ? "Save Changes" : "Create Task";

  const defaultTrigger = useMemo(
    () => (
      <Button>
        <CheckSquare className="h-4 w-4 mr-2" />
        Add Task
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
        description: formData.description.trim() || null,
        type: formData.type,
        assignedToUserId:
          formData.assignedToUserId === "unassigned" ? null : formData.assignedToUserId,
        dueDate: formData.dueDate || null,
      };

      const response = await fetch(
        isEditMode && task ? `/api/tasks/${task.id}` : "/api/tasks",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setOpen(false);
        setSubmitting(false);
        if (!isEditMode) {
          setFormData(emptyFormState);
        }
        await onSuccess();
      } else {
        console.error("Failed to save task:", await response.text());
      }
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? <PencilLine className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as TaskType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERIC">General</SelectItem>
                  <SelectItem value="BABY">Baby</SelectItem>
                  <SelectItem value="HOUSE">House</SelectItem>
                </SelectContent>
              </Select>
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
              {submitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
