const AUTH_SESSION_ENDPOINT = '/api/auth/session';

export const setCookies = async (accessToken: string) => {
	const response = await fetch(AUTH_SESSION_ENDPOINT, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({ accessToken }),
		cache: 'no-store',
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error('Unable to persist the authentication session.');
	}
};

export const clearCookies = async () => {
	const response = await fetch(AUTH_SESSION_ENDPOINT, {
		method: 'DELETE',
		cache: 'no-store',
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error('Unable to clear the authentication session.');
	}
};

export const getCookies = () => {
	if (typeof document === 'undefined') {
		return undefined;
	}

	const match = document.cookie
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith('token='));

	return match?.slice('token='.length);
};
