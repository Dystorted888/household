"use client";

import { useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User as UserIcon, Palette, Menu } from "lucide-react";
import Link from "next/link";
import type { User as UserType } from "@prisma/client";

interface SettingsClientProps {
  users: UserType[];
}

export function SettingsClient({ users }: SettingsClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <h1 className="text-lg font-semibold text-on-surface">Settings</h1>
              <p className="text-xs text-on-surface-variant hidden sm:block">
                Manage your household and preferences
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Profiles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>User Profiles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="space-y-2">
                    <Label htmlFor={`name-${user.id}`}>{user.name}</Label>
                    <Input
                      id={`name-${user.id}`}
                      defaultValue={user.name}
                      placeholder="Display name"
                    />
                  </div>
                ))}
                <Button className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Light</Button>
                    <Button variant="outline" size="sm">Dark</Button>
                    <Button variant="default" size="sm">System</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Household Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Household</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="household-name">Household Name</Label>
                    <Input id="household-name" defaultValue="Our Home" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="UTC" />
                  </div>
                </div>
                <Button>Save Household Settings</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedPage>
  );
}
