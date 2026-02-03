'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckIcon, CopyIcon, HashIcon, LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ReferralCodeCardProps {
  code: string;
  link: string;
  isLoading: boolean;
}

export function ReferralCodeCard({
  code,
  link,
  isLoading,
}: ReferralCodeCardProps) {
  const t = useTranslations('Dashboard.settings.referral');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          {t('code.title')}
        </CardTitle>
        <CardDescription>{t('code.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <HashIcon className="h-4 w-4" />
            {t('code.yourCode')}
          </Label>
          <div className="flex gap-2">
            <Input
              value={code}
              readOnly
              className="font-mono text-lg tracking-wider"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(code, 'code')}
              disabled={!code}
            >
              {copiedCode ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            {t('code.yourLink')}
          </Label>
          <div className="flex gap-2">
            <Input value={link} readOnly className="text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(link, 'link')}
              disabled={!link}
            >
              {copiedLink ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
