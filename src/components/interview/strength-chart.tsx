
"use client"

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

export interface ChartData {
  name: string;
  value: number;
}

interface StrengthChartProps {
  data: ChartData[];
}

export function StrengthChart({ data }: StrengthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data to display.
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
             <LabelList dataKey="value" position="top" offset={5} fontSize={12} fill="hsl(var(--foreground))" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
