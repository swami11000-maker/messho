'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight, Menu, Search, ShieldCheck, Sparkles, UserRound, Wallet, X, Gift, LogOut } from 'lucide-react';
import { Logo, PublicFooter } from './brand';
import { customerNav } from './data';
import { clearCookies } from '@/libs/auth-session';
import { formatMoney } from '@/libs/format';
import { useOverview } from '@/hooks/use-overview';
import type { OverviewResponse } from '@/libs/types';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
	return <div className={`rounded-3xl border border-slate-200 bg-white shadow-card ${className}`}>{children}</div>;
}

export function SectionTitle({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
	return (
		<div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
			<div>
				<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 md:text-4xl">{title}</h1>
				{desc && <p className="mt-2 text-sm font-medium text-slate-500">{desc}</p>}
			</div>
			{action}
		</div>
	);
}

function Avatar() {
	return (
		<div className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-b from-orange-100 to-blue-100 ring-1 ring-slate-200">
			<UserRound
				size={23}
				className="text-blue-950"
			/>
			<span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
		</div>
	);
}

function Topbar({
	onOpen,
	user,
}: {
	onOpen: () => void;
	user: OverviewResponse['data']['user'] | null;
}) {
	const router = useRouter();
	const [query, setQuery] = useState('');
	const search = (event: FormEvent) => {
		event.preventDefault();
		const value = query.toLowerCase();
		if (value.includes('membership') || value.includes('plan')) router.push('/dashboard/membership');
		else if (value.includes('spin') || value.includes('reward')) router.push('/dashboard/spin');
		else if (value.includes('withdraw')) router.push('/dashboard/withdraw');
		else router.push(`/dashboard/transactions`);
	};
	return (
		<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
			<div className="flex h-[74px] items-center justify-between px-4 lg:px-8">
				<div className="flex items-center gap-3">
					<button
						onClick={onOpen}
						className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 lg:hidden"
					>
						<Menu size={22} />
					</button>
					<Logo href="/dashboard" />
				</div>
				<form onSubmit={search} className="hidden w-[420px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 xl:flex">
					<Search
						size={17}
						className="text-slate-400"
					/>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
						placeholder="Search membership, transaction, reward..."
					/>
				</form>
				<div className="flex items-center gap-3">
					<Link href="/dashboard/membership" className="hidden items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 md:flex">
						Buy Membership
					</Link>
					<Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
						<Avatar />
						<span className="hidden text-sm font-black text-slate-800 sm:block">{user?.name ?? 'Member'}</span>
						<ChevronDown
							size={16}
							className="hidden text-slate-400 sm:block"
						/>
					</Link>
				</div>
			</div>
		</header>
	);
}

function Sidebar({
	open,
	close,
	overview,
}: {
	open: boolean;
	close: () => void;
	overview: OverviewResponse['data'] | null;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const logout = async () => {
		try {
			await clearCookies();
		} catch {
			// Continue with the local logout flow even if the cookie route fails.
		}
		router.replace('/login');
		router.refresh();
	};

	const main = customerNav.slice(0, 6);
	const account = customerNav.slice(6);

	const isActiveRoute = (href: string) => {
		if (href === '/dashboard') return pathname === '/dashboard';
		return pathname === href || pathname.startsWith(`${href}/`);
	};

	const render = (item: { label: string; href: string; icon: LucideIcon }) => {
		const Icon = item.icon;
		const active = isActiveRoute(item.href);

		return (
			<Link
				key={item.href}
				href={item.href}
				onClick={close}
				className={`group relative flex items-center gap-3 rounded-2xl px-3 text-[12.5px] font-black transition-all duration-300 ${
					active ? 'bg-white text-[#071b4d] shadow-[0_16px_40px_rgba(0,0,0,0.20)]' : 'text-slate-300 hover:bg-white/8 hover:text-white'
				}`}
			>
				{active && (
					<>
						<span className="absolute -left-4 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#f8c84b]" />
						<span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#f8c84b]" />
					</>
				)}

				<span
					className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-300 ${
						active ? 'bg-[#fff7dc] text-[#b77900]' : 'bg-white/8 text-slate-300 group-hover:bg-white/12 group-hover:text-[#f8c84b]'
					}`}
				>
					<Icon
						size={17}
						strokeWidth={2.4}
					/>
				</span>

				<span className="min-w-0 flex-1 truncate">{item.label}</span>
			</Link>
		);
	};

	return (
		<>
			{open && (
				<button
					onClick={close}
					className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
					aria-label="Close sidebar"
				/>
			)}

			<aside
				className={`fixed left-0 top-0 z-50 h-screen w-[296px] overflow-hidden bg-[#071b4d] text-white shadow-[28px_0_90px_rgba(2,6,23,0.45)] transition-transform duration-300 lg:sticky lg:top-[74px] lg:z-30 lg:h-[calc(100vh-74px)] lg:translate-x-0 lg:shadow-none ${
					open ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				{/* Background Effects */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
					<div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />
					<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:34px_34px] opacity-40" />
				</div>

				{/* Mobile Header */}
				<div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 lg:hidden">
					<div className="flex items-center gap-3">
						<div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f8c84b] text-sm font-black text-[#071b4d] shadow-[0_14px_30px_rgba(248,200,75,0.28)]">SG</div>
						<div>
							<h2 className="text-lg font-black tracking-[-0.04em]">
								Spin<span className="text-[#f8c84b]">Gold</span>
							</h2>
							<p className="text-[10px] font-bold text-blue-100">Reward Dashboard</p>
						</div>
					</div>

					<button
						onClick={close}
						className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/8 text-white transition hover:bg-white/15"
					>
						<X size={18} />
					</button>
				</div>

				<div className="relative flex h-full flex-col">
					<div className="sidebar-dark-scroll flex-1 overflow-y-auto px-4 py-5">
						{/* Desktop Brand */}
						<div className="mb-5 hidden px-1 lg:block">
							<div className="flex items-center gap-3">
								<div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f8c84b] text-sm font-black text-[#071b4d] shadow-[0_14px_30px_rgba(248,200,75,0.28)]">SG</div>

								<div>
									<h2 className="text-[24px] font-black tracking-[-0.05em]">
										Spin<span className="text-[#f8c84b]">Gold</span>
									</h2>
									<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">Reward System</p>
								</div>
							</div>
						</div>

						{/* Profile Card */}
						<div className="rounded-[24px] border border-white/10 bg-white/10 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.20)] backdrop-blur-xl">
							<div className="flex items-center gap-3">
								<div className="relative grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-white text-[#071b4d]">
									<Avatar />
									<span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-[#071b4d] bg-emerald-500">
										<ShieldCheck
											size={10}
											className="text-white"
										/>
									</span>
								</div>

								<div className="min-w-0 flex-1">
									<h3 className="truncate text-[14px] font-black text-white">{overview?.user.name ?? 'Member'}</h3>
									<p className="mt-1 text-[10.5px] font-bold text-emerald-300">Verified Member</p>
								</div>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-2">
								<div className="rounded-2xl border border-white/10 bg-black/15 p-3">
									<p className="text-[10px] font-bold text-blue-100">Balance</p>
									<h4 className="mt-1 text-[14px] font-black text-[#f8c84b]">{formatMoney(overview?.user.walletBalance ?? 0)}</h4>
								</div>

								<div className="rounded-2xl border border-white/10 bg-black/15 p-3">
									<p className="text-[10px] font-bold text-blue-100">Spins</p>
									<h4 className="mt-1 text-[14px] font-black text-white">{overview?.stats.spinsRemaining ?? 0} / {overview?.stats.dailySpins ?? 0}</h4>
								</div>
							</div>
						</div>

						{/* Balance Card */}
						<div className="mt-4 rounded-[24px] border border-[#f8c84b]/25 bg-gradient-to-br from-[#0b2a70] to-[#06143a] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
							<div className="flex items-center gap-3">
								<div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f8c84b]/15 text-[#f8c84b]">
									<Wallet size={18} />
								</div>
								<div className="min-w-0">
									<p className="text-[10px] font-bold text-blue-100">Available Balance</p>
									<h4 className="mt-0.5 truncate text-[12px] font-black text-white">{formatMoney(overview?.user.walletBalance ?? 0)}</h4>
									<p className="mt-1 truncate text-[10px] font-bold text-blue-100/80">Withdrawable: {formatMoney(overview?.user.withdrawableBalance ?? 0)}</p>
								</div>
							</div>
						</div>

						{/* Main Menu */}
						<div className="mt-6">
							<p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/70">Main Menu</p>

							<nav className="space-y-1.5">{main.map(render)}</nav>
						</div>

						{/* Account */}
						<div className="mt-6">
							<p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/70">Account</p>

							<nav className="space-y-1.5">{account.map(render)}</nav>
						</div>

						{/* Referral Premium Card */}
						<div className="mt-6 rounded-[24px] border border-[#f8c84b]/25 bg-[#f8c84b] p-4 text-[#071b4d] shadow-[0_18px_45px_rgba(248,200,75,0.18)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="inline-flex items-center gap-1.5 rounded-full bg-[#071b4d]/10 px-2.5 py-1 text-[10px] font-black">
										<Sparkles size={11} />
										Referral
									</div>

									<h3 className="mt-3 text-[15px] font-black">Refer & Earn</h3>

									<p className="mt-1.5 text-[11px] font-bold leading-5 text-[#071b4d]/75">Earn 5% on referred membership purchases.</p>
								</div>

								<div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/45">
									<Gift size={23} />
								</div>
							</div>

							<Link href="/dashboard/referrals" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071b4d] py-2.5 text-[12px] font-black text-white transition hover:bg-[#09266b]">
								Invite Now
								<ChevronRight size={14} />
							</Link>
						</div>
					</div>

					{/* Logout */}
					<div className="border-t border-white/10 bg-[#06143a]/80 px-4 py-4">
						<button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 py-2.5 text-[12px] font-black text-red-200 transition hover:bg-red-500 hover:text-white">
							<LogOut size={15} />
							Logout
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}

export function CustomerShell({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const { overview } = useOverview();

	return (
		<main className="min-h-screen bg-[#f6f8ff] text-slate-950">
			<Topbar
				onOpen={() => setOpen(true)}
				user={overview?.user ?? null}
			/>
			<div className="grid lg:grid-cols-[292px_1fr]">
				<Sidebar
					open={open}
					close={() => setOpen(false)}
					overview={overview}
				/>
				<div className="min-w-0">
					<div className="safe-area px-4 py-7 lg:px-8">{children}</div>
					<PublicFooter />
				</div>
			</div>
		</main>
	);
}

export function Status({ value }: { value: string }) {
	const tone =
		value.includes('Pending') || value.includes('Review')
			? 'bg-yellow-50 text-yellow-700'
			: value.includes('Reject') || value.includes('Blocked') || value.includes('Failed')
				? 'bg-red-50 text-red-600'
				: value.includes('Process')
					? 'bg-blue-50 text-blue-600'
					: 'bg-emerald-50 text-emerald-600';
	return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${tone}`}>{value}</span>;
}
