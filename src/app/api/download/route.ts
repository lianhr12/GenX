/**
 * Download API - Proxy for downloading files from CDN
 * GET /api/download?url=<encoded_url>&filename=<filename>
 */

import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'download';

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL - only allow our CDN domains
    const allowedDomains = [
      'asset.genx.art',
      'genx-assets.s3.amazonaws.com',
      'genx-assets.s3.us-east-1.amazonaws.com',
    ];

    const urlObj = new URL(url);
    if (!allowedDomains.some((domain) => urlObj.hostname.includes(domain))) {
      return NextResponse.json(
        { error: 'Invalid URL domain' },
        { status: 403 }
      );
    }

    // Fetch the file from CDN
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: response.status }
      );
    }

    const blob = await response.blob();

    // Determine content type
    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';

    // Return the file with download headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
