/**
 * Video Generation Callback API
 * POST /api/v1/video/callback/[provider] - AI provider webhook
 */

import type { ProviderType } from '@/ai/video';
import { verifyCallbackSignature } from '@/ai/video/utils/callback-signature';
import { videoService } from '@/services/video';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const providerType = provider as ProviderType;

    // Validate provider type
    if (!['evolink', 'kie'].includes(providerType)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Get signature info from URL params
    const { searchParams } = new URL(request.url);
    const videoUuid = searchParams.get('videoUuid');
    const timestamp = searchParams.get('ts');
    const signature = searchParams.get('sig');

    // Verify signature
    if (!videoUuid || !timestamp || !signature) {
      console.error('Missing callback signature parameters');
      return NextResponse.json(
        { error: 'Missing signature parameters' },
        { status: 400 }
      );
    }

    const verification = verifyCallbackSignature(
      videoUuid,
      timestamp,
      signature
    );
    if (!verification.valid) {
      console.error(
        `Callback signature verification failed: ${verification.error}`
      );
      return NextResponse.json(
        { error: verification.error || 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = await request.json();

    // Process callback
    await videoService.handleCallback(providerType, payload, videoUuid);

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
