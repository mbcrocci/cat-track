import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Cat, Droplets, PawPrint, Trash2, Wheat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

import type { StatsData } from "@/server/api/functions";
import { getStats, deleteFeeding } from "@/server/api/functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Header, Page } from "@/components/page";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => getStats(),
  });

  return (
    <Page>
      <main className="relative mx-auto max-w-md px-4 py-6 pb-24">
        <Header
          title="Stats"
          subtitle="Feeding history and breakdowns"
          icon={<BarChart3 className="size-5 text-primary" strokeWidth={2.25} />}
          navigation={
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground no-underline outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <PawPrint className="size-4" aria-hidden />
              Track
            </Link>
          }
        />

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading stats…</p>}

        {stats && (
          <div className="mt-8 space-y-8">
            <FeedingsByDayChart data={stats.byDay} />
            <SummaryCards byCat={stats.byCat} byFoodType={stats.byFoodType} />
            <RecentFeedings recent={stats.recent} />
          </div>
        )}
      </main>
    </Page>
  );
}

function FeedingsByDayChart({ data }: { data: StatsData["byDay"] }) {
  const [viewByCat, setViewByCat] = useState(false);

  const chartData = data.map((d) => ({
    date: format(new Date(d.date), "MMM d"),
    count: d.count,
    mittens: d.mittens,
    vaquinha: d.vaquinha,
  }));

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="size-4 text-muted-foreground" />
              Feedings by day
            </CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </div>
          <div className="flex rounded-lg border border-border bg-muted p-0.5">
            <button
              onClick={() => setViewByCat(false)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                !viewByCat
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewByCat(true)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewByCat
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Cat
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[200px] w-full">
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {viewByCat ? (
              <>
                <Bar
                  dataKey="mittens"
                  radius={[4, 4, 0, 0]}
                  fill="#f59e0b"
                  name="Mittens"
                />
                <Bar
                  dataKey="vaquinha"
                  radius={[4, 4, 0, 0]}
                  fill="#14b8a6"
                  name="Vaquinha"
                />
              </>
            ) : (
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="var(--color-chart-1)" />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

type Period = "today" | "yesterday" | "total";

const periodLabels: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yest." },
  { value: "total", label: "Total" },
];

function PeriodToggle({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="flex rounded-md border border-border/60 bg-muted/50 p-0.5 gap-px">
      {periodLabels.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`relative flex-1 rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 ${
            value === p.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function SummaryCards({
  byCat,
  byFoodType,
}: {
  byCat: StatsData["byCat"];
  byFoodType: StatsData["byFoodType"];
}) {
  const [catPeriod, setCatPeriod] = useState<Period>("today");
  const [foodPeriod, setFoodPeriod] = useState<Period>("today");

  const catData = byCat[catPeriod];
  const foodData = byFoodType[foodPeriod];

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Cat className="size-4 text-muted-foreground" />
              By cat
            </CardTitle>
          </div>
          <PeriodToggle value={catPeriod} onChange={setCatPeriod} />
        </CardHeader>
        <CardContent className="space-y-1.5">
          {catData.map(({ cat, count }) => (
            <div
              key={cat}
              className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5"
            >
              <span className="text-xs font-medium capitalize text-muted-foreground">{cat}</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wheat className="size-4 text-muted-foreground" />
              <Droplets className="size-3.5 text-muted-foreground" />
              By type
            </CardTitle>
          </div>
          <PeriodToggle value={foodPeriod} onChange={setFoodPeriod} />
        </CardHeader>
        <CardContent className="space-y-1.5">
          {foodData.map(({ foodType, count }) => (
            <div
              key={foodType}
              className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5"
            >
              <span className="text-xs font-medium capitalize text-muted-foreground">
                {foodType}
              </span>
              <span className="text-lg font-semibold tabular-nums text-foreground">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RecentFeedings({ recent }: { recent: StatsData["recent"] }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteFeeding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  if (recent.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">Recent feedings</CardTitle>
        <CardDescription>Latest 20 entries</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recent.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="capitalize font-medium text-foreground">{r.cat}</span>
              <div className="flex items-center gap-2">
                {r.foodType === "wet" ? (
                  <Droplets className="size-3.5 text-muted-foreground" aria-hidden />
                ) : (
                  <Wheat className="size-3.5 text-muted-foreground" aria-hidden />
                )}
                <span className="capitalize text-muted-foreground">{r.foodType}</span>
                <span className="text-muted-foreground">{format(r.createdAt, "MMM d, HH:mm")}</span>
                <button
                  onClick={() => deleteMutation.mutate({ data: { id: r.id } })}
                  className="ml-1 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete feeding"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
