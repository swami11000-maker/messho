import { getToken } from "../providers/authToken";

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

if (typeof window === 'undefined' && baseUrl && baseUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
	console.warn('[api-client] NEXT_PUBLIC_API_BASE_URL points to localhost in production. Override it in Vercel Dashboard environment variables.');
}

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

	const token = await getToken();
	console.log("token ===> ",token)
	const response = await fetch(`${baseUrl}${path}`, {
		method,
		headers :{
			authorization : `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		credentials: 'include',
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
	if (!payload) {
		return { success: true, message: 'Request succeeded' } as ApiSuccessPayload<TResponse>;
	}

	return payload;
};
