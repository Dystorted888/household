"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { ShoppingItem, ShoppingList } from "@prisma/client";

interface UrgentShoppingCardProps {
  urgentItems: (ShoppingItem & { list: ShoppingList })[];
}

export function UrgentShoppingCard({ urgentItems }: UrgentShoppingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingBag className="h-4 w-4" />
          <span>Urgent Shopping</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {urgentItems.length > 0 ? (
          <div className="space-y-4">
            {urgentItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border-2 border-error/20 p-4 bg-error/5">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-on-surface">{item.name}</span>
                    <Badge variant="destructive" className="text-xs font-medium self-start">HIGH</Badge>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-2">
                    From: {item.list.name}
                    {item.quantity && ` • ${item.quantity}`}
                  </div>
                </div>
              </div>
            ))}
            {urgentItems.length > 5 && (
              <p className="text-xs text-on-surface-variant text-center font-medium">
                +{urgentItems.length - 5} more urgent items
              </p>
            )}
            <Link href="/shopping">
              <Button variant="filled" className="w-full mt-4">
                View all lists
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-outline-variant p-6 text-center">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-on-surface-variant/40" />
            <p className="text-on-surface-variant font-medium">No urgent shopping items</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
