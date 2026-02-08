import { websiteConfig } from './config/website';

/**
 * The routes for the application
 */
export enum Routes {
  Root = '/',

  // marketing pages
  FAQ = '/#faqs',
  Features = '/#features',
  Pricing = '/pricing', // change to /#pricing if you want to use the pricing section in homepage
  Blog = '/blog',
  Docs = '/docs',
  About = '/about',
  Contact = '/contact',
  Waitlist = '/waitlist',
  Changelog = '/changelog',
  Roadmap = '/roadmap',
  CookiePolicy = '/cookie',
  PrivacyPolicy = '/privacy',
  TermsOfService = '/terms',

  // auth routes
  Login = '/auth/login',
  Register = '/auth/register',
  AuthError = '/auth/error',
  ForgotPassword = '/auth/forgot-password',
  ResetPassword = '/auth/reset-password',

  // dashboard routes
  Dashboard = '/dashboard',
  MyCreations = '/dashboard/creations',
  MyVideos = '/dashboard/creations/videos',
  MyImages = '/dashboard/creations/images',
  AdminUsers = '/admin/users',
  AdminImages = '/admin/images',
  AdminGallery = '/admin/gallery',
  SettingsProfile = '/settings/profile',
  SettingsBilling = '/settings/billing',
  SettingsCredits = '/settings/credits',
  SettingsSecurity = '/settings/security',
  SettingsNotifications = '/settings/notifications',
  SettingsReferral = '/settings/referral',

  // payment processing
  Payment = '/payment',

  // Create routes (AI tools)
  CreateText = '/create/text',
  CreateImage = '/create/image',
  CreateChat = '/create/chat',
  CreateVideo = '/create/video',
  CreateAudio = '/create/audio',
  CreateImageToVideo = '/create/image-to-video',
  CreateTextToVideo = '/create/text-to-video',
  CreateReferenceToVideo = '/create/reference-to-video',

  // Model pages
  Models = '/models',

  // Style pages
  Styles = '/styles',
  StyleCyberpunk = '/styles/cyberpunk',
  StyleWatercolor = '/styles/watercolor',
  StyleOilPainting = '/styles/oil-painting',
  StyleAnime = '/styles/anime',
  StyleFluidArt = '/styles/fluid-art',

  // Gallery
  Gallery = '/gallery',

  // Help & API
  Help = '/help',
  APIDocs = '/api-docs',

  // block routes
  MagicuiBlocks = '/magicui',
  HeroBlocks = '/blocks/hero-section',
  LogoCloudBlocks = '/blocks/logo-cloud',
  FeaturesBlocks = '/blocks/features',
  IntegrationsBlocks = '/blocks/integrations',
  ContentBlocks = '/blocks/content',
  StatsBlocks = '/blocks/stats',
  TeamBlocks = '/blocks/team',
  TestimonialsBlocks = '/blocks/testimonials',
  CallToActionBlocks = '/blocks/call-to-action',
  FooterBlocks = '/blocks/footer',
  PricingBlocks = '/blocks/pricing',
  ComparatorBlocks = '/blocks/comparator',
  FAQBlocks = '/blocks/faqs',
  LoginBlocks = '/blocks/login',
  SignupBlocks = '/blocks/sign-up',
  ForgotPasswordBlocks = '/blocks/forgot-password',
  ContactBlocks = '/blocks/contact',
}

/**
 * The routes that can not be accessed by logged in users
 */
export const routesNotAllowedByLoggedInUsers = [Routes.Login, Routes.Register];

/**
 * The routes that are protected and require authentication
 */
export const protectedRoutes = [
  Routes.Dashboard,
  Routes.MyCreations,
  Routes.MyVideos,
  Routes.MyImages,
  Routes.AdminUsers,
  Routes.AdminImages,
  Routes.AdminGallery,
  Routes.SettingsProfile,
  Routes.SettingsBilling,
  Routes.SettingsCredits,
  Routes.SettingsSecurity,
  Routes.SettingsNotifications,
  Routes.SettingsReferral,
  Routes.Payment,
];

/**
 * The default redirect path after logging in
 */
export const DEFAULT_LOGIN_REDIRECT =
  websiteConfig.routes.defaultLoginRedirect ?? Routes.Dashboard;
