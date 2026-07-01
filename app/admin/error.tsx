'use client';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return <div className="grid min-h-screen place-items-center bg-[#070d1c] px-4 text-white"><div className="max-w-md rounded-3xl border border-red-400/20 bg-white/5 p-8 text-center"><h2 className="text-2xl font-black">Admin console unavailable</h2><p className="mt-3 text-sm font-bold text-slate-400">The API could not load this admin page.</p><button onClick={reset} className="mt-6 rounded-xl bg-white px-5 py-3 font-black text-slate-950">Try Again</button></div></div>;
}
