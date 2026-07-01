'use client';

import { useEffect, useState } from 'react';
import { Copy, Gift, Trophy, Users } from 'lucide-react';
import { Kpi, PageShell, PageTitle } from './dashboard-ui';
import { Panel } from './premium-hero';
import { useOverview } from '@/hooks/use-overview';
import { formatMoney } from '@/libs/format';
import { useAlert } from '../alert';
import Link from 'next/link';

export function ReferralsPage({ publicMode = false }: { publicMode?: boolean }) {
  const { overview } = useOverview(!publicMode);
  const { success } = useAlert();
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);
  const referralUrl = origin && overview?.user.referralCode ? `${origin}/signup?ref=${overview.user.referralCode}` : '';
  const copy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    success('Referral link copied.');
  };
  return (
    <PageShell>
      <PageTitle
        title="Rewards + Referrals"
        desc="Invite friends and earn 5% when they purchase a membership."
        eyebrow="Referral Network"
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Kpi icon={Gift} title={publicMode ? 'Referral Bonus' : 'Total Reward Balance'} value={publicMode ? '5%' : formatMoney(overview?.user.rewardBalance ?? 0)} sub={publicMode ? 'Direct membership purchases' : 'Available rewards'} tone="gold" />
        <Kpi icon={Users} title={publicMode ? 'Simple Sharing' : 'Referral Code'} value={publicMode ? '1 Level' : overview?.user.referralCode ?? 'Loading'} sub="Share with friends" tone="navy" />
        <Kpi icon={Trophy} title={publicMode ? 'Payout' : 'Direct Referrals'} value={publicMode ? 'Unlocked' : String(overview?.stats.referrals ?? 0)} sub={publicMode ? 'Immediately withdrawable' : 'Registered users'} tone="green" />
      </div>

      <Panel className="p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">
          Referral Link
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#121826]">{publicMode ? 'Start Referring' : 'Your Referral Link'}</h2>

        {publicMode ? <Link href="/signup" className="mt-5 inline-flex rounded-2xl bg-[#101936] px-6 py-4 font-black text-[#f4c95d]">Create Account & Get Referral Link</Link> : <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <div className="flex-1 rounded-2xl border border-[#eadfcd] bg-white/60 px-4 py-4 font-black text-[#121826]">
            {referralUrl || 'Loading referral link...'}
          </div>

          <button onClick={copy} className="flex items-center justify-center gap-2 rounded-2xl bg-[#101936] px-6 py-4 font-black text-[#f4c95d]">
            <Copy size={17} />
            Copy
          </button>
        </div>}
      </Panel>

      <div className="grid gap-5">
        {[["Direct Referral", "5%", "Per membership purchase"]].map(([a, b, c]) => (
          <Panel key={a} className="p-5">
            <div className="flex justify-between">
              <h3 className="text-xl font-black text-[#121826]">{a}</h3>
              <span className="rounded-2xl bg-[#f4c95d] px-3 py-2 font-black text-[#121826]">
                {b}
              </span>
            </div>

            <p className="mt-4 text-sm font-bold text-[#8a7653]">Reward Rule</p>
            <h4 className="mt-1 text-2xl font-black text-[#121826]">{c}</h4>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
