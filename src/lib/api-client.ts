export type ApiErrorPayload = { success: false; message: string; errors?: Array<{ field: string; message: string }> };

export type ApiSuccessPayload<T> = { success: true; message: string; data?: T };

export type ApiEnvelope<T> = ApiSuccessPayload<T> | ApiErrorPayload;

export class ApiClientError<T = unknown> extends Error {
	constructor(
		public status: number,
		message: string,
		public payload?: T,
	) {
		super(message);
		this.name = 'ApiClientError';
	}
}

let unauthorizedHandler: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: (() => void) | null) => {
	unauthorizedHandler = handler;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const parseJsonSafe = async <T>(response: Response): Promise<T | null> => {
	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('application/json')) {
		return null;
	}

	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
};

const getForwardedCookieHeader = async () => {
	if (typeof window !== 'undefined') {
		return undefined;
	}

	try {
		const { cookies } = await import('next/headers');
		const cookieStore = await cookies();
		const token = cookieStore.get('token')?.value;
		console.log('Forwarding token cookie:', token);
		return token ? `token=${token}` : undefined;
	} catch {
		return undefined;
	}
};

export interface ApiRequestOptions {
	withCredentials?: boolean;
	headers?: HeadersInit;
}

export const requestApi = async <TResponse, TBody = unknown>(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	path: string,
	body?: TBody,
	options: ApiRequestOptions = {},
): Promise<ApiEnvelope<TResponse>> => {
	if (!baseUrl) {
		throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required');
	}

	const headers = new Headers(options.headers);
	headers.set('Content-Type', 'application/json');

	// Only forward cookies on server-side (client uses credentials: 'include')
	if (typeof window === 'undefined') {
		const cookieHeader = await getForwardedCookieHeader();
		if (cookieHeader) {
			headers.set('Cookie', cookieHeader);

			// Extract token from cookie for Authorization header
			const tokenMatch = cookieHeader.match(/token=([^;]+)/);
			if (tokenMatch) {
				headers.set('Authorization', `Bearer ${tokenMatch[1]}`);
			}
		}
	}

	const response = await fetch(`${baseUrl}${path}`, {
		method,
		headers,
		credentials: options.withCredentials ? 'include' : 'same-origin',
		cache: 'no-store',
		body: body !== undefined && method !== 'GET' ? JSON.stringify(body) : undefined,
	});

	const payload = await parseJsonSafe<ApiEnvelope<TResponse>>(response);

	if (!response.ok) {
		const errorPayload = payload as ApiErrorPayload;
		const errorMessage = errorPayload?.message || (await response.text()) || response.statusText;
		const error = new ApiClientError(response.status, errorMessage, errorPayload);

		if (response.status === 401) {
			unauthorizedHandler?.();
		}
		throw error;
	}

	// Response is OK, but may not have JSON payload
	if (!payload) {
		return { success: true, message: 'Request succeeded' } as ApiSuccessPayload<TResponse>;
	}

	return payload;
};
