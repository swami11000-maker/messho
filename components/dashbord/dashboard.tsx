import { Crown, Gift, Landmark, Users, Wallet } from 'lucide-react';
import { ActivityChart } from './activity-chart';
import { Kpi, PageShell } from './dashboard-ui';
import { MembershipMini } from './mycard';
import { PremiumHero } from './premium-hero';
import { QuickActions } from './quick-actions';
import { RewardsGrowth } from './rewards-page';
import { SpinPreviewCard } from './spin';
import { Transactions } from './transactions';
import type { OverviewResponse } from '@/libs/types';
import { formatMoney } from '@/libs/format';

export function DashboardHome({ data }: { data: OverviewResponse['data'] }) {
	return (
		<PageShell>
			<PremiumHero
				name={data.user.name}
				walletBalance={formatMoney(data.user.walletBalance ?? 0)}
				rewardBalance={formatMoney(data.user.rewardBalance ?? 0)}
				withdrawableBalance={formatMoney(data.user.withdrawableBalance ?? 0)}
				spinsRemaining={data.stats.spinsRemaining ?? 0}
				dailySpins={data.stats.dailySpins ?? 0}
			/>

			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
				<Kpi icon={Wallet} title="Wallet Balance" value={formatMoney(data.user.walletBalance ?? 0)} sub="Available for plans" tone="navy" />
				<Kpi icon={Gift} title="Reward Balance" value={formatMoney(data.user.rewardBalance ?? 0)} sub="Spin rewards" tone="gold" />
				<Kpi icon={Crown} title="Active Plans" value={String(data.stats.activePlans ?? 0)} sub="Membership cards" tone="blue" />
				<Kpi icon={Users} title="Daily Spins" value={`${data.stats.spinsRemaining ?? 0}/${data.stats.dailySpins ?? 0}`} sub="Remaining today" tone="green" />
				<Kpi icon={Landmark} title="Withdrawable" value={formatMoney(data.user.withdrawableBalance ?? 0)} sub="Unlocked rewards" tone="clay" />
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.42fr_0.88fr]">
				<div className="space-y-6">
					{/* <ActivityChart /> */}
					<Transactions data={data.transactions ?? []} />
					<QuickActions />
				</div>
				<div className="space-y-6">
					<MembershipMini />
					{/* <SpinPreviewCard /> */}
					{/* <RewardsGrowth /> */}
				</div>
			</div>
		</PageShell>
	);
}
