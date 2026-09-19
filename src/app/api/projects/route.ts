import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/ProjectService';

const projectService = new ProjectService();

export async function GET() {
  try {
    const projects = await projectService.getAllProjects();
    return NextResponse.json({
      success: true,
      data: projects.map(p => p.toJSON()),
      count: projects.length,
    });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await projectService.createProject(
      body.name,
      body.description || '',
      body.owner || 'Anonymous'
    );
    return NextResponse.json(
      { success: true, data: project.toJSON() },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
