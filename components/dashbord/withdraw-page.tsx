'use client';

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { Kpi, PageShell, PageTitle } from './dashboard-ui';
import { Panel } from './premium-hero';
import { apiCall } from '@/hooks/api-call-hook';
import type { ApiResponse } from '@/libs/types';
import { useAlert } from '../alert';
import { useOverview } from '@/hooks/use-overview';
import { formatMoney } from '@/libs/format';

/* WITHDRAW */

export function WithdrawPage() {
  const { overview, refresh } = useOverview();
  const { success, error } = useAlert();
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (overview?.user.payoutWalletAddress) {
      setWalletAddress(overview.user.payoutWalletAddress);
    }
  }, [overview?.user.payoutWalletAddress]);

  const submit = async () => {
    const rupees = Number(amount);
    if (!Number.isFinite(rupees) || rupees < 100) {
      error('Minimum withdrawal is ₹100.');
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      error('Enter a valid EVM wallet address.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiCall<ApiResponse>('POST', '/platform/withdrawals', { amount: Math.round(rupees * 100), walletAddress });
      if (response.success) {
        success(response.message);
        setAmount('');
        await refresh();
      } else {
        error(response.message);
      }
    } catch {
      error('Unable to submit withdrawal.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <PageShell>
      <PageTitle
        title="Withdraw"
        desc="Request withdrawal after membership expiry."
        eyebrow="Withdraw Center"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_370px]">
        <Panel className="p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">
            Request
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#121826]">Withdraw Request</h2>

          <div className="mt-5 grid gap-4">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="100"
              className="rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-4 font-bold text-[#121826] outline-none focus:border-[#101936]"
              placeholder="Enter amount"
            />
            <input
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              className="rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-4 font-bold text-[#121826] outline-none focus:border-[#101936]"
              placeholder="Wallet address"
            />
            <button onClick={submit} disabled={submitting} className="rounded-2xl bg-[#101936] py-4 font-black text-[#f4c95d] transition hover:bg-[#1b294f] disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </Panel>

        <Kpi icon={Wallet} title="Available Balance" value={formatMoney(overview?.user.withdrawableBalance ?? 0)} sub="Unlocked after membership expiry" tone="navy" />
      </div>
    </PageShell>
  );
}
