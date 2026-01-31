'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { GalleryItem } from '@/db/schema';
import {
  useDeleteGalleryItem,
  useReviewGalleryItem,
  useToggleFeatured,
} from '@/hooks/use-admin-gallery';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  Star,
  StarOff,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { GalleryEditDialog } from './gallery-edit-dialog';

interface GalleryAdminTableProps {
  data: GalleryItem[];
  total: number;
  pageIndex: number;
  pageSize: number;
  search: string;
  loading: boolean;
  onSearch: (search: string) => void;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function GalleryAdminTable({
  data,
  total,
  pageIndex,
  pageSize,
  search,
  loading,
  onSearch,
  onPageChange,
  onPageSizeChange,
}: GalleryAdminTableProps) {
  const t = useTranslations('Dashboard.admin.gallery');
  const tCommon = useTranslations('Common.table');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<GalleryItem | null>(null);

  const { mutate: deleteItem, isPending: isDeleting } = useDeleteGalleryItem();
  const { mutate: reviewItem, isPending: isReviewing } = useReviewGalleryItem();
  const { mutate: toggleFeatured, isPending: isTogglingFeatured } =
    useToggleFeatured();

  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = (item: GalleryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setItemToEdit(item);
    setEditDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    deleteItem(itemToDelete.id, {
      onSuccess: () => {
        toast.success(t('delete.success'));
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || t('delete.error'));
      },
    });
  };

  const handleApprove = (item: GalleryItem) => {
    reviewItem(
      { id: item.id, action: 'approve' },
      {
        onSuccess: () => {
          toast.success(t('review.approveSuccess'));
        },
        onError: (error) => {
          toast.error(error.message || t('review.error'));
        },
      }
    );
  };

  const handleReject = (item: GalleryItem) => {
    reviewItem(
      { id: item.id, action: 'reject' },
      {
        onSuccess: () => {
          toast.success(t('review.rejectSuccess'));
        },
        onError: (error) => {
          toast.error(error.message || t('review.error'));
        },
      }
    );
  };

  const handleToggleFeatured = (item: GalleryItem) => {
    toggleFeatured(
      { id: item.id, isFeatured: !item.isFeatured },
      {
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">{t('statuses.approved')}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{t('statuses.pending')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('statuses.rejected')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (sourceType: string) => {
    return sourceType === 'official' ? (
      <Badge variant="default">{t('sourceTypes.official')}</Badge>
    ) : (
      <Badge variant="outline">{t('sourceTypes.user')}</Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {tCommon('totalRecords', { count: total })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                {t('columns.thumbnail')}
              </TableHead>
              <TableHead>{t('columns.prompt')}</TableHead>
              <TableHead>{t('columns.artStyle')}</TableHead>
              <TableHead>{t('columns.sourceType')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.isFeatured')}</TableHead>
              <TableHead className="text-right">
                {t('columns.likesCount')}
              </TableHead>
              <TableHead className="text-right">
                {t('columns.viewsCount')}
              </TableHead>
              <TableHead className="w-[80px]">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="relative h-14 w-20 overflow-hidden rounded">
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.prompt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate text-sm">{item.prompt}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.artStyle}</Badge>
                  </TableCell>
                  <TableCell>{getSourceBadge(item.sourceType)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(item)}
                      disabled={isTogglingFeatured}
                    >
                      {item.isFeatured ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likesCount}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Eye className="h-3 w-3" />
                      {item.viewsCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Edit option - always visible */}
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('actions.edit')}
                        </DropdownMenuItem>
                        {/* Review options - only for pending items */}
                        {item.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleApprove(item)}
                              disabled={isReviewing}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              {t('actions.approve')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReject(item)}
                              disabled={isReviewing}
                            >
                              <X className="mr-2 h-4 w-4" />
                              {t('actions.reject')}
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(item)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {tCommon('page')} {pageIndex + 1} / {totalPages || 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            {tCommon('previousPage')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
          >
            {tCommon('nextPage')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <GalleryEditDialog
        item={itemToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
