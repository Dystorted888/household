"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";

type ProtectedPageProps = {
  children: React.ReactNode;
};

export const ProtectedPage = ({ children }: ProtectedPageProps) => {
  const { profile, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !profile) {
      router.replace("/login");
    }
  }, [profile, isLoaded, router]);

  // Show loading state until auth is loaded
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading your household...</p>
      </div>
    );
  }

  // Show login redirect message if no profile (this should be brief)
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
};


