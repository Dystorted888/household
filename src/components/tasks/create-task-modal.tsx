"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckSquare } from "lucide-react";
import type { User } from "@prisma/client";

interface CreateTaskModalProps {
  users: User[];
  onTaskCreated: () => void;
}

export function CreateTaskModal({ users, onTaskCreated }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "GENERIC" as const,
    assignedToUserId: "",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          assignedToUserId: formData.assignedToUserId === "unassigned" ? undefined : formData.assignedToUserId || undefined,
          dueDate: formData.dueDate || undefined,
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          title: "",
          description: "",
          type: "GENERIC",
          assignedToUserId: "",
          dueDate: "",
        });
        onTaskCreated();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckSquare className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedToUserId: value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="sm:w-auto w-full">
              Cancel
            </Button>
            <Button type="submit" className="sm:w-auto w-full">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
