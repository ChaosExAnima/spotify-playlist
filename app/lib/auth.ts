import { saveSession, sessionFromRequest } from './session';

import type { Session } from './session';

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

const TOKEN_SESSION_KEY = 'token';
const VERIFIER_SESSION_KEY = 'verifier';

export interface AuthSession {
	[TOKEN_SESSION_KEY]?: AuthInfo;
	[VERIFIER_SESSION_KEY]?: string;
}

export let token: string = null;

export function getToken() {
	return token;
}

export async function setToken(session: Session) {
	const authInfo = await getAuthInfo(session);
	if (authInfo && authInfo.expires < Date.now()) {
		token = authInfo.access;
	}
}

export function isLoggedIn() {
	return !!token;
}

export async function logIn(request: Request) {
	const codeVerifier = generateRandomString(128);
	const codeChallenge = await generateCodeChallenge(codeVerifier);
	const session = await sessionFromRequest(request);
	session.set(VERIFIER_SESSION_KEY, codeVerifier);
	console.log('set verifier');
	const url = getAuthRedirectUrl(codeChallenge);
	return saveSession(session, url);
}

export async function handleLoginCode(request: Request) {
	if (!getRedirectCode(request)) {
		console.log('no code');
		return false;
	}
	const session = await sessionFromRequest(request);
	const codeVerifier = session.get(VERIFIER_SESSION_KEY);
	if (!codeVerifier) {
		console.log('no verifier');
		return false;
	}
	try {
		const authInfo = await fetchAuthInfo(request, codeVerifier);
		if (authInfo) {
			console.log('set auth info:', authInfo);
			session.set(TOKEN_SESSION_KEY, authInfo);
		} else {
			console.log('no auth info');
		}
	} catch (err) {
		console.log(err);
	}
	session.unset(VERIFIER_SESSION_KEY);
	return saveSession(session);
}

async function getAuthInfo(session: Session) {
	if (session.has(TOKEN_SESSION_KEY)) {
		const authInfo = session.get(TOKEN_SESSION_KEY);
		if ('access' in authInfo && 'expires' in authInfo) {
			return authInfo;
		}
	}
	return null;
}

/**
 * @returns The current redirect code
 */
export function getRedirectCode(request: Request) {
	const params = new URL(request.url).searchParams;

	const code = params.get('code');
	const state = params.get('state');
	if (state === process.env.STATE) {
		console.log('code:', code);
		return code;
	}
}

function getAuthRedirectUrl(codeChallenge: string) {
	if (!process.env.CLIENT_ID || !process.env.STATE) {
		throw new Error('Env not set!');
	}
	const params = new URLSearchParams({
		client_id: process.env.CLIENT_ID,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256',
		redirect_uri: `${process.env.HOST}/login`,
		response_type: 'code',
		scope: 'playlist-read-private',
		state: process.env.STATE,
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
	const digestBytes = await globalThis.crypto.subtle.digest('SHA-256', data);
	const digest = String.fromCharCode(
		...Array.from(new Uint8Array(digestBytes))
	);
	return base64encode(digest);
}

async function fetchAuthInfo(request: Request, codeVerifier: string) {
	const code = getRedirectCode(request);
	if (!code) {
		throw new Error('No redirect code found');
	}
	const body = new URLSearchParams({
		client_id: process.env.CLIENT_ID,
		code,
		code_verifier: codeVerifier,
		grant_type: 'authorization_code',
		redirect_uri: `${process.env.HOST}/login`,
	});
	const bearer = btoa(
		`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
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
	return authInfo;
}
