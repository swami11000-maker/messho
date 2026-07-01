'use client';

import { Gift, Trophy, Users } from 'lucide-react';
import { Kpi, PageShell, PageTitle } from './dashboard-ui';
import { Panel } from './premium-hero';
import { Transactions } from './transactions';
import { useOverview } from '@/hooks/use-overview';
import { formatMoney } from '@/libs/format';

export function RewardsGrowth() {
	const { overview } = useOverview();
	const rewardTransactions = overview?.transactions.filter((item) => item.amount > 0) ?? [];
	const total = rewardTransactions.reduce((sum, item) => sum + item.amount, 0);
	const bars = Array.from({ length: 6 }, (_, index) => {
		const amount = rewardTransactions[index]?.amount ?? 0;
		const max = Math.max(...rewardTransactions.map((item) => item.amount), 1);
		return `${Math.max(8, Math.round((amount / max) * 100))}%`;
	}).reverse();
	return (
		<Panel className="p-5">
			<p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">Growth</p>
			<div className="mt-2 flex items-end justify-between">
				<div>
					<h2 className="text-xl font-black tracking-[-0.04em] text-[#121826]">Rewards Growth</h2>
					<h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#121826]">{formatMoney(total)}</h3>
					<p className="mt-1 text-xs font-bold text-emerald-600">{rewardTransactions.length} recent reward entries</p>
				</div>
				<div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f1] text-emerald-600">
					<Trophy size={24} />
				</div>
			</div>
			<div className="mt-8 flex h-44 items-end gap-3 rounded-3xl border border-[#eadfcd] bg-white/50 p-4">
				{bars.map((height, index) => (
					<div
						key={`${height}-${index}`}
						className="flex flex-1 flex-col items-center gap-2"
					>
						<div
							className={`w-full rounded-t-2xl ${index === 5 ? 'bg-[#101936]' : 'bg-[#f4c95d]'}`}
							style={{ height }}
						/>
						<span className="text-[10px] font-black text-[#8a7653]">{index + 1}</span>
					</div>
				))}
			</div>
		</Panel>
	);
}

export function RewardsPage() {
	const { overview } = useOverview();
	const spinRewards = overview?.transactions.filter((item) => item.type === 'spin_reward').reduce((sum, item) => sum + item.amount, 0) ?? 0;
	const referralRewards = overview?.transactions.filter((item) => item.type === 'referral').reduce((sum, item) => sum + item.amount, 0) ?? 0;
	return (
		<PageShell>
			<PageTitle
				title="Rewards"
				desc="Track spin rewards, referral bonuses and monthly growth."
				eyebrow="Reward Wallet"
			/>

			<div className="grid gap-5 md:grid-cols-3">
				<Kpi
					icon={Trophy}
					title="Total Rewards"
					value={formatMoney(overview?.user.rewardBalance ?? 0)}
					sub="Available balance"
					tone="navy"
				/>
				<Kpi
					icon={Gift}
					title="Recent Spin Rewards"
					value={formatMoney(spinRewards)}
					sub="Latest transactions"
					tone="gold"
				/>
				<Kpi
					icon={Users}
					title="Referral Bonus"
					value={formatMoney(referralRewards)}
					sub="Network earning"
					tone="green"
				/>
			</div>

			<RewardsGrowth />
			<Transactions />
		</PageShell>
	);
}
