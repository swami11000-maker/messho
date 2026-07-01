import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { CustomerShell } from '@/components/customer-shell';
import { apiCall } from '@/hooks/api-call-hook';
import type { UserDetailResponse } from '@/libs/types';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
	try {
		const response = await apiCall<UserDetailResponse & { success?: boolean }>('GET', '/auth/get-user-detail');
		if (!response.data?.user || response.data.user.type !== 'user') redirect('/login');
	} catch {
		redirect('/login');
	}

	return <CustomerShell>{children}</CustomerShell>;
}
