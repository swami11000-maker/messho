import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { apiCall } from '@/hooks/api-call-hook';
import type { UserDetailResponse } from '@/libs/types';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
	try {
		const response = await apiCall<UserDetailResponse & { success?: boolean }>('GET', '/auth/get-user-detail');
		if (!response.data?.user || response.data.user.type !== 'admin') redirect('/login');
	} catch {
		redirect('/login');
	}

	return children;
}
