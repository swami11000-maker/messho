export interface User {
	id: string;
	name: string;
	email: string;
	status: string;
	type: string;
	createdAt: string;
	updatedAt: string;
	walletBalance: number;
	rewardBalance: number;
	withdrawableBalance: number;
	payoutWalletAddress: string;
	referralCode?: string;
}

export interface UserDetailResponse {
	data: {
		user: User;
	};
}

export interface AuthResponse {
	success: boolean;
	message: string;
	accessToken?: string;
	user?: Pick<User, 'type'>;
	data?: {
		resetToken?: string;
		resetUrl?: string;
	};
}

export interface Membership {
	_id: string;
	planId: string;
	planName: string;
	price: number;
	dailySpins: number;
	rewardMin: number;
	rewardMax: number;
	startsAt: string;
	expiresAt: string;
	status: 'active' | 'expired';
	earned: number;
}
export interface RewardHistoryItem {
  name: string;
  amount: number;
  type: 'SPIN' | 'REFERRAL' | string;
  createdAt: string;
  updatedAt: string;
}
export interface Transaction {
	_id: string;
	type: 'deposit' | 'membership' | 'spin_reward' | 'withdrawal' | 'referral' | 'membership_purchase' | 'crypto_deposit';
	amount: number;
	status: string;
	reference: string;
	description: string;
	createdAt: string;
}

export interface OverviewResponse {
	success: boolean;
	message?: string;
	data: {
		user: User;
		memberships: Membership[];
		rewardsHistory: RewardHistoryItem[];
		transactions: Transaction[];
		stats: {
			activePlans: number;
			dailySpins: number;
			spinsUsedToday: number;
			spinsRemaining: number;
			totalSpins: number;
			totalRewards: number;
			highestReward: number;
			referrals: number;
		};
		platform: {
			wheelValues?: number[];
		};
	};
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
	errors?: Record<string, string[]>;
}
