import { DashboardHome } from '@/components/customer-pages';
import { apiCall } from '@/hooks/api-call-hook';
import type { OverviewResponse } from '@/libs/types';

export const dynamic = 'force-dynamic';

export default async function Page() {
	const response = await apiCall<OverviewResponse>('GET', '/platform/overview');

	return <DashboardHome data={response.data} />;
}
