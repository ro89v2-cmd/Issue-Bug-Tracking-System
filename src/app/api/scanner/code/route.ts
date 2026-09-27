import { NextRequest, NextResponse } from 'next/server';
import { ThreatScannerService } from '@/services/ThreatScannerService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Code content is required' },
        { status: 400 }
      );
    }

    const scannerService = ThreatScannerService.getInstance();
    const result = scannerService.scanCode(code);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Code scanner failure';
    console.error('POST /api/scanner/code error:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
