import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Get password from environment variable (fallback to ADMIN_TOKEN)
    const correctPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN;

    if (!correctPassword) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify password
    if (password !== correctPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionExpiry = Date.now() + SESSION_DURATION;
    const cookieStore = await cookies();

    // Set httpOnly cookie for security
    cookieStore.set('admin_session', sessionExpiry.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION / 1000, // in seconds
      path: '/',
    });

    return NextResponse.json({
      success: true,
      expiresAt: sessionExpiry
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
