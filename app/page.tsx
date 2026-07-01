'use client';

import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
	ArrowRight,
	BadgeIndianRupee,
	Bell,
	CheckCircle2,
	ChevronDown,
	Clock3,
	Coins,
	CreditCard,
	Crown,
	Gift,
	HandCoins,
	LayoutDashboard,
	LockKeyhole,
	Menu,
	ShieldCheck,
	Sparkles,
	Trophy,
	Users,
	Wallet,
	X,
	Zap,
} from 'lucide-react';

const navItems = [
	{ label: 'Home', href: '#home' },
	{ label: 'Membership', href: '#membership' },
	{ label: 'How It Works', href: '#how-it-works' },
	{ label: 'Rewards', href: '#rewards' },
	{ label: 'Security', href: '#security' },
	{ label: 'FAQ', href: '#faq' },
];

const plans = [
	{ name: 'Starter', price: '₹499', spins: '1 Spin', reward: '₹650 - ₹750', tag: 'Beginner', color: 'from-emerald-400 to-teal-600' },
	{ name: 'Basic', price: '₹999', spins: '1 Spin', reward: '₹1,750 - ₹1,900', tag: 'Value', color: 'from-blue-400 to-indigo-600' },
	{ name: 'Standard', price: '₹1499', spins: '2 Spins', reward: '₹2,800 - ₹3,000', tag: 'Popular', popular: true, color: 'from-violet-500 to-purple-700' },
	{ name: 'Advanced', price: '₹1999', spins: '3 Spins', reward: '₹3,900 - ₹4,100', tag: 'Smart', color: 'from-orange-400 to-rose-600' },
	{ name: 'Pro', price: '₹3000', spins: '4 Spins', reward: '₹6,000 - ₹6,300', tag: 'Growth', color: 'from-yellow-400 to-orange-500' },
	{ name: 'Elite', price: '₹5000', spins: '6 Spins', reward: '₹10,500 - ₹11,500', tag: 'Premium', color: 'from-cyan-400 to-blue-600' },
	{ name: 'Legend', price: '₹10000', spins: '13 Spins', reward: '₹21,000 - ₹22,500', tag: 'Maximum', color: 'from-fuchsia-500 to-purple-800' },
];

const steps = [
	{ icon: '💳', title: 'Fund Account', desc: 'Account balance maintain karke plan activate karo.' },
	{ icon: '📒', title: 'Track Activity', desc: 'Transactions aur rewards ko dashboard se monitor karo.' },
	{ icon: '👑', title: 'Buy Membership', desc: 'Apne earning goal ke hisaab se plan choose karo.' },
	{ icon: '🎡', title: 'Spin Daily', desc: '21 days tak daily spin claim karo.' },
	{ icon: '🎁', title: 'Earn Rewards', desc: 'Spin reward wallet balance me add hota hai.' },
	{ icon: '🏦', title: 'Withdraw', desc: 'Plan expiry ke baad withdrawal request create karo.' },
];

const faqs = [
	{ q: 'What is SpinGold?', a: 'SpinGold ek 21-day membership spin reward system UI hai jahan user membership buy karke daily spins se rewards earn karta hai.' },
	{ q: 'How does daily spin work?', a: 'Har active membership ke hisaab se daily spins milte hain. Bigger membership me spin count aur reward range better hoti hai.' },
	{ q: 'Can I buy multiple memberships?', a: 'Haan, user multiple memberships buy kar sakta hai. Total daily spins active memberships ke basis par calculate ho sakte hain.' },
	{ q: 'When can I withdraw?', a: 'User apni membership ke 21 days complete hone ke baad withdrawal request create kar sakta hai.' },
	{ q: 'Is wallet payment secure?', a: 'UI secure wallet connection, payment status, transaction tracking aur smart flow ko highlight karta hai.' },
];

function Logo({ light = false }: { light?: boolean }) {
	return (
		<div className="flex items-center gap-3">
			<div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-700 shadow-xl shadow-blue-700/25">
				<div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-yellow-400 ring-4 ring-white" />
				<span className="text-sm font-black text-white">SG</span>
			</div>

			<div className="leading-none">
				<h1 className={`text-2xl font-black tracking-tight ${light ? 'text-white' : 'text-slate-950'}`}>
					Spin<span className="text-yellow-500">Gold</span>
				</h1>
				<p className={`mt-1 text-[10px] font-black uppercase tracking-[0.26em] ${light ? 'text-slate-400' : 'text-slate-400'}`}>Reward System</p>
			</div>
		</div>
	);
}

function PrimaryButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
	return (
		<a
			href="/signup"
			className={`group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-400 px-7 py-4 text-sm font-black text-white shadow-2xl shadow-orange-500/25 transition duration-300 hover:-translate-y-1 hover:shadow-orange-500/40 ${className}`}
		>
			{children}
			<ArrowRight
				size={18}
				className="transition group-hover:translate-x-1"
			/>
		</a>
	);
}

function SectionHeader({ badge, title, desc }: { badge: string; title: string; desc: string }) {
	return (
		<div className="mx-auto max-w-3xl text-center">
			<div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
				<Sparkles size={16} />
				{badge}
			</div>
			<h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h2>
			<p className="mt-4 text-base leading-7 text-slate-500">{desc}</p>
		</div>
	);
}

function StatCard({ icon: Icon, value, title, sub }: { icon: LucideIcon; value: string; title: string; sub: string }) {
	return (
		<div className="group rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(37,99,235,0.16)]">
			<div className="flex items-center gap-4">
				<div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-violet-100 text-blue-700 transition duration-300 group-hover:scale-110">
					<Icon size={28} />
				</div>
				<div>
					<h3 className="text-2xl font-black text-slate-950">{value}</h3>
					<p className="mt-1 text-sm font-black text-slate-700">{title}</p>
					<p className="text-xs font-semibold text-slate-400">{sub}</p>
				</div>
			</div>
		</div>
	);
}

function SpinWheel({ compact = false }: { compact?: boolean }) {
	return (
		<div className={`relative rounded-full p-2 shadow-2xl shadow-orange-500/25 ${compact ? 'h-44 w-44' : 'h-72 w-72'}`}>
			<div className="absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 -translate-y-3 border-l-[13px] border-r-[13px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-300 drop-shadow-xl" />

			<div
				className="animate-wheel-slow h-full w-full rounded-full border-[10px] border-orange-300 shadow-inner"
				style={{
					background:
						'conic-gradient(from -20deg, #ef4444 0deg 48deg, #f97316 48deg 96deg, #16a34a 96deg 144deg, #0284c7 144deg 192deg, #4f46e5 192deg 240deg, #7c3aed 240deg 288deg, #dc2626 288deg 360deg)',
				}}
			/>

			<div className="absolute inset-7 rounded-full border border-white/40" />

			<div className="absolute inset-0 flex items-center justify-center">
				<div className="flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-yellow-300 bg-white text-sm font-black text-orange-500 shadow-2xl">SPIN</div>
			</div>

			{[
				['₹0', 'left-[47%] top-10'],
				['₹55', 'right-14 top-16'],
				['₹76', 'right-10 top-[43%]'],
				['₹50', 'bottom-20 right-12'],
				['₹114', 'bottom-10 left-[42%]'],
				['₹35', 'bottom-20 left-11'],
				['₹230', 'left-9 top-[43%]'],
			].map(([label, pos]) => (
				<span
					key={label}
					className={`absolute ${pos} text-xs font-black text-white drop-shadow`}
				>
					{label}
				</span>
			))}
		</div>
	);
}

function DashboardPreview() {
	const sidebar = ['Dashboard', 'Memberships', 'Daily Spin', 'Rewards', 'Referrals', 'Withdraw'];

	return (
		<div className="relative">
			<div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-yellow-300/30 blur-3xl" />
			<div className="absolute -bottom-10 -right-8 h-36 w-36 rounded-full bg-fuchsia-400/30 blur-3xl" />

			<div className="relative rounded-[2.2rem] border border-white/40 bg-white/80 p-4 shadow-[0_35px_130px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
				<div className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white">
					<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-xs font-black text-white">SG</div>
							<div>
								<h3 className="text-sm font-black text-slate-950">SpinGold Dashboard</h3>
								<p className="text-[11px] font-semibold text-slate-400">Live reward overview</p>
							</div>
						</div>

						<div className="hidden rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-black text-green-700 sm:block">Wallet Active</div>
					</div>

					<div className="grid grid-cols-12">
						<aside className="col-span-3 hidden border-r border-slate-100 bg-slate-50/80 p-3 md:block">
							{sidebar.map((item, index) => (
								<div
									key={item}
									className={`mb-2 flex items-center gap-2 rounded-xl px-3 py-3 text-[11px] font-black ${
										index === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500'
									}`}
								>
									<LayoutDashboard size={14} />
									{item}
								</div>
							))}
						</aside>

						<div className="col-span-12 p-5 md:col-span-9">
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
								{[
									['Wallet', '₹12,450', 'text-emerald-600'],
									['Rewards', '₹4,250', 'text-blue-600'],
									['Plans', '2', 'text-purple-600'],
									['Refs', '125', 'text-orange-600'],
								].map(([label, value, color]) => (
									<div
										key={label}
										className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
									>
										<p className="text-[11px] font-bold text-slate-400">{label}</p>
										<h4 className={`mt-2 text-xl font-black ${color}`}>{value}</h4>
									</div>
								))}
							</div>

							<div className="mt-5 grid items-center gap-5 lg:grid-cols-[1fr_220px]">
								<div className="rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 p-5">
									<div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black text-blue-700 shadow-sm">
										<Clock3 size={14} />
										Next Spin Available
									</div>

									<h3 className="mt-4 text-4xl font-black text-slate-950">12:45:30</h3>

									<p className="mt-2 text-sm font-medium text-slate-500">Daily spin claim karke reward collect karo.</p>

									<a href="/login" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/20">
										Spin Now <ArrowRight size={16} />
									</a>
								</div>

								<div className="flex justify-center">
									<SpinWheel compact />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Floating Cards */}
			<div className="absolute -left-5 bottom-16 hidden rounded-2xl border border-white/50 bg-white/90 p-4 shadow-2xl backdrop-blur lg:block">
				<p className="text-[11px] font-bold text-slate-400">Today Reward</p>
				<h4 className="text-xl font-black text-emerald-600">+₹230</h4>
			</div>

			<div className="absolute -right-4 top-14 hidden rounded-2xl border border-white/50 bg-white/90 p-4 shadow-2xl backdrop-blur lg:block">
				<p className="text-[11px] font-bold text-slate-400">Payment</p>
				<div className="mt-1 flex items-center gap-2 text-sm font-black text-blue-700">
					<ShieldCheck size={17} /> Secured
				</div>
			</div>
		</div>
	);
}

export default function HomePage() {
	const [mobile, setMobile] = useState(false);
	const [openFaq, setOpenFaq] = useState<number | null>(0);

	return (
		<main className="min-h-screen overflow-hidden bg-[#f7f9ff] text-slate-950">
			{/* Navbar */}
			<header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-2xl">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
					<Logo />

					<nav className="hidden items-center gap-7 text-sm font-black text-slate-600 lg:flex">
						{navItems.map((item, index) => (
							<a
								key={item.label}
								href={item.href}
								className={`relative transition hover:text-blue-700 ${index === 0 ? 'text-blue-700' : ''}`}
							>
								{item.label}
								{index === 0 && <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-blue-600" />}
							</a>
						))}
					</nav>

					<div className="hidden items-center gap-3 lg:flex">
						<a href="/signup" className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:border-blue-500 hover:shadow-lg">Create Account</a>

						<a
							href="/login"
							className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5"
						>
							Login
						</a>
					</div>

					<button
						onClick={() => setMobile(!mobile)}
						className="rounded-2xl border border-slate-200 bg-white p-3 lg:hidden"
					>
						{mobile ? <X /> : <Menu />}
					</button>
				</div>

				{mobile && (
					<div className="border-t border-slate-100 bg-white px-4 py-5 lg:hidden">
						<div className="grid gap-2 font-bold">
							{navItems.map((item) => (
								<a
									key={item.label}
									href={item.href}
									className="rounded-xl px-4 py-3 hover:bg-blue-50"
								>
									{item.label}
								</a>
							))}

							<a href="/signup" className="rounded-2xl border border-blue-200 px-4 py-3 text-left font-black">Create Account</a>

							<a
								href="/login"
								className="rounded-2xl bg-blue-600 px-4 py-3 text-left font-black text-white"
							>
								Login
							</a>
						</div>
					</div>
				)}
			</header>

			{/* Hero */}
			<section
				id="home"
				className="relative bg-[radial-gradient(circle_at_top_left,#2563eb,transparent_34%),radial-gradient(circle_at_top_right,#a855f7,transparent_34%),linear-gradient(135deg,#020617,#0f2a85_48%,#4c1d95)]"
			>
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:76px_76px]" />
				<div className="absolute left-8 top-32 animate-float text-6xl">🪙</div>
				<div className="absolute right-10 top-40 animate-float-delayed text-7xl">🪙</div>
				<div className="absolute bottom-16 left-[42%] animate-float text-5xl">🪙</div>

				<div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
					<div>
						<div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white shadow-2xl backdrop-blur">
							<Sparkles
								className="text-yellow-300"
								size={18}
							/>
							21 Days Spin Reward System
						</div>

						<h2 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">
							Spin Daily. Earn Rewards. <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Withdraw After 21 Days.</span>
						</h2>

						<p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-blue-100">
							Buy membership, unlock daily spins, collect rewards, earn referral income and withdraw after your plan expiry.
						</p>

						<div className="mt-9 flex flex-wrap gap-4">
							<PrimaryButton>Get Started</PrimaryButton>

							<a href="/membership" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/20">
								<Wallet size={20} /> Buy Membership
							</a>
						</div>

						<div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
							{[
								['Secure', ShieldCheck],
								['Transparent', Zap],
								['Smart Wallet', CreditCard],
								['Fast Payout', Coins],
							].map(([text, Icon]) => {
								const I = Icon as LucideIcon;

								return (
									<div
										key={text as string}
										className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur"
									>
										<I
											className="mb-2 text-emerald-300"
											size={20}
										/>
										<p className="text-sm font-black">{text as string}</p>
									</div>
								);
							})}
						</div>
					</div>

					<DashboardPreview />
				</div>
			</section>

			{/* Stats */}
			<section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 lg:px-8">
				<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
					<StatCard
						icon={Users}
						value="25,486+"
						title="Active Members"
						sub="Growing every day"
					/>
					<StatCard
						icon={Gift}
						value="₹12,75,630+"
						title="Daily Rewards"
						sub="Distributed daily"
					/>
					<StatCard
						icon={Wallet}
						value="₹8,43,20,900+"
						title="Total Withdrawals"
						sub="Withdrawn by users"
					/>
					<StatCard
						icon={ShieldCheck}
						value="100%"
						title="Secure Payments"
						sub="Wallet protected flow"
					/>
				</div>
			</section>

			{/* Membership */}
			<section
				id="membership"
				className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/60 to-white px-4 py-24 lg:px-8"
			>
				{/* Background Glow */}
				<div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
				<div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl" />

				<div className="relative mx-auto max-w-7xl">
					<div className="mx-auto max-w-3xl text-center">
						<div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2 text-sm font-black text-blue-700 shadow-sm">
							<Sparkles
								size={16}
								className="text-yellow-500"
							/>
							Membership Plans
						</div>

						<h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
							Choose Your <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Reward Plan</span>
						</h2>

						<p className="mt-5 text-lg leading-8 text-slate-500">
							21 days tak daily spins unlock karo. Higher plan me better reward range, extra earning potential aur premium benefits milte hain.
						</p>
					</div>

					{/* Small Info Bar */}
					<div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
						{[
							{ icon: <Zap size={22} />, title: 'Daily Spins', desc: 'Plan ke hisaab se daily spins' },
							{ icon: <ShieldCheck size={22} />, title: 'Secure Wallet', desc: 'Wallet based payment flow' },
							{ icon: <Crown size={22} />, title: '21-Day Reward', desc: 'Expiry ke baad withdrawal' },
						].map((item) => (
							<div
								key={item.title}
								className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20">
										{item.icon}
									</div>
									<div>
										<h3 className="font-black text-slate-950">{item.title}</h3>
										<p className="text-sm font-medium text-slate-500">{item.desc}</p>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Cards */}
					<div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{plans.map((plan) => (
							<div
								key={plan.name}
								className={`group relative overflow-hidden rounded-[2rem] border bg-white p-1 shadow-[0_25px_80px_rgba(15,23,42,0.09)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_35px_110px_rgba(37,99,235,0.18)] ${
									plan.popular ? 'border-purple-300 ring-4 ring-purple-100' : 'border-slate-200'
								}`}
							>
								{/* Top gradient */}
								<div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${plan.color} opacity-95`} />

								{/* Popular Badge */}
								{plan.popular && (
									<div className="absolute right-5 top-5 z-20 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-wide text-purple-700 shadow-lg">
										Most Popular
									</div>
								)}

								<div className="relative z-10 rounded-[1.75rem] bg-white/95 p-6 pt-7 backdrop-blur-xl">
									{/* Icon */}
									<div
										className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${plan.color} text-white shadow-xl transition duration-500 group-hover:rotate-6 group-hover:scale-110`}
									>
										<Crown size={28} />
									</div>

									{/* Plan Name */}
									<div className="mt-6">
										<p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">{plan.tag}</p>

										<h3 className="mt-2 text-2xl font-black text-slate-950">{plan.name}</h3>

										<div className="mt-4 flex items-end gap-1">
											<p className="text-4xl font-black tracking-tight text-slate-950">{plan.price}</p>
											<span className="pb-1 text-sm font-bold text-slate-400">/ plan</span>
										</div>
									</div>

									{/* Reward Box */}
									<div className="mt-6 rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/60 p-4">
										<div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
											<span className="text-sm font-bold text-slate-500">Daily Spins</span>
											<span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">{plan.spins}</span>
										</div>

										<div className="pt-3">
											<span className="text-sm font-bold text-slate-500">21-Day Rewards</span>
											<p className="mt-1 text-lg font-black text-slate-950">{plan.reward}</p>
										</div>
									</div>

									{/* Features */}
									<div className="mt-6 space-y-3">
										{['21 days membership active', 'Daily spin reward access', 'Referral earning support', 'Withdraw after expiry'].map((feature) => (
											<div
												key={feature}
												className="flex items-center gap-3 text-sm font-bold text-slate-600"
											>
												<CheckCircle2
													size={18}
													className="text-emerald-500"
												/>
												{feature}
											</div>
										))}
									</div>

									{/* CTA */}
									<a
										href="/signup"
										className={`mt-7 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black transition-all duration-300 ${
											plan.popular
												? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40'
												: 'border border-blue-200 bg-white text-blue-700 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-xl hover:shadow-blue-600/20'
										}`}
									>
										Buy Membership
										<ArrowRight size={17} />
									</a>
								</div>
							</div>
						))}
					</div>

					{/* Bottom Note */}
					<div className="mx-auto mt-12 max-w-4xl rounded-[2rem] border border-blue-100 bg-white/80 p-6 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
						<p className="text-sm font-bold leading-7 text-slate-600">
							Note: Reward range plan ke hisaab se vary kar sakta hai. Daily spins 21 days tak active rahenge aur withdrawal membership expiry ke baad available hoga.
						</p>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section
				id="how-it-works"
				className="bg-white py-20"
			>
				<div className="mx-auto max-w-7xl px-4 lg:px-8">
					<SectionHeader
						badge="Simple Flow"
						title="How SpinGold Works"
						desc="Wallet connect se lekar withdraw tak pura user flow clean, simple aur easy-to-understand banaya gaya hai."
					/>

					<div className="mt-12 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
						{steps.map((step, index) => (
							<div
								key={step.title}
								className="relative"
							>
								{index !== steps.length - 1 && <div className="absolute right-[-18px] top-14 hidden text-2xl text-slate-300 lg:block">→</div>}

								<div className="h-full rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5 text-center transition hover:-translate-y-2 hover:bg-white hover:shadow-2xl">
									<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-lg">{step.icon}</div>

									<h3 className="mt-5 font-black text-slate-950">
										{index + 1}. {step.title}
									</h3>

									<p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Rewards */}
			<section
				id="rewards"
				className="mx-auto max-w-7xl px-4 py-20 lg:px-8"
			>
				<SectionHeader
					badge="Rewards Hub"
					title="Spin Rewards, Referral & Bonus"
					desc="Wheel rewards, referral income aur extra spin opportunities ko premium cards me show kiya gaya hai."
				/>

				<div className="mt-12 grid gap-6 lg:grid-cols-3">
					<div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
						<h3 className="text-2xl font-black text-slate-950">Wheel Rewards</h3>
						<p className="mt-2 text-sm text-slate-500">Reward values plan ke hisaab se vary kar sakte hain.</p>

						<div className="mt-8 flex justify-center">
							<SpinWheel />
						</div>

						<div className="mt-8 grid grid-cols-2 gap-3">
							{['₹0', '₹35', '₹50', '₹55', '₹76', '₹114', '₹230'].map((item) => (
								<div
									key={item}
									className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
								>
									<span className="font-black">{item}</span>
									<BadgeIndianRupee
										size={17}
										className="text-blue-600"
									/>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-600 to-violet-700 p-7 text-white shadow-[0_25px_80px_rgba(37,99,235,0.25)]">
						<div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15">
							<Users size={30} />
						</div>

						<h3 className="mt-7 text-3xl font-black">Referral Program</h3>

						<p className="mt-3 leading-7 text-blue-100">Invite friends and earn 5% when they purchase a membership.</p>

						<div className="mt-8 grid gap-3">
							{[
								['Direct Referral', '5%'],
							].map(([level, value]) => (
								<div
									key={level}
									className="rounded-2xl bg-white/12 p-4 text-center backdrop-blur"
								>
									<p className="text-xs font-bold text-blue-100">{level}</p>
									<h4 className="mt-1 text-2xl font-black">{value}</h4>
								</div>
							))}
						</div>

						<a href="/referrals" className="mt-8 block w-full rounded-2xl bg-white px-5 py-4 text-center font-black text-blue-700">Explore Referral</a>
					</div>

					<div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
						<div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
							<Trophy size={34} />
						</div>

						<h3 className="mt-7 text-3xl font-black text-slate-950">Platform Controls</h3>

						<p className="mt-3 text-slate-500">Core reward and support workflows are tracked by the backend.</p>

						<div className="mt-7 space-y-4">
							{['Membership-based daily spin limits', '5% direct referral rewards', 'Admin-reviewed withdrawals', 'Trackable support tickets'].map((item) => (
								<div
									key={item}
									className="flex items-center gap-3 font-bold text-slate-700"
								>
									<CheckCircle2
										className="text-emerald-500"
										size={20}
									/>
									{item}
								</div>
							))}
						</div>

						<a href="/signup" className="mt-8 block w-full rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-400 px-5 py-4 text-center font-black text-white shadow-xl shadow-orange-500/20">
							Claim Bonus
						</a>
					</div>
				</div>
			</section>

			{/* Security */}
			<section
				id="security"
				className="bg-slate-950 py-20 text-white"
			>
				<div className="mx-auto max-w-7xl px-4 lg:px-8">
					<div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
						<div>
							<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-blue-100">
								<LockKeyhole size={16} />
								Security First
							</div>

							<h2 className="text-4xl font-black tracking-tight md:text-5xl">Built for secure wallet payment experience.</h2>

							<p className="mt-5 max-w-xl leading-8 text-slate-400">
								UI me wallet status, transaction tracking, payout request aur transparent reward flow ko clear way me represent kiya gaya hai.
							</p>

							<a href="#how-it-works" className="mt-8 inline-flex rounded-2xl bg-white px-7 py-4 text-sm font-black text-slate-950">View Security Flow</a>
						</div>

						<div className="grid gap-5 md:grid-cols-3">
							{[
								{ icon: ShieldCheck, title: 'Wallet Protection', desc: 'User wallet connect aur payment flow clean display.' },
								{ icon: Bell, title: 'Deadline Alerts', desc: 'Spin reminder aur membership expiry status.' },
								{ icon: HandCoins, title: 'Withdraw Flow', desc: 'Expiry ke baad withdrawal request tracking.' },
							].map((card) => {
								const Icon = card.icon;

								return (
									<div
										key={card.title}
										className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:-translate-y-2 hover:bg-white/[0.1]"
									>
										<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
											<Icon size={27} />
										</div>

										<h3 className="mt-6 text-xl font-black">{card.title}</h3>

										<p className="mt-3 text-sm leading-7 text-slate-400">{card.desc}</p>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section
				id="faq"
				className="mx-auto max-w-5xl px-4 py-20 lg:px-8"
			>
				<SectionHeader
					badge="Questions"
					title="Frequently Asked Questions"
					desc="SpinGold reward system ke common questions ko clean accordion design me show kiya gaya hai."
				/>

				<div className="mt-10 grid gap-4">
					{faqs.map((faq, index) => (
						<div
							key={faq.q}
							className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
						>
							<button
								onClick={() => setOpenFaq(openFaq === index ? null : index)}
								className="flex w-full items-center justify-between px-6 py-5 text-left font-black text-slate-950"
							>
								{faq.q}
								<ChevronDown className={`transition ${openFaq === index ? 'rotate-180' : ''}`} />
							</button>

							{openFaq === index && <p className="border-t border-slate-100 px-6 py-5 leading-7 text-slate-500">{faq.a}</p>}
						</div>
					))}
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-slate-950 text-white">
				<div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
					<div className="lg:col-span-2">
						<Logo light />

						<p className="mt-5 max-w-sm leading-7 text-slate-400">SpinGold 21 days membership spin reward system UI. Premium, responsive and dashboard-style landing page.</p>

						<a href="/signup" className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950">Create Account</a>
					</div>

					<div>
						<h3 className="font-black">Quick Links</h3>
						<div className="mt-5 grid gap-3 text-sm text-slate-400">
							<a href="#home">Home</a>
							<a href="#membership">Membership</a>
							<a href="#how-it-works">How It Works</a>
							<a href="#rewards">Rewards</a>
						</div>
					</div>

					<div>
						<h3 className="font-black">Account</h3>
						<div className="mt-5 grid gap-3 text-sm text-slate-400">
							<a href="/login">Login</a>
							<a href="/dashboard/cards">My Memberships</a>
							<a href="/dashboard/transactions">Transactions</a>
							<a href="/dashboard/withdraw">Withdraw</a>
						</div>
					</div>

					<div>
						<h3 className="font-black">Support</h3>
						<p className="mt-5 text-sm text-slate-400">Members can open and track support tickets from their dashboard.</p>
						<a href="/dashboard/support" className="mt-5 inline-flex rounded-xl border border-white/15 px-4 py-3 text-sm font-black">Open Support</a>
					</div>
				</div>

				<div className="border-t border-white/10 py-5 text-center text-sm text-slate-500">© 2026 SpinGold. All rights reserved.</div>
			</footer>
		</main>
	);
}
