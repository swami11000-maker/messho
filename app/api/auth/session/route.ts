import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'token';

export async function POST(req: NextRequest) {
	const { accessToken } = (await req.json().catch(() => ({}))) as { accessToken?: string };

	if (!accessToken) {
		return NextResponse.json({ success: false, message: 'Missing access token' }, { status: 400 });
	}

	const isProduction = process.env.NODE_ENV === 'production';
	
	// Get the host to determine if we need cross-domain cookie
	const host = req.headers.get('host') || '';
	const isCrossDomain = isProduction && !host.includes('localhost');
	
	const response = NextResponse.json({ 
		success: true, 
		message: 'Session updated',
		// Debug info (remove in production)
		...(process.env.NODE_ENV !== 'production' && {
			debug: {
				environment: process.env.NODE_ENV,
				host: host,
				isCrossDomain: isCrossDomain,
			}
		})
	});
	
	response.cookies.set(TOKEN_KEY, accessToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isCrossDomain ? 'none' : 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	});

	return response;
}

export async function DELETE(req: NextRequest) {
	const isProduction = process.env.NODE_ENV === 'production';
	const host = req.headers.get('host') || '';
	const isCrossDomain = isProduction && !host.includes('localhost');
	
	const response = NextResponse.json({ success: true, message: 'Session cleared' });
	
	response.cookies.set(TOKEN_KEY, '', {
		httpOnly: true,
		secure: isProduction,
		sameSite: isCrossDomain ? 'none' : 'lax',
		path: '/',
		maxAge: 0,
	});

	return response;
}