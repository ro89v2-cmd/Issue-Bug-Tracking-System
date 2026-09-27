import { NextRequest, NextResponse } from 'next/server';
import { ThreatScannerService } from '@/services/ThreatScannerService';
import { ScanFinding } from '@/services/scanners/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const finding: ScanFinding = body.finding;
    const reporter: string = body.reporter || 'SOC Automated Scanner';

    if (!finding || !finding.title) {
      return NextResponse.json(
        { success: false, error: 'Finding payload is required' },
        { status: 400 }
      );
    }

    const scannerService = ThreatScannerService.getInstance();
    const createdIssue = await scannerService.autoLogIncident(finding, reporter);

    return NextResponse.json({
      success: true,
      data: createdIssue.toJSON(),
      message: 'Threat incident successfully logged to Command Center',
    }, { status: 201 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to auto-log incident';
    console.error('POST /api/scanner/auto-incident error:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
