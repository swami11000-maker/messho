'use client';

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className="grid min-h-[60vh] place-items-center px-4">
			<div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
				<h2 className="text-2xl font-black text-slate-950">Dashboard unavailable</h2>
				<p className="mt-3 text-sm font-bold text-slate-500">Check the backend connection and try again.</p>
				<button
					onClick={reset}
					className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
				>
					Try Again
				</button>
			</div>
		</div>
	);
}
