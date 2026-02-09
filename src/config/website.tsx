import { PaymentTypes, PlanIntervals } from '@/payment/types';
import type { WebsiteConfig } from '@/types';

/**
 * website config, without translations
 */
export const websiteConfig: WebsiteConfig = {
  ui: {
    mode: {
      defaultMode: 'dark',
      enableSwitch: false,
    },
  },
  metadata: {
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    },
    social: {
      twitter: 'https://twitter.com/genxart',
      discord: 'https://discord.gg/KqbTsxGA',
    },
  },
  features: {
    enableUpgradeCard: true,
    enableUpdateAvatar: true,
    enableAffonsoAffiliate: false,
    enablePromotekitAffiliate: false,
    enableDatafastRevenueTrack: false,
    enableCrispChat: process.env.NEXT_PUBLIC_DEMO_WEBSITE === 'true',
    enableTurnstileCaptcha: true,
  },
  routes: {
    defaultLoginRedirect: '/dashboard',
  },
  analytics: {
    enableVercelAnalytics: false,
    enableSpeedInsights: false,
  },
  auth: {
    enableGoogleLogin: true,
    enableGithubLogin: true,
    enableFacebookLogin: false, // Temporarily disabled
    enableCredentialLogin: true,
    enableGoogleOneTap: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: {
        flag: '🇺🇸',
        name: 'English',
        hreflang: 'en',
      },
      zh: {
        flag: '🇨🇳',
        name: '简体中文',
        hreflang: 'zh-CN',
      },
      'zh-hk': {
        flag: '🇨🇳',
        name: '繁體中文',
        hreflang: 'zh-HK',
      },
      ja: {
        flag: '🇯🇵',
        name: '日本語',
        hreflang: 'ja',
      },
      ko: {
        flag: '🇰🇷',
        name: '한국어',
        hreflang: 'ko',
      },
      es: {
        flag: '🇪🇸',
        name: 'Español',
        hreflang: 'es',
      },
      fr: {
        flag: '🇫🇷',
        name: 'Français',
        hreflang: 'fr',
      },
      pt: {
        flag: '🇧🇷',
        name: 'Português',
        hreflang: 'pt',
      },
      de: {
        flag: '🇩🇪',
        name: 'Deutsch',
        hreflang: 'de',
      },
      it: {
        flag: '🇮🇹',
        name: 'Italiano',
        hreflang: 'it',
      },
      ru: {
        flag: '🇷🇺',
        name: 'Русский',
        hreflang: 'ru',
      },
      ar: {
        flag: '🇸🇦',
        name: 'العربية',
        hreflang: 'ar',
      },
      th: {
        flag: '🇹🇭',
        name: 'ภาษาไทย',
        hreflang: 'th',
      },
      pl: {
        flag: '🇵🇱',
        name: 'Polski',
        hreflang: 'pl',
      },
      nl: {
        flag: '🇳🇱',
        name: 'Nederlands',
        hreflang: 'nl',
      },
      da: {
        flag: '🇩🇰',
        name: 'Dansk',
        hreflang: 'da',
      },
      nb: {
        flag: '🇳🇴',
        name: 'Norsk bokmål',
        hreflang: 'nb',
      },
      id: {
        flag: '🇮🇩',
        name: 'Bahasa Indonesia',
        hreflang: 'id',
      },
      tr: {
        flag: '🇹🇷',
        name: 'Türkçe',
        hreflang: 'tr',
      },
    },
  },
  blog: {
    enable: true,
    paginationSize: 6,
    relatedPostsSize: 3,
  },
  docs: {
    enable: true,
  },
  mail: {
    provider: 'resend',
    fromEmail: 'GenX.art <support@genx.art>',
    supportEmail: 'support@genx.art',
  },
  newsletter: {
    enable: true,
    provider: 'resend',
    autoSubscribeAfterSignUp: true,
  },
  storage: {
    enable: true,
    provider: 's3',
  },
  payment: {
    provider: 'stripe',
  },
  price: {
    plans: {
      free: {
        id: 'free',
        prices: [],
        isFree: true,
        credits: {
          enable: true,
          amount: 15,
          expireDays: 30,
        },
      },
      pro: {
        id: 'pro',
        prices: [
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
            creemProductId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_PRO_MONTHLY,
            amount: 990,
            currency: 'USD',
            interval: PlanIntervals.MONTH,
          },
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY!,
            creemProductId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_PRO_YEARLY,
            amount: 9900,
            currency: 'USD',
            interval: PlanIntervals.YEAR,
          },
        ],
        isFree: false,
        popular: true,
        credits: {
          enable: true,
          amount: 800,
          expireDays: 30,
        },
      },
    },
  },
  credits: {
    enableCredits: true,
    enablePackagesForFreePlan: true,
    registerGiftCredits: {
      enable: true,
      amount: 15,
      expireDays: 30,
    },
    packages: {
      starter: {
        id: 'starter',
        popular: false,
        amount: 350,
        expireDays: 365,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STARTER!,
          creemProductId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_CREDITS_STARTER,
          amount: 490,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
      basic: {
        id: 'basic',
        popular: false,
        amount: 750,
        expireDays: 365,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC!,
          creemProductId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_CREDITS_BASIC,
          amount: 990,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
      standard: {
        id: 'standard',
        popular: true,
        amount: 1600,
        expireDays: 365,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD!,
          creemProductId:
            process.env.NEXT_PUBLIC_CREEM_PRODUCT_CREDITS_STANDARD,
          amount: 1990,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
      premium: {
        id: 'premium',
        popular: false,
        amount: 4200,
        expireDays: 365,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM!,
          creemProductId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_CREDITS_PREMIUM,
          amount: 4990,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
      enterprise: {
        id: 'enterprise',
        popular: false,
        amount: 9000,
        expireDays: 365,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE!,
          creemProductId:
            process.env.NEXT_PUBLIC_CREEM_PRODUCT_CREDITS_ENTERPRISE,
          amount: 9990,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
    },
  },
};
