import { NextRequest, NextResponse } from 'next/server';
import { IssueService } from '@/services/IssueService';

const issueService = new IssueService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issue = await issueService.getIssueById(id);

    if (!issue) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: issue.toJSON() });
  } catch (error) {
    console.error('GET /api/issues/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const success = await issueService.updateIssue(id, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Issue updated successfully' });
  } catch (error) {
    console.error('PUT /api/issues/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await issueService.deleteIssue(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/issues/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}
