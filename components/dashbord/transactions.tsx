'use client';

import { Filter, Search } from "lucide-react";
import { Status } from "../customer-shell";
import { Panel } from "./premium-hero";
import { PageShell, PageTitle } from "./dashboard-ui";
import type { Transaction } from "@/libs/types";
import { formatDate, formatMoney } from "@/libs/format";
import { useOverview } from "@/hooks/use-overview";
import { useMemo, useState } from "react";
import { useCallback, useEffect } from "react";
import { apiCall } from "@/hooks/api-call-hook";
import Link from "next/link";

export function Transactions({ full = false, data }: { full?: boolean; data?: Transaction[] }) {
  const { overview, loading: overviewLoading } = useOverview(!full && !data);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(full);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const loadLedger = useCallback(async () => {
    if (!full) return;
    setLedgerLoading(true);
    setLoadError('');
    try {
      const response = await apiCall<{ success: boolean; message?: string; data: { transactions: Transaction[] } }>('GET', '/platform/transactions');
      if (response.success) setAllTransactions(response.data.transactions);
      else setLoadError(response.message ?? 'Unable to load transactions.');
    } catch {
      setLoadError('Unable to connect to the transaction API.');
    } finally {
      setLedgerLoading(false);
    }
  }, [full]);
  useEffect(() => void loadLedger(), [loadLedger]);
  const transactions = useMemo(() => data ?? (full ? allTransactions : overview?.transactions) ?? [], [allTransactions, data, full, overview?.transactions]);
  const loading = overviewLoading || ledgerLoading;
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return transactions.filter((item) => {
      const matchesQuery = !normalized || `${item.reference} ${item.type} ${item.description} ${item.status}`.toLowerCase().includes(normalized);
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [query, statusFilter, transactions, typeFilter]);
  return (
    <Panel className="p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">
            Ledger
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#121826]">
            {full ? "All Transactions" : "Recent Transactions"}
          </h2>
        </div>

        {full ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="flex items-center gap-2 rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-3">
              <Search size={16} className="text-[#8a7653]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search txn..."
                className="bg-transparent text-sm font-semibold outline-none placeholder:text-[#8a7653]"
              />
            </div>

            <label className="flex items-center gap-2 rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-3 text-sm font-black text-[#121826]">
              <Filter size={16} />
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="bg-transparent outline-none">
                <option value="all">All types</option>
                <option value="deposit">Deposits</option>
								<option value="crypto_deposit">Crypto Deposits</option>
                <option value="membership">Memberships</option>
                <option value="spin_reward">Spin rewards</option>
                <option value="referral">Referrals</option>
                <option value="withdrawal">Withdrawals</option>
              </select>
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-3 text-sm font-black text-[#121826] outline-none">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        ) : (
          <Link
            href="/dashboard/transactions"
            className="w-fit rounded-2xl bg-[#101936] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#1b294f]"
          >
            View All
          </Link>
        )}
      </div>

      <div className="mt-5 overflow-x-auto rounded-3xl border border-[#eadfcd] bg-white/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadfcd] text-xs font-black uppercase tracking-wide text-[#8a7653]">
              <th className="px-4 py-4">TXN ID</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">User</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((t) => (
              <tr key={t._id} className="border-b border-[#eadfcd] last:border-0">
                <td className="px-4 py-4 font-black text-[#121826]">{t.reference}</td>
                <td className="px-4 py-4 font-bold capitalize text-[#5f5446]">{t.type.replace('_', ' ')}</td>
                <td className="px-4 py-4 font-bold text-[#8a7653]">{t.description}</td>
                <td
                  className={`px-4 py-4 font-black ${
                    t.status !=='debited' ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {t.status !=='debited' ? '+' : '-'} {formatMoney(Math.abs(t.amount))}
                </td>
                <td className="px-4 py-4">
                  <Status value={t.status[0].toUpperCase() + t.status.slice(1)} />
                </td>
                <td className="px-4 py-4 text-xs font-bold text-[#8a7653]">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
            {!loading && !loadError && visible.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center font-bold text-[#8a7653]">{query ? 'No matching transactions.' : 'No transactions yet.'}</td></tr>
            )}
            {loadError && <tr><td colSpan={6} className="px-4 py-10 text-center"><p className="font-bold text-red-600">{loadError}</p><button onClick={loadLedger} className="mt-3 rounded-xl bg-[#101936] px-4 py-2 text-sm font-black text-white">Retry</button></td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function TransactionsPage() {
  return (
    <PageShell>
      <PageTitle
        title="Transactions"
        desc="View wallet, membership, reward and withdrawal history."
        eyebrow="Transaction Ledger"
      />
      <Transactions full />
    </PageShell>
  );
}
