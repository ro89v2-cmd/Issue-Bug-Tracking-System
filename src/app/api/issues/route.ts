import { NextRequest, NextResponse } from 'next/server';
import { IssueService } from '@/services/IssueService';
import { IssueType, Priority, Status } from '@/models/enums';

const issueService = new IssueService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');

    let issues;

    if (projectId) {
      issues = await issueService.getIssuesByProject(projectId);
    } else if (status) {
      issues = await issueService.getIssuesByStatus(status as Status);
    } else if (priority) {
      issues = await issueService.getIssuesByPriority(priority as Priority);
    } else {
      issues = await issueService.getAllIssues();
    }

    return NextResponse.json({
      success: true,
      data: issues.map(issue => issue.toJSON()),
      count: issues.length,
    });
  } catch (error) {
    console.error('GET /api/issues error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const issue = await issueService.createIssue({
      title: body.title,
      description: body.description || '',
      type: body.type as IssueType,
      priority: body.priority as Priority,
      reporter: body.reporter || 'Anonymous',
      projectId: body.projectId || 'proj-1',
      assignee: body.assignee,
      stepsToReproduce: body.stepsToReproduce,
      expectedBehavior: body.expectedBehavior,
      actualBehavior: body.actualBehavior,
      environment: body.environment,
      useCase: body.useCase,
      acceptanceCriteria: body.acceptanceCriteria,
      estimatedEffort: body.estimatedEffort,
    });

    return NextResponse.json(
      { success: true, data: issue.toJSON() },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/issues error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}
