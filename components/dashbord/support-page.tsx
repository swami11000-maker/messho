'use client';

import { useCallback, useEffect, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import { PageShell, PageTitle } from './dashboard-ui';
import { Panel } from './premium-hero';
import { apiCall } from '@/hooks/api-call-hook';
import type { ApiResponse } from '@/libs/types';
import { useAlert } from '../alert';
import { formatDate } from '@/libs/format';
import { Status } from '../customer-shell';

type Ticket = { _id: string; subject: string; message: string; status: string; adminReply: string; createdAt: string };

export function SupportPage() {
	const { success, error } = useAlert();
	const [subject, setSubject] = useState('');
	const [message, setMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const load = useCallback(async () => {
		const response = await apiCall<{ success: boolean; data: { tickets: Ticket[] } }>('GET', '/platform/support');
		if (response.success) setTickets(response.data.tickets);
	}, []);
	useEffect(() => void load(), [load]);

	const submit = async () => {
		setSubmitting(true);
		try {
			const response = await apiCall<ApiResponse>('POST', '/platform/support', { subject, message });
			if (response.success) {
				success(response.message);
				setSubject('');
				setMessage('');
				await load();
			} else error(response.message);
		} catch {
			error('Unable to create support ticket.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<PageShell>
			<PageTitle title="Support" desc="Get help with withdrawals, memberships, rewards and account issues." eyebrow="Help Center" />
			<div className="grid gap-6 xl:grid-cols-[1fr_370px]">
				<Panel className="p-5">
					<h2 className="text-2xl font-black text-[#121826]">Create Support Ticket</h2>
					<div className="mt-5 grid gap-4">
						<input value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-4 font-bold text-[#121826] outline-none focus:border-[#101936]" placeholder="Subject" />
						<textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-40 rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-4 font-bold text-[#121826] outline-none focus:border-[#101936]" placeholder="Describe your issue..." />
						<button onClick={submit} disabled={submitting || subject.trim().length < 3 || message.trim().length < 10} className="rounded-2xl bg-[#101936] py-4 font-black text-[#f4c95d] disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit Ticket'}</button>
					</div>
				</Panel>
				<Panel className="p-5">
					<div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#101936] text-[#f4c95d]"><LifeBuoy size={30}/></div>
					<h2 className="mt-4 text-2xl font-black text-[#121826]">Ticket history</h2>
					<p className="mt-2 text-sm font-semibold leading-6 text-[#8a7653]">Replies and status updates appear below.</p>
				</Panel>
			</div>
			<div className="space-y-4">
				{tickets.map((ticket) => <Panel key={ticket._id} className="p-5"><div className="flex flex-col justify-between gap-3 md:flex-row"><div><h3 className="text-lg font-black text-[#121826]">{ticket.subject}</h3><p className="mt-1 text-xs font-bold text-[#8a7653]">{formatDate(ticket.createdAt)}</p></div><Status value={ticket.status.replace('_',' ')}/></div><p className="mt-4 text-sm font-semibold text-[#5f5446]">{ticket.message}</p>{ticket.adminReply && <div className="mt-4 rounded-2xl bg-[#eef4ff] p-4"><p className="text-xs font-black uppercase text-blue-700">Support reply</p><p className="mt-2 text-sm font-bold text-[#121826]">{ticket.adminReply}</p></div>}</Panel>)}
				{tickets.length === 0 && <Panel className="p-8 text-center font-bold text-[#8a7653]">No support tickets yet.</Panel>}
			</div>
		</PageShell>
	);
}
