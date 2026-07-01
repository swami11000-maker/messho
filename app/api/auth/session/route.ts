import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'token';

export async function POST(req: NextRequest) {
	const { accessToken } = (await req.json().catch(() => ({}))) as { accessToken?: string };

	if (!accessToken) {
		return NextResponse.json({ success: false, message: 'Missing access token' }, { status: 400 });
	}

	const response = NextResponse.json({ success: true, message: 'Session updated' });
	response.cookies.set(TOKEN_KEY, accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	});

	return response;
}

export async function DELETE() {
	const response = NextResponse.json({ success: true, message: 'Session cleared' });
	response.cookies.set(TOKEN_KEY, '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});

	return response;
}
