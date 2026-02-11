'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { FunnelStep } from '@/lib/admin/analytics';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface FunnelChartProps {
  data: FunnelStep[];
  title: string;
  description?: string;
  labels: Record<string, string>;
}

const FUNNEL_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];

export function FunnelChart({
  data,
  title,
  description,
  labels,
}: FunnelChartProps) {
  const chartData = data.map((step) => ({
    name: labels[step.name] ?? step.name,
    value: step.value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="var(--border)"
            />
            <XAxis
              type="number"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              stroke="var(--border)"
            />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              stroke="var(--border)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--popover-foreground)',
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
