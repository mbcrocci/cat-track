import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Cat, Droplets, Wheat } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'

import type {StatsData} from '@/server/api/functions';
import {  getStats } from '@/server/api/functions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/stats')({
  component: StatsPage,
})

const chartConfig = {
  count: {
    label: 'Feedings',
    color: 'var(--color-chart-1)',
  },
}

function StatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => getStats(),
  })

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 opacity-[0.07] dark:opacity-[0.12]"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -20%, var(--color-primary), transparent)',
        }}
      />

      <main className="relative mx-auto max-w-md px-4 py-6 pb-24">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Stats
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Feeding history and breakdowns
        </p>

        {isLoading && (
          <p className="mt-8 text-sm text-muted-foreground">Loading stats…</p>
        )}

        {stats && (
          <div className="mt-8 space-y-8">
            <FeedingsByDayChart data={stats.byDay} />
            <SummaryCards byCat={stats.byCat} byFoodType={stats.byFoodType} />
            <RecentFeedings recent={stats.recent} />
          </div>
        )}
      </main>
    </div>
  )
}

function FeedingsByDayChart({ data }: { data: StatsData['byDay'] }) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), 'MMM d'),
    count: d.count,
  }))

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="size-4 text-muted-foreground" />
          Feedings by day
        </CardTitle>
        <CardDescription>Last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              fill="var(--color-chart-1)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function SummaryCards({
  byCat,
  byFoodType,
}: {
  byCat: StatsData['byCat']
  byFoodType: StatsData['byFoodType']
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cat className="size-4 text-muted-foreground" />
            By cat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {byCat.map(({ cat, count }) => (
            <Badge key={cat} variant="secondary" className="capitalize">
              {cat}: {count}
            </Badge>
          ))}
        </CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wheat className="size-4 text-muted-foreground" />
            <Droplets className="size-3.5 text-muted-foreground" />
            By type
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {byFoodType.map(({ foodType, count }) => (
            <Badge key={foodType} variant="outline" className="capitalize">
              {foodType}: {count}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RecentFeedings({ recent }: { recent: StatsData['recent'] }) {
  if (recent.length === 0) return null

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
              <span className="capitalize font-medium text-foreground">
                {r.cat}
              </span>
              <div className="flex items-center gap-2">
                {r.foodType === 'wet' ? (
                  <Droplets
                    className="size-3.5 text-muted-foreground"
                    aria-hidden
                  />
                ) : (
                  <Wheat
                    className="size-3.5 text-muted-foreground"
                    aria-hidden
                  />
                )}
                <span className="capitalize text-muted-foreground">
                  {r.foodType}
                </span>
                <span className="text-muted-foreground">
                  {format(r.createdAt, 'MMM d, HH:mm')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
