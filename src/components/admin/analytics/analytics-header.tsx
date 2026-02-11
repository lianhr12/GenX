'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TimeRange } from '@/lib/admin/analytics';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface AnalyticsHeaderProps {
  title: string;
  description?: string;
  labels: Record<TimeRange, string>;
  currentRange: TimeRange;
}

export function AnalyticsHeader({
  title,
  description,
  labels,
  currentRange,
}: AnalyticsHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleRangeChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <Select value={currentRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(labels) as TimeRange[]).map((key) => (
            <SelectItem key={key} value={key}>
              {labels[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
