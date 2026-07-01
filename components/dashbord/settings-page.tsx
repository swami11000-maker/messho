'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PageShell, PageTitle } from './dashboard-ui';
import { Panel } from './premium-hero';
import { useOverview } from '@/hooks/use-overview';
import { apiCall } from '@/hooks/api-call-hook';
import type { ApiResponse } from '@/libs/types';
import { useAlert } from '../alert';

export function SettingsPage() {
  const { overview, refresh } = useOverview();
  const { success, error } = useAlert();
  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (overview) {
      setName(overview.user.name);
      setWalletAddress(overview.user.payoutWalletAddress ?? '');
    }
  }, [overview]);

  const save = async () => {
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      error('Enter a valid EVM wallet address.');
      return;
    }
    const response = await apiCall<ApiResponse>('PATCH', '/platform/profile', { name, payoutWalletAddress: walletAddress });
    if (response.success) {
      success(response.message);
      await refresh();
    } else {
      error(response.message);
    }
  };
  return (
    <PageShell>
      <PageTitle
        title="Settings"
        desc="Manage profile, security and notification preferences."
        eyebrow="Account Settings"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="p-5">
          <h2 className="text-2xl font-black text-[#121826]">Profile Settings</h2>

          <div className="mt-5 grid gap-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-4 font-bold text-[#121826] outline-none focus:border-[#101936]"
              placeholder="Full name"
            />
            <input
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              className="rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-4 font-bold text-[#121826] outline-none focus:border-[#101936]"
              placeholder="Payout wallet address"
            />
            <button onClick={save} className="w-fit rounded-2xl bg-[#101936] px-6 py-3 font-black text-[#f4c95d]">
              Save Changes
            </button>
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="text-2xl font-black text-[#121826]">Security</h2>

          {["Password protected account", "HTTP-only session cookie", "Saved payout wallet", "Account status enforcement"].map((i) => (
            <div key={i} className="mt-4 flex justify-between rounded-2xl border border-[#eadfcd] bg-white/60 p-4">
              <span className="font-bold text-[#121826]">{i}</span>
              <CheckCircle2 className="text-emerald-600" />
            </div>
          ))}
        </Panel>
      </div>
    </PageShell>
  );
}
