'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { ChartConfig } from '@/components/ui/chart'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { sparklinePoints } from '@/features/dashboard/services/format-dashboard'

const sparklineConfig = {
  value: {
    color: 'var(--primary)',
    label: 'Value',
  },
} satisfies ChartConfig

const SPARKLINE_DIMENSION = { height: 32, width: 160 }

type DashboardStatSparklineProps = {
  series: readonly number[]
}

export function DashboardStatSparkline({ series }: DashboardStatSparklineProps) {
  return (
    <ChartContainer
      aria-hidden
      className="aspect-auto h-8 w-full"
      config={sparklineConfig}
      initialDimension={SPARKLINE_DIMENSION}
    >
      <AreaChart data={sparklinePoints(series)} margin={{ bottom: 0, left: 0, right: 0, top: 2 }}>
        {/* Axes, grid, and tooltip stay mounted for the scale, and stay hidden so only the area shows. */}
        <CartesianGrid horizontal={false} vertical={false} />
        <XAxis dataKey="index" hide />
        <YAxis hide />
        <ChartTooltip active={false} content={<ChartTooltipContent />} />
        <Area
          activeDot={false}
          dataKey="value"
          dot={false}
          fill="var(--color-value)"
          fillOpacity={0.35}
          stroke="var(--color-value)"
          strokeWidth={1.5}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  )
}
