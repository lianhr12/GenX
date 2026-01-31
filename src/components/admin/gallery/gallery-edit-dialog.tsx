'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { GalleryItem } from '@/db/schema';
import { useUpdateGalleryItem } from '@/hooks/use-admin-gallery';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface GalleryEditDialogProps {
  item: GalleryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const artStyles = [
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'oilPainting', label: 'Oil Painting' },
  { value: 'anime', label: 'Anime' },
  { value: 'fluidArt', label: 'Fluid Art' },
];

export function GalleryEditDialog({
  item,
  open,
  onOpenChange,
}: GalleryEditDialogProps) {
  const t = useTranslations('Dashboard.admin.gallery');
  const { mutate: updateItem, isPending } = useUpdateGalleryItem();

  const [formData, setFormData] = useState({
    videoUrl: '',
    thumbnailUrl: '',
    prompt: '',
    artStyle: 'cyberpunk',
    creatorName: '',
    isFeatured: false,
    sortWeight: 0,
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        videoUrl: item.videoUrl,
        thumbnailUrl: item.thumbnailUrl,
        prompt: item.prompt,
        artStyle: item.artStyle,
        creatorName: item.creatorName || '',
        isFeatured: item.isFeatured,
        sortWeight: item.sortWeight,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    updateItem(
      {
        id: item.id,
        videoUrl: formData.videoUrl,
        thumbnailUrl: formData.thumbnailUrl,
        prompt: formData.prompt,
        artStyle: formData.artStyle as
          | 'cyberpunk'
          | 'watercolor'
          | 'oilPainting'
          | 'anime'
          | 'fluidArt',
        creatorName: formData.creatorName || undefined,
        isFeatured: formData.isFeatured,
        sortWeight: formData.sortWeight,
      },
      {
        onSuccess: () => {
          toast.success(t('form.success'));
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || t('form.error'));
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('edit.title')}</DialogTitle>
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">{t('form.videoUrl')}</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder={t('form.videoUrlPlaceholder')}
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">{t('form.thumbnailUrl')}</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                placeholder={t('form.thumbnailUrlPlaceholder')}
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">{t('form.prompt')}</Label>
            <Textarea
              id="prompt"
              placeholder={t('form.promptPlaceholder')}
              value={formData.prompt}
              onChange={(e) =>
                setFormData({ ...formData, prompt: e.target.value })
              }
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="artStyle">{t('form.artStyle')}</Label>
              <Select
                value={formData.artStyle}
                onValueChange={(value) =>
                  setFormData({ ...formData, artStyle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.selectArtStyle')} />
                </SelectTrigger>
                <SelectContent>
                  {artStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorName">{t('form.creatorName')}</Label>
              <Input
                id="creatorName"
                placeholder={t('form.creatorNamePlaceholder')}
                value={formData.creatorName}
                onChange={(e) =>
                  setFormData({ ...formData, creatorName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sortWeight">{t('form.sortWeight')}</Label>
              <Input
                id="sortWeight"
                type="number"
                value={formData.sortWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortWeight: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t('form.sortWeightHint')}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isFeatured">{t('form.isFeatured')}</Label>
              </div>
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? t('form.submitting') : t('form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
