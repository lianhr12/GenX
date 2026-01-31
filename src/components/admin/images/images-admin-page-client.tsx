'use client';

import { useAdminImages } from '@/hooks/use-admin-images';
import type { SortingState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { useEffect, useMemo, useRef } from 'react';
import { ImagesAdminTable } from './images-admin-table';

export function ImagesAdminPageClient() {
  const t = useTranslations('Dashboard.admin.images');

  const [{ page, size, search, status, model }, setQueryStates] =
    useQueryStates({
      page: parseAsIndex.withDefault(0),
      size: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
      model: parseAsString.withDefault(''),
    });

  // Build filters for server API
  const filters = useMemo(() => {
    const serverFilters: Array<{ id: string; value: string }> = [];

    if (status) {
      serverFilters.push({ id: 'status', value: status });
    }
    if (model) {
      serverFilters.push({ id: 'model', value: model });
    }

    return serverFilters;
  }, [status, model]);

  const filtersSignature = useMemo(
    () => JSON.stringify({ status, model }),
    [status, model]
  );

  const previousFiltersSignatureRef = useRef(filtersSignature);

  // Reset page to 0 when filters change
  useEffect(() => {
    if (previousFiltersSignatureRef.current === filtersSignature) return;
    previousFiltersSignatureRef.current = filtersSignature;
    void setQueryStates(
      { page: 0 },
      {
        history: 'replace',
        shallow: true,
      }
    );
  }, [filtersSignature, setQueryStates]);

  // Default sorting by createdAt desc
  const sorting: SortingState = [{ id: 'createdAt', desc: true }];

  const { data, isLoading } = useAdminImages(
    page,
    size,
    search,
    sorting,
    filters
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <ImagesAdminTable
        data={data?.items || []}
        total={data?.total || 0}
        pageIndex={page}
        pageSize={size}
        search={search}
        loading={isLoading}
        onSearch={(newSearch) => setQueryStates({ search: newSearch, page: 0 })}
        onPageChange={(newPageIndex) => setQueryStates({ page: newPageIndex })}
        onPageSizeChange={(newPageSize) =>
          setQueryStates({ size: newPageSize, page: 0 })
        }
      />
    </div>
  );
}
