export type ApiErrorPayload = {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
};

export type ApiSuccessPayload<T> = {
  success: true;
  message: string;
  data?: T;
};

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
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const cookieHeader = await getForwardedCookieHeader();
  if (cookieHeader) headers.set('Cookie', cookieHeader);

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    credentials: options.withCredentials ? 'include' : 'same-origin',
    cache: 'no-store',
    body: body !== undefined && method !== 'GET' ? JSON.stringify(body) : undefined,
  }).catch((error: unknown) => {
    throw new ApiClientError(0, 'API unavailable', error);
  });

  const payload = await parseJsonSafe<ApiEnvelope<TResponse>>(response);
  const fallbackMessage = response.ok ? 'Request succeeded' : 'Request failed';

  if (!payload) {
    if (!response.ok) {
      const error = new ApiClientError(response.status, fallbackMessage);
      if (response.status === 401) {
        unauthorizedHandler?.();
      }
      throw error;
    }

    return { success: true, message: fallbackMessage } as ApiSuccessPayload<TResponse>;
  }

  if (!response.ok) {
    const error = new ApiClientError(response.status, payload.message ?? fallbackMessage, payload);
    if (response.status === 401) {
      unauthorizedHandler?.();
    }
    throw error;
  }

  return payload;
};
