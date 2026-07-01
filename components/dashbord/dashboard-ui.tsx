import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function PageShell({ children }: { children: ReactNode }) {
	return (
		<div className="-mx-4 -my-7 min-h-screen bg-[#f6f0e5] px-4 py-6 lg:-mx-8 lg:px-8">
			<div className="mx-auto max-w-[1500px] space-y-6">{children}</div>
		</div>
	);
}

export function PageTitle({ title, desc, action, eyebrow = 'Customer Dashboard' }: { title: string; desc: string; action?: ReactNode; eyebrow?: string }) {
	return (
		<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
			<div>
				<p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8a7653]">{eyebrow}</p>
				<h1 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#121826] md:text-4xl">{title}</h1>
				<p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#8a7653]">{desc}</p>
			</div>
			{action}
		</div>
	);
}

export function Kpi({
	title,
	value,
	sub,
	icon: Icon,
	tone = 'navy',
}: {
	title: string;
	value: string;
	sub: string;
	icon: LucideIcon;
	tone?: 'navy' | 'gold' | 'green' | 'clay' | 'blue';
}) {
	const tones = {
		navy: { card: 'bg-[#101936] text-white border-[#101936]', icon: 'bg-white/10 text-[#f4c95d]', sub: 'text-white/60', value: 'text-white' },
		gold: { card: 'bg-[#fff8e6] text-[#121826] border-[#f1dfb7]', icon: 'bg-[#f4c95d] text-[#121826]', sub: 'text-[#8a7653]', value: 'text-[#121826]' },
		green: { card: 'bg-[#eef8f1] text-[#121826] border-[#d8eadc]', icon: 'bg-[#1f9d55] text-white', sub: 'text-[#5f7d68]', value: 'text-[#121826]' },
		clay: { card: 'bg-[#fff1e8] text-[#121826] border-[#efd4c2]', icon: 'bg-[#d97745] text-white', sub: 'text-[#8a6553]', value: 'text-[#121826]' },
		blue: { card: 'bg-[#eef4ff] text-[#121826] border-[#d9e6ff]', icon: 'bg-[#3158d4] text-white', sub: 'text-[#65759a]', value: 'text-[#121826]' },
	};
	const selectedTone = tones[tone];

	return (
		<div
			className={`group relative overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_45px_rgba(47,43,35,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(47,43,35,0.12)] ${selectedTone.card}`}
		>
			<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
			<div className="relative flex items-start justify-between gap-4">
				<div>
					<p className={`text-[11px] font-black uppercase tracking-[0.16em] ${selectedTone.sub}`}>{title}</p>
					<h3 className={`mt-4 text-[28px] font-black tracking-[-0.05em] ${selectedTone.value}`}>{value}</h3>
					<p className={`mt-2 text-xs font-bold ${selectedTone.sub}`}>{sub}</p>
				</div>
				<div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-sm ${selectedTone.icon}`}>
					<Icon
						size={23}
						strokeWidth={2.5}
					/>
				</div>
			</div>
		</div>
	);
}
