"use client";

import { Menu, X, UserRound } from "lucide-react";
import { useState } from "react";
import { Logo } from "./brand";
import Link from "next/link";

export function PublicNav({ active = "Home" }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["Home", "/"], ["Membership", "/membership"], ["How It Works", "/#how"], ["Rewards", "/dashboard/rewards"], ["Referrals", "/referrals"], ["FAQ", "/#faq"], ["Contact", "/dashboard/support"]
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="safe-area flex h-[72px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 lg:hidden">{open ? <X size={22}/> : <Menu size={22}/>}</button>
          <Logo />
        </div>
        <nav className="hidden items-center gap-8 text-[13px] font-black text-slate-700 lg:flex">
          {links.map(([label, href]) => <Link key={label} href={href} className={`relative transition hover:text-blue-700 ${active === label ? "text-blue-700" : ""}`}>{label}{active === label && <span className="absolute -bottom-[18px] left-0 h-[3px] w-full rounded-full bg-blue-600"/>}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/signup" className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-600">Create Account</Link>
          <Link href="/login" className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20"><UserRound size={17}/> Login</Link>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            {links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={label} href={href} className={`rounded-xl px-4 py-3 text-sm font-black ${active === label ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-blue-50"}`}>{label}</Link>)}
            <Link onClick={() => setOpen(false)} href="/signup" className="rounded-xl border border-blue-200 px-4 py-3 text-left text-sm font-black">Create Account</Link>
            <Link onClick={() => setOpen(false)} href="/login" className="rounded-xl bg-blue-600 px-4 py-3 text-left text-sm font-black text-white">Login</Link>
          </div>
        </div>
      )}
    </header>
  );
}
