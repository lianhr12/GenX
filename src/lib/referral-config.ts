/**
 * Referral System Configuration
 * Contains all configurable values for the referral system
 */

export const REFERRAL_CONFIG = {
  // Referral code settings
  codeLength: 6,
  codeCharset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Excludes confusing chars: 0, O, I, 1

  // Reward amounts (in credits)
  registrationReward: 50,
  purchaseReward: 100,

  // Anti-abuse settings
  cooldownHours: 24, // New users must wait before referring others
  dailyIpLimit: 10, // Max referrals per IP per day
  dailyDomainLimit: 10, // Max referrals per non-whitelisted domain per day

  // Cookie settings
  cookieName: 'ref_code',
  cookieMaxAge: 7 * 24 * 60 * 60, // 7 days in seconds

  // Whitelisted email domains (not subject to domain limits)
  whitelistedDomains: [
    // International
    'gmail.com',
    'googlemail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'yahoo.com',
    'yahoo.co.jp',
    'yahoo.co.uk',
    'yahoo.fr',
    'yahoo.de',
    'icloud.com',
    'me.com',
    'mac.com',
    'protonmail.com',
    'proton.me',
    'aol.com',
    'zoho.com',
    'yandex.com',
    'yandex.ru',
    'mail.com',
    'gmx.com',
    'gmx.de',
    // China
    'qq.com',
    'foxmail.com',
    '163.com',
    '126.com',
    'yeah.net',
    'sina.com',
    'sina.cn',
    'sohu.com',
    'aliyun.com',
    '139.com',
    '189.cn',
    'wo.cn',
    // Japan
    'docomo.ne.jp',
    'ezweb.ne.jp',
    'softbank.ne.jp',
    // Korea
    'naver.com',
    'daum.net',
    'hanmail.net',
    // Russia
    'mail.ru',
    // Germany
    'web.de',
    't-online.de',
    // France
    'orange.fr',
    'free.fr',
    'laposte.net',
    // UK
    'btinternet.com',
    'sky.com',
    // India
    'rediffmail.com',
    // Brazil
    'uol.com.br',
    'bol.com.br',
  ],

  // Temporary/disposable email domains (blocked)
  temporaryEmailDomains: [
    // Common temporary email services
    'tempmail.com',
    'temp-mail.org',
    'guerrillamail.com',
    'guerrillamail.org',
    'mailinator.com',
    '10minutemail.com',
    '10minutemail.net',
    'throwaway.email',
    'fakeinbox.com',
    'sharklasers.com',
    'trashmail.com',
    'trashmail.net',
    'mailnesia.com',
    'maildrop.cc',
    'getnada.com',
    'yopmail.com',
    'yopmail.fr',
    'dispostable.com',
    'mailcatch.com',
    'spamgourmet.com',
    'mytrashmail.com',
    'jetable.org',
    'tempinbox.com',
    'discard.email',
    'discardmail.com',
    'spambox.us',
    'tempr.email',
    'throwawaymail.com',
    'mohmal.com',
    'tempail.com',
    'emailondeck.com',
    'fakemailgenerator.com',
    'mintemail.com',
    'mailforspam.com',
    'spam4.me',
    'getairmail.com',
    'moakt.com',
    'tempsky.com',
    'burnermail.io',
    'mailsac.com',
    'inboxkitten.com',
    '33mail.com',
    'guerrillamailblock.com',
    'pokemail.net',
    'spam.la',
    'boun.cr',
    'mt2009.com',
    '20minutemail.com',
    'anonymbox.com',
    'spamdecoy.net',
    'spamfree24.org',
    'spamherelots.com',
    'tempomail.fr',
    'trash-mail.at',
    'wegwerfmail.de',
    'wegwerfmail.net',
    'wegwerfmail.org',
  ],
} as const;

/**
 * Check if an email domain is whitelisted
 */
export function isWhitelistedDomain(domain: string): boolean {
  return REFERRAL_CONFIG.whitelistedDomains.includes(domain.toLowerCase());
}

/**
 * Check if an email domain is a temporary/disposable email
 */
export function isTemporaryEmail(domain: string): boolean {
  return REFERRAL_CONFIG.temporaryEmailDomains.includes(domain.toLowerCase());
}

/**
 * Extract domain from email address
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1].toLowerCase() : '';
}
