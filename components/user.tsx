'use client';

/**
 * UserAdminPanel
 * ---------------------------------------------------------------------------
 * Admin detail view for a single user: profile, wallet, membership plans
 * (with day-by-day spin reward grid), reward history, transaction ledger and
 * today's rewards. Includes Edit, Delete and a "More actions" menu.
 *
 * USAGE
 *   <UserAdminPanel userId="6a4a89215a36774c70c46395" />
 *
 * DATA SOURCE
 *   GET  {apiBaseUrl}/{userId}                -> full snapshot (shape below)
 *   PATCH {apiBaseUrl}/{userId}                -> { name?, email?, status? }
 *   DELETE {apiBaseUrl}/{userId}
 *   PATCH {apiBaseUrl}/{userId}/wallet         -> { walletBalance }  (adjust balance)
 *   PATCH {apiBaseUrl}/{userId}/spins/reset    -> reset totalSpins
 *
 *   Default apiBaseUrl: http://localhost:5000/api/admin/user
 *   Override via the `apiBaseUrl` prop if your route differs.
 *
 * DEPENDENCIES
 *   - Tailwind CSS (utility classes used throughout)
 *   - lucide-react (icons)  ->  npm i lucide-react
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Wallet,
	RefreshCw,
	Pencil,
	Trash2,
	MoreVertical,
	X,
	Check,
	Copy,
	Download,
	AlertTriangle,
	ChevronDown,
	ChevronUp,
	Gift,
	Ticket,
	ArrowUpRight,
	ArrowDownRight,
	Loader2,
	Sparkles,
} from 'lucide-react';
import { requestApi } from '@/src/lib/api-client';

/* ---------------------------------------------------------------------- */
/* Types                                                                   */
/* ---------------------------------------------------------------------- */

interface UserRecord {
	_id: string;
	name: string;
	email: string;
	status: string;
	type: string;
	walletBalance: number;
	rewardBalance: number;
	withdrawableBalance: number;
	referralCode: string;
	referredBy: string | null;
	createdAt: string;
	updatedAt: string;
}

interface DayReward {
	day: number;
	rewards: number[];
}

interface MembershipPlan {
	planId: string;
	amount: number;
	startDate: string;
	endDate: string;
	spins: number;
	isActive: boolean;
	totalRewards: DayReward[];
}

interface Memberships {
	_id: string;
	userId: string;
	totalSpins: number;
	myplans: MembershipPlan[];
	createdAt: string;
	updatedAt: string;
}

interface RewardHistoryItem {
	name: string;
	amount: number;
	type: string;
	createdAt: string;
	updatedAt: string;
}

interface RewardHistory {
	_id: string;
	userId: string;
	history: RewardHistoryItem[];
	createdAt: string;
	updatedAt: string;
}

interface TransactionItem {
	planId: string;
	prvBalance: number;
	newBalance: number;
	amount: number;
	transactionType: string;
	transactionStatus: string;
}

interface Transactions {
	_id: string;
	userId: string;
	traData: TransactionItem[];
	createdAt: string;
	updatedAt: string;
}

interface TodayRewards {
	_id: string;
	userId: string;
	todayRewords: number[];
	createdAt: string;
	updatedAt: string;
}

interface UserSnapshot {
	user: UserRecord;
	memberships: Memberships;
	rewardHistory: RewardHistory;
	transactions: Transactions;
	todayrewards: TodayRewards;
}

interface ApiResponse {
	success: boolean;
	data: UserSnapshot;
	message?: string;
}

interface UserAdminPanelProps {
	/** Mongo _id of the user to load. This is the only required prop. */
	userId: string;
	/** Base admin API path, without trailing slash. */
	apiBaseUrl?: string;
}

/* ---------------------------------------------------------------------- */
/* Formatting helpers                                                     */
/* ---------------------------------------------------------------------- */

// Balances arrive as integer paisa (1/100 rupee).
const formatMoney = (paisa: number) => (paisa / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

const formatDate = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatDateShort = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const initials = (name: string) =>
	name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join('');

/* ---------------------------------------------------------------------- */
/* Small building blocks                                                  */
/* ---------------------------------------------------------------------- */

function StatusPill({ status }: { status: string }) {
	const isActive = status.toLowerCase() === 'active';
	return (
		<span className={`rounded-full border-2 border-black  px-3 py-1 text-xs font-black ${isActive ? 'bg-emerald-400/15 text-emerald-900' : 'bg-rose-400/15 text-rose-300'}`}>
			{status}
		</span>
	);
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
	return (
		<div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
			<div className="flex items-center justify-between">
				<span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
				<span className={accent}>{icon}</span>
			</div>
			<p className="mt-3 font-mono text-xl font-black text-white">{value}</p>
		</div>
	);
}

/** Reward intensity -> color, used by the spin-day grid (0 = miss). */
function rewardTone(value: number) {
	if (value === 0) return 'bg-white/[0.03] text-slate-600 ring-white/5';
	if (value < 50) return 'bg-amber-400/10 text-amber-300 ring-amber-400/20';
	if (value < 100) return 'bg-amber-400/20 text-amber-200 ring-amber-400/30';
	if (value < 200) return 'bg-orange-400/25 text-orange-200 ring-orange-400/40';
	return 'bg-emerald-400/25 text-emerald-200 ring-emerald-400/40';
}

function RewardDayGrid({ days }: { days: DayReward[] }) {
	return (
		<div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-21">
			{days.map((d) => {
				const total = d.rewards.reduce((a, b) => a + b, 0);
				return (
					<div
						key={d.day}
						title={`Day ${d.day}: ${d.rewards.join(' + ')}`}
						className={`flex flex-col items-center justify-center rounded-md py-1.5 ring-1 ring-inset ${rewardTone(total)}`}
					>
						<span className="text-[10px] leading-none opacity-70">D{d.day}</span>
						<span className="font-mono text-[11px] font-semibold leading-tight">{total}</span>
					</div>
				);
			})}
		</div>
	);
}

function PlanCard({ plan, index }: { plan: MembershipPlan; index: number }) {
	const [open, setOpen] = useState(index === 0);
	const totalEarned = plan.totalRewards.reduce((sum, d) => sum + d.rewards.reduce((a, b) => a + b, 0), 0);
	return (
		<div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
			<button
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/5"
			>
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-indigo-400/10 p-2 text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
						<Ticket className="h-4 w-4" />
					</div>
					<div>
						<p className="text-sm font-black text-white">
							{plan.planId.charAt(0).toUpperCase() + plan.planId.slice(1)} plan
							<span className="ml-2 font-mono text-xs text-slate-400">{formatMoney(plan.amount)}</span>
						</p>
						<p className="text-xs text-slate-400">
							{formatDateShort(plan.startDate)} &rarr; {formatDateShort(plan.endDate)} &middot; {plan.spins} spins/day
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3 bg-white rounded-lg">
					<StatusPill status={plan.isActive ? 'active' : 'expired'} />
					<span className="font-mono text-lg  text-green-700">Total Earning {formatMoney(totalEarned * 100)}</span>
					{open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
				</div>
			</button>
			{open && (
				<div className="border-t border-white/10 px-4 py-4">
					<RewardDayGrid days={plan.totalRewards} />
				</div>
			)}
		</div>
	);
}

/* ---------------------------------------------------------------------- */
/* Edit modal                                                              */
/* ---------------------------------------------------------------------- */

function EditUserModal({
	user,
	onClose,
	onSave,
	saving,
}: {
	user: UserRecord;
	onClose: () => void;
	onSave: (updates: Partial<Pick<UserRecord, 'name' | 'email' | 'status'>>) => void;
	saving: boolean;
}) {
	const [name, setName] = useState(user.name);
	const [email, setEmail] = useState(user.email);
	const [status, setStatus] = useState(user.status);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
			<div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F151D] p-5 shadow-[0_20px_70px_rgba(0,0,0,.18)] backdrop-blur-xl">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-black text-white">Edit user</h3>
					<button
						onClick={onClose}
						className="rounded-xl p-1 text-slate-400 hover:bg-white/5 hover:text-white"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="mt-4 space-y-3">
					<div>
						<label className="mb-1 block text-xs font-black text-slate-400">Name</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-black text-slate-400">Email</label>
						<input
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							type="email"
							className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-black text-slate-400">Status</label>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50"
						>
							<option value="active">active</option>
							<option value="suspended">suspended</option>
							<option value="blocked">blocked</option>
						</select>
					</div>
				</div>

				<div className="mt-5 flex justify-end gap-2">
					<button
						onClick={onClose}
						className="rounded-xl px-3 py-2 text-sm font-black text-slate-400 hover:bg-white/5"
					>
						Cancel
					</button>
					<button
						disabled={saving}
						onClick={() => onSave({ name, email, status })}
						className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3 py-2 text-sm font-black text-white transition hover:bg-indigo-400 disabled:opacity-60"
					>
						{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
						Save changes
					</button>
				</div>
			</div>
		</div>
	);
}

/* ---------------------------------------------------------------------- */
/* Delete confirmation                                                     */
/* ---------------------------------------------------------------------- */

function DeleteUserModal({ userName, onClose, onConfirm, deleting }: { userName: string; onClose: () => void; onConfirm: () => void; deleting: boolean }) {
	const [confirmText, setConfirmText] = useState('');
	const canDelete = confirmText.trim() === userName;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
			<div className="w-full max-w-md rounded-3xl border border-rose-400/20 bg-[#0F151D] p-5 shadow-[0_20px_70px_rgba(0,0,0,.18)] backdrop-blur-xl">
				<div className="flex items-start gap-3">
					<div className="rounded-2xl bg-rose-400/15 p-2 text-rose-300 ring-1 ring-inset ring-rose-400/20">
						<AlertTriangle className="h-4 w-4" />
					</div>
					<div>
						<h3 className="text-sm font-black text-white">Delete this user?</h3>
						<p className="mt-1 text-xs text-slate-400">
							This permanently removes the account, wallet, memberships and reward history for <span className="text-white">{userName}</span>. This cannot be undone.
						</p>
					</div>
				</div>

				<div className="mt-4">
					<label className="mb-1 block text-xs font-black text-slate-400">
						Type <span className="font-mono text-white">{userName}</span> to confirm
					</label>
					<input
						value={confirmText}
						onChange={(e) => setConfirmText(e.target.value)}
						className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/50"
					/>
				</div>

				<div className="mt-5 flex justify-end gap-2">
					<button
						onClick={onClose}
						className="rounded-xl px-3 py-2 text-sm font-black text-slate-400 hover:bg-white/5"
					>
						Cancel
					</button>
					<button
						disabled={!canDelete || deleting}
						onClick={onConfirm}
						className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-black text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
						Delete user
					</button>
				</div>
			</div>
		</div>
	);
}

/* ---------------------------------------------------------------------- */
/* Main component                                                          */
/* ---------------------------------------------------------------------- */

export default function UserAdminPanel({ userId, apiBaseUrl = 'http://localhost:5000/api/admin/user' }: UserAdminPanelProps) {
	const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const [showEdit, setShowEdit] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [toast, setToast] = useState<string | null>(null);

	const showToast = (msg: string) => {
		setToast(msg);
		window.setTimeout(() => setToast(null), 2500);
	};

	const fetchUser = useCallback(
		async (isRefresh = false) => {
			if (isRefresh) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}
			setError(null);
			try {
				const json = await requestApi<ApiResponse['data']>('GET', `/admin/user/${userId}`);
				if (!json.success) throw new Error(json.message || 'Failed to load user');
				if (!json.data) throw new Error('Empty user data received');
				setSnapshot(json.data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Something went wrong');
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[userId],
	);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const handleSaveEdit = async (updates: Partial<Pick<UserRecord, 'name' | 'email' | 'status'>>) => {
		setSaving(true);
		try {
			const res = await fetch(`${apiBaseUrl}/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
			if (!res.ok) throw new Error('Update failed');
			setShowEdit(false);
			showToast('User updated');
			await fetchUser(true);
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Update failed');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			const res = await fetch(`${apiBaseUrl}/${userId}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Delete failed');
			setShowDelete(false);
			showToast('User deleted');
			setSnapshot(null);
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Delete failed');
		} finally {
			setDeleting(false);
		}
	};

	const handleExport = () => {
		if (!snapshot) return;
		const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${snapshot.user._id}.json`;
		a.click();
		URL.revokeObjectURL(url);
		setShowMenu(false);
	};

	const handleCopyId = () => {
		if (!snapshot) return;
		navigator.clipboard.writeText(snapshot.user._id);
		showToast('User ID copied');
		setShowMenu(false);
	};

	const handleResetSpins = async () => {
		setShowMenu(false);
		try {
			const res = await fetch(`${apiBaseUrl}/${userId}/spins/reset`, { method: 'PATCH' });
			if (!res.ok) throw new Error('Reset failed');
			showToast('Spin count reset');
			await fetchUser(true);
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Reset failed');
		}
	};

	const activePlanCount = useMemo(() => snapshot?.memberships.myplans.filter((p) => p.isActive).length ?? 0, [snapshot]);

	/* ---------------------------- Loading / error --------------------------- */

	if (loading) {
		return (
			<div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06] text-slate-400">
				<Loader2 className="mr-2 h-5 w-5 animate-spin" />
				Loading user…
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center">
				<AlertTriangle className="mx-auto mb-2 h-6 w-6 text-rose-300" />
				<p className="text-sm text-slate-300">{error}</p>
				<button
					onClick={() => fetchUser()}
					className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-black text-slate-200 hover:bg-white/10"
				>
					<RefreshCw className="h-3.5 w-3.5" />
					Try again
				</button>
			</div>
		);
	}

	if (!snapshot) {
		return <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-slate-400">This user no longer exists.</div>;
	}

	const { user, memberships, rewardHistory, transactions, todayrewards } = snapshot;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-5 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-white shadow-[0_20px_70px_rgba(0,0,0,.18)] backdrop-blur-xl font-sans sm:p-6">
			{/* Toast */}
			{toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-[#071125] px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}

			{/* Header */}
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 font-mono text-sm font-black text-white">
						{initials(user.name)}
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h2 className="text-base font-black tracking-tight text-white">{user.name}</h2>
							<StatusPill status={user.status} />
						</div>
						<p className="text-sm text-slate-400">{user.email}</p>
						<p className="mt-0.5 font-mono text-[11px] text-slate-500">{user._id}</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => fetchUser(true)}
						className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
						title="Refresh"
					>
						<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
					</button>
					<button
						onClick={() => setShowEdit(true)}
						className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-200 transition hover:bg-white/10"
					>
						<Pencil className="h-3.5 w-3.5" />
						Edit
					</button>
					<button
						onClick={() => setShowDelete(true)}
						className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-black text-rose-300 transition hover:bg-rose-400/20"
					>
						<Trash2 className="h-3.5 w-3.5" />
						Delete
					</button>
					<div className="relative">
						<button
							onClick={() => setShowMenu((v) => !v)}
							className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
							title="More actions"
						>
							<MoreVertical className="h-4 w-4" />
						</button>
						{showMenu && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setShowMenu(false)}
								/>
								<div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0F151D] py-1 shadow-xl">
									<button
										onClick={handleCopyId}
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5"
									>
										<Copy className="h-3.5 w-3.5" /> Copy user ID
									</button>
									<button
										onClick={handleResetSpins}
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5"
									>
										<RefreshCw className="h-3.5 w-3.5" /> Reset total spins
									</button>
									<button
										onClick={handleExport}
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5"
									>
										<Download className="h-3.5 w-3.5" /> Export as JSON
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<StatCard
					label="Wallet balance"
					value={formatMoney(user.walletBalance)}
					icon={<Wallet className="h-4 w-4" />}
					accent="text-emerald-300"
				/>
				<StatCard
					label="Reward balance"
					value={formatMoney(user.rewardBalance)}
					icon={<Gift className="h-4 w-4" />}
					accent="text-amber-300"
				/>
				<StatCard
					label="Withdrawable"
					value={formatMoney(user.withdrawableBalance)}
					icon={<ArrowUpRight className="h-4 w-4" />}
					accent="text-indigo-300"
				/>
				<StatCard
					label="Total spins"
					value={String(memberships.totalSpins)}
					icon={<Sparkles className="h-4 w-4" />}
					accent="text-violet-300"
				/>
			</div>

			{/* Meta row */}
			<div className="flex flex-wrap gap-x-6 gap-y-1 rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs text-slate-400">
				<span>
					Referral code: <span className="font-mono text-white">{user.referralCode}</span>
				</span>
				<span>
					Referred by: <span className="font-mono text-white">{user.referredBy ?? '—'}</span>
				</span>
				<span>
					Joined: <span className="text-white">{formatDate(user.createdAt)}</span>
				</span>
				<span>
					Updated: <span className="text-white">{formatDate(user.updatedAt)}</span>
				</span>
			</div>

			{/* Membership plans */}
			<section>
				<div className="mb-2 flex items-center justify-between">
					<h3 className="text-sm font-black text-white">
						Membership plans{' '}
						<span className="font-mono text-xs font-normal text-slate-400">
							({activePlanCount} active / {memberships.myplans.length} total)
						</span>
					</h3>
				</div>
				<div className="space-y-3">
					{memberships.myplans.map((plan, i) => (
						<PlanCard
							key={`${plan.startDate}-${i}`}
							plan={plan}
							index={i}
						/>
					))}
				</div>
			</section>

			{/* Today's rewards */}
			<section>
				<h3 className="mb-2 text-sm font-black text-white">Today&apos;s rewards</h3>
				<div className="flex flex-wrap gap-1.5 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
					{todayrewards.todayRewords.map((val, i) => (
						<span
							key={i}
							className={`rounded-md px-2 py-1 font-mono text-xs ring-1 ring-inset ${rewardTone(val)}`}
						>
							{val}
						</span>
					))}
				</div>
			</section>

			{/* Reward history + transactions */}
			<div className="grid gap-4 lg:grid-cols-2">
				<section>
					<h3 className="mb-2 text-sm font-black text-white">Reward history</h3>
					<div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
						{rewardHistory.history.length === 0 ? (
							<p className="p-4 text-xs text-slate-400">No reward events yet.</p>
						) : (
							<ul className="divide-y divide-white/10">
								{rewardHistory.history.map((h, i) => (
									<li
										key={i}
										className="flex items-center justify-between px-4 py-2.5"
									>
										<div>
											<p className="text-sm font-bold text-white">{h.name}</p>
											<p className="text-[11px] text-slate-500">{formatDate(h.createdAt)}</p>
										</div>
										<span className="font-mono text-sm font-bold text-emerald-300">+{formatMoney(h.amount * 100)}</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</section>

				<section>
					<h3 className="mb-2 text-sm font-black text-white">Transactions</h3>
					<div className="max-h-72 overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.06]">
						<ul className="divide-y divide-white/10">
							{transactions.traData.map((t, i) => (
								<li
									key={i}
									className="flex items-center justify-between px-4 py-2.5"
								>
									<div className="flex items-center gap-2">
										<span className={`rounded-xl p-1.5 ${t.transactionStatus === 'debited' ? 'bg-rose-400/10 text-rose-300' : 'bg-emerald-400/10 text-emerald-300'}`}>
											{t.transactionStatus === 'debited' ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
										</span>
										<div>
											<p className="text-sm font-bold capitalize text-white">{t.transactionType.replace(/_/g, ' ')}</p>
											<p className="font-mono text-[11px] text-slate-500">
												{formatMoney(t.prvBalance)} &rarr; {formatMoney(t.newBalance)}
											</p>
										</div>
									</div>
									<span className={`font-mono text-sm font-bold ${t.transactionStatus === 'debited' ? 'text-rose-300' : 'text-emerald-300'}`}>
										{t.transactionStatus === 'debited' ? '-' : '+'}
										{formatMoney(t.amount)}
									</span>
								</li>
							))}
						</ul>
					</div>
				</section>
			</div>

			{/* Modals */}
			{showEdit && (
				<EditUserModal
					user={user}
					onClose={() => setShowEdit(false)}
					onSave={handleSaveEdit}
					saving={saving}
				/>
			)}
			{showDelete && (
				<DeleteUserModal
					userName={user.name}
					onClose={() => setShowDelete(false)}
					onConfirm={handleDelete}
					deleting={deleting}
				/>
			)}
		</div>
	);
}
