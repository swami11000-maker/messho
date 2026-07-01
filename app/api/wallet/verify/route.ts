import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';


export async function POST(req: NextRequest) {
	try {
		const { address, message, signature } = await req.json();

		if (!address || !message || !signature) {
			return NextResponse.json(
				{
					success: false,
					message: 'Missing required fields',
				},
				{ status: 400 }
			);
		}

		const recoveredAddress = ethers.verifyMessage(
			message,
			signature
		);

		if (
			recoveredAddress.toLowerCase() !==
			address.toLowerCase()
		) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid signature',
				},
				{ status: 401 }
			);
		}

		/**
		 * User authentication check
		 * Example:
		 * const userId = session.user.id;
		 */

		/**
		 * Save wallet in DB
		 *
		 * await prisma.user.update({
		 *   where: { id: userId },
		 *   data: {
		 *      wallet_address: address,
		 *      wallet_verified: true
		 *   }
		 * })
		 */

		return NextResponse.json({
			success: true,
			message: 'Wallet verified successfully',
			wallet: address,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: 'Verification failed',
			},
			{ status: 500 }
		);
	}
}