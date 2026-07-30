export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt, verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { verifyTotp } from '@/lib/mfa';
import { logAudit } from '@/lib/audit-logger';

export async function POST(request: Request) {
  try {
    const { email, password, mfaCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true
      }
    });

    if (!user || !user.isActive || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.mfaEnabled) {
      if (!user.mfaSecret || !mfaCode) return NextResponse.json({ mfaRequired: true }, { status: 200 });
      if (!verifyTotp(user.mfaSecret, String(mfaCode))) return NextResponse.json({ error: 'Invalid MFA code' }, { status: 401 });
    }

    // Create encrypted JWT
    const sessionData = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      sessionVersion: user.sessionVersion,
      canCreateCase: user.canCreateCase,
      modulePermissions: user.modulePermissions,
    };
    const sessionCookie = await encrypt(sessionData);

    const cookieStore = await cookies();
    const requestUrl = new URL(request.url);
    const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const isSecureRequest = requestUrl.protocol === 'https:' || forwardedProtocol === 'https';
    
    // Internal server deployments might use HTTP, so we shouldn't force secure cookies
    // unless the request is HTTPS or we explicitly require it via environment variable.
    const requireSecure = process.env.REQUIRE_SECURE_COOKIES === 'true';
    const isSecure = isSecureRequest || requireSecure;

    cookieStore.set('auth-session', sessionCookie, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    // Audit Log Login Event
    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'AUTH_LOGIN',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      req: request,
    });

    // Return the user without the password
    const { password: _, mfaSecret: __, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      mustChangePassword: user.mustChangePassword,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
