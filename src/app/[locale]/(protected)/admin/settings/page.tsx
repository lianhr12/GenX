import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CoinsIcon, DatabaseIcon, KeyIcon, ShieldIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function AdminSettingsPage() {
  const t = await getTranslations('Dashboard.admin.adminSettings');

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      {/* Pricing & Credits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CoinsIcon className="size-5" />
            <CardTitle>{t('pricing.title')}</CardTitle>
          </div>
          <CardDescription>{t('pricing.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <ConfigItem
              label={t('pricing.priceConfig')}
              path="src/config/price-config.tsx"
            />
            <ConfigItem
              label={t('pricing.creditsConfig')}
              path="src/config/credits-config.tsx"
            />
            <ConfigItem
              label={t('pricing.videoCredits')}
              path="src/config/video-credits.ts"
            />
            <ConfigItem
              label={t('pricing.imageCredits')}
              path="src/config/image-credits.ts"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Permissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldIcon className="size-5" />
            <CardTitle>{t('admin.title')}</CardTitle>
          </div>
          <CardDescription>{t('admin.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {t('admin.betterAuthNote')}
          </p>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyIcon className="size-5" />
            <CardTitle>{t('env.title')}</CardTitle>
          </div>
          <CardDescription>{t('env.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <EnvItem name="DATABASE_URL" status={!!process.env.DATABASE_URL} />
            <EnvItem
              name="STRIPE_SECRET_KEY"
              status={!!process.env.STRIPE_SECRET_KEY}
            />
            <EnvItem
              name="BETTER_AUTH_SECRET"
              status={!!process.env.BETTER_AUTH_SECRET}
            />
            <EnvItem
              name="S3_ACCESS_KEY"
              status={!!process.env.S3_ACCESS_KEY}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DatabaseIcon className="size-5" />
            <CardTitle>{t('system.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Node.js</span>
              <span className="font-mono">{process.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('system.environment')}
              </span>
              <span className="font-mono">{process.env.NODE_ENV}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('system.database')}
              </span>
              <span className="font-mono">
                {process.env.DATABASE_URL ? '✓ Connected' : '✗ Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('system.payments')}
              </span>
              <span className="font-mono">
                {process.env.STRIPE_SECRET_KEY ? 'Stripe ✓' : 'Not configured'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigItem({ label, path }: { label: string; path: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span>{label}</span>
      <code className="text-muted-foreground text-xs">{path}</code>
    </div>
  );
}

function EnvItem({ name, status }: { name: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <code className="text-xs">{name}</code>
      <span className={status ? 'text-green-500' : 'text-red-500'}>
        {status ? '✓' : '✗'}
      </span>
    </div>
  );
}
