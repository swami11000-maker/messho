"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronRight, Command, LogOut, Menu, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { Logo } from "./brand";
import { adminNav } from "./data";
import { clearCookies } from "@/libs/auth-session";

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/[0.06] text-white shadow-[0_20px_70px_rgba(0,0,0,.18)] backdrop-blur-xl ${className}`}>{children}</div>;
}

function AdminTopbar({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071125]/95 text-white backdrop-blur-xl">
      <div className="flex h-[74px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3"><button onClick={onOpen} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 lg:hidden"><Menu size={22}/></button><Logo light href="/admin"/></div>
        <div className="hidden w-[440px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 xl:flex"><Search size={17} className="text-slate-400"/><input className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-500" placeholder="Search users, payouts, withdrawals..."/></div>
        <div className="flex items-center gap-3"><div className="hidden rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-300 md:block">Live System</div><Link href="/admin/settings" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"><div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500"><UserRound size={22}/></div><span className="hidden text-sm font-black sm:block">Admin</span></Link></div>
      </div>
    </header>
  );
}

function AdminSidebar({ open, close }: { open: boolean; close: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => {
    try {
      await clearCookies();
    } catch {
      // Continue with the local logout flow even if the cookie route fails.
    }
    router.replace('/login');
    router.refresh();
  };
  return (
    <>
      {open && <button onClick={close} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"/>}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-[300px] border-r border-white/10 bg-[#071125] text-white shadow-2xl transition-transform lg:sticky lg:top-[74px] lg:z-30 lg:h-[calc(100vh-74px)] lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/10 p-4 lg:hidden"><Logo light href="/admin"/><button onClick={close} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10"><X size={18}/></button></div>
        <div className="flex h-full flex-col p-4">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4">
            <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Command size={23}/></div><div><h3 className="font-black">Admin Command</h3><p className="text-xs font-bold text-slate-400">Approval + Reward OS</p></div></div>
            <div className="mt-4 rounded-xl bg-white/5 p-3"><p className="text-[10px] text-slate-400">Access</p><h4 className="mt-1 text-sm font-black text-emerald-300">Role protected</h4></div>
          </div>
          <nav className="mt-5 space-y-1.5 overflow-y-auto pr-1">
            {adminNav.map(item=>{const Icon=item.icon; const active=pathname===item.href; return <Link key={item.href} href={item.href} onClick={close} className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-black transition ${active?'bg-white text-slate-950 shadow-lg':'text-slate-300 hover:bg-white/10 hover:text-white'}`}><span className={`grid h-8 w-8 place-items-center rounded-lg ${active?'bg-blue-50 text-blue-600':'bg-white/5 text-slate-400 group-hover:text-white'}`}><Icon size={16}/></span><span className="flex-1">{item.label}</span><ChevronRight size={14} className={active?'opacity-100':'opacity-0 group-hover:opacity-100'}/></Link>})}
          </nav>
          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4"><div className="flex gap-3"><ShieldCheck size={24} className="text-emerald-300"/><div><h4 className="text-sm font-black">Policy Lock Enabled</h4><p className="mt-1 text-xs leading-5 text-emerald-100/80">Withdrawals and reward controls require admin approval.</p></div></div></div>
            <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 py-3 text-sm font-black text-red-200"><LogOut size={16}/>Logout</button>
          </div>
        </div>
      </aside>
    </>
  )
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <main className="min-h-screen bg-[#070d1c] text-white"><AdminTopbar onOpen={() => setOpen(true)}/><div className="grid lg:grid-cols-[300px_1fr]"><AdminSidebar open={open} close={() => setOpen(false)}/><div className="min-w-0"><div className="safe-area px-4 py-7 lg:px-8">{children}</div></div></div></main>
}

export function AdminTitle({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">SpinGold Admin</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-400">{desc}</p></div>{action}</div>
}
