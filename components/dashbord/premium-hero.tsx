'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Sparkles, Wallet } from 'lucide-react';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
	return <div className={`rounded-[30px] border border-[#eadfcd] bg-[#fffaf1] shadow-[0_18px_50px_rgba(47,43,35,0.07)] ${className}`}>{children}</div>;
}
interface PremiumHeroProps {
	name: string;
	walletBalance: string;
	rewardBalance: string;
	withdrawableBalance: string;
	spinsRemaining: number;
	dailySpins: number;
}
export function PremiumHero({ name, walletBalance, rewardBalance, withdrawableBalance, spinsRemaining, dailySpins }: PremiumHeroProps) {
	return (
		<section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
			<div className="relative overflow-hidden rounded-[34px] bg-[#101936] p-6 text-white shadow-[0_28px_80px_rgba(16,25,54,0.22)] md:p-8">
				<div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#f4c95d]/20 blur-3xl" />
				<div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />

				<div className="relative">
					<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#f4c95d] backdrop-blur">
						<Sparkles size={14} />
						SpinGold Member
					</div>

					<div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
						<div>
							<h1 className="max-w-2xl text-4xl font-black tracking-[-0.06em] md:text-5xl">Welcome back, {name}</h1>

							<p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/65 md:text-base">
								Manage membership credits, daily spins, rewards, referrals and withdrawals from one clean dashboard.
							</p>
						</div>

						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
							<p className="text-xs font-bold text-white/55">Today’s Available Spins</p>
							<div className="mt-2 flex items-end gap-2">
								<span className="text-5xl font-black tracking-[-0.06em] text-[#f4c95d]">{spinsRemaining}</span>
								<span className="pb-2 text-sm font-black text-white/55">/ {dailySpins} left</span>
							</div>
							<p className="mt-2 text-xs font-bold text-emerald-300">Reset in 12:45:30</p>
						</div>
					</div>

					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							href="/dashboard/spin"
							className="inline-flex items-center gap-2 rounded-2xl bg-[#f4c95d] px-5 py-3 text-sm font-black text-[#101936] shadow-[0_14px_34px_rgba(244,201,93,0.22)] transition hover:-translate-y-0.5"
						>
							Spin Now <ArrowRight size={16} />
						</Link>

						<Link
							href="/dashboard/transactions"
							className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
						>
							View Transactions
						</Link>

						<Link
							href="/dashboard/membership"
							className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
						>
							Buy Membership
						</Link>
					</div>
				</div>
			</div>

			<Panel className="p-6">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">Balance Summary</p>
						<h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#121826]">{walletBalance}</h2>
						<p className="mt-2 text-xs font-bold text-[#8a7653]">Available for membership purchases</p>
					</div>

					<div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#101936] text-[#f4c95d]">
						<Wallet size={30} />
					</div>
				</div>

				<div className="mt-6 rounded-3xl border border-[#eadfcd] bg-white/65 p-4">
					<p className="text-[11px] font-bold text-[#8a7653]">Member Credits</p>
					<p className="mt-1 text-sm font-black text-[#121826]">Use your balance to activate plans and keep daily rewards moving.</p>
				</div>

				<div className="mt-4 grid grid-cols-2 gap-3">
					<div className="rounded-3xl bg-[#eef8f1] p-4">
						<p className="text-[11px] font-bold text-[#5f7d68]">Reward</p>
								<h3 className="mt-1 text-xl font-black text-[#121826]">{rewardBalance}</h3>
					</div>

					<div className="rounded-3xl bg-[#fff1e8] p-4">
						<p className="text-[11px] font-bold text-[#8a6553]">Withdrawable</p>
						<h3 className="mt-1 text-xl font-black text-[#121826]">{withdrawableBalance}</h3>
					</div>
				</div>
			</Panel>
		</section>
	);
}
