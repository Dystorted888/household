"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { setProfile } = useAuth();

  const handleSelect = (who: "Husband" | "Wife") => {
    setProfile(who);
    router.replace("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-semibold text-zinc-900">
          Who is using the app?
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          This app is just for the two of you. Choose who you are to continue.
        </p>
        <div className="mt-6 grid gap-4">
          <button
            type="button"
            onClick={() => handleSelect("Husband")}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-100"
          >
            Husband
            <p className="mt-1 text-xs font-normal text-zinc-500">
              Plan meals, manage tasks, and track baby prep.
            </p>
          </button>
          <button
            type="button"
            onClick={() => handleSelect("Wife")}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-100"
          >
            Wife
            <p className="mt-1 text-xs font-normal text-zinc-500">
              Share the same dashboard and keep everything in sync.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}


