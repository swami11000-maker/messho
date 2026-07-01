import { Crown, Landmark, LineChart, RefreshCcw } from 'lucide-react';
import { Panel } from './premium-hero';

const actions = [
	{ title: 'Buy Membership', desc: 'Activate 21-day plan', icon: Crown, href: '/dashboard/membership' },
	{ title: 'Spin Now', desc: 'Use available spins', icon: RefreshCcw, href: '/dashboard/spin' },
	{ title: 'Withdraw', desc: 'Claim expired rewards', icon: Landmark, href: '/dashboard/withdraw' },
	{ title: 'Transactions', desc: 'Review account activity', icon: LineChart, href: '/dashboard/transactions' },
];

export function QuickActions() {
	return (
		<Panel className="p-5">
			<div>
				<p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7653]">Shortcuts</p>
				<h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#121826]">Quick Actions</h2>
			</div>
			<div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{actions.map((item) => {
					const Icon = item.icon;
					return (
						<a key={item.title} href={item.href} className="group rounded-3xl border border-[#eadfcd] bg-white/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-[#101936] hover:shadow-[0_22px_50px_rgba(16,25,54,0.16)]">
							<div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f6f0e5] text-[#121826] transition group-hover:bg-[#f4c95d]">
								<Icon size={23} />
							</div>
							<h3 className="mt-4 font-black text-[#121826] transition group-hover:text-white">{item.title}</h3>
							<p className="mt-1 text-xs font-bold text-[#8a7653] transition group-hover:text-white/60">{item.desc}</p>
						</a>
					);
				})}
			</div>
		</Panel>
	);
}
