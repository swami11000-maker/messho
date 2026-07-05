import { requestApi } from '@/src/lib/api-client';

export const apiCall = async <TResponse = unknown>(method: string, url: string, body?: unknown): Promise<TResponse> => {
	const response = await requestApi<TResponse, unknown>(method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url, body, { withCredentials: true });

	return response as TResponse;
};
