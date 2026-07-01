import Link from "next/link";

export function Logo({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3">
      <div className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-700 to-violet-700 ring-4 ring-yellow-400 shadow-lg shadow-blue-900/20 transition group-hover:scale-105">
        <span className="text-[11px] font-black text-white">SG</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
      </div>
      <div className="leading-none">
        <h1 className={`text-[27px] font-black tracking-[-0.05em] ${light ? "text-white" : "text-slate-950"}`}>Spin<span className="text-yellow-500">Gold</span></h1>
        <p className={`mt-1 text-[9px] font-black uppercase tracking-[0.24em] ${light ? "text-blue-100" : "text-slate-400"}`}>Reward OS</p>
      </div>
    </Link>
  );
}

export function PublicFooter() {
  const columns = [
    ["Quick Links", ["Home", "/"], ["Membership", "/membership"], ["Referrals", "/referrals"]],
    ["Account", ["Login", "/login"], ["My Memberships", "/dashboard/cards"], ["Transactions", "/dashboard/transactions"], ["Withdraw", "/dashboard/withdraw"], ["Support", "/dashboard/support"]]
  ];
  return (
    <footer className="bg-[#06183f] text-white">
      <div className="safe-area grid gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100">21 Days Membership Spin Reward System. Spin daily, earn rewards, refer & earn more with transparent controls.</p>
          <Link href="/signup" className="mt-6 inline-flex rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950">Create Account</Link>
        </div>
        {columns.map(([title, ...links]) => (
          <div key={title as string}>
            <h3 className="font-black">{title}</h3>
            <div className="mt-5 grid gap-3 text-sm text-blue-100">
              {(links as string[][]).map(([label, href]) => <Link key={label} href={href} className="transition hover:text-white">{label}</Link>)}
            </div>
          </div>
        ))}
        <div>
          <h3 className="font-black">Need Help?</h3>
          <p className="mt-5 text-sm leading-6 text-blue-100">Registered members can open and track support tickets from the dashboard.</p>
          <Link href="/dashboard/support" className="mt-5 inline-flex rounded-xl border border-white/20 px-4 py-3 text-sm font-black">Open Support</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="safe-area flex flex-col justify-between gap-3 px-4 py-5 text-sm text-blue-100 md:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} SpinGold. All rights reserved.</p>
          <p className="flex items-center gap-2">API status monitored <span className="text-emerald-400">●</span></p>
        </div>
      </div>
    </footer>
  );
}
