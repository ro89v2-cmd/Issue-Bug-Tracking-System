import { NextResponse } from 'next/server';
import { IssueService } from '@/services/IssueService';

const issueService = new IssueService();

export async function GET() {
  try {
    const stats = await issueService.getStatistics();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('GET /api/issues/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
