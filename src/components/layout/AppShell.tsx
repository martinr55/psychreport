import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6">
        {children}
      </main>
    </div>
  );
}
