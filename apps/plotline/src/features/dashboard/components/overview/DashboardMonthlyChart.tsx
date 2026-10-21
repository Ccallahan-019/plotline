'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import type { ChartConfig } from '@/components/ui/chart'
import type { DashboardSummary } from '@/features/dashboard/types'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  formatDashboardQuantity,
  monthAxisLetter,
  titlesPerMonthBars,
  titlesPerMonthMinPointSize,
} from '@/features/dashboard/services/format-dashboard'

const titlesPerMonthConfig = {
  count: {
    color: 'var(--primary)',
    label: 'Titles',
  },
} satisfies ChartConfig

type DashboardMonthlyChartProps = {
  summary: DashboardSummary
}

export function DashboardMonthlyChart({ summary }: DashboardMonthlyChartProps) {
  const bars = titlesPerMonthBars(
    summary.titlesPerMonth.counts,
    summary.titlesPerMonth.highlightMonth,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Titles per Month</CardTitle>
        <CardDescription>Your viewing year, so far</CardDescription>
        <CardAction>
          <Badge variant="secondary">Stats {summary.year}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-48 w-full" config={titlesPerMonthConfig}>
          <BarChart data={bars} margin={{ bottom: 0, left: 0, right: 0, top: 8 }}>
            <XAxis
              axisLine={false}
              dataKey="month"
              interval={0}
              tickFormatter={monthAxisLetter}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar dataKey="count" minPointSize={titlesPerMonthMinPointSize} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
        <ul className="sr-only">
          {bars.map((bar) => (
            <li key={bar.month}>
              {bar.month}: {formatDashboardQuantity(bar.count, 'title')}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
