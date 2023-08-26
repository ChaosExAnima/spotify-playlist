import { fetchWithBasic } from './common';

import type { AuthInfo } from '../auth';

interface TokenResponse {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export async function fetchAuthInfo(code: string) {
	if (!code) {
		throw new Error('No redirect code found');
	}
	const response = await fetchWithBasic<TokenResponse>('/token', 'POST', {
		code,
		grant_type: 'authorization_code',
		redirect_uri: `${process.env.HOST}/login`,
	});

	const authInfo: AuthInfo = {
		access: response.access_token,
		expires: Date.now() + response.expires_in,
		refresh: response.refresh_token,
	};
	return authInfo;
}

export async function fetchRefreshedAuth(oldAuth: AuthInfo) {
	if (!oldAuth.refresh) {
		throw new Error('No refresh code found');
	}

	const response = await fetchWithBasic<TokenResponse>('/token', 'POST', {
		grant_type: 'refresh_token',
		refresh_token: oldAuth.refresh,
	});

	const authInfo: AuthInfo = {
		...oldAuth,
		access: response.access_token,
		expires: Date.now() + response.expires_in,
	};
	return authInfo;
}
