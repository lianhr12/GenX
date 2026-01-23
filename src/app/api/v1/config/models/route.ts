/**
 * Models Config API
 * GET /api/v1/config/models - Get available video models
 */

import { NextResponse } from 'next/server';
import { getAvailableModels, getImageToVideoModels } from '@/config/video-credits';

export async function GET() {
  try {
    const allModels = getAvailableModels();
    const imageToVideoModels = getImageToVideoModels();

    return NextResponse.json({
      success: true,
      data: {
        all: allModels,
        imageToVideo: imageToVideoModels,
      },
    });
  } catch (error) {
    console.error('Models config error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
