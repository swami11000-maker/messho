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
				walletBalance={formatMoney(data.user.walletBalance)}
				rewardBalance={formatMoney(data.user.rewardBalance)}
				withdrawableBalance={formatMoney(data.user.withdrawableBalance)}
				spinsRemaining={data.stats.spinsRemaining}
				dailySpins={data.stats.dailySpins}
			/>

			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
				<Kpi icon={Wallet} title="Wallet Balance" value={formatMoney(data.user.walletBalance)} sub="Available for plans" tone="navy" />
				<Kpi icon={Gift} title="Reward Balance" value={formatMoney(data.user.rewardBalance)} sub="Spin rewards" tone="gold" />
				<Kpi icon={Crown} title="Active Plans" value={String(data.stats.activePlans)} sub="Membership cards" tone="blue" />
				<Kpi icon={Users} title="Daily Spins" value={`${data.stats.spinsRemaining}/${data.stats.dailySpins}`} sub="Remaining today" tone="green" />
				<Kpi icon={Landmark} title="Withdrawable" value={formatMoney(data.user.withdrawableBalance)} sub="Unlocked rewards" tone="clay" />
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.42fr_0.88fr]">
				<div className="space-y-6">
					<ActivityChart />
					<Transactions data={data.transactions} />
					<QuickActions />
				</div>
				<div className="space-y-6">
					<MembershipMini />
					<SpinPreviewCard />
					<RewardsGrowth />
				</div>
			</div>
		</PageShell>
	);
}
