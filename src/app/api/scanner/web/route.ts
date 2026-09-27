import { NextRequest, NextResponse } from 'next/server';
import { ThreatScannerService } from '@/services/ThreatScannerService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL target is required' },
        { status: 400 }
      );
    }

    const scannerService = ThreatScannerService.getInstance();
    const result = await scannerService.scanWeb(url);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Scanner failure';
    console.error('POST /api/scanner/web error:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
