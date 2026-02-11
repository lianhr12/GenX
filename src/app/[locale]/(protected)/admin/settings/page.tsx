import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IMAGE_MODELS } from '@/config/image-credits';
import { VIDEO_MODELS } from '@/config/video-credits';
import { websiteConfig } from '@/config/website';
import {
  CoinsIcon,
  CpuIcon,
  KeyIcon,
  SettingsIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function AdminSettingsPage() {
  const t = await getTranslations('Dashboard.admin.adminSettings');

  const { price, credits, features, auth, payment, storage, mail, newsletter } =
    websiteConfig;

  // Model stats
  const videoModels = Object.values(VIDEO_MODELS);
  const imageModels = Object.values(IMAGE_MODELS);
  const videoCreditsRange = videoModels.map((m) => m.creditCost.base);
  const imageCreditsRange = imageModels.map((m) => m.creditCost.base);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      {/* Subscription Plans & Credit Packages */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CoinsIcon className="size-5" />
            <CardTitle>{t('pricing.title')}</CardTitle>
          </div>
          <CardDescription>{t('pricing.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plans */}
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('pricing.plans')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span>{t('pricing.free')}</span>
                <span className="text-muted-foreground">
                  {price.plans.free.credits?.amount} {t('pricing.credits')}/{price.plans.free.credits?.expireDays}{t('pricing.days')}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span>{t('pricing.pro')}</span>
                <span className="text-muted-foreground">
                  ${(price.plans.pro.prices[0]?.amount ?? 0) / 100}/{t('pricing.month')} | ${(price.plans.pro.prices[1]?.amount ?? 0) / 100}/{t('pricing.year')} | {price.plans.pro.credits?.amount} {t('pricing.credits')}/{price.plans.pro.credits?.expireDays}{t('pricing.days')}
                </span>
              </div>
            </div>
          </div>
          {/* Packages */}
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('pricing.packages')}</h4>
            <div className="space-y-2 text-sm">
              {Object.values(credits.packages).map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span className="capitalize">{pkg.id}</span>
                    {pkg.popular && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary text-xs">{t('pricing.popular')}</span>}
                  </span>
                  <span className="text-muted-foreground">
                    {pkg.amount} {t('pricing.credits')} · ${pkg.price.amount / 100} · {pkg.expireDays}{t('pricing.days')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Models Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CpuIcon className="size-5" />
            <CardTitle>{t('models.title')}</CardTitle>
          </div>
          <CardDescription>{t('models.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border px-3 py-3 text-center">
              <div className="font-semibold text-2xl">{videoModels.length}</div>
              <div className="text-muted-foreground text-xs">{t('models.videoModels')}</div>
              <div className="mt-1 text-muted-foreground text-xs">
                {t('models.creditRange')}: {Math.min(...videoCreditsRange)}–{Math.max(...videoCreditsRange)}
              </div>
            </div>
            <div className="rounded-md border px-3 py-3 text-center">
              <div className="font-semibold text-2xl">{imageModels.length}</div>
              <div className="text-muted-foreground text-xs">{t('models.imageModels')}</div>
              <div className="mt-1 text-muted-foreground text-xs">
                {t('models.creditRange')}: {Math.min(...imageCreditsRange)}–{Math.max(...imageCreditsRange)}
              </div>
            </div>
            <div className="rounded-md border px-3 py-3 text-center">
              <div className="font-semibold text-2xl">{videoModels.length + imageModels.length}</div>
              <div className="text-muted-foreground text-xs">{t('models.totalModels')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features & Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            <CardTitle>{t('features.title')}</CardTitle>
          </div>
          <CardDescription>{t('features.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('features.featureToggles')}</h4>
            <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.upgradeCard')}</span>
                <StatusBadge enabled={!!features.enableUpgradeCard} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.updateAvatar')}</span>
                <StatusBadge enabled={!!features.enableUpdateAvatar} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.turnstileCaptcha')}</span>
                <StatusBadge enabled={!!features.enableTurnstileCaptcha} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.crispChat')}</span>
                <StatusBadge enabled={!!features.enableCrispChat} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('features.loginMethods')}</h4>
            <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.credential')}</span>
                <StatusBadge enabled={!!auth.enableCredentialLogin} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.google')}</span>
                <StatusBadge enabled={!!auth.enableGoogleLogin} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.github')}</span>
                <StatusBadge enabled={!!auth.enableGithubLogin} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.facebook')}</span>
                <StatusBadge enabled={!!auth.enableFacebookLogin} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.googleOneTap')}</span>
                <StatusBadge enabled={!!auth.enableGoogleOneTap} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('features.serviceProviders')}</h4>
            <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.payment')}</span>
                <span className="font-mono text-xs">{payment.provider}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.storage')}</span>
                <span className="font-mono text-xs">{storage.provider}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.email')}</span>
                <span className="font-mono text-xs">{mail.provider}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{t('features.newsletter')}</span>
                <span className="font-mono text-xs">{newsletter.provider}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment & System */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyIcon className="size-5" />
            <CardTitle>{t('env.title')}</CardTitle>
          </div>
          <CardDescription>{t('env.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('env.core')}</h4>
            <div className="space-y-1 text-sm">
              <EnvItem name="DATABASE_URL" status={!!process.env.DATABASE_URL} />
              <EnvItem name="BETTER_AUTH_SECRET" status={!!process.env.BETTER_AUTH_SECRET} />
              <EnvItem name="BETTER_AUTH_URL" status={!!process.env.BETTER_AUTH_URL} />
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('env.payment')}</h4>
            <div className="space-y-1 text-sm">
              <EnvItem name="STRIPE_SECRET_KEY" status={!!process.env.STRIPE_SECRET_KEY} />
              <EnvItem name="STRIPE_WEBHOOK_SECRET" status={!!process.env.STRIPE_WEBHOOK_SECRET} />
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('env.storage')}</h4>
            <div className="space-y-1 text-sm">
              <EnvItem name="S3_ACCESS_KEY" status={!!process.env.S3_ACCESS_KEY} />
              <EnvItem name="S3_SECRET_KEY" status={!!process.env.S3_SECRET_KEY} />
              <EnvItem name="S3_BUCKET" status={!!process.env.S3_BUCKET} />
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-sm">{t('env.ai')}</h4>
            <div className="space-y-1 text-sm">
              <EnvItem name="OPENAI_API_KEY" status={!!process.env.OPENAI_API_KEY} />
              <EnvItem name="REPLICATE_API_TOKEN" status={!!process.env.REPLICATE_API_TOKEN} />
              <EnvItem name="AI_CALLBACK_URL" status={!!process.env.AI_CALLBACK_URL} />
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('env.nodeVersion')}</span>
                <span className="font-mono text-xs">{process.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('env.environment')}</span>
                <span className="font-mono text-xs">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('env.database')}</span>
                <span className="font-mono text-xs">
                  {process.env.DATABASE_URL ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('env.payments')}</span>
                <span className="font-mono text-xs">
                  {process.env.STRIPE_SECRET_KEY ? 'Stripe ✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={
        enabled
          ? 'text-green-600 dark:text-green-400'
          : 'text-muted-foreground'
      }
    >
      {enabled ? '✓' : '✗'}
    </span>
  );
}

function EnvItem({ name, status }: { name: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <code className="text-xs">{name}</code>
      <span className={status ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
        {status ? '✓' : '✗'}
      </span>
    </div>
  );
}
