import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  const expiry = parseInt(session.value);
  const isValid = expiry > Date.now();

  if (!isValid) {
    cookieStore.delete('admin_session');
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    expiresAt: expiry
  });
}
