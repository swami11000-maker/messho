import { DashboardHome } from '@/components/customer-pages';
import { apiCall } from '@/hooks/api-call-hook';
import type { OverviewResponse } from '@/libs/types';

export const dynamic = 'force-dynamic';

export default async function Page() {
	// try {
		const response = await apiCall<OverviewResponse>('GET', '/platform/overview');
		return <DashboardHome data={response.data} />;
	// } catch {
	// 	return (
	// 		<div className="flex items-center justify-center min-h-screen">
	// 			<p className="text-lg font-bold text-red-600">Unable to load dashboard. Please try again.</p>
	// 		</div>
	// 	);
	// }
}
