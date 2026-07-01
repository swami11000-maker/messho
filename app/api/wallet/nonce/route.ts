import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const { address } = await req.json();

		if (!address) {
			return NextResponse.json({ success: false, message: 'Wallet address required' }, { status: 400 });
		}

		const nonce = Math.floor(Math.random() * 1000000);

		const message = `
Verify wallet ownership

Wallet: ${address}
Nonce: ${nonce}
Timestamp: ${Date.now()}
		`.trim();

		// Production me nonce DB ya Redis me store karo
		// Example:
		// await prisma.walletNonce.create({...})

		return NextResponse.json({ success: true, message });
	} catch (error) {
		return NextResponse.json({ success: false, message: 'Failed to generate nonce' }, { status: 500 });
	}
}
