'use client';

import type { GalleryItem } from '@/db/schema';
import { useAdminGallery } from '@/hooks/use-admin-gallery';
import type { SortingState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { useEffect, useMemo, useRef } from 'react';
import { GalleryAdminTable } from './gallery-admin-table';

export function GalleryAdminPageClient() {
  const t = useTranslations('Dashboard.admin.gallery');

  const [{ page, size, search, status, sourceType, artStyle }, setQueryStates] =
    useQueryStates({
      page: parseAsIndex.withDefault(0),
      size: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
      sourceType: parseAsString.withDefault(''),
      artStyle: parseAsString.withDefault(''),
    });

  // Build filters for server API
  const filters = useMemo(() => {
    const serverFilters: Array<{ id: string; value: string }> = [];

    if (status) {
      serverFilters.push({ id: 'status', value: status });
    }
    if (sourceType) {
      serverFilters.push({ id: 'sourceType', value: sourceType });
    }
    if (artStyle) {
      serverFilters.push({ id: 'artStyle', value: artStyle });
    }

    return serverFilters;
  }, [status, sourceType, artStyle]);

  const filtersSignature = useMemo(
    () => JSON.stringify({ status, sourceType, artStyle }),
    [status, sourceType, artStyle]
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

  const { data, isLoading } = useAdminGallery(
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

      <GalleryAdminTable
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
