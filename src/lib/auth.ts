import cookies from 'js-cookie';
import { redirect } from 'react-router-dom';

// All taken from https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

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

interface ErrorResponse {
	error: string;
	error_description: string;
}

const TOKEN_COOKIE = 'token';
const VERIFIER_COOKIE = 'verifier';

export function isLoggedIn() {
	return !!getAuthInfo();
}

export function getToken() {
	const authInfo = getAuthInfo();
	if (authInfo && authInfo.expires < Date.now()) {
		return authInfo.access;
	}
	return null;
}

export async function logIn() {
	const codeVerifier = generateRandomString(128);
	const codeChallenge = await generateCodeChallenge(codeVerifier);
	cookies.set(VERIFIER_COOKIE, codeVerifier, { sameSite: 'strict' });
	const url = getAuthRedirectUrl(codeChallenge);
	throw redirect(url);
}

export async function handleLoginCode(): Promise<void> {
	if (!getRedirectCode()) {
		return;
	}
	const codeVerifier = cookies.get(VERIFIER_COOKIE);
	if (!codeVerifier) {
		return;
	}
	try {
		await fetchAuthInfo(codeVerifier);
	} catch (err) {
		console.log(err);
		return;
	}
	cookies.remove(VERIFIER_COOKIE);
	throw redirect('/');
}

/**
 * Logs out
 * @param doRedirect Whether to do a redirect as well
 */
export function logOut(doRedirect = true) {
	cookies.remove(VERIFIER_COOKIE);
	cookies.remove(TOKEN_COOKIE);
	if (doRedirect) {
		throw redirect('/');
	}
}

function getAuthInfo() {
	const token = cookies.get(TOKEN_COOKIE);
	if (token) {
		const authInfo = JSON.parse(token) as AuthInfo;
		if ('access' in authInfo && 'expires' in authInfo) {
			return authInfo;
		}
	}
	return null;
}

/**
 *
 * @returns The current redirect code
 */
function getRedirectCode() {
	const params = new URL(window.location.toString()).searchParams;
	const code = params.get('code');
	const state = params.get('state');
	if (state === import.meta.env.VITE_APP_STATE) {
		return code;
	}
}

function getAuthRedirectUrl(codeChallenge: string) {
	if (
		!import.meta.env.VITE_APP_CLIENT_ID ||
		!import.meta.env.VITE_APP_REDIRECT
	) {
		throw new Error('Env not set!');
	}
	const params = new URLSearchParams({
		client_id: import.meta.env.VITE_APP_CLIENT_ID,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256',
		redirect_uri: import.meta.env.VITE_APP_REDIRECT,
		response_type: 'code',
		scope: 'playlist-read-private',
		state: import.meta.env.VITE_APP_STATE,
	});
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

function base64encode(input: string) {
	return btoa(input)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier: string) {
	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const digestBytes = await window.crypto.subtle.digest('SHA-256', data);
	const digest = String.fromCharCode(
		...Array.from(new Uint8Array(digestBytes))
	);
	return base64encode(digest);
}

async function fetchAuthInfo(codeVerifier: string) {
	const code = getRedirectCode();
	if (!code) {
		throw new Error('No redirect code found');
	}
	const body = new URLSearchParams({
		client_id: import.meta.env.VITE_APP_CLIENT_ID,
		code,
		code_verifier: codeVerifier,
		grant_type: 'authorization_code',
		redirect_uri: import.meta.env.VITE_APP_REDIRECT,
	});
	const bearer = btoa(
		`${import.meta.env.VITE_APP_CLIENT_ID}:${
			import.meta.env.VITE_APP_CLIENT_SECRET
		}`
	);
	const options: RequestInit = {
		body,
		headers: {
			Authorization: `Basic ${bearer}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		method: 'POST',
	};
	const response = await fetch(
		'https://accounts.spotify.com/api/token',
		options
	);
	if (!response.ok) {
		const result: ErrorResponse = await response.json();
		throw new Error(`Got unexpected response: ${result.error_description}`);
	}
	const result: TokenResponse = await response.json();

	const authInfo: AuthInfo = {
		access: result.access_token,
		expires: Date.now() + result.expires_in,
		refresh: result.refresh_token,
	};
	cookies.set('token', JSON.stringify(authInfo), { sameSite: 'strict' });
}
