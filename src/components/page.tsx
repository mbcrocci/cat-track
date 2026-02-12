import { Link } from "@tanstack/react-router";
import { BarChart3, PawPrint } from "lucide-react";

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background">
      {/* Ambient radial glow at the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 opacity-[0.07] dark:opacity-[0.12]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, var(--color-primary), transparent)",
        }}
      />

      {children}
    </div>
  );
}

export function Header(
    { title, subtitle, icon, navigation }: { title: string, subtitle: string, icon?: React.ReactNode, navigation?: React.ReactNode }

) {
  return (
    <header className="animate-fade-in-up flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
        {icon}
        
        </div>
        <div>
          <h1 className="font-display text-[1.625rem] font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-[13px] leading-tight text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {navigation}
    </header>
  );
}
