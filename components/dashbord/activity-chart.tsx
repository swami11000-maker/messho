'use client';

import { Panel } from './premium-hero';
import Link from 'next/link';
import { useOverview } from '@/hooks/use-overview';
import { formatMoney } from '@/libs/format';

export function ActivityChart() {
	const { overview } = useOverview();
	const rewards = overview?.transactions.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0) ?? 0;
	const referrals = overview?.transactions.filter((item) => item.type === 'referral').reduce((sum, item) => sum + item.amount, 0) ?? 0;
	return (
		<Panel className="p-5">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
				<div>
					<p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">Activity Overview</p>
					<h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#121826]">Earnings & Spin Activity</h2>
				</div>
				<Link
					href="/dashboard/transactions"
					className="w-fit rounded-2xl border border-[#eadfcd] bg-white/70 px-4 py-2.5 text-xs font-black text-[#121826] transition hover:bg-[#f4c95d]"
				>
					View Report
				</Link>
			</div>

			<div className="mt-5 grid overflow-hidden rounded-3xl border border-[#eadfcd] bg-white/50 sm:grid-cols-3">
				{[
					['Total Spins', String(overview?.stats.totalSpins ?? 0), 'All time'],
					['Total Earned', formatMoney(rewards), 'Recent ledger'],
					['Referral Earnings', formatMoney(referrals), `${overview?.stats.referrals ?? 0} referrals`],
				].map(([label, value, period], index) => (
					<div
						key={label}
						className={`p-5 ${index !== 2 ? 'border-b border-[#eadfcd] sm:border-b-0 sm:border-r' : ''}`}
					>
						<p className="text-xs font-black text-[#8a7653]">{label}</p>
						<h3 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#121826]">{value}</h3>
						<p className="mt-1 text-xs font-bold text-[#8a7653]">{period}</p>
					</div>
				))}
			</div>

			<div className="relative mt-6 h-[260px] overflow-hidden rounded-3xl bg-[#101936] p-4">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />
				<svg
					viewBox="0 0 760 240"
					className="relative h-full w-full"
					preserveAspectRatio="none"
				>
					{[40, 80, 120, 160, 200].map((y) => (
						<line
							key={y}
							x1="0"
							x2="760"
							y1={y}
							y2={y}
							stroke="rgba(255,255,255,0.10)"
							strokeDasharray="5 8"
						/>
					))}
					<path
						d="M0 218 C45 135, 75 120, 116 148 C160 178, 172 72, 230 70 C286 68, 310 160, 365 162 C430 164, 442 104, 505 88 C560 74, 578 108, 625 82 C675 55, 715 78, 760 44 L760 240 L0 240 Z"
						fill="url(#premiumArea)"
					/>
					<path
						d="M0 218 C45 135, 75 120, 116 148 C160 178, 172 72, 230 70 C286 68, 310 160, 365 162 C430 164, 442 104, 505 88 C560 74, 578 108, 625 82 C675 55, 715 78, 760 44"
						fill="none"
						stroke="#f4c95d"
						strokeWidth="4"
						strokeLinecap="round"
					/>
					<circle
						cx="505"
						cy="88"
						r="7"
						fill="#f4c95d"
						stroke="#101936"
						strokeWidth="4"
					/>
					<defs>
						<linearGradient
							id="premiumArea"
							x1="0"
							x2="0"
							y1="0"
							y2="1"
						>
							<stop
								stopColor="#f4c95d"
								stopOpacity="0.32"
							/>
							<stop
								offset="1"
								stopColor="#f4c95d"
								stopOpacity="0"
							/>
						</linearGradient>
					</defs>
				</svg>
			</div>
		</Panel>
	);
}
