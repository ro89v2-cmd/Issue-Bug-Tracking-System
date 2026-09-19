import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/UserService';

const userService = new UserService();

export async function GET() {
  try {
    const users = await userService.getAllUsers();
    return NextResponse.json({
      success: true,
      data: users.map(u => u.toJSON()),
      count: users.length,
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await userService.createUser(
      body.name,
      body.email,
      body.role || 'Developer'
    );
    return NextResponse.json(
      { success: true, data: user.toJSON() },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
