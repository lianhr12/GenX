/**
 * Image Generation Callback API
 * POST /api/v1/image/callback/[provider] - AI provider webhook
 */

import { verifyImageCallbackSignature } from '@/ai/image/utils/callback-signature';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;

    // Validate provider type
    if (provider !== 'evolink') {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Get signature info from URL params
    const { searchParams } = new URL(request.url);
    const imageUuid = searchParams.get('imageUuid');
    const timestamp = searchParams.get('ts');
    const signature = searchParams.get('sig');

    // Verify signature
    if (!imageUuid || !timestamp || !signature) {
      console.error('Missing callback signature parameters');
      return NextResponse.json(
        { error: 'Missing signature parameters' },
        { status: 400 }
      );
    }

    const verification = verifyImageCallbackSignature(
      imageUuid,
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
    await imageService.handleCallback('evolink', payload, imageUuid);

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Image callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
