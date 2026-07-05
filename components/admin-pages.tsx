'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Crown, Gift, Landmark, LockKeyhole, Search, ShieldAlert, Unlock, Users, Wallet } from 'lucide-react';
import { AdminCard, AdminTitle } from './admin-shell';
import { apiCall } from '@/hooks/api-call-hook';
import { formatDate, formatMoney } from '@/libs/format';
import type { ApiResponse } from '@/libs/types';
import { useAlert } from './alert';

type AdminUser = {
	_id: string;
	name: string;
	email: string;
	status: string;
	walletBalance: number;
	rewardBalance: number;
	withdrawableBalance: number;
	payoutWalletAddress: string;
	createdAt: string;
};
type Withdrawal = {
	_id: string;
	amount: number;
	walletAddress: string;
	status: string;
	createdAt: string;
	txHash?: string;
	user?: { name: string; email: string };
};
type SupportTicket = {
	_id: string;
	subject: string;
	message: string;
	status: string;
	adminReply: string;
	createdAt: string;
	user?: { name: string; email: string };
};
type AuditEntry = {
	_id: string;
	action: string;
	previousValue?: number;
	newValue?: number;
	reason?: string;
	module: string;
	targetId: string;
	createdAt: string;
	admin?: { name: string; email: string };
};

type RewardAuditEntry = {
	_id: string;
	action: string;
	previousValue: number;
	newValue: number;
	reason: string;
	createdAt: string;
	admin?: { name: string; email: string };
};

type RewardSlot = {
	id: string;
	dayNumber: number;
	spinNumber: number;
	scheduledDate: string;
	defaultValue: number;
	adminValue: number | null;
	finalValue: number;
	allowedValues: number[];
	source: 'system' | 'admin';
	isAdminOverride: boolean;
	overrideReason: string;
	status: 'pending' | 'used' | 'skipped' | 'expired' | 'locked';
	visibleToUser: boolean;
	usedAt: string | null;
	lockedAt: string | null;
	lockReason: string;
};

type RewardMembership = {
	_id: string;
	planName: string;
	planId: string;
	price: number;
	dailySpins: number;
	rewardMin: number;
	rewardMax: number;
	startsAt: string;
	expiresAt: string;
	status: 'active' | 'expired';
	earned: number;
	schedules: RewardSlot[];
};

type RewardUserResponse = {
	user: {
		_id: string;
		name: string;
		email: string;
		status: string;
		payoutWalletAddress?: string;
		createdAt: string;
	};
	memberships: RewardMembership[];
};

function useAdminData<T>(url: string) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const load = useCallback(async () => {
		setLoading(true);
		try {
			const response = await apiCall<{ success: boolean; data: T }>('GET', url);
			if (response.success) setData(response.data);
		} finally {
			setLoading(false);
		}
	}, [url]);
	useEffect(() => void load(), [load]);
	return { data, load, loading };
}

function Status({ value }: { value: string }) {
	const tone = value === 'rejected' || value === 'suspended'
		? 'bg-red-400/10 text-red-300'
		: value === 'pending' || value === 'processing'
			? 'bg-yellow-400/10 text-yellow-300'
			: value === 'locked'
				? 'bg-blue-400/10 text-blue-300'
				: 'bg-emerald-400/10 text-emerald-300';
	return <span className={`rounded-full px-3 py-1 text-xs font-black capitalize ${tone}`}>{value}</span>;
}

function Empty({ text }: { text: string }) {
	return <AdminCard className="p-10 text-center font-bold text-slate-400">{text}</AdminCard>;
}

export function AdminDashboard() {
	const { data } = useAdminData<{ users: number; activePlans: number; pendingWithdrawals: number; openTickets: number }>('/admin/overview');
	const cards = [
		['Total Users', data?.users ?? 0, Users],
		['Active Plans', data?.activePlans ?? 0, Crown],
		['Pending Withdrawals', data?.pendingWithdrawals ?? 0, Landmark],
		['Open Tickets', data?.openTickets ?? 0, Gift],
	] as const;
	return (
		<>
			<AdminTitle title="Command Center" desc="Live operational totals from the SpinGold backend." />
			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
				{cards.map(([title, value, Icon]) => (
					<AdminCard key={title} className="p-5">
						<div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/15 text-blue-300"><Icon size={23} /></div>
						<p className="mt-5 text-sm font-bold text-slate-400">{title}</p>
						<h3 className="mt-2 text-3xl font-black">{value}</h3>
					</AdminCard>
				))}
			</div>
		</>
	);
}

export function AdminUsers() {
	const { data, load } = useAdminData<{ users: AdminUser[] }>('/admin/users');
	const { success, error } = useAlert();
	const changeStatus = async (user: AdminUser) => {
		const status = user.status === 'active' ? 'suspended' : 'active';
		const response = await apiCall<ApiResponse>('PATCH', `/admin/users/${user._id}/status`, { status });
		if (response.success) { success(response.message); await load(); } else error(response.message);
	};
	return (
		<>
			<AdminTitle title="User Control" desc="Registered users, balances, payout details and account state." />
			<AdminCard className="overflow-x-auto p-5">
				<table className="w-full min-w-[900px] text-left text-sm">
					<thead><tr className="border-b border-white/10 text-slate-500"><th className="py-3">User</th><th>Payout Wallet</th><th>Cash</th><th>Rewards</th><th>Withdrawable</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
					<tbody>{data?.users.map((user) => <tr key={user._id} className="border-b border-white/5"><td className="py-4"><b>{user.name}</b><p className="text-xs text-slate-500">{user.email}</p></td><td className="max-w-[220px] truncate text-xs text-slate-400">{user.payoutWalletAddress || 'Not set'}</td><td>{formatMoney(user.walletBalance)}</td><td>{formatMoney(user.rewardBalance)}</td><td>{formatMoney(user.withdrawableBalance ?? 0)}</td><td><Status value={user.status}/></td><td>{formatDate(user.createdAt)}</td><td><button onClick={() => changeStatus(user)} className={`rounded-lg px-3 py-2 text-xs font-black ${user.status === 'active' ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'}`}>{user.status === 'active' ? 'Suspend' : 'Reactivate'}</button></td></tr>)}</tbody>
				</table>
			</AdminCard>
		</>
	);
}

export function AdminWithdrawals() {
	const { data, load } = useAdminData<{ withdrawals: Withdrawal[] }>('/admin/withdrawals');
	const { success, error } = useAlert();
	const review = async (id: string, status: 'processing' | 'paid' | 'rejected') => {
		const response = await apiCall<ApiResponse>('PATCH', `/admin/withdrawals/${id}`, { status });
		if (response.success) { success(response.message); await load(); } else error(response.message);
	};
	return (
		<>
			<AdminTitle title="Withdrawal Desk" desc="Review requests, mark treasury processing, paid, or reject and refund." />
			<div className="space-y-3">
				{data?.withdrawals.map((item) => <AdminCard key={item._id} className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"><div><b>{item.user?.name} · {formatMoney(item.amount)}</b><p className="mt-1 text-xs text-slate-400">{item.walletAddress}{item.txHash ? ` · TX: ${item.txHash.slice(0, 18)}...` : ''}</p></div><div className="flex flex-wrap items-center gap-2"><Status value={item.status}/>{!['paid','rejected'].includes(item.status) && <><button onClick={() => review(item._id, 'processing')} className="rounded-xl bg-blue-500/20 px-3 py-2 text-xs font-black text-blue-300">Processing</button><button onClick={() => review(item._id, 'paid')} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black">Paid</button><button onClick={() => review(item._id, 'rejected')} className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-black text-red-300">Reject</button></>}</div></AdminCard>)}
				{data?.withdrawals.length === 0 && <Empty text="No withdrawal requests." />}
			</div>
		</>
	);
}

export function RewardControl() {
	return <RewardControlPanel />;
}

function RewardControlPanel() {
	const [query, setQuery] = useState('');
	const [searching, setSearching] = useState(false);
	const [rewardData, setRewardData] = useState<RewardUserResponse | null>(null);
	const [selectedMembershipId, setSelectedMembershipId] = useState<string>('');
	const [slotDrafts, setSlotDrafts] = useState<Record<string, string>>({});
	const [bulkMode, setBulkMode] = useState<'zero' | 'low' | 'balanced' | 'jackpot'>('balanced');
	const [bulkReason, setBulkReason] = useState('scheduled control');
	const [reason, setReason] = useState('manual adjustment');
	const [auditLogs, setAuditLogs] = useState<RewardAuditEntry[]>([]);
	const [saving, setSaving] = useState<string | null>(null);
	const { success, error } = useAlert();

	const membership = useMemo(() => rewardData?.memberships.find((item) => item._id === selectedMembershipId) ?? rewardData?.memberships[0] ?? null, [rewardData, selectedMembershipId]);

	const loadAudit = useCallback(async (membershipId: string) => {
		const response = await apiCall<ApiResponse<{ logs: RewardAuditEntry[] }>>('GET', `/admin/reward-audit/${membershipId}`);
		if (response.success && response.data) {
			setAuditLogs(response.data.logs);
		}
	}, []);

	useEffect(() => {
		if (!membership) {
			setAuditLogs([]);
			return;
		}
		void loadAudit(membership._id);
	}, [membership, loadAudit]);

	useEffect(() => {
		if (!membership) return;
		setSlotDrafts((current) => {
			const next = { ...current };
			for (const slot of membership.schedules) {
				next[slot.id] = String((slot.adminValue ?? slot.defaultValue) / 100);
			}
			return next;
		});
	}, [membership]);

	const loadUser = async (value = query) => {
		const term = value.trim();
		if (!term) {
			error('Enter a user id, email, wallet address, or referral code.');
			return;
		}
		setSearching(true);
		try {
			const response = await apiCall<ApiResponse<RewardUserResponse>>('GET', `/admin/reward-schedules/users/${encodeURIComponent(term)}`);
			if (!response.success || !response.data) {
				error(response.message);
				return;
			}
			setRewardData(response.data);
			setSelectedMembershipId(response.data.memberships[0]?._id ?? '');
			success('Reward schedule loaded');
		} catch {
			error('Unable to load reward schedule.');
		} finally {
			setSearching(false);
		}
	};

	const saveSlot = async (slot: RewardSlot) => {
		const raw = slotDrafts[slot.id];
		const selected = Number(raw);
		if (Number.isNaN(selected)) {
			error('Choose a valid admin reward value.');
			return;
		}
		setSaving(slot.id);
		try {
			const response = await apiCall<ApiResponse<{ slot: RewardSlot }>>('PATCH', `/admin/reward-schedules/${slot.id}`, {
				adminValue: selected * 100,
				reason,
			});
			if (response.success && response.data) {
				success(response.message);
				await loadUser();
			} else {
				error(response.message);
			}
		} finally {
			setSaving(null);
		}
	};

	const lockSlot = async (slot: RewardSlot, locked: boolean) => {
		setSaving(slot.id);
		try {
			const response = await apiCall<ApiResponse>('POST', `/admin/reward-schedules/${slot.id}/lock`, {
				locked,
				reason,
			});
			if (response.success) {
				success(response.message);
				await loadUser();
			} else {
				error(response.message);
			}
		} finally {
			setSaving(null);
		}
	};

	const applyBulk = async () => {
		if (!membership) return;
		setSaving('bulk');
		try {
			const response = await apiCall<ApiResponse>('PATCH', `/admin/reward-schedules/${membership._id}/bulk`, {
				mode: bulkMode,
				reason: bulkReason,
			});
			if (response.success) {
				success(response.message);
				await loadUser();
			} else {
				error(response.message);
			}
		} finally {
			setSaving(null);
		}
	};

	const regenerate = async () => {
		if (!membership) return;
		setSaving('regen');
		try {
			const response = await apiCall<ApiResponse>('POST', `/admin/reward-schedules/${membership._id}/regenerate`, {
				reason,
			});
			if (response.success) {
				success(response.message);
				await loadUser();
			} else {
				error(response.message);
			}
		} finally {
			setSaving(null);
		}
	};

	const valueOptions = [0, 35, 50, 55, 76, 114, 230];

	return (
		<>
			<AdminTitle
				title="Reward Control"
				desc="Hidden 21-day reward schedules for each membership. Admin overrides are audited and the frontend only receives the final value."
			/>

			<div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
				<AdminCard className="p-5">
					<div className="flex items-center gap-3">
						<Search size={18} className="text-blue-300" />
						<div>
							<p className="text-sm font-black">Find member</p>
							<p className="text-xs text-slate-400">Paste user id, email, payout wallet, or referral code.</p>
						</div>
					</div>

					<div className="mt-4 flex flex-col gap-3 sm:flex-row">
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search member"
							className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
						/>
						<button onClick={() => void loadUser()} disabled={searching} className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60">
							{searching ? 'Loading...' : 'Load Schedule'}
						</button>
					</div>

					{rewardData && (
						<div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs font-bold text-slate-400">Selected user</p>
							<h3 className="mt-1 text-xl font-black">{rewardData.user.name}</h3>
							<p className="mt-1 text-sm text-slate-400">{rewardData.user.email}</p>
							<p className="mt-2 text-xs text-slate-500">{rewardData.user.payoutWalletAddress || 'Payout wallet not set'}</p>

							<div className="mt-4 grid gap-2">
								{rewardData.memberships.map((item) => (
									<button
										key={item._id}
										onClick={() => setSelectedMembershipId(item._id)}
										className={`rounded-2xl border px-4 py-3 text-left transition ${selectedMembershipId === item._id ? 'border-blue-400 bg-blue-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
									>
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="text-sm font-black">{item.planName}</p>
												<p className="text-xs text-slate-400">{formatDate(item.startsAt)} - {formatDate(item.expiresAt)}</p>
											</div>
											<span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase">{item.status}</span>
										</div>
										<p className="mt-2 text-xs text-slate-400">
											{item.schedules.length} slots | earned {formatMoney(item.earned)}
										</p>
									</button>
								))}
							</div>
						</div>
					)}
				</AdminCard>

				<AdminCard className="p-5">
					{membership ? (
						<>
							<div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
								<div>
									<p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Membership</p>
									<h3 className="mt-2 text-2xl font-black">{membership.planName}</h3>
									<p className="mt-1 text-sm text-slate-400">
										{formatMoney(membership.rewardMin)} - {formatMoney(membership.rewardMax)} reward window
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<select value={bulkMode} onChange={(event) => setBulkMode(event.target.value as typeof bulkMode)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
										<option value="zero">Zero</option>
										<option value="low">Low</option>
										<option value="balanced">Balanced</option>
										<option value="jackpot">Jackpot</option>
									</select>
									<button onClick={applyBulk} disabled={saving === 'bulk'} className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-black text-white disabled:opacity-60">
										{saving === 'bulk' ? 'Applying...' : 'Bulk Update'}
									</button>
									<button onClick={regenerate} disabled={saving === 'regen'} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white disabled:opacity-60">
										{saving === 'regen' ? 'Working...' : 'Regenerate'}
									</button>
								</div>
							</div>

							<div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
								<ShieldAlert size={16} className="text-amber-300" />
								Use the dropdown to set the final wheel value. Lock keeps a slot from accidental edits.
							</div>

							<div className="mt-4 overflow-x-auto">
								<table className="w-full min-w-[1100px] text-left text-sm">
									<thead>
										<tr className="border-b border-white/10 text-slate-400">
											<th className="py-3">Day</th>
											<th>Spin</th>
											<th>Scheduled</th>
											<th>Default</th>
											<th>Admin</th>
											<th>Final</th>
											<th>Status</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{membership.schedules.map((slot) => (
											<tr key={slot.id} className="border-b border-white/5">
												<td className="py-3 font-black">Day {slot.dayNumber}</td>
												<td>{slot.spinNumber}</td>
												<td className="text-xs text-slate-400">{formatDate(slot.scheduledDate)}</td>
												<td>{formatMoney(slot.defaultValue)}</td>
												<td>
													<select
														value={slotDrafts[slot.id] ?? String(slot.finalValue / 100)}
														onChange={(event) => setSlotDrafts((current) => ({ ...current, [slot.id]: event.target.value }))}
														className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
													>
														{valueOptions.map((value) => (
															<option key={value} value={value}>
																₹{value}
															</option>
														))}
													</select>
												</td>
												<td className="font-black text-emerald-300">{formatMoney(slot.finalValue)}</td>
												<td>
													<span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase">{slot.status}</span>
												</td>
												<td>
													<div className="flex flex-wrap gap-2">
														<button onClick={() => void saveSlot(slot)} disabled={saving === slot.id} className="rounded-xl bg-blue-500 px-3 py-2 text-xs font-black text-white disabled:opacity-60">
															Save
														</button>
														<button onClick={() => void lockSlot(slot, slot.status !== 'locked')} disabled={saving === slot.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white disabled:opacity-60">
															{slot.status === 'locked' ? <Unlock size={14} /> : <LockKeyhole size={14} />}
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="mt-6">
								<label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Admin reason</label>
								<input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Reason for override or lock" />
							</div>
						</>
					) : (
						<div className="grid min-h-[500px] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
							<div>
								<Crown className="mx-auto text-blue-300" />
								<p className="mt-4 text-lg font-black">Search a user to inspect the schedule</p>
								<p className="mt-2 text-sm text-slate-400">Use an ID, email, wallet address, or referral code.</p>
							</div>
						</div>
					)}
				</AdminCard>
			</div>

			{membership && (
				<AdminCard className="mt-6 p-5">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Audit trail</p>
							<h3 className="mt-2 text-2xl font-black">Recent reward changes</h3>
						</div>
						<p className="text-sm text-slate-400">{auditLogs.length} entries</p>
					</div>

					<div className="mt-4 space-y-3">
						{auditLogs.map((log) => (
							<div key={log._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
									<div>
										<p className="font-black">{log.action}</p>
										<p className="mt-1 text-xs text-slate-400">
											{formatMoney(log.previousValue)} - {formatMoney(log.newValue)}
										</p>
									</div>
									<div className="text-xs text-slate-400">
										<p>{log.admin?.name ?? 'Admin'}</p>
										<p className="mt-1">{formatDate(log.createdAt)}</p>
									</div>
								</div>
								{log.reason && <p className="mt-3 text-sm text-slate-300">{log.reason}</p>}
							</div>
						))}
						{auditLogs.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">No reward audit entries yet.</p>}
					</div>
				</AdminCard>
			)}
		</>
	);
}
export function Treasury() {
	const { data } = useAdminData<{ userWallets: number; userRewards: number; withdrawableRewards: number; paidWithdrawals: number; projectedLiability: number }>('/admin/treasury');
	const cards = [
		['User Wallet Balances', data?.userWallets ?? 0, Wallet],
		['Reward Balances', data?.userRewards ?? 0, Gift],
		['Withdrawable Rewards', data?.withdrawableRewards ?? 0, Landmark],
		['Paid Withdrawals', data?.paidWithdrawals ?? 0, Landmark],
		['Projected Liability', data?.projectedLiability ?? 0, Crown],
	] as const;
	return <><AdminTitle title="Treasury" desc="Live balances and platform liability from the financial ledger."/><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([title,value,Icon]) => <AdminCard key={title} className="p-5"><Icon className="text-blue-300"/><p className="mt-4 text-sm font-bold text-slate-400">{title}</p><h3 className="mt-2 text-2xl font-black">{formatMoney(value)}</h3></AdminCard>)}</div></>;
}
export function Audit() {
	const { data, loading } = useAdminData<{ logs: AuditEntry[] }>('/admin/audit');
	return <><AdminTitle title="Audit Logs" desc="Traceable admin actions for users, withdrawals, rewards, and support."/><div className="space-y-3">{data?.logs.map((log) => <AdminCard key={log._id} className="flex flex-col justify-between gap-3 p-5 md:flex-row md:items-center"><div><b>{log.action}</b><p className="mt-1 text-xs text-slate-400">{log.module} · {log.targetId}</p></div><div className="text-right text-xs text-slate-400"><p>{log.admin?.email ?? 'Admin'}</p><p className="mt-1">{formatDate(log.createdAt)}</p></div></AdminCard>)}{!loading && data?.logs.length === 0 && <Empty text="No admin actions recorded yet."/>}</div></>;
}
export function AdminSettings() {
	return <InfoPage title="Admin Settings" desc="Core safety policies are enforced by backend authorization and validation." items={['JWT role guard on every admin API', 'Validated request bodies', 'Passwords hashed with bcrypt and never returned']} />;
}

export function AdminSupport() {
	const { data, load, loading } = useAdminData<{ tickets: SupportTicket[] }>('/admin/support');
	return <><AdminTitle title="Support Tickets" desc="Reply to member issues and manage ticket status."/><div className="space-y-4">{data?.tickets.map((ticket) => <SupportTicketCard key={ticket._id} ticket={ticket} reload={load}/>)}{!loading && data?.tickets.length === 0 && <Empty text="No support tickets."/>}</div></>;
}

function SupportTicketCard({ ticket, reload }: { ticket: SupportTicket; reload: () => Promise<void> }) {
	const [reply, setReply] = useState(ticket.adminReply);
	const [saving, setSaving] = useState(false);
	const { success, error } = useAlert();
	const update = async (status: 'open' | 'in_progress' | 'closed') => {
		setSaving(true);
		try {
			const response = await apiCall<ApiResponse>('PATCH', `/admin/support/${ticket._id}`, { status, adminReply: reply });
			if (response.success) { success(response.message); await reload(); } else error(response.message);
		} finally {
			setSaving(false);
		}
	};
	return <AdminCard className="p-5"><div className="flex flex-col justify-between gap-3 md:flex-row"><div><h3 className="text-lg font-black">{ticket.subject}</h3><p className="mt-1 text-xs text-slate-400">{ticket.user?.name} · {ticket.user?.email} · {formatDate(ticket.createdAt)}</p></div><Status value={ticket.status}/></div><p className="mt-4 text-sm font-bold text-slate-300">{ticket.message}</p><textarea value={reply} onChange={(event) => setReply(event.target.value)} className="mt-4 min-h-24 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" placeholder="Write support reply..."/><div className="mt-3 flex flex-wrap gap-2"><button disabled={saving} onClick={() => update('in_progress')} className="rounded-xl bg-blue-500/20 px-4 py-2 text-xs font-black text-blue-300">Save & In Progress</button><button disabled={saving} onClick={() => update('closed')} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black">Reply & Close</button><button disabled={saving} onClick={() => update('open')} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black">Reopen</button></div></AdminCard>;
}

function InfoPage({ title, desc, items }: { title: string; desc: string; items: string[] }) {
	return (
		<>
			<AdminTitle title={title} desc={desc} />
			<AdminCard className="p-6">
				{items.map((item) => <div key={item} className="mt-3 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 font-bold text-slate-300"><CheckCircle2 className="shrink-0 text-emerald-300"/>{item}</div>)}
				<div className="mt-6 flex gap-3 text-sm text-slate-400"><LockKeyhole className="text-blue-300"/>Production deployments should connect an email provider and blockchain indexer before accepting real funds.</div>
			</AdminCard>
		</>
	);
}
