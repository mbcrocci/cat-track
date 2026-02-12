import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cat, Clock, Droplets, Loader2, PawPrint } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLastFeedings, logFeeding } from "@/server/api/functions";
import { toast } from "sonner";
import { Feeding } from "@/server/database/schema";

export const Route = createFileRoute("/")({
  component: HomePage,
});

/* ────────────────────────────────────────────────────────── */
/*  Page                                                      */
/* ────────────────────────────────────────────────────────── */

function HomePage() {
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

      <main className="relative mx-auto max-w-md px-5 pt-10 pb-56">
        <Header />
        <FeedingStatus />
      </main>

      <QuickLogBar />
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Header                                                    */
/* ────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <PawPrint className="size-5 text-primary" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="font-display text-[1.625rem] font-bold tracking-tight text-foreground">
            Cat Track
          </h1>
          <p className="text-[13px] leading-tight text-muted-foreground">Thursday, February 12</p>
        </div>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Feeding Status Cards                                      */
/* ────────────────────────────────────────────────────────── */

function FeedingStatus() {
  const { data: feedings } = useQuery({
    queryKey: ["last-feedings"],
    queryFn: () => getLastFeedings(),
  });

  if (!feedings) return null;

  return (
    <section className="mt-10 space-y-4" aria-label="Feeding status">
      {feedings.mittens && (
        <CatCard
          name="Mittens"
          hours={feedings.mittens.hours}
          minutes={feedings.mittens.minutes}
          lastFedAt={feedings.mittens.lastFedAt}
          color="amber"
          status={feedings.mittens.status as FeedStatus}
          delay={feedings.mittens.delay}
        />
      )}

      {feedings.vaquinha && (
        <CatCard
          name="Vaquinha"
          hours={feedings.vaquinha.hours}
          minutes={feedings.vaquinha.minutes}
          lastFedAt={feedings.vaquinha.lastFedAt}
          color="teal"
          status={feedings.vaquinha.status as FeedStatus}
          delay={feedings.vaquinha.delay}
        />
      )}
    </section>
  );
}

/* ── Style maps ── */

type CatColor = "amber" | "teal";
type FeedStatus = "fed" | "hungry";

const colorStyles: Record<CatColor, { border: string; iconBg: string; iconText: string }> = {
  amber: {
    border: "border-l-amber-400 dark:border-l-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-950/50",
    iconText: "text-amber-600 dark:text-amber-400",
  },
  teal: {
    border: "border-l-teal-400 dark:border-l-teal-500",
    iconBg: "bg-teal-100 dark:bg-teal-950/50",
    iconText: "text-teal-600 dark:text-teal-400",
  },
};

const statusStyles: Record<FeedStatus, { dot: string; label: string }> = {
  fed: {
    dot: "bg-emerald-500",
    label: "Fed",
  },
  hungry: {
    dot: "bg-amber-500 animate-pulse",
    label: "Getting hungry",
  },
};

/* ── Card ── */

interface CatCardProps {
  name: string;
  hours: number;
  minutes: number;
  lastFedAt: string;
  color: CatColor;
  status: FeedStatus;
  delay: number;
}

function CatCard({ name, hours, minutes, lastFedAt, color, status, delay }: CatCardProps) {
  const c = colorStyles[color];
  const s = statusStyles[status];

  return (
    <article
      className={`animate-fade-in-up rounded-2xl border-l-4 ${c.border} bg-card p-5 shadow-sm ring-1 ring-border/50`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Top row — icon, name, status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`grid size-8 place-items-center rounded-lg ${c.iconBg}`}>
            <Cat className={`size-[18px] ${c.iconText}`} strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-foreground">{name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${s.dot}`} />
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      </div>

      {/* Big time display */}
      <div className="mt-6 text-center">
        <p className="font-display leading-none text-foreground">
          <span className="text-5xl font-bold tracking-tight">{hours}</span>
          <span className="ml-0.5 text-xl font-medium text-muted-foreground/70">h</span>
          <span className="inline-block w-3" />
          <span className="text-5xl font-bold tracking-tight">{minutes}</span>
          <span className="ml-0.5 text-xl font-medium text-muted-foreground/70">m</span>
        </p>
        <p className="mt-2 text-[13px] text-muted-foreground">since last meal</p>
      </div>

      {/* Detail row */}
      <div className="mt-5 flex items-center gap-1.5 text-muted-foreground">
        <Clock className="size-3.5" />
        <span className="text-xs">{lastFedAt}</span>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Quick Log Bar (fixed bottom)                              */
/* ────────────────────────────────────────────────────────── */

function QuickLogBar() {
  const [wetFood, setWetFood] = useState(false);
  const foodType = wetFood ? "wet" : "dry";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
      <div
        className="mx-auto max-w-md px-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:bg-card/60 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Log feeding
            </p>
            <button
              type="button"
              onClick={() => setWetFood((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                wetFood
                  ? "bg-sky-100 text-sky-700 ring-1 ring-sky-300/50 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-500/30"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <Droplets
                className={`size-3 transition-colors duration-200 ${wetFood ? "text-sky-500 dark:text-sky-400" : "text-muted-foreground/50"}`}
              />
              Wet
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <QuickLogButton label="Mittens" emoji="🐱" cat="mittens" foodType={foodType} />
            <QuickLogButton label="Both" emoji="🐾" cat="both" foodType={foodType} />
            <QuickLogButton label="Vaquinha" emoji="🐮" cat="vaquinha" foodType={foodType} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Button ── */

interface QuickLogButtonProps {
  label: string;
  emoji: string;
  primary?: boolean;
  cat: Feeding["cat"];
  foodType: Feeding["foodType"];
}

function QuickLogButton({ label, emoji, primary = false, cat, foodType }: QuickLogButtonProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: (typeof logFeeding)["arguments"]) => logFeeding({ data }),
    onSuccess: () => {
      toast.success("Feeding logged");
      queryClient.invalidateQueries({ queryKey: ["last-feedings"] });
    },
    onError: () => {
      toast.error("Failed to log feeding");
    },
  });

  const onClick = () => mutate({ cat, foodType });

  return (
    <button
      type="button"
      className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 active:brightness-95 ${
        primary
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "bg-secondary text-secondary-foreground"
      }`}
      disabled={isPending}
      onClick={onClick}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <span className="text-lg leading-none">{emoji}</span>
          <span className="text-[11px] font-semibold leading-tight">{label}</span>
        </>
      )}
    </button>
  );
}
