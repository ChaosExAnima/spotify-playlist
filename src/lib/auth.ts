import { getCookie, setCookie } from './cookie';

interface AuthInfo {
	access: string;
	expires: number;
	refresh: string;
}

interface TokenResponse {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export function getAuthInfo() {
	const token = getCookie('token');
	if (token) {
		return JSON.parse(token) as AuthInfo;
	}
	return null;
}

export function getAuthRedirectUrl(codeChallenge?: string) {
	const params = new URLSearchParams({
		client_id: import.meta.env.VITE_APP_CLIENT_ID,
		redirect_uri: import.meta.env.VITE_APP_REDIRECT,
		response_type: 'code',
		scope: 'playlist-read-private',
		state: import.meta.env.VITE_APP_STATE,
	});
	if (codeChallenge) {
		params.set('code_challenge_method', 'S256');
		params.set('code_challenge', codeChallenge);
	}
	return `https://accounts.spotify.com/authorize?${params}`;
}

function generateRandomString(length: number) {
	let text = '';
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

async function generateCodeChallenge(codeVerifier: string) {
	function base64encode(input: ArrayBufferLike) {
		return btoa(
			String.fromCharCode.apply(null, Array.from(new Uint8Array(input)))
		)
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
	}

	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const digest = await window.crypto.subtle.digest('SHA-256', data);

	return base64encode(digest);
}

export async function authorizePKCE() {
	const codeVerifier = generateRandomString(128);
	const codeChallenge = await generateCodeChallenge(codeVerifier);
	localStorage.setItem('code_verifier', codeVerifier);
	return getAuthRedirectUrl(codeChallenge);
}

export function getRedirectCode() {
	const params = new URL(window.location.toString()).searchParams;
	const code = params.get('code');
	const state = params.get('state');
	if (state === import.meta.env.VITE_APP_STATE) {
		return code;
	}
}

export async function fetchAuthInfo(codeVerifier?: string) {
	const code = getRedirectCode();
	if (!code) {
		throw new Error('No redirect code found');
	}
	const body = new URLSearchParams({
		code,
		grant_type: 'authorization_code',
		redirect_uri: import.meta.env.VITE_APP_REDIRECT,
	});
	if (codeVerifier) {
		body.set('client_id', import.meta.env.VITE_APP_CLIENT_ID);
		body.set('code_verifier', codeVerifier);
	}
	const options: RequestInit = {
		body,
		method: 'POST',
	};
	if (!codeVerifier) {
		const bearer = btoa(
			`${import.meta.env.VITE_APP_CLIENT_ID}:${
				import.meta.env.VITE_APP_CLIENT_SECRET
			}`
		);
		options.headers = {
			Authorization: `Basic ${bearer}`,
		};
	}
	const response = await fetch(
		'https://accounts.spotify.com/api/token',
		options
	);
	if (!response.ok) {
		console.error(response.status);
	}
	const result: TokenResponse = await response.json();

	const authInfo: AuthInfo = {
		access: result.access_token,
		expires: Date.now() + result.expires_in,
		refresh: result.refresh_token,
	};
	setCookie('token', JSON.stringify(authInfo));
}
