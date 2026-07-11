'use client';

import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { plans } from '../data';
import { PageShell, PageTitle } from './dashboard-ui';
import { Panel } from './premium-hero';
import { apiCall } from '@/hooks/api-call-hook';
import type { ApiResponse } from '@/libs/types';
import { useAlert } from '../alert';
import { useOverview } from '@/hooks/use-overview';
import { formatMoney } from '@/libs/format';
import { useRouter } from 'next/navigation';

const planTones = [
	'bg-[#eef8f1] text-emerald-700 border-[#d8eadc]',
	'bg-[#eef4ff] text-blue-700 border-[#d9e6ff]',
	'bg-[#fff8e6] text-[#121826] border-[#f1dfb7]',
	'bg-[#fff1e8] text-orange-700 border-[#efd4c2]',
	'bg-[#101936] text-[#f4c95d] border-[#101936]',
	'bg-[#eef8f1] text-emerald-700 border-[#d8eadc]',
	'bg-[#fff8e6] text-[#121826] border-[#f1dfb7]',
];

export function MembershipPage({ publicMode = false }: { publicMode?: boolean }) {
	const [selected, setSelected] = useState('standard');
	const plan = plans.find((p) => p.id === selected) || plans[2];
	const { success, error } = useAlert();
	const { overview, refresh } = useOverview(!publicMode);
	const router = useRouter();
	const [buying, setBuying] = useState(false);

	const buy = async () => {
		if (publicMode) {
			router.push('/signup');
			return;
		}

		setBuying(true);

		try {
			const response = await apiCall<ApiResponse>('GET', `/membership/buy-membership/${plan.id}`);

			console.log('Buy membership response:', response);

			if (response?.success) {
				success(response.message ?? 'Membership purchased successfully.');
				await refresh();
				return;
			}

			error(response?.message ?? 'Failed to purchase membership.');
		} catch (err) {
			console.error('Buy Membership Error:', err);

			const message =
				err instanceof Error
					? err.message
					: 'Unable to purchase membership right now.';
			error(message);
		} finally {
			setBuying(false);
		}
	};

	return (
		<PageShell>
			<PageTitle
				title="Buy Membership"
				desc="Choose a 21-day plan. Daily spins and reward range are controlled by backend schedule."
				eyebrow="Membership Store"
			/>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
				{/* Left Side */}
				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
						{plans.map((p, index) => {
							const active = selected === p.id;

							return (
								<button
									key={p.id}
									onClick={() => setSelected(p.id)}
									className={`relative rounded-3xl border p-5 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
										active ? 'border-[#101936] bg-[#101936] text-white ring-4 ring-[#f4c95d]/30' : planTones[index % planTones.length]
									}`}
								>
									{p.popular && (
										<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#f4c95d] px-4 py-1 text-[10px] font-black text-[#101936]">POPULAR</span>
									)}

									<div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${active ? 'bg-white/10 text-[#f4c95d]' : 'bg-white/70'}`}>
										<BadgeCheck size={24} />
									</div>

									<h3 className="mt-4 text-lg font-black">{p.name}</h3>

									<p className="mt-2 text-3xl font-black">₹{p.price}</p>

									<div className={`my-4 h-px ${active ? 'bg-white/20' : 'bg-[#eadfcd]'}`} />

									<p className={`text-xs font-bold uppercase ${active ? 'text-white/60' : 'text-[#8a7653]'}`}>Daily Spins</p>

									<p className="mt-1 text-lg font-black">{p.spins} Spins</p>

									<p className={`mt-4 text-xs font-bold uppercase ${active ? 'text-white/60' : 'text-[#8a7653]'}`}>21-Day Rewards</p>

									<p className="mt-1 text-sm font-black">{p.rewards}</p>
								</button>
							);
						})}
					</div>

					
				</div>

				{/* Right Sidebar */}
				<div className="w-full">
					<Panel className="w-full p-5 lg:sticky lg:top-24">
						<p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">Order Summary</p>

						<h2 className="mt-2 text-xl font-black text-[#121826]">Your Membership Summary</h2>

						<p className="mt-2 text-sm font-bold text-[#8a7653]">
							{publicMode ? 'Create an account to purchase this plan.' : `Wallet: ${formatMoney(overview?.user.walletBalance ?? 0)}`}
						</p>

						<div className="mt-5 rounded-3xl border border-[#eadfcd] bg-white/60 p-5">
							<div className="flex items-center justify-between">
								<b>{plan.name}</b>
								<b>₹{plan.price}</b>
							</div>

							<div className="mt-5 space-y-4 text-sm">
								<div className="flex justify-between">
									<span className="text-[#8a7653]">Daily Spins</span>
									<b>{plan.spins} Spins</b>
								</div>

								<div className="flex justify-between">
									<span className="text-[#8a7653]">Total Spins</span>
									<b>{plan.spins * 21} Spins</b>
								</div>

								<div className="flex justify-between">
									<span className="text-[#8a7653]">Rewards</span>
									<b>{plan.rewards}</b>
								</div>
							</div>
						</div>

						<button
							onClick={buy}
							disabled={buying}
							className="mt-6 w-full rounded-2xl bg-[#101936] py-4 text-base font-black text-[#f4c95d] transition hover:bg-[#1b294f] disabled:opacity-60"
						>
							{publicMode ? 'Create Account to Buy' : buying ? 'Processing...' : 'Confirm & Buy Now'}
						</button>
					</Panel>
				</div>
			</div>
			<ComparePlans />
		</PageShell>
	);
}

function ComparePlans() {
	return (
		<Panel className="overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[980px] text-left text-sm">
					<tbody>
						{[
							['Price', ...plans.map((plan) => `₹${plan.price}`)],
							['Daily Spins', ...plans.map((plan) => `${plan.spins} Spins`)],
							['Total Spins', ...plans.map((plan) => `${plan.spins * 21} Spins`)],
							['Rewards', ...plans.map((plan) => plan.rewards)],
						].map((row) => (
							<tr
								key={row[0]}
								className="border-b border-[#eadfcd] last:border-b-0"
							>
								{row.map((cell, index) => (
									<td
										key={`${row[0]}-${index}`}
										className={`p-4 ${index === 0 ? 'font-black text-[#121826]' : 'text-center font-bold text-[#5f5446]'}`}
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Panel>
	);
}
