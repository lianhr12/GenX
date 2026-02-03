import { validateReferralCode } from '@/lib/referral';
import { REFERRAL_CONFIG } from '@/lib/referral-config';
import { Routes } from '@/routes';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Handle referral link redirect
 * Sets a cookie with the referral code and redirects to the register page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Validate the referral code
  const validation = await validateReferralCode(code);

  if (!validation.valid) {
    // Invalid code - redirect to home page
    console.log(`Invalid referral code: ${code}, reason: ${validation.error}`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Valid code - set cookie and redirect to register page
  const response = NextResponse.redirect(new URL(Routes.Register, request.url));

  // Set the referral code cookie
  response.cookies.set(REFERRAL_CONFIG.cookieName, code.toUpperCase(), {
    maxAge: REFERRAL_CONFIG.cookieMaxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  console.log(`Referral code ${code} set in cookie, redirecting to register`);
  return response;
}
