'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Status } from '../customer-shell';
import { PageShell, PageTitle } from './dashboard-ui';
import { Panel } from './premium-hero';
import { useOverview } from '@/hooks/use-overview';
import { formatDate, formatMoney } from '@/libs/format';
import type { Membership } from '@/libs/types';

function progress(membership: Membership) {
	const start = new Date(membership.startsAt).getTime();
	const end = new Date(membership.expiresAt).getTime();
	return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
}

function PlanIcon({ name }: { name: string }) {
	return (
		<div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#101936] text-[#f4c95d]">
			<div className="text-center">
				<Sparkles
					size={25}
					className="mx-auto"
				/>
				<p className="mt-1 text-[9px] font-black uppercase">{name.slice(0, 4)}</p>
			</div>
		</div>
	);
}

export function MembershipMini() {
	const { overview, loading } = useOverview();
	const active = overview?.memberships.filter((item) => item.status === 'active').slice(0, 2) ?? [];
	return (
		<Panel className="p-5">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">Membership</p>
					<h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#121826]">Active Plans</h2>
				</div>
				<Link
					className="rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-2 text-xs font-black text-[#121826]"
					href="/dashboard/cards"
				>
					View All
				</Link>
			</div>
			<div className="mt-5 space-y-4">
				{active.map((membership) => (
					<div
						key={membership._id}
						className="rounded-3xl border border-[#eadfcd] bg-white/60 p-4"
					>
						<div className="flex gap-4">
							<div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#101936] text-[#f4c95d]">
								<Sparkles size={24} />
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-3">
									<b className="truncate text-[#121826]">{membership.planName}</b>
									<Status value="Active" />
								</div>
								<p className="mt-2 text-xs font-bold text-[#8a7653]">Expires {formatDate(membership.expiresAt)}</p>
								<div className="mt-4 h-2.5 rounded-full bg-[#f1eadb]">
									<div
										className="h-full rounded-full bg-[#f4c95d]"
										style={{ width: `${progress(membership)}%` }}
									/>
								</div>
							</div>
						</div>
					</div>
				))}
				{!loading && active.length === 0 && (
					<div className="rounded-3xl border border-dashed border-[#eadfcd] p-5 text-center">
						<p className="text-sm font-bold text-[#8a7653]">No active membership.</p>
						<Link
							href="/dashboard/membership"
							className="mt-3 inline-block font-black text-[#101936]"
						>
							Buy a plan
						</Link>
					</div>
				)}
			</div>
		</Panel>
	);
}

type Filter = 'all' | 'active' | 'expired';

export function CardsPage() {
	const { overview, loading } = useOverview();
	const [expanded, setExpanded] = useState<string | null>(null);
	const [filter, setFilter] = useState<Filter>('all');
	const memberships = useMemo(() => overview?.memberships ?? [], [overview?.memberships]);
	const visible = useMemo(() => memberships.filter((item) => filter === 'all' || item.status === filter), [memberships, filter]);
	const counts = {
		all: memberships.length,
		active: memberships.filter((item) => item.status === 'active').length,
		expired: memberships.filter((item) => item.status === 'expired').length,
	};

	return (
		<PageShell>
			<PageTitle
				title="My Cards"
				desc="Manage purchased memberships, expiry, daily spins and earned rewards."
				eyebrow="Membership Cards"
				action={<span className="text-sm font-black text-[#8a7653]">Showing {visible.length} cards</span>}
			/>
			<Panel className="p-5">
				<div className="flex flex-wrap gap-3">
					{(
						[
							['all', 'All Cards'],
							['active', 'Active'],
							['expired', 'Expired'],
						] as const
					).map(([value, label]) => (
						<button
							key={value}
							onClick={() => setFilter(value)}
							className={`rounded-2xl border px-5 py-3 text-sm font-black transition ${filter === value ? 'border-[#101936] bg-[#101936] text-[#f4c95d]' : 'border-[#eadfcd] bg-white/60 text-[#121826] hover:bg-[#f4c95d]'}`}
						>
							{label} <span className="opacity-70">{counts[value]}</span>
						</button>
					))}
				</div>
				<div className="mt-5 space-y-4">
					{visible.map((membership) => {
						const open = expanded === membership._id;
						return (
							<div
								key={membership._id}
								className={`rounded-[28px] border p-5 ${open ? 'border-[#101936] bg-[#101936] text-white' : 'border-[#eadfcd] bg-white/60 text-[#121826]'}`}
							>
								<div className="grid gap-4 xl:grid-cols-[80px_1fr_1fr_1fr_1fr_70px] xl:items-center">
									<PlanIcon name={membership.planName} />
									<div>
										<h3 className="text-xl font-black">{membership.planName} Plan</h3>
										<div className="mt-2">
											<Status value={membership.status === 'active' ? 'Active' : 'Expired'} />
										</div>
									</div>
									<p>
										<span className={`text-xs font-bold ${open ? 'text-white/50' : 'text-[#8a7653]'}`}>Price</span>
										<br />
										<b>{formatMoney(membership.price)}</b>
									</p>
									<p>
										<span className={`text-xs font-bold ${open ? 'text-white/50' : 'text-[#8a7653]'}`}>Daily Spins</span>
										<br />
										<b>{membership.dailySpins}</b>
									</p>
									{/* <p>
										<span className={`text-xs font-bold ${open ? 'text-white/50' : 'text-[#8a7653]'}`}>Earned</span>
										<br />
										<b className={open ? 'text-[#f4c95d]' : 'text-emerald-600'}>{formatMoney(membership.earned)}</b>
									</p> */}
									<button
										onClick={() => setExpanded(open ? null : membership._id)}
										className={`grid h-10 w-10 place-items-center rounded-2xl border ${open ? 'border-white/10 bg-white/10' : 'border-[#eadfcd] bg-[#fffaf1]'}`}
									>
										<ChevronDown
											className={open ? 'rotate-180' : ''}
											size={18}
										/>
									</button>
								</div>
								{open && (
									<div className="mt-5 border-t border-white/10 pt-5">
										<div className="grid gap-3 sm:grid-cols-3">
											<p>
												<span className="text-xs text-white/50">Started</span>
												<br />
												<b>{formatDate(membership.startsAt)}</b>
											</p>
											<p>
												<span className="text-xs text-white/50">Expires</span>
												<br />
												<b>{formatDate(membership.expiresAt)}</b>
											</p>
											<p>
												<span className="text-xs text-white/50">Reward Range</span>
												<br />
												<b>
													{formatMoney(membership.rewardMin)} - {formatMoney(membership.rewardMax)}
												</b>
											</p>
										</div>
										<div className="mt-5 h-3 rounded-full bg-white/10">
											<div
												className="h-full rounded-full bg-[#f4c95d]"
												style={{ width: `${progress(membership)}%` }}
											/>
										</div>
									</div>
								)}
							</div>
						);
					})}
					{!loading && visible.length === 0 && (
						<div className="py-12 text-center">
							<p className="font-bold text-[#8a7653]">No memberships in this category.</p>
							<Link
								href="/dashboard/membership"
								className="mt-3 inline-block font-black text-[#101936]"
							>
								Browse plans
							</Link>
						</div>
					)}
				</div>
			</Panel>
		</PageShell>
	);
}
