'use client';

import { useState } from 'react';
import { RefreshCcw, Sparkles, Zap } from 'lucide-react';
import SpinWheelCanvas from '../SpinWheelCanvas';
import { Status } from '../customer-shell';
import { wheelValues } from '../data';
import { Panel } from './premium-hero';
import { apiCall } from '@/hooks/api-call-hook';
import type { ApiResponse } from '@/libs/types';
import { useAlert } from '../alert';
import { useOverview } from '@/hooks/use-overview';
import { formatDate, formatMoney } from '@/libs/format';

export function SpinPreviewCard() {
  return (
    <div className="rounded-[30px] border border-[#101936] bg-[#101936] p-5 text-white shadow-[0_18px_50px_rgba(16,25,54,0.16)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f4c95d]">Daily Spin</p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.04em]">Wheel Preview</h2>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-[#f4c95d]">
          <Zap size={22} />
        </div>
      </div>
      <div className="mt-6 grid place-items-center rounded-3xl bg-white/8 py-7">
        <CompactSpinWheel />
      </div>
    </div>
  );
}

function CompactSpinWheel() {
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 2300);
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 -translate-y-4 border-l-[18px] border-r-[18px] border-t-[34px] border-l-transparent border-r-transparent border-t-[#f4c95d] drop-shadow-xl" />
      <div
        className={`relative grid h-[260px] w-[260px] place-items-center rounded-full border-[12px] border-[#f4c95d] shadow-[0_0_42px_rgba(244,201,93,.36),0_25px_70px_rgba(0,0,0,.22)] ${spinning ? 'animate-spinWheel' : 'animate-pulseSoft'}`}
        style={{ background: 'conic-gradient(#b91c1c 0deg 51deg,#c26a23 51deg 102deg,#1f9d55 102deg 153deg,#0f766e 153deg 204deg,#3158d4 204deg 255deg,#6d28d9 255deg 306deg,#9d174d 306deg 360deg)' }}
      >
        {wheelValues.map((value, index) => (
          <span
            key={value}
            className="absolute text-xl font-black text-white drop-shadow"
            style={{ transform: `rotate(${index * 51 + 24}deg) translateY(-100px) rotate(-${index * 51 + 24}deg)` }}
          >
            {value}
          </span>
        ))}
        <button type="button" onClick={handleSpin} disabled={spinning} className="absolute grid h-24 w-24 place-items-center rounded-full border-[7px] border-[#f4c95d] bg-[#101936] text-2xl font-black text-[#f4c95d] shadow-xl transition hover:scale-105 disabled:cursor-not-allowed">
          SPIN
        </button>
      </div>
      <button type="button" onClick={handleSpin} disabled={spinning} className="mt-8 flex items-center gap-3 rounded-2xl bg-[#f4c95d] px-10 py-4 text-lg font-black text-[#101936] shadow-[0_18px_45px_rgba(244,201,93,0.24)] transition hover:-translate-y-1 disabled:cursor-not-allowed">
        <RefreshCcw size={21} /> SPIN
      </button>
    </div>
  );
}

export function SpinPage() {
  const { overview, refresh } = useOverview();
  const { success, error } = useAlert();

  const spin = async () => {
    const response = await apiCall<ApiResponse<{ reward: number; spinsRemaining: number }>>('POST', '/platform/spin');
    if (!response.success || !response.data) {
      error(response.message);
      throw new Error(response.message);
    }
    success(response.message);
    await refresh();
    return response.data.reward;
  };

  const recentSpins = overview?.transactions.filter((transaction) => transaction.type === 'spin_reward').slice(0, 5) ?? [];
  return (
    <div className="-mx-4 -my-7 min-h-screen bg-[#101936] px-4 py-8 lg:-mx-8 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[1fr_370px]">
        <div className="text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-[#f4c95d]">
            <Sparkles size={15} />
            DAILY SPIN
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.06em] md:text-5xl">
            Spin Daily. Earn Rewards.
          </h1>

          <p className="mt-3 text-white/60">
            Spin the wheel once every day and win controlled backend rewards.
          </p>

          <div className="mt-8 flex justify-center">
            <SpinWheelCanvas onSpin={spin} />
          </div>
        </div>

        <div className="space-y-5">
          <Panel className="p-5">
            <h2 className="text-xl font-black text-[#121826]">Recent Spins</h2>

            {recentSpins.map((transaction) => (
              <div key={transaction._id} className="mt-4 flex items-center justify-between border-b border-[#eadfcd] pb-3 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eef8f1] font-black text-emerald-600">
                    {formatMoney(transaction.amount)}
                  </div>
                  <div>
                    <b className="text-[#121826]">Cash Reward</b>
                    <p className="text-xs font-bold text-[#8a7653]">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                <Status value="Won" />
              </div>
            ))}
          </Panel>

          <Panel className="p-5">
            <h2 className="text-xl font-black text-[#121826]">Your Statistics</h2>

            {[
              ["Total Spins", String(overview?.stats.totalSpins ?? 0)],
              ["Total Rewards Won", formatMoney(overview?.stats.totalRewards ?? 0)],
              ["Highest Reward", formatMoney(overview?.stats.highestReward ?? 0)],
              ["Spins Remaining", String(overview?.stats.spinsRemaining ?? 0)],
            ].map(([a, b]) => (
              <p key={a} className="mt-4 flex justify-between border-b border-[#eadfcd] pb-3 text-sm last:border-b-0">
                <span className="font-bold text-[#8a7653]">{a}</span>
                <b>{b}</b>
              </p>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
