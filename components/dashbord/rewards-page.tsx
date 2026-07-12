'use client';

import { Gift, Trophy, Users } from 'lucide-react';
import { Kpi, PageShell, PageTitle } from './dashboard-ui';
import { Panel } from './premium-hero';
import { useOverview } from '@/hooks/use-overview';
import { formatMoney } from '@/libs/format';

export function RewardsGrowth() {
	const { overview } = useOverview();
	const rewardHistory = overview?.rewardsHistory ?? [];
	// Compute total from the reward entries
	const total = rewardHistory.reduce((sum, entry) => sum + (entry.amount || 0), 0);

	return (
		<Panel className="p-5">
			<p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">Growth</p>
			<div className="mt-2 flex items-end justify-between">
				<div>
					<h2 className="text-xl font-black tracking-[-0.04em] text-[#121826]">Rewards Growth</h2>
					<h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#121826]">{formatMoney(total)}</h3>
					<p className="mt-1 text-xs font-bold text-emerald-600">{rewardHistory.length} recent reward entries</p>
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

// Static bar heights for the chart (unchanged)
const bars = [40, 60, 30, 80, 50, 70, 45, 55, 65, 35];

export function RewardsPage() {
	const { overview } = useOverview();
	const rewardHistory = overview?.rewardsHistory ?? [];

	// Compute totals by type
	const spinRewards = rewardHistory
		.filter((entry) => entry.type === 'SPIN')
		.reduce((sum, entry) => sum + (entry.amount || 0), 0);

	const referralRewards = rewardHistory
		.filter((entry) => entry.type === 'REFERRAL')
		.reduce((sum, entry) => sum + (entry.amount || 0), 0);

	// Format date for display
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			}).format(date);
		} catch {
			return dateString;
		}
	};

	return (
		<PageShell>
			<PageTitle
				title="Rewards"
				desc="Track spin rewards, referral bonuses and monthly growth."
				eyebrow="Reward Wallet"
			/>
			{/* Table Section */}
			<Panel className="mt-6 p-5">
				<h3 className="text-lg font-bold tracking-[-0.02em] text-[#121826]">Reward History</h3>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[#eadfcd] text-left text-xs font-bold uppercase tracking-wider text-[#8a7653]">
								<th className="pb-3 pr-4">Name</th>
								<th className="pb-3 pr-4">Amount</th>
								<th className="pb-3 pr-4">Type</th>
								<th className="pb-3">Date</th>
							</tr>
						</thead>
						<tbody>
							{rewardHistory.length === 0 ? (
								<tr>
									<td colSpan={4} className="py-6 text-center text-sm text-[#8a7653]">
										No rewards recorded yet.
									</td>
								</tr>
							) : (
								rewardHistory.map((entry, index) => (
									<tr
										key={index}
										className="border-b border-[#eadfcd]/40 last:border-0"
									>
										<td className="py-3 pr-4 font-medium text-[#121826]">{entry.name || '—'}</td>
										<td className="py-3 pr-4 font-bold text-[#118103]">
											{formatMoney(entry.amount * 100)}
										</td>
										<td className="py-3 pr-4">
											<span className="rounded-full bg-[#f4f0ea] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8a7653]">
												{entry.type || 'UNKNOWN'}
											</span>
										</td>
										<td className="py-3 text-[#5a4e3c]">{formatDate(entry.createdAt)}</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Panel>
		</PageShell>
	);
}